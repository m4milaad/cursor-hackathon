/**
 * Property-Based Tests for Whisper Service
 * Feature: raasta-ai-companion
 * 
 * These tests validate universal properties that should hold for all inputs
 * using fast-check for comprehensive input coverage.
 * 
 * Note: Tests use 5 iterations for faster execution (as per task requirements)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import * as fc from 'fast-check'

// Mock the config module
jest.mock('./config', () => ({
  getEnvironmentConfig: jest.fn(() => ({
    OPENAI_API_KEY: undefined,
  })),
  isServiceInDemoMode: jest.fn(() => true),
}))

// Import after mocking
import {
  validateAudioFile,
  getAudioDuration,
  transcribeAudio,
} from './whisper'

describe('Whisper Service - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Property 13: Whisper Performance', () => {
    /**
     * **Validates: Requirements 5.3**
     * 
     * Property: For any audio clip under 60 seconds,
     * the Whisper_Service SHALL complete transcription within 10 seconds.
     * 
     * Note: This test validates the demo mode performance path.
     * Actual Whisper API timing requires integration testing with real API.
     */
    it('should complete demo transcription within performance threshold', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 1024 * 1024 }), // 100 bytes to 1MB
          async (size) => {
            // Create mock audio blob
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: 'audio/webm' })
            
            // Property: Demo transcription should complete quickly
            const startTime = Date.now()
            const result = await transcribeAudio(blob)
            const duration = Date.now() - startTime
            
            // Demo mode should complete within 2 seconds (well under 10s threshold)
            expect(duration).toBeLessThan(2000)
            expect(result).toHaveProperty('text')
            expect(result).toHaveProperty('demo')
            expect(result.demo).toBe(true)
          }
        ),
        { numRuns: 5 }
      )
    }, 10000) // 10 second timeout

    it('should handle various audio sizes efficiently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            1024,           // 1KB
            10 * 1024,      // 10KB
            100 * 1024,     // 100KB
            1024 * 1024,    // 1MB
            5 * 1024 * 1024 // 5MB
          ),
          async (size) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: 'audio/webm' })
            
            // Property: Performance should scale reasonably with size
            const startTime = Date.now()
            await transcribeAudio(blob)
            const duration = Date.now() - startTime
            
            // Should complete quickly regardless of size in demo mode
            expect(duration).toBeLessThan(2000)
          }
        ),
        { numRuns: 5 }
      )
    }, 15000) // 15 second timeout for larger files
  })

  describe('Property: Audio Format Validation', () => {
    /**
     * **Validates: Requirements 37.1, 37.2**
     * 
     * Property: The Whisper_Service SHALL accept WebM, MP3, and WAV formats
     */
    it('should accept all supported audio formats', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'audio/webm',
            'audio/mp3',
            'audio/mpeg',
            'audio/wav',
            'audio/x-wav'
          ),
          fc.integer({ min: 1, max: 1024 * 1024 }),
          (mimeType, size) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: mimeType })
            
            const result = validateAudioFile(blob)
            
            // Property: All supported formats should be valid
            expect(result.valid).toBe(true)
            expect(result.error).toBeUndefined()
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should reject unsupported audio formats', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'audio/ogg',
            'audio/aac',
            'video/mp4',
            'image/jpeg',
            'text/plain'
          ),
          fc.integer({ min: 1, max: 1024 }),
          (mimeType, size) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: mimeType })
            
            const result = validateAudioFile(blob)
            
            // Property: Unsupported formats should be rejected
            expect(result.valid).toBe(false)
            expect(result.error).toBeTruthy()
            expect(typeof result.error).toBe('string')
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Property: File Size Validation', () => {
    /**
     * **Validates: Requirements 37.5**
     * 
     * Property: Audio files exceeding 25MB SHALL be rejected
     */
    it('should accept files under 25MB', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 25 * 1024 * 1024 }),
          (size) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: 'audio/webm' })
            
            const result = validateAudioFile(blob)
            
            // Property: Files under 25MB should be valid
            expect(result.valid).toBe(true)
            expect(result.error).toBeUndefined()
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should reject files over 25MB', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 25 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }),
          (size) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: 'audio/webm' })
            
            const result = validateAudioFile(blob)
            
            // Property: Files over 25MB should be rejected
            expect(result.valid).toBe(false)
            expect(result.error).toBeTruthy()
            expect(result.error).toContain('25MB')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should reject empty files', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('audio/webm', 'audio/mp3', 'audio/wav'),
          (mimeType) => {
            const blob = new Blob([], { type: mimeType })
            
            const result = validateAudioFile(blob)
            
            // Property: Empty files should be rejected
            expect(result.valid).toBe(false)
            expect(result.error).toBeTruthy()
            expect(result.error).toContain('khali')
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Property: Error Message Localization', () => {
    /**
     * **Validates: Requirements 5.2, 7.1**
     * 
     * Property: Error messages SHALL be in Roman Urdu
     */
    it('should return Roman Urdu error messages', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(new Blob([], { type: 'audio/webm' })), // Empty
            fc.constant(new Blob([new Uint8Array(26 * 1024 * 1024)], { type: 'audio/webm' })), // Too large
            fc.constant(new Blob([new Uint8Array(100)], { type: 'video/mp4' })) // Wrong format
          ),
          (blob) => {
            const result = validateAudioFile(blob)
            
            // Property: Invalid files should have Roman Urdu error messages
            if (!result.valid) {
              expect(result.error).toBeTruthy()
              expect(typeof result.error).toBe('string')
              // Check for Roman Urdu keywords
              const hasUrduKeywords = 
                result.error.includes('hai') ||
                result.error.includes('karein') ||
                result.error.includes('nahi') ||
                result.error.includes('khali') ||
                result.error.includes('badi') ||
                result.error.includes('supported')
              expect(hasUrduKeywords).toBe(true)
            }
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Property: Transcription Result Structure', () => {
    it('should always return consistent result structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 1024 * 1024 }),
          fc.constantFrom('audio/webm', 'audio/mp3', 'audio/wav'),
          async (size, mimeType) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: mimeType })
            
            const result = await transcribeAudio(blob)
            
            // Property: Result should always have expected structure
            expect(result).toHaveProperty('text')
            expect(result).toHaveProperty('demo')
            expect(typeof result.text).toBe('string')
            expect(typeof result.demo).toBe('boolean')
            
            // Optional error field
            if (result.error) {
              expect(typeof result.error).toBe('string')
            }
          }
        ),
        { numRuns: 5 }
      )
    }, 10000) // 10 second timeout

    it('should handle demo mode consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          async (iterations) => {
            const audioData = new Uint8Array(1024)
            const blob = new Blob([audioData], { type: 'audio/webm' })
            
            // Property: Demo mode should be consistent across calls
            const results = []
            for (let i = 0; i < iterations; i++) {
              results.push(await transcribeAudio(blob))
            }
            
            // All results should have same demo flag
            const demoFlags = results.map(r => r.demo)
            expect(new Set(demoFlags).size).toBe(1)
          }
        ),
        { numRuns: 5 }
      )
    }, 30000) // 30 second timeout for multiple iterations
  })

  describe('Property: Validation Consistency', () => {
    it('should validate same blob consistently', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1024 * 1024 }),
          fc.constantFrom('audio/webm', 'audio/mp3', 'audio/wav'),
          fc.integer({ min: 2, max: 10 }),
          (size, mimeType, iterations) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: mimeType })
            
            // Property: Multiple validations should return same result
            const results = []
            for (let i = 0; i < iterations; i++) {
              results.push(validateAudioFile(blob))
            }
            
            // All results should be identical
            for (let i = 1; i < results.length; i++) {
              expect(results[i].valid).toBe(results[0].valid)
              expect(results[i].error).toBe(results[0].error)
            }
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Property: Edge Cases', () => {
    it('should handle boundary file sizes correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            1,                          // Minimum
            1024,                       // 1KB
            25 * 1024 * 1024 - 1,      // Just under limit
            25 * 1024 * 1024,          // Exactly at limit
            25 * 1024 * 1024 + 1       // Just over limit
          ),
          (size) => {
            const audioData = new Uint8Array(size)
            const blob = new Blob([audioData], { type: 'audio/webm' })
            
            const result = validateAudioFile(blob)
            
            // Property: Boundary conditions should be handled correctly
            if (size <= 25 * 1024 * 1024) {
              expect(result.valid).toBe(true)
            } else {
              expect(result.valid).toBe(false)
              expect(result.error).toContain('25MB')
            }
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle various blob types safely', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(new Blob([new Uint8Array(100)], { type: 'audio/webm' })),
            fc.constant(new Blob([new Uint8Array(100)], { type: '' })),
            fc.constant(new Blob([new Uint8Array(100)])),
            fc.constant(new Blob([], { type: 'audio/webm' }))
          ),
          (blob) => {
            // Property: Should never throw, always return result
            expect(() => validateAudioFile(blob)).not.toThrow()
            
            const result = validateAudioFile(blob)
            expect(result).toHaveProperty('valid')
            expect(typeof result.valid).toBe('boolean')
          }
        ),
        { numRuns: 5 }
      )
    })
  })
})
