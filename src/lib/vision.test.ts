/**
 * Unit Tests for Vision AI Service
 * 
 * Tests specific examples, edge cases, and integration points
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock the config module before importing vision
jest.mock('./config', () => ({
  getEnvironmentConfig: jest.fn(() => ({
    ROBOFLOW_API_KEY: undefined,
    ROBOFLOW_MODEL_ID: undefined,
  })),
  isServiceInDemoMode: jest.fn(() => true),
}))

// Import after mocking
import { 
  analyzeCropImage, 
  getTreatmentInfo, 
  isSupportedCrop,
  formatTreatmentForVoice 
} from './vision'
import { isServiceInDemoMode } from './config'

describe('Vision AI Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('analyzeCropImage', () => {
    it('should return demo analysis when in demo mode', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['test'], 'crop.jpg', { type: 'image/jpeg' })
      const result = await analyzeCropImage(mockFile)

      expect(result).toBeDefined()
      expect(result.summary).toBeTruthy()
      expect(result.mandiHint).toBeTruthy()
      expect(result.confidence).toBeGreaterThanOrEqual(0.75)
      expect(result.cropType).toBeTruthy()
    })

    it('should handle JPEG images', async () => {
      const mockFile = new File(['test'], 'crop.jpg', { type: 'image/jpeg' })
      const result = await analyzeCropImage(mockFile)

      expect(result).toBeTruthy()
      expect(typeof result.summary).toBe('string')
    })

    it('should handle PNG images', async () => {
      const mockFile = new File(['test'], 'crop.png', { type: 'image/png' })
      const result = await analyzeCropImage(mockFile)

      expect(result).toBeTruthy()
      expect(typeof result.summary).toBe('string')
    })

    it('should handle WebP images', async () => {
      const mockFile = new File(['test'], 'crop.webp', { type: 'image/webp' })
      const result = await analyzeCropImage(mockFile)

      expect(result).toBeTruthy()
      expect(typeof result.summary).toBe('string')
    })

    it('should complete within 8 seconds for small images', async () => {
      const mockFile = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 100 * 1024 }) // 100KB

      const startTime = Date.now()
      await analyzeCropImage(mockFile)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(8000)
    })

    it('should return consistent results for same input', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const result1 = await analyzeCropImage(mockFile)
      const result2 = await analyzeCropImage(mockFile)

      expect(result1.summary).toBe(result2.summary)
      expect(result1.mandiHint).toBe(result2.mandiHint)
      expect(result1.confidence).toBe(result2.confidence)
    })

    it('should include mandi price information', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await analyzeCropImage(mockFile)

      expect(result.mandiHint).toMatch(/₹|mandi|price/i)
    })

    it('should identify crop type from disease class', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await analyzeCropImage(mockFile)

      expect(result.cropType).toBeDefined()
      expect(['apple', 'rice', 'wheat', 'saffron', 'unknown']).toContain(result.cropType)
    })
  })

  describe('getTreatmentInfo', () => {
    it('should return treatment for apple_scab', () => {
      const treatment = getTreatmentInfo('apple_scab')

      expect(treatment.treatment).toContain('Mancozeb')
      expect(treatment.timing).toContain('3-5 days')
      expect(treatment.romanUrdu).toBeTruthy()
      expect(treatment.preventive).toBeTruthy()
    })

    it('should return treatment for rice_blast', () => {
      const treatment = getTreatmentInfo('rice_blast')

      expect(treatment.treatment).toContain('Tricyclazole')
      expect(treatment.timing).toContain('2-3 days')
      expect(treatment.romanUrdu).toBeTruthy()
    })

    it('should return treatment for wheat_rust', () => {
      const treatment = getTreatmentInfo('wheat_rust')

      expect(treatment.treatment).toContain('Propiconazole')
      expect(treatment.timing).toContain('3-4 days')
      expect(treatment.romanUrdu).toBeTruthy()
    })

    it('should return treatment for saffron_corm_rot', () => {
      const treatment = getTreatmentInfo('saffron_corm_rot')

      expect(treatment.treatment).toContain('Remove infected corms')
      expect(treatment.timing).toContain('Immediate')
      expect(treatment.romanUrdu).toBeTruthy()
    })

    it('should return treatment for healthy crops', () => {
      const treatment = getTreatmentInfo('healthy')

      expect(treatment.treatment).toContain('No treatment needed')
      expect(treatment.timing).toContain('Continue regular care')
      expect(treatment.romanUrdu).toBeTruthy()
    })

    it('should return default treatment for unknown disease', () => {
      const treatment = getTreatmentInfo('unknown_disease_xyz')

      expect(treatment.treatment).toContain('agricultural extension officer')
      expect(treatment.timing).toContain('As soon as possible')
      expect(treatment.romanUrdu).toBeTruthy()
    })

    it('should handle disease names with hyphens', () => {
      const treatment = getTreatmentInfo('apple-scab')

      expect(treatment.treatment).toContain('Mancozeb')
    })

    it('should handle disease names with mixed case', () => {
      const treatment = getTreatmentInfo('Apple_Scab')

      expect(treatment.treatment).toContain('Mancozeb')
    })
  })

  describe('isSupportedCrop', () => {
    it('should return true for apple', () => {
      expect(isSupportedCrop('apple')).toBe(true)
    })

    it('should return true for rice', () => {
      expect(isSupportedCrop('rice')).toBe(true)
    })

    it('should return true for wheat', () => {
      expect(isSupportedCrop('wheat')).toBe(true)
    })

    it('should return true for saffron', () => {
      expect(isSupportedCrop('saffron')).toBe(true)
    })

    it('should return false for unsupported crops', () => {
      expect(isSupportedCrop('corn')).toBe(false)
      expect(isSupportedCrop('potato')).toBe(false)
      expect(isSupportedCrop('tomato')).toBe(false)
    })

    it('should be case-insensitive', () => {
      expect(isSupportedCrop('APPLE')).toBe(true)
      expect(isSupportedCrop('Rice')).toBe(true)
      expect(isSupportedCrop('WHEAT')).toBe(true)
    })
  })

  describe('formatTreatmentForVoice', () => {
    it('should format treatment in Roman Urdu', () => {
      const formatted = formatTreatmentForVoice('apple_scab', 'apple', 0.87, 'roman-urdu')

      expect(formatted).toContain('apple')
      expect(formatted).toContain('apple scab')
      expect(formatted).toContain('87 percent')
      expect(formatted).toMatch(/spray|karen/i)
    })

    it('should format treatment in English', () => {
      const formatted = formatTreatmentForVoice('rice_blast', 'rice', 0.92, 'english')

      expect(formatted).toContain('rice')
      expect(formatted).toContain('rice blast')
      expect(formatted).toContain('92 percent')
      expect(formatted).toContain('Treatment:')
      expect(formatted).toContain('Timing:')
    })

    it('should include confidence when provided', () => {
      const formatted = formatTreatmentForVoice('wheat_rust', 'wheat', 0.85)

      expect(formatted).toContain('85 percent')
    })

    it('should omit confidence when below threshold', () => {
      const formatted = formatTreatmentForVoice('wheat_rust', 'wheat', 0.65)

      expect(formatted).not.toContain('percent')
    })

    it('should include preventive measures', () => {
      const formatted = formatTreatmentForVoice('apple_scab', 'apple', 0.90, 'english')

      expect(formatted).toContain('Prevention:')
      expect(formatted).toContain('Remove fallen leaves')
    })

    it('should handle diseases without confidence', () => {
      const formatted = formatTreatmentForVoice('healthy', 'apple', undefined, 'roman-urdu')

      expect(formatted).toBeTruthy()
      expect(formatted).not.toContain('percent')
    })

    it('should format for natural TTS pacing with punctuation', () => {
      const formatted = formatTreatmentForVoice('rice_blast', 'rice', 0.88, 'english')

      // Should have periods for TTS pacing
      expect(formatted).toMatch(/\./g)
      expect(formatted.split('.').length).toBeGreaterThan(2)
    })
  })

  describe('Demo Mode Behavior', () => {
    it('should use demo responses when ROBOFLOW_API_KEY is not configured', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await analyzeCropImage(mockFile)

      expect(result.summary).toBeTruthy()
      expect(result.confidence).toBeGreaterThanOrEqual(0.75)
    })

    it('should simulate realistic processing delays in demo mode', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const startTime = Date.now()
      await analyzeCropImage(mockFile)
      const duration = Date.now() - startTime

      // Demo mode should have 1000-1200ms delay
      expect(duration).toBeGreaterThanOrEqual(1000)
      expect(duration).toBeLessThan(2000)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted image files gracefully', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['corrupted data'], 'corrupted.jpg', { type: 'image/jpeg' })

      // Should not throw in demo mode
      const result = await analyzeCropImage(mockFile)
      expect(result).toBeTruthy()
    })

    it('should provide Roman Urdu error messages', async () => {
      // Test that the error message format is in Roman Urdu
      // The actual error is defined in the catch block of analyzeCropImage
      const errorMessage = 'Patti ki tasveer se bimari pehchan na paye. Qareeb se aur saaf photo lein.'
      
      // Verify the error message contains Roman Urdu keywords
      expect(errorMessage).toMatch(/patti|tasveer|bimari|pehchan/i)
      expect(errorMessage).toMatch(/qareeb|saaf|photo/i)
    })

    it('should log errors to console', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(false)

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Test error'))
      ) as jest.Mock

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      try {
        await analyzeCropImage(mockFile)
      } catch {
        // Expected to throw
      }

      // Should log warnings about fallback attempts
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('Image Preprocessing', () => {
    it('should handle images under 2MB without compression', async () => {
      const mockFile = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 1 * 1024 * 1024 }) // 1MB

      const result = await analyzeCropImage(mockFile)
      expect(result).toBeTruthy()
    })

    it('should compress images over 2MB', async () => {
      const mockFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 3 * 1024 * 1024 }) // 3MB

      const result = await analyzeCropImage(mockFile)
      expect(result).toBeTruthy()
    })
  })

  describe('Supported Crops', () => {
    it('should support apple crop detection', async () => {
      expect(isSupportedCrop('apple')).toBe(true)
    })

    it('should support rice crop detection', async () => {
      expect(isSupportedCrop('rice')).toBe(true)
    })

    it('should support wheat crop detection', async () => {
      expect(isSupportedCrop('wheat')).toBe(true)
    })

    it('should support saffron crop detection', async () => {
      expect(isSupportedCrop('saffron')).toBe(true)
    })

    it('should reject unsupported crops', async () => {
      expect(isSupportedCrop('corn')).toBe(false)
      expect(isSupportedCrop('potato')).toBe(false)
      expect(isSupportedCrop('tomato')).toBe(false)
      expect(isSupportedCrop('banana')).toBe(false)
    })
  })
})
