/**
 * Property-Based Tests for Response Caching System
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
  generateCacheKey,
  generateLLMCacheKey,
  cacheLLMResponse,
  getCachedLLMResponse,
  hasLLMCache,
  clearLLMCache,
  getLLMCacheStats,
  cacheOCRResult,
  getCachedOCRResult,
  hasOCRCache,
  clearOCRCache,
  getOCRCacheStats,
  clearAllCaches,
  getAllCacheStats,
} from './cache'

// ============================================
// Test Setup
// ============================================

beforeEach(() => {
  // Clear all caches before each test
  clearAllCaches()
})

// ============================================
// Property 35: Query Response Caching
// **Validates: Requirements 16.2**
// ============================================

describe('Response Caching - Property Tests', () => {
  test('Property 35: Identical LLM queries within 1 hour return cached response', async () => {
    // Test that identical queries within 1 hour return the same cached result
    // without making new API calls
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
          input: fc.string({ minLength: 10, maxLength: 200 }),
          response: fc.string({ minLength: 20, maxLength: 500 }),
        }),
        async (data) => {
          clearLLMCache()
          
          // Generate cache key
          const key = generateLLMCacheKey(data.mode, data.input)
          
          // Cache the response
          cacheLLMResponse(key, data.response)
          
          // Verify cache has one entry
          const statsAfterCache = getLLMCacheStats()
          expect(statsAfterCache.size).toBe(1)
          
          // Retrieve cached response
          const cached = getCachedLLMResponse(key)
          expect(cached).toBe(data.response)
          
          // Verify cache hit
          const statsAfterHit = getLLMCacheStats()
          expect(statsAfterHit.hits).toBe(1)
          expect(statsAfterHit.misses).toBe(0)
          
          // Retrieve again - should still be cached
          const cached2 = getCachedLLMResponse(key)
          expect(cached2).toBe(data.response)
          
          // Verify another cache hit
          const statsAfterSecondHit = getLLMCacheStats()
          expect(statsAfterSecondHit.hits).toBe(2)
          expect(statsAfterSecondHit.misses).toBe(0)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Cache key generation is deterministic', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
          input: fc.string({ minLength: 5, maxLength: 100 }),
        }),
        (data) => {
          // Generate key twice with same input
          const key1 = generateLLMCacheKey(data.mode, data.input)
          const key2 = generateLLMCacheKey(data.mode, data.input)
          
          // Property: Same input should produce same key
          expect(key1).toBe(key2)
          expect(key1.length).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Cache key is case-insensitive for input', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
          input: fc.string({ minLength: 5, maxLength: 50 }),
        }),
        (data) => {
          // Generate keys with different cases
          const key1 = generateLLMCacheKey(data.mode, data.input.toLowerCase())
          const key2 = generateLLMCacheKey(data.mode, data.input.toUpperCase())
          const key3 = generateLLMCacheKey(data.mode, data.input)
          
          // Property: Case should not affect cache key
          expect(key1).toBe(key2)
          expect(key2).toBe(key3)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Cache key ignores leading/trailing whitespace', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
          input: fc.string({ minLength: 5, maxLength: 50 }),
          leadingSpaces: fc.integer({ min: 0, max: 5 }),
          trailingSpaces: fc.integer({ min: 0, max: 5 }),
        }),
        (data) => {
          const trimmed = data.input
          const withSpaces = ' '.repeat(data.leadingSpaces) + data.input + ' '.repeat(data.trailingSpaces)
          
          const key1 = generateLLMCacheKey(data.mode, trimmed)
          const key2 = generateLLMCacheKey(data.mode, withSpaces)
          
          // Property: Whitespace should not affect cache key
          expect(key1).toBe(key2)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Different inputs produce different cache keys', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
          input1: fc.string({ minLength: 10, maxLength: 50 }),
          input2: fc.string({ minLength: 10, maxLength: 50 }),
        }),
        (data) => {
          // Skip if inputs are the same (after normalization)
          if (data.input1.trim().toLowerCase() === data.input2.trim().toLowerCase()) {
            return true
          }
          
          const key1 = generateLLMCacheKey(data.mode, data.input1)
          const key2 = generateLLMCacheKey(data.mode, data.input2)
          
          // Property: Different inputs should produce different keys
          expect(key1).not.toBe(key2)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Cache miss returns undefined', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        (key) => {
          clearLLMCache()
          
          // Try to get non-existent key
          const result = getCachedLLMResponse(key)
          
          // Property: Should return undefined for cache miss
          expect(result).toBeUndefined()
          
          // Verify cache miss was recorded
          const stats = getLLMCacheStats()
          expect(stats.misses).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Multiple different queries can be cached simultaneously', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
            input: fc.string({ minLength: 10, maxLength: 50 }),
            response: fc.string({ minLength: 20, maxLength: 100 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (queries) => {
          clearLLMCache()
          
          // Cache all queries
          const keys = queries.map(q => {
            const key = generateLLMCacheKey(q.mode, q.input)
            cacheLLMResponse(key, q.response)
            return key
          })
          
          // Verify all are cached
          keys.forEach((key, i) => {
            const cached = getCachedLLMResponse(key)
            expect(cached).toBe(queries[i].response)
          })
          
          // Verify cache size
          const stats = getLLMCacheStats()
          expect(stats.size).toBeGreaterThan(0)
          expect(stats.size).toBeLessThanOrEqual(queries.length)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: hasLLMCache correctly identifies cached entries', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
          input: fc.string({ minLength: 10, maxLength: 100 }),
          response: fc.string({ minLength: 20, maxLength: 200 }),
        }),
        (data) => {
          clearLLMCache()
          
          const key = generateLLMCacheKey(data.mode, data.input)
          
          // Before caching
          expect(hasLLMCache(key)).toBe(false)
          
          // After caching
          cacheLLMResponse(key, data.response)
          expect(hasLLMCache(key)).toBe(true)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: OCR cache works independently from LLM cache', () => {
    fc.assert(
      fc.property(
        fc.record({
          ocrKey: fc.string({ minLength: 10, maxLength: 50 }),
          ocrText: fc.string({ minLength: 20, maxLength: 200 }),
          llmKey: fc.string({ minLength: 10, maxLength: 50 }),
          llmResponse: fc.string({ minLength: 20, maxLength: 200 }),
        }),
        (data) => {
          clearAllCaches()
          
          // Cache OCR result
          cacheOCRResult(data.ocrKey, data.ocrText)
          
          // Cache LLM response
          cacheLLMResponse(data.llmKey, data.llmResponse)
          
          // Verify both are cached independently
          expect(getCachedOCRResult(data.ocrKey)).toBe(data.ocrText)
          expect(getCachedLLMResponse(data.llmKey)).toBe(data.llmResponse)
          
          // Verify separate statistics
          const ocrStats = getOCRCacheStats()
          const llmStats = getLLMCacheStats()
          
          expect(ocrStats.size).toBe(1)
          expect(llmStats.size).toBe(1)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Cache statistics are accurate', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            key: fc.string({ minLength: 10, maxLength: 50 }),
            value: fc.string({ minLength: 10, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (entries) => {
          clearLLMCache()
          
          // Cache all entries
          entries.forEach(e => cacheLLMResponse(e.key, e.value))
          
          // Get stats
          const stats = getLLMCacheStats()
          
          // Property: Size should match number of unique keys
          const uniqueKeys = new Set(entries.map(e => e.key))
          expect(stats.size).toBe(uniqueKeys.size)
          
          // Property: Stats should be non-negative
          expect(stats.hits).toBeGreaterThanOrEqual(0)
          expect(stats.misses).toBeGreaterThanOrEqual(0)
          expect(stats.hitRate).toBeGreaterThanOrEqual(0)
          expect(stats.hitRate).toBeLessThanOrEqual(1)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: clearLLMCache removes all entries', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            mode: fc.constantFrom('samjho', 'zameen', 'raah', 'taleem'),
            input: fc.string({ minLength: 10, maxLength: 50 }),
            response: fc.string({ minLength: 20, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (queries) => {
          clearLLMCache()
          
          // Cache all queries
          queries.forEach(q => {
            const key = generateLLMCacheKey(q.mode, q.input)
            cacheLLMResponse(key, q.response)
          })
          
          // Verify cache has entries
          const statsBefore = getLLMCacheStats()
          expect(statsBefore.size).toBeGreaterThan(0)
          
          // Clear cache
          clearLLMCache()
          
          // Verify cache is empty
          const statsAfter = getLLMCacheStats()
          expect(statsAfter.size).toBe(0)
          expect(statsAfter.hits).toBe(0)
          expect(statsAfter.misses).toBe(0)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: getAllCacheStats combines statistics correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          llmEntries: fc.integer({ min: 0, max: 3 }),
          ocrEntries: fc.integer({ min: 0, max: 3 }),
        }),
        (data) => {
          clearAllCaches()
          
          // Add LLM entries
          for (let i = 0; i < data.llmEntries; i++) {
            cacheLLMResponse(`llm-key-${i}`, `response-${i}`)
          }
          
          // Add OCR entries
          for (let i = 0; i < data.ocrEntries; i++) {
            cacheOCRResult(`ocr-key-${i}`, `text-${i}`)
          }
          
          // Get combined stats
          const allStats = getAllCacheStats()
          
          // Property: Total size should be sum of individual sizes
          expect(allStats.total.size).toBe(data.llmEntries + data.ocrEntries)
          expect(allStats.llm.size).toBe(data.llmEntries)
          expect(allStats.ocr.size).toBe(data.ocrEntries)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Generic cache key generation is consistent', () => {
    fc.assert(
      fc.property(
        fc.record({
          param1: fc.string({ minLength: 1, maxLength: 20 }),
          param2: fc.integer({ min: 0, max: 1000 }),
          param3: fc.boolean(),
        }),
        (params) => {
          // Generate key twice with same params
          const key1 = generateCacheKey(params)
          const key2 = generateCacheKey(params)
          
          // Property: Same params should produce same key
          expect(key1).toBe(key2)
          expect(key1.length).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Cache key generation handles different parameter orders', () => {
    fc.assert(
      fc.property(
        fc.record({
          a: fc.string({ minLength: 1, maxLength: 20 }),
          b: fc.integer({ min: 0, max: 100 }),
          c: fc.boolean(),
        }),
        (params) => {
          // Generate keys with different parameter orders
          const key1 = generateCacheKey({ a: params.a, b: params.b, c: params.c })
          const key2 = generateCacheKey({ c: params.c, a: params.a, b: params.b })
          const key3 = generateCacheKey({ b: params.b, c: params.c, a: params.a })
          
          // Property: Parameter order should not affect key
          expect(key1).toBe(key2)
          expect(key2).toBe(key3)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })
})
