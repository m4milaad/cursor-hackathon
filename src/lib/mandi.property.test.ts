/**
 * Property-based tests for Mandi Price Service
 * Feature: raasta-ai-companion
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for comprehensive input coverage.
 * 
 * Note: Tests use 5 iterations for faster execution (as per task requirements)
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import * as fc from 'fast-check'
import { 
  getPriceForCrop, 
  formatMandiPrice, 
  isSupportedCrop,
  clearPriceCache,
  getCacheStats,
  type MandiPrice 
} from './mandi'

// ============================================
// Test Setup
// ============================================

beforeEach(() => {
  // Clear cache before each test to ensure clean state
  clearPriceCache()
})

// ============================================
// Property 8: Mandi Price Caching Duration
// **Validates: Requirements 3.4**
// ============================================

describe('Mandi Price Service - Property Tests', () => {
  test('Property 8: Mandi price caching duration - identical queries within 6 hours return cached data', async () => {
    // Test that identical queries within 6 hours return the same cached result
    // without making new API calls
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          cropType: fc.constantFrom('apple', 'rice', 'wheat', 'saffron'),
          region: fc.constantFrom('kashmir', 'Kashmir', 'KASHMIR'),
        }),
        async (input) => {
          // Clear cache for this test
          clearPriceCache()
          
          // First call - should fetch and cache
          const firstResult = await getPriceForCrop(input.cropType, input.region)
          expect(firstResult).toBeDefined()
          
          // Verify cache has one entry
          const statsAfterFirst = getCacheStats()
          expect(statsAfterFirst.size).toBe(1)
          
          // Second call immediately - should return cached result
          const secondResult = await getPriceForCrop(input.cropType, input.region)
          expect(secondResult).toBeDefined()
          
          // Verify cache still has one entry (no new API call)
          const statsAfterSecond = getCacheStats()
          expect(statsAfterSecond.size).toBe(1)
          
          // Results should be identical (same object reference from cache)
          expect(secondResult).toEqual(firstResult)
          expect(secondResult?.commodity).toBe(firstResult?.commodity)
          expect(secondResult?.mandi).toBe(firstResult?.mandi)
          expect(secondResult?.price).toBe(firstResult?.price)
          expect(secondResult?.date).toBe(firstResult?.date)
          
          return true
        }
      ),
      { numRuns: 5 } // 5 iterations as per task requirements
    )
  }, 15000) // 15 second timeout

  test('Property: Cache key generation is case-insensitive', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('apple', 'Apple', 'APPLE', 'ApPlE'),
        async (cropType) => {
          clearPriceCache()
          
          // First call with one case
          const firstResult = await getPriceForCrop(cropType, 'kashmir')
          
          // Second call with different case should hit cache
          const secondResult = await getPriceForCrop(cropType.toLowerCase(), 'KASHMIR')
          
          // Should return same cached result
          expect(secondResult).toEqual(firstResult)
          
          // Cache should have only one entry
          const stats = getCacheStats()
          expect(stats.size).toBe(1)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Multiple different crops can be cached simultaneously', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.constantFrom('apple', 'rice', 'wheat', 'saffron'),
          { minLength: 2, maxLength: 4 }
        ),
        async (cropTypes) => {
          clearPriceCache()
          
          // Fetch prices for all crop types
          const results = await Promise.all(
            cropTypes.map(crop => getPriceForCrop(crop, 'kashmir'))
          )
          
          // All results should be defined
          results.forEach(result => {
            expect(result).toBeDefined()
          })
          
          // Cache should have entries for unique crop types
          const uniqueCrops = new Set(cropTypes.map(c => c.toLowerCase()))
          const stats = getCacheStats()
          expect(stats.size).toBe(uniqueCrops.size)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Price format is consistent across all crops', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('apple', 'rice', 'wheat', 'saffron'),
        async (cropType) => {
          const price = await getPriceForCrop(cropType, 'kashmir')
          
          if (price) {
            // Verify price structure (Requirement 3.5)
            expect(price.commodity).toBeDefined()
            expect(typeof price.commodity).toBe('string')
            
            expect(price.mandi).toBeDefined()
            expect(typeof price.mandi).toBe('string')
            
            expect(price.price).toBeDefined()
            expect(typeof price.price).toBe('number')
            expect(price.price).toBeGreaterThan(0)
            
            expect(price.unit).toBe('₹/kg')
            
            expect(price.date).toBeDefined()
            expect(typeof price.date).toBe('string')
            
            // Verify formatted output
            const formatted = formatMandiPrice(price)
            expect(formatted).toContain('mandi')
            expect(formatted).toContain('₹')
            expect(formatted).toContain('/kg')
            expect(formatted).toContain(price.mandi)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Supported crop detection is consistent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('apple', 'rice', 'wheat', 'saffron', 'corn', 'potato', 'tomato'),
        (cropType) => {
          const isSupported = isSupportedCrop(cropType)
          
          // Verify supported crops (Requirement 3.2)
          const expectedSupported = ['apple', 'rice', 'wheat', 'saffron']
          const shouldBeSupported = expectedSupported.includes(cropType.toLowerCase())
          
          expect(isSupported).toBe(shouldBeSupported)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Format with date includes date information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('apple', 'rice', 'wheat', 'saffron'),
        async (cropType) => {
          const price = await getPriceForCrop(cropType, 'kashmir')
          
          if (price) {
            const withoutDate = formatMandiPrice(price, false)
            const withDate = formatMandiPrice(price, true)
            
            // With date should be longer
            expect(withDate.length).toBeGreaterThan(withoutDate.length)
            
            // With date should contain the date
            expect(withDate).toContain(price.date)
            
            // Without date should not contain parentheses
            expect(withoutDate).not.toContain('(')
            
            // With date should contain parentheses
            expect(withDate).toContain('(')
            expect(withDate).toContain(')')
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Cache persists across multiple queries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('apple', 'rice', 'wheat', 'saffron'),
        async (cropType) => {
          clearPriceCache()
          
          // Make multiple queries for the same crop
          const results = await Promise.all([
            getPriceForCrop(cropType, 'kashmir'),
            getPriceForCrop(cropType, 'kashmir'),
            getPriceForCrop(cropType, 'kashmir'),
          ])
          
          // All results should be identical
          expect(results[0]).toEqual(results[1])
          expect(results[1]).toEqual(results[2])
          
          // Cache should have only one entry
          const stats = getCacheStats()
          expect(stats.size).toBe(1)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Price values are positive numbers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('apple', 'rice', 'wheat', 'saffron'),
        async (cropType) => {
          const price = await getPriceForCrop(cropType, 'kashmir')
          
          if (price) {
            expect(price.price).toBeGreaterThan(0)
            expect(Number.isFinite(price.price)).toBe(true)
            expect(Number.isNaN(price.price)).toBe(false)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  test('Property: Mandi names are from Kashmir region', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('apple', 'rice', 'wheat', 'saffron'),
        async (cropType) => {
          const price = await getPriceForCrop(cropType, 'kashmir')
          
          if (price) {
            // In demo mode, should return Kashmir mandis (Requirement 3.2)
            const kashmirMandis = ['Sopore', 'Srinagar', 'Anantnag', 'Baramulla', 'Pampore']
            const isKashmirMandi = kashmirMandis.some(mandi => 
              price.mandi.toLowerCase().includes(mandi.toLowerCase())
            )
            
            // In demo mode, should always be Kashmir mandi
            expect(isKashmirMandi).toBe(true)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)
})
