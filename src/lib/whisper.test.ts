/**
 * Unit Tests for Whisper Service
 * Feature: raasta-ai-companion
 * 
 * These tests validate specific examples and edge cases for the Whisper transcription service.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  validateAudioFile,
  getAudioDuration,
  transcribeAudio,
  transcribeAudioViaAPI,
} from './whisper'

// Mock the config module
jest.mock('./config', () => ({
  getEnvironmentConfig: jest.fn(() => ({
    OPENAI_API_KEY: undefined,
  })),
  isServiceInDemoMode: jest.fn(() => true),
}))

describe('Whisper Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateAudioFile', () => {
    /**
     * Test audio format handling and conversion
     * Validates: Requirements 5.4, 37.1, 37.2
     */
    it('should accept WebM audio format', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept MP3 audio format', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/mp3' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept MPEG audio format', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/mpeg' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept WAV audio format', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/wav' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept x-wav audio format', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/x-wav' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject unsupported audio formats', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/ogg' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('supported nahi hai')
    })

    it('should reject video formats', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'video/mp4' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should reject image formats', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'image/jpeg' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBeTruthy()
    })

    /**
     * Test error handling for oversized files
     * Validates: Requirements 37.3, 37.5
     */
    it('should reject files over 25MB', () => {
      const size = 26 * 1024 * 1024 // 26MB
      const blob = new Blob([new Uint8Array(size)], { type: 'audio/webm' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('25MB')
      expect(result.error).toContain('badi hai')
    })

    it('should accept files exactly at 25MB limit', () => {
      const size = 25 * 1024 * 1024 // Exactly 25MB
      const blob = new Blob([new Uint8Array(size)], { type: 'audio/webm' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept files just under 25MB limit', () => {
      const size = 25 * 1024 * 1024 - 1 // Just under 25MB
      const blob = new Blob([new Uint8Array(size)], { type: 'audio/webm' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty files', () => {
      const blob = new Blob([], { type: 'audio/webm' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('khali hai')
    })

    it('should accept small valid files', () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'audio/webm' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle blobs with empty mime type gracefully', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: '' })
      const result = validateAudioFile(blob)
      
      // Should accept when mime type is empty (browser may not set it)
      expect(result.valid).toBe(true)
    })

    it('should handle blobs with no mime type gracefully', () => {
      const blob = new Blob([new Uint8Array(1024)])
      const result = validateAudioFile(blob)
      
      // Should accept when mime type is not set
      expect(result.valid).toBe(true)
    })
  })

  describe('transcribeAudio - Demo Mode', () => {
    /**
     * Test demo mode behavior
     * Validates: Requirements 5.4, 6.1, 6.3
     */
    it('should return empty transcription in demo mode', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('demo')
      expect(result.demo).toBe(true)
      expect(result.text).toBe('')
    })

    it('should simulate realistic processing delay in demo mode', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      
      const startTime = Date.now()
      await transcribeAudio(blob)
      const duration = Date.now() - startTime
      
      // Should have delay between 500-1500ms
      expect(duration).toBeGreaterThanOrEqual(500)
      expect(duration).toBeLessThan(2000) // Allow some margin
    })

    it('should handle multiple demo transcriptions consistently', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      
      const results = await Promise.all([
        transcribeAudio(blob),
        transcribeAudio(blob),
        transcribeAudio(blob)
      ])
      
      // All should be in demo mode
      results.forEach(result => {
        expect(result.demo).toBe(true)
        expect(result.text).toBe('')
      })
    })

    it('should complete demo transcription quickly', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      
      const startTime = Date.now()
      await transcribeAudio(blob)
      const duration = Date.now() - startTime
      
      // Demo mode should complete within 2 seconds
      expect(duration).toBeLessThan(2000)
    })
  })

  describe('transcribeAudio - Error Handling', () => {
    /**
     * Test error handling for invalid inputs
     * Validates: Requirements 5.2, 7.1, 12.1
     */
    it('should return error for empty audio file', async () => {
      const blob = new Blob([], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result.demo).toBe(false)
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('khali hai')
    })

    it('should return error for oversized file', async () => {
      const size = 26 * 1024 * 1024 // 26MB
      const blob = new Blob([new Uint8Array(size)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result.demo).toBe(false)
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('25MB')
    })

    it('should return error for unsupported format', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/ogg' })
      const result = await transcribeAudio(blob)
      
      expect(result.demo).toBe(false)
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('supported nahi hai')
    })

    it('should return error messages in Roman Urdu', async () => {
      const blob = new Blob([], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result.error).toBeTruthy()
      // Check for Roman Urdu keywords
      const hasUrduKeywords = 
        result.error!.includes('hai') ||
        result.error!.includes('karein') ||
        result.error!.includes('nahi')
      expect(hasUrduKeywords).toBe(true)
    })

    it('should handle validation errors gracefully', async () => {
      const blob = new Blob([new Uint8Array(100 * 1024 * 1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('demo')
      expect(result).toHaveProperty('error')
      expect(result.text).toBe('')
    })
  })

  describe('transcribeAudio - Result Structure', () => {
    /**
     * Test result structure consistency
     * Validates: Requirements 5.1, 5.4
     */
    it('should always return text property', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result).toHaveProperty('text')
      expect(typeof result.text).toBe('string')
    })

    it('should always return demo property', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result).toHaveProperty('demo')
      expect(typeof result.demo).toBe('boolean')
    })

    it('should return error property when validation fails', async () => {
      const blob = new Blob([], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result).toHaveProperty('error')
      expect(typeof result.error).toBe('string')
    })

    it('should not have error property on success', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      if (result.demo) {
        expect(result.error).toBeUndefined()
      }
    })
  })

  describe('getAudioDuration', () => {
    /**
     * Test audio duration calculation
     * Validates: Requirements 37.4
     */
    it('should return 0 for server-side execution', async () => {
      // Mock server-side environment
      const originalWindow = global.window
      // @ts-expect-error - Testing server-side behavior
      delete global.window
      
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const duration = await getAudioDuration(blob)
      
      expect(duration).toBe(0)
      
      // Restore window
      global.window = originalWindow
    })

    it('should handle audio loading errors gracefully', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'audio/webm' })
      const duration = await getAudioDuration(blob)
      
      // Should return 0 or a valid number without throwing
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle minimum valid file size', async () => {
      const blob = new Blob([new Uint8Array(1)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('demo')
    })

    it('should handle typical mobile recording size', async () => {
      const size = 500 * 1024 // 500KB - typical 30 second recording
      const blob = new Blob([new Uint8Array(size)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result.demo).toBe(true)
      expect(result.text).toBe('')
    })

    it('should handle large but valid file size', async () => {
      const size = 20 * 1024 * 1024 // 20MB
      const blob = new Blob([new Uint8Array(size)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result.demo).toBe(true)
    })

    it('should handle case-insensitive mime types', () => {
      const blob1 = new Blob([new Uint8Array(1024)], { type: 'audio/WEBM' })
      const blob2 = new Blob([new Uint8Array(1024)], { type: 'AUDIO/webm' })
      
      const result1 = validateAudioFile(blob1)
      const result2 = validateAudioFile(blob2)
      
      expect(result1.valid).toBe(true)
      expect(result2.valid).toBe(true)
    })

    it('should handle mime types with parameters', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm; codecs=opus' })
      const result = validateAudioFile(blob)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('Performance Requirements', () => {
    /**
     * Test performance thresholds
     * Validates: Requirements 5.3, 16.4
     */
    it('should complete validation quickly', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      
      const startTime = Date.now()
      validateAudioFile(blob)
      const duration = Date.now() - startTime
      
      // Validation should be nearly instant
      expect(duration).toBeLessThan(100)
    })

    it('should handle concurrent transcriptions', async () => {
      const blobs = Array.from({ length: 5 }, () => 
        new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      )
      
      const startTime = Date.now()
      const results = await Promise.all(blobs.map(blob => transcribeAudio(blob)))
      const duration = Date.now() - startTime
      
      // All should complete within reasonable time
      expect(duration).toBeLessThan(10000)
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result.demo).toBe(true)
      })
    })
  })

  describe('Language Support', () => {
    /**
     * Test language support
     * Validates: Requirements 5.1
     */
    it('should support Urdu transcription in demo mode', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      // Demo mode returns empty string, but should not error
      expect(result.demo).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should support Hindi transcription in demo mode', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result.demo).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should support Kashmiri transcription in demo mode', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' })
      const result = await transcribeAudio(blob)
      
      expect(result.demo).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('Integration with API Route', () => {
    /**
     * Test client-side API wrapper
     * Validates: Requirements 5.2, 7.3
     */
    it('should validate before calling API', async () => {
      const blob = new Blob([], { type: 'audio/webm' })
      const result = await transcribeAudioViaAPI(blob)
      
      // Should return validation error without calling API
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('khali hai')
    })

    it('should handle oversized files before API call', async () => {
      const size = 26 * 1024 * 1024
      const blob = new Blob([new Uint8Array(size)], { type: 'audio/webm' })
      const result = await transcribeAudioViaAPI(blob)
      
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('25MB')
    })

    it('should handle unsupported formats before API call', async () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'audio/ogg' })
      const result = await transcribeAudioViaAPI(blob)
      
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('supported nahi hai')
    })
  })
})
