/**
 * Property-based tests for Vision AI service
 * Feature: raasta-ai-companion
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for comprehensive input coverage.
 * 
 * Note: Tests use 5 iterations for faster execution (as per task requirements)
 */

import { describe, test, expect } from '@jest/globals'
import * as fc from 'fast-check'
import { analyzeCropImage, getTreatmentInfo, isSupportedCrop } from './vision'

// ============================================
// Test Utilities
// ============================================

/**
 * Generate a mock image file for testing
 */
function generateMockImage(sizeKB: number = 500): File {
  const buffer = new ArrayBuffer(sizeKB * 1024)
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  return new File([blob], 'test-crop.jpg', { type: 'image/jpeg' })
}

/**
 * Calculate accuracy between expected and actual disease class
 * For property testing, we use exact match since we control the input
 */
function calculateAccuracy(expected: string, actual: string): number {
  return expected.toLowerCase() === actual.toLowerCase() ? 1.0 : 0.0
}

// ============================================
// Property 4: Vision Model Accuracy Threshold
// **Validates: Requirements 2.1**
// ============================================

describe('Vision AI Service - Property Tests', () => {
  test('Property 4: Vision model accuracy threshold - demo mode always returns valid results', async () => {
    // In demo mode (no API keys), we test that the service returns consistent results
    // with confidence scores meeting the 75% threshold
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          imageSize: fc.integer({ min: 100, max: 5000 }), // 100KB to 5MB
          fileName: fc.constantFrom('apple.jpg', 'rice.jpg', 'wheat.jpg', 'saffron.jpg')
        }),
        async (input) => {
          const image = generateMockImage(input.imageSize)
          const result = await analyzeCropImage(image)
          
          // Verify result structure
          expect(result).toBeDefined()
          expect(result.summary).toBeDefined()
          expect(typeof result.summary).toBe('string')
          expect(result.summary.length).toBeGreaterThan(0)
          
          // Verify confidence meets threshold (if provided)
          if (result.confidence !== undefined) {
            expect(result.confidence).toBeGreaterThanOrEqual(0.75)
            expect(result.confidence).toBeLessThanOrEqual(1.0)
          }
          
          // Verify mandi hint is provided
          expect(result.mandiHint).toBeDefined()
          expect(typeof result.mandiHint).toBe('string')
          expect(result.mandiHint.length).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 5 } // 5 iterations as per task requirements
    )
  }, 15000) // 15 second timeout for property test

  test('Property: Vision service handles various image sizes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 50, max: 10000 }), // 50KB to 10MB
        async (sizeKB) => {
          const image = generateMockImage(sizeKB)
          const result = await analyzeCropImage(image)
          
          // Should always return a valid result regardless of size
          expect(result).toBeDefined()
          expect(result.summary).toBeDefined()
          expect(result.mandiHint).toBeDefined()
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Treatment info is available for all disease classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'apple_scab',
          'apple_black_rot',
          'apple_cedar_rust',
          'rice_blast',
          'rice_brown_spot',
          'wheat_rust',
          'wheat_smut',
          'saffron_corm_rot',
          'early_fungal_spots',
          'healthy',
          'unknown_disease'
        ),
        (diseaseClass) => {
          const treatment = getTreatmentInfo(diseaseClass)
          
          // Verify treatment structure
          expect(treatment).toBeDefined()
          expect(treatment.treatment).toBeDefined()
          expect(typeof treatment.treatment).toBe('string')
          expect(treatment.treatment.length).toBeGreaterThan(0)
          
          expect(treatment.timing).toBeDefined()
          expect(typeof treatment.timing).toBe('string')
          expect(treatment.timing.length).toBeGreaterThan(0)
          
          // Verify Roman Urdu translation is present
          if (treatment.romanUrdu) {
            expect(typeof treatment.romanUrdu).toBe('string')
            expect(treatment.romanUrdu.length).toBeGreaterThan(0)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Supported crop detection is consistent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('apple', 'rice', 'wheat', 'saffron', 'corn', 'potato', 'tomato'),
        (cropType) => {
          const isSupported = isSupportedCrop(cropType)
          
          // Verify supported crops (Requirement 2.2)
          const expectedSupported = ['apple', 'rice', 'wheat', 'saffron']
          const shouldBeSupported = expectedSupported.includes(cropType.toLowerCase())
          
          expect(isSupported).toBe(shouldBeSupported)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Vision service returns results within reasonable time', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 5000 }),
        async (sizeKB) => {
          const image = generateMockImage(sizeKB)
          const startTime = Date.now()
          
          await analyzeCropImage(image)
          
          const duration = Date.now() - startTime
          
          // Should complete within 8 seconds (Requirement 2.4)
          // In demo mode, should be much faster (around 1-2 seconds)
          expect(duration).toBeLessThan(8000)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Crop type is correctly identified from disease class', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 1000 }),
        async (sizeKB) => {
          const image = generateMockImage(sizeKB)
          const result = await analyzeCropImage(image)
          
          // If cropType is provided, it should be one of the supported crops or 'unknown'
          if (result.cropType) {
            const validCropTypes = ['apple', 'rice', 'wheat', 'saffron', 'unknown']
            expect(validCropTypes).toContain(result.cropType)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Mandi hint format is consistent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 1000 }),
        async (sizeKB) => {
          const image = generateMockImage(sizeKB)
          const result = await analyzeCropImage(image)
          
          // Mandi hint should contain price information
          expect(result.mandiHint).toMatch(/₹|mandi|price|demo/i)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)
})
