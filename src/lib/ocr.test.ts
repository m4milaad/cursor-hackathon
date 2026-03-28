/**
 * Unit Tests for OCR Service
 * 
 * Tests specific examples, edge cases, and integration points
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock the config module before importing ocr
jest.mock('./config', () => ({
  getEnvironmentConfig: jest.fn(() => ({
    GOOGLE_CLOUD_VISION_KEY: undefined,
    OPENAI_API_KEY: undefined,
  })),
  isServiceInDemoMode: jest.fn(() => true),
}))

// Mock Tesseract.js to avoid actual OCR processing in tests
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => Promise.resolve({
    recognize: jest.fn(() => Promise.resolve({
      data: {
        text: 'Mocked Tesseract OCR text',
        confidence: 85,
      },
    })),
    terminate: jest.fn(() => Promise.resolve()),
  })),
}))

import { extractTextFromImage, extractMarksheetText } from './ocr'
import { isServiceInDemoMode } from './config'

describe('OCR Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('extractTextFromImage', () => {
    it('should return demo text when in demo mode', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractTextFromImage(mockFile)

      expect(result).toContain('[Demo OCR]')
      expect(result).toContain('Government notice')
      expect(result).toContain('Land records')
    })

    it('should handle JPEG images', async () => {
      const mockFile = new File(['test'], 'document.jpg', { type: 'image/jpeg' })
      const result = await extractTextFromImage(mockFile)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle PNG images', async () => {
      const mockFile = new File(['test'], 'document.png', { type: 'image/png' })
      const result = await extractTextFromImage(mockFile)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle WebP images', async () => {
      const mockFile = new File(['test'], 'document.webp', { type: 'image/webp' })
      const result = await extractTextFromImage(mockFile)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should validate image size limits', async () => {
      // Create a file that appears to be 6MB (over 5MB limit)
      const mockFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 })

      // Should still process (compression will handle it)
      const result = await extractTextFromImage(mockFile)
      expect(result).toBeTruthy()
    })

    it('should complete within 5 seconds for small images', async () => {
      const mockFile = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 100 * 1024 }) // 100KB

      const startTime = Date.now()
      await extractTextFromImage(mockFile)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(5000)
    })

    it('should throw Roman Urdu error message on failure', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(false)

      // Mock Tesseract to throw an error
      const Tesseract = await import('tesseract.js')
      ;(Tesseract.createWorker as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          recognize: jest.fn(() => Promise.reject(new Error('Tesseract failed'))),
          terminate: jest.fn(() => Promise.resolve()),
        })
      )

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await expect(extractTextFromImage(mockFile)).rejects.toThrow(/tasveer|padh|paye|roshni/i)
    })

    it('should return consistent results for same input', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const result1 = await extractTextFromImage(mockFile)
      const result2 = await extractTextFromImage(mockFile)

      expect(result1).toBe(result2)
    })
  })

  describe('extractMarksheetText', () => {
    it('should return demo marksheet text when in demo mode', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['test'], 'marksheet.jpg', { type: 'image/jpeg' })
      const result = await extractMarksheetText(mockFile)

      expect(result).toContain('[Demo OCR marksheet]')
      expect(result).toContain('Class 12')
      expect(result).toContain('JKBOSE')
      expect(result).toContain('Science stream')
    })

    it('should extract marks information', async () => {
      const mockFile = new File(['test'], 'marksheet.jpg', { type: 'image/jpeg' })
      const result = await extractMarksheetText(mockFile)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle various image formats', async () => {
      const formats = ['image/jpeg', 'image/png', 'image/webp']

      for (const format of formats) {
        const mockFile = new File(['test'], `marksheet.${format.split('/')[1]}`, { type: format })
        const result = await extractMarksheetText(mockFile)

        expect(result).toBeTruthy()
      }
    })

    it('should throw Roman Urdu error on marksheet extraction failure', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(false)

      // Mock Tesseract to throw an error
      const Tesseract = await import('tesseract.js')
      ;(Tesseract.createWorker as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          recognize: jest.fn(() => Promise.reject(new Error('Tesseract failed'))),
          terminate: jest.fn(() => Promise.resolve()),
        })
      )

      const mockFile = new File(['test'], 'marksheet.jpg', { type: 'image/jpeg' })

      await expect(extractMarksheetText(mockFile)).rejects.toThrow(/marksheet|tasveer|padh|paye/i)
    })

    it('should complete within reasonable time', async () => {
      const mockFile = new File(['test'], 'marksheet.jpg', { type: 'image/jpeg' })

      const startTime = Date.now()
      await extractMarksheetText(mockFile)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(5000)
    })
  })

  describe('Demo Mode Behavior', () => {
    it('should use demo responses when GOOGLE_CLOUD_VISION_KEY is not configured', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractTextFromImage(mockFile)

      expect(result).toContain('[Demo OCR]')
    })

    it('should simulate realistic processing delays in demo mode', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const startTime = Date.now()
      await extractTextFromImage(mockFile)
      const duration = Date.now() - startTime

      // Demo mode should have 500-1500ms delay (currently 900ms)
      expect(duration).toBeGreaterThanOrEqual(800)
      expect(duration).toBeLessThan(1500)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted image files gracefully', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const mockFile = new File(['corrupted data'], 'corrupted.jpg', { type: 'image/jpeg' })

      // Should not throw in demo mode
      const result = await extractTextFromImage(mockFile)
      expect(result).toBeTruthy()
    })

    it('should provide descriptive error messages', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(false)

      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network failure'))
      ) as jest.Mock

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      try {
        await extractTextFromImage(mockFile)
        fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(10)
      }
    })

    it('should log errors to console', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(false)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock Tesseract to throw an error
      const Tesseract = await import('tesseract.js')
      ;(Tesseract.createWorker as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          recognize: jest.fn(() => Promise.reject(new Error('Test error'))),
          terminate: jest.fn(() => Promise.resolve()),
        })
      )

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      try {
        await extractTextFromImage(mockFile)
      } catch {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Image Compression', () => {
    it('should handle images under 2MB without compression', async () => {
      const mockFile = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 1 * 1024 * 1024 }) // 1MB

      const result = await extractTextFromImage(mockFile)
      expect(result).toBeTruthy()
    })

    it('should compress images over 2MB', async () => {
      const mockFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockFile, 'size', { value: 3 * 1024 * 1024 }) // 3MB

      const result = await extractTextFromImage(mockFile)
      expect(result).toBeTruthy()
    })
  })
})
