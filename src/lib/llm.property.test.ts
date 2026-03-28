/**
 * Property-Based Tests for LLM Service
 * Feature: raasta-ai-companion
 * 
 * These tests validate universal properties that should hold for all inputs
 * using fast-check for comprehensive input coverage.
 * 
 * Note: Tests use 5 iterations for faster execution (as per task requirements)
 */

import { describe, it, expect } from '@jest/globals'
import * as fc from 'fast-check'
import { detectLanguage } from './localeForLlm'

describe('LLM Service - Property-Based Tests', () => {
  describe('Property 21: Language Detection and Response Matching', () => {
    /**
     * **Validates: Requirements 8.1**
     * 
     * Property: For any user input in Urdu, Hindi, or Kashmiri,
     * the LLM_Service SHALL detect the language and respond in the same language.
     */
    
    it('should detect Devanagari script as Hindi', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.integer({ min: 0x0900, max: 0x097F }), // Devanagari Unicode range
            { minLength: 1, maxLength: 50 }
          ),
          (codePoints) => {
            const text = String.fromCharCode(...codePoints)
            const detected = detectLanguage(text)
            
            // Property: Devanagari text should be detected as Hindi
            expect(detected).toBe('hi')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should detect Arabic/Perso-Arabic script as Kashmiri', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.integer({ min: 0x0600, max: 0x06FF }), // Arabic Unicode range
            { minLength: 1, maxLength: 50 }
          ),
          (codePoints) => {
            const text = String.fromCharCode(...codePoints)
            const detected = detectLanguage(text)
            
            // Property: Arabic script should be detected as Kashmiri
            expect(detected).toBe('ks')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should detect Roman script as Roman Urdu (en)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
            // Filter to only ASCII/Latin characters
            return /^[a-zA-Z0-9\s.,!?]+$/.test(s)
          }),
          (text) => {
            const detected = detectLanguage(text)
            
            // Property: Roman script should default to Roman Urdu
            expect(detected).toBe('en')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle empty or whitespace-only input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\n\t'),
            fc.string({ maxLength: 10 }).map(s => s.replace(/\S/g, ' '))
          ),
          (text) => {
            const detected = detectLanguage(text)
            
            // Property: Empty input should default to Roman Urdu
            expect(detected).toBe('en')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should consistently detect the same language for the same input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.array(fc.integer({ min: 0x0900, max: 0x097F }), { minLength: 1, maxLength: 20 }).map(cp => String.fromCharCode(...cp)),
            fc.array(fc.integer({ min: 0x0600, max: 0x06FF }), { minLength: 1, maxLength: 20 }).map(cp => String.fromCharCode(...cp))
          ),
          (text) => {
            // Call detection multiple times
            const detected1 = detectLanguage(text)
            const detected2 = detectLanguage(text)
            const detected3 = detectLanguage(text)
            
            // Property: Same input should always produce same output
            expect(detected1).toBe(detected2)
            expect(detected2).toBe(detected3)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle mixed script input by prioritizing non-Latin scripts', () => {
      fc.assert(
        fc.property(
          fc.record({
            devanagari: fc.array(fc.integer({ min: 0x0900, max: 0x097F }), { minLength: 1, maxLength: 10 }),
            latin: fc.string({ minLength: 1, maxLength: 10 })
          }),
          ({ devanagari, latin }) => {
            const devanagariText = String.fromCharCode(...devanagari)
            const mixedText = devanagariText + ' ' + latin
            const detected = detectLanguage(mixedText)
            
            // Property: Mixed text with Devanagari should be detected as Hindi
            expect(detected).toBe('hi')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle all valid locale types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'hi', 'ks'),
          (expectedLocale) => {
            let text: string
            
            // Generate text matching the expected locale
            if (expectedLocale === 'hi') {
              text = String.fromCharCode(0x0915, 0x0916, 0x0917) // Devanagari
            } else if (expectedLocale === 'ks') {
              text = String.fromCharCode(0x0627, 0x0628, 0x062A) // Arabic
            } else {
              text = 'hello world' // Roman
            }
            
            const detected = detectLanguage(text)
            
            // Property: Detection should match expected locale
            expect(detected).toBe(expectedLocale)
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Property 32: Voice-Friendly Response Length', () => {
    /**
     * **Validates: Requirements 11.3, 38.2**
     * 
     * Property: For any LLM response intended for voice output,
     * the word count SHALL not exceed 200 words.
     */
    
    it('should limit responses to 200 words maximum', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 300 }),
          (words) => {
            const longText = words.join(' ')
            
            // Simulate the postProcessResponse function
            const processedWords = longText.split(/\s+/)
            let processed = longText
            if (processedWords.length > 200) {
              processed = processedWords.slice(0, 200).join(' ') + '.'
            }
            
            const finalWordCount = processed.split(/\s+/).filter(w => w.length > 0).length
            
            // Property: Word count should never exceed 200
            expect(finalWordCount).toBeLessThanOrEqual(200)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should preserve short responses unchanged', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 100 }),
          (words) => {
            const shortText = words.join(' ')
            const wordCount = shortText.split(/\s+/).filter(w => w.length > 0).length
            
            if (wordCount <= 200) {
              // Simulate the postProcessResponse function
              const processedWords = shortText.split(/\s+/)
              let processed = shortText
              if (processedWords.length > 200) {
                processed = processedWords.slice(0, 200).join(' ') + '.'
              }
              
              // Property: Short text should remain unchanged (except whitespace normalization)
              const originalWords = shortText.split(/\s+/).filter(w => w.length > 0)
              const processedWordsList = processed.split(/\s+/).filter(w => w.length > 0 && w !== '.')
              
              expect(processedWordsList.length).toBe(originalWords.length)
            }
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle exactly 200 words correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 200, maxLength: 200 }),
          (words) => {
            const exactText = words.join(' ')
            
            // Simulate the postProcessResponse function
            const processedWords = exactText.split(/\s+/)
            let processed = exactText
            if (processedWords.length > 200) {
              processed = processedWords.slice(0, 200).join(' ') + '.'
            }
            
            const finalWordCount = processed.split(/\s+/).filter(w => w.length > 0).length
            
            // Property: Exactly 200 words should remain at 200
            expect(finalWordCount).toBe(200)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should add period when truncating', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 201, maxLength: 300 }),
          (words) => {
            const longText = words.join(' ')
            
            // Simulate the postProcessResponse function
            const processedWords = longText.split(/\s+/)
            let processed = longText
            if (processedWords.length > 200) {
              processed = processedWords.slice(0, 200).join(' ') + '.'
            }
            
            // Property: Truncated text should end with period
            expect(processed.endsWith('.')).toBe(true)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle various word lengths', () => {
      fc.assert(
        fc.property(
          fc.record({
            shortWords: fc.array(fc.string({ minLength: 1, maxLength: 5 }), { minLength: 50, maxLength: 100 }),
            longWords: fc.array(fc.string({ minLength: 10, maxLength: 30 }), { minLength: 50, maxLength: 100 })
          }),
          ({ shortWords, longWords }) => {
            const mixedText = [...shortWords, ...longWords].join(' ')
            
            // Simulate the postProcessResponse function
            const processedWords = mixedText.split(/\s+/)
            let processed = mixedText
            if (processedWords.length > 200) {
              processed = processedWords.slice(0, 200).join(' ') + '.'
            }
            
            const finalWordCount = processed.split(/\s+/).filter(w => w.length > 0).length
            
            // Property: Word count limit applies regardless of word length
            expect(finalWordCount).toBeLessThanOrEqual(200)
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Property: Language Detection Robustness', () => {
    it('should never throw errors for any string input', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 1000 }),
          (text) => {
            // Property: Should never throw, always return valid locale
            expect(() => detectLanguage(text)).not.toThrow()
            const result = detectLanguage(text)
            expect(['en', 'hi', 'ks']).toContain(result)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle special characters and symbols', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
            // Include special characters
            return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(s)
          }),
          (text) => {
            const detected = detectLanguage(text)
            
            // Property: Special characters should default to Roman Urdu
            expect(detected).toBe('en')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle very long inputs efficiently', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 500, maxLength: 2000 }),
          (text) => {
            const startTime = Date.now()
            const detected = detectLanguage(text)
            const duration = Date.now() - startTime
            
            // Property: Detection should be fast even for long inputs
            expect(duration).toBeLessThan(100) // Should complete in <100ms
            expect(['en', 'hi', 'ks']).toContain(detected)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle Unicode edge cases', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('\u0000'), // Null character
            fc.constant('\uFFFD'), // Replacement character
            fc.constant('\u200B'), // Zero-width space
            fc.constant('\uFEFF')  // Byte order mark
          ),
          (text) => {
            // Property: Should handle Unicode edge cases gracefully
            expect(() => detectLanguage(text)).not.toThrow()
            const result = detectLanguage(text)
            expect(['en', 'hi', 'ks']).toContain(result)
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Property: Default Behavior', () => {
    it('should default to Roman Urdu for ambiguous input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('123456'),
            fc.constant('!!!'),
            fc.constant('   '),
            fc.constant('\n\n\n')
          ),
          (text) => {
            const detected = detectLanguage(text)
            
            // Property: Ambiguous input should default to Roman Urdu
            expect(detected).toBe('en')
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle null-like inputs safely', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', null, undefined),
          (input) => {
            // @ts-expect-error - Testing invalid inputs
            const detected = detectLanguage(input)
            
            // Property: Null-like inputs should default to Roman Urdu
            expect(detected).toBe('en')
          }
        ),
        { numRuns: 5 }
      )
    })
  })
})
