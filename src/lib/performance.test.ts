/**
 * Unit Tests for Performance Optimizations
 * Feature: raasta-ai-companion
 * 
 * Tests for:
 * - Image compression quality and size
 * - Cache hit/miss scenarios
 * - Parallel execution timing
 * 
 * Requirements: 16.1, 16.2, 16.4
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import {
  compressImage,
  compressForUpload,
  compressForApi,
  needsCompression,
  getCompressionStats,
} from './imageCompression'
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
  clearOCRCache,
  clearAllCaches,
  getAllCacheStats,
} from './cache'
import {
  LoadingStateManager,
  executeParallel,
  executeParallelSafe,
  withLoadingState,
  WorkflowOptimizer,
} from './parallel'

// ============================================
// Test Helpers
// ============================================

/**
 * Create a real image file from canvas
 */
async function createTestImage(
  width: number,
  height: number,
  name: string = 'test.jpg'
): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'blue'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = 'white'
    ctx.fillRect(10, 10, width - 20, height - 20)
  }
  
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
      'image/jpeg',
      0.9
    )
  })
  
  return new File([blob], name, { type: 'image/jpeg' })
}

/**
 * Create a mock async operation
 */
function createMockOp<T>(value: T, delay: number): () => Promise<T> {
  return async () => {
    await new Promise(resolve => setTimeout(resolve, delay))
    return value
  }
}

// ============================================
// Image Compression Tests
// Requirements: 16.1
// ============================================

describe('Image Compression - Unit Tests', () => {
  test('compressForUpload produces files under 10MB', async () => {
    const file = await createTestImage(1000, 1000)
    const compressed = await compressForUpload(file)
    
    expect(compressed.size).toBeLessThanOrEqual(10 * 1024 * 1024)
    expect(compressed.type).toMatch(/^image\/(jpeg|jpg)/)
  }, 15000)

  test('compressForApi produces files under 2MB', async () => {
    const file = await createTestImage(1500, 1500)
    const compressed = await compressForApi(file)
    
    expect(compressed.size).toBeLessThanOrEqual(2 * 1024 * 1024)
    expect(compressed.type).toMatch(/^image\/(jpeg|jpg)/)
  }, 15000)

  test('needsCompression correctly identifies oversized files', () => {
    const smallFile = new File([new Uint8Array(1024 * 1024)], 'small.jpg', {
      type: 'image/jpeg',
    })
    const largeFile = new File([new Uint8Array(15 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })
    
    expect(needsCompression(smallFile, 'upload')).toBe(false)
    expect(needsCompression(largeFile, 'upload')).toBe(true)
    expect(needsCompression(smallFile, 'api')).toBe(false)
    expect(needsCompression(largeFile, 'api')).toBe(true)
  })

  test('compressImage returns valid compression result', async () => {
    const file = await createTestImage(800, 800)
    const result = await compressImage(file, {
      target: 'api',
      quality: 0.8,
    })
    
    expect(result.file).toBeInstanceOf(File)
    expect(result.originalSize).toBe(file.size)
    expect(result.compressedSize).toBe(result.file.size)
    expect(result.compressionRatio).toBeGreaterThan(0)
    expect(result.compressionRatio).toBeLessThanOrEqual(1)
    expect(result.format).toBeTruthy()
  }, 15000)

  test('getCompressionStats returns formatted string', async () => {
    const file = await createTestImage(1000, 1000)
    const result = await compressImage(file, {
      target: 'api',
      quality: 0.7,
    })
    
    const stats = getCompressionStats(result)
    
    expect(typeof stats).toBe('string')
    expect(stats).toContain('MB')
    expect(stats).toContain('%')
    expect(stats).toContain('reduction')
  }, 15000)

  test('compression with different quality levels produces different sizes', async () => {
    const file = await createTestImage(800, 800)
    
    const highQuality = await compressImage(file, {
      target: 'api',
      quality: 0.9,
    })
    
    const lowQuality = await compressImage(file, {
      target: 'api',
      quality: 0.5,
    })
    
    // Lower quality should produce smaller or equal file
    expect(lowQuality.compressedSize).toBeLessThanOrEqual(highQuality.compressedSize)
  }, 15000)
})

// ============================================
// Cache Tests
// Requirements: 16.2
// ============================================

describe('Response Caching - Unit Tests', () => {
  beforeEach(() => {
    clearAllCaches()
  })

  test('LLM cache stores and retrieves responses', () => {
    const key = generateLLMCacheKey('samjho', 'test input')
    const response = 'test response'
    
    cacheLLMResponse(key, response)
    const cached = getCachedLLMResponse(key)
    
    expect(cached).toBe(response)
  })

  test('LLM cache returns undefined for non-existent keys', () => {
    const result = getCachedLLMResponse('non-existent-key')
    expect(result).toBeUndefined()
  })

  test('hasLLMCache correctly identifies cached entries', () => {
    const key = generateLLMCacheKey('raah', 'question')
    
    expect(hasLLMCache(key)).toBe(false)
    
    cacheLLMResponse(key, 'answer')
    
    expect(hasLLMCache(key)).toBe(true)
  })

  test('clearLLMCache removes all entries', () => {
    cacheLLMResponse('key1', 'response1')
    cacheLLMResponse('key2', 'response2')
    
    let stats = getLLMCacheStats()
    expect(stats.size).toBe(2)
    
    clearLLMCache()
    
    stats = getLLMCacheStats()
    expect(stats.size).toBe(0)
  })

  test('cache statistics track hits and misses', () => {
    const key = 'test-key'
    cacheLLMResponse(key, 'response')
    
    // Hit
    getCachedLLMResponse(key)
    
    // Miss
    getCachedLLMResponse('non-existent')
    
    const stats = getLLMCacheStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.5, 2)
  })

  test('OCR cache works independently from LLM cache', () => {
    const ocrKey = 'ocr-key'
    const llmKey = 'llm-key'
    
    cacheOCRResult(ocrKey, 'ocr text')
    cacheLLMResponse(llmKey, 'llm response')
    
    expect(getCachedOCRResult(ocrKey)).toBe('ocr text')
    expect(getCachedLLMResponse(llmKey)).toBe('llm response')
    
    clearOCRCache()
    
    expect(getCachedOCRResult(ocrKey)).toBeUndefined()
    expect(getCachedLLMResponse(llmKey)).toBe('llm response')
  })

  test('getAllCacheStats combines statistics', () => {
    cacheLLMResponse('llm1', 'response1')
    cacheLLMResponse('llm2', 'response2')
    cacheOCRResult('ocr1', 'text1')
    
    const allStats = getAllCacheStats()
    
    expect(allStats.llm.size).toBe(2)
    expect(allStats.ocr.size).toBe(1)
    expect(allStats.total.size).toBe(3)
  })

  test('generateCacheKey is deterministic', () => {
    const params = { mode: 'samjho', input: 'test', extra: 123 }
    
    const key1 = generateCacheKey(params)
    const key2 = generateCacheKey(params)
    
    expect(key1).toBe(key2)
    expect(key1.length).toBeGreaterThan(0)
  })

  test('generateCacheKey handles parameter order', () => {
    const key1 = generateCacheKey({ a: 1, b: 2, c: 3 })
    const key2 = generateCacheKey({ c: 3, a: 1, b: 2 })
    
    expect(key1).toBe(key2)
  })

  test('generateLLMCacheKey normalizes input', () => {
    const key1 = generateLLMCacheKey('samjho', '  Test Input  ')
    const key2 = generateLLMCacheKey('samjho', 'test input')
    
    expect(key1).toBe(key2)
  })

  test('cache hit rate calculation is correct', () => {
    clearLLMCache()
    
    const key = 'test-key'
    cacheLLMResponse(key, 'response')
    
    // 3 hits
    getCachedLLMResponse(key)
    getCachedLLMResponse(key)
    getCachedLLMResponse(key)
    
    // 1 miss
    getCachedLLMResponse('other-key')
    
    const stats = getLLMCacheStats()
    expect(stats.hits).toBe(3)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.75, 2)
  })
})

// ============================================
// Parallel Execution Tests
// Requirements: 16.4
// ============================================

describe('Parallel Execution - Unit Tests', () => {
  test('executeParallel runs operations in parallel', async () => {
    const ops = [
      createMockOp('a', 100),
      createMockOp('b', 100),
      createMockOp('c', 100),
    ]
    
    const start = Date.now()
    const results = await executeParallel(ops)
    const duration = Date.now() - start
    
    expect(results).toEqual(['a', 'b', 'c'])
    // Should take ~100ms (parallel), not ~300ms (sequential)
    expect(duration).toBeLessThan(250)
  }, 10000)

  test('executeParallelSafe handles failures', async () => {
    const ops = [
      createMockOp('success', 50),
      async () => { throw new Error('fail') },
      createMockOp('success2', 50),
    ]
    
    const results = await executeParallelSafe(ops)
    
    expect(results.length).toBe(3)
    expect(results[0]).toBe('success')
    expect(results[1]).toBeNull()
    expect(results[2]).toBe('success2')
  }, 10000)

  test('LoadingStateManager tracks loading states', () => {
    const manager = new LoadingStateManager()
    
    expect(manager.isLoading('test')).toBe(false)
    
    manager.setLoading('test', true)
    expect(manager.isLoading('test')).toBe(true)
    
    manager.setLoading('test', false)
    expect(manager.isLoading('test')).toBe(false)
  })

  test('LoadingStateManager tracks multiple keys', () => {
    const manager = new LoadingStateManager()
    
    manager.setLoading('key1', true)
    manager.setLoading('key2', true)
    manager.setLoading('key3', true)
    
    const activeKeys = manager.getActiveKeys()
    expect(activeKeys.length).toBe(3)
    expect(activeKeys).toContain('key1')
    expect(activeKeys).toContain('key2')
    expect(activeKeys).toContain('key3')
  })

  test('LoadingStateManager subscription works', () => {
    const manager = new LoadingStateManager()
    const states: boolean[] = []
    
    manager.subscribe('test', (loading) => {
      states.push(loading)
    })
    
    manager.setLoading('test', true)
    manager.setLoading('test', false)
    
    expect(states).toEqual([true, false])
  })

  test('LoadingStateManager unsubscription works', () => {
    const manager = new LoadingStateManager()
    let callCount = 0
    
    const unsubscribe = manager.subscribe('test', () => {
      callCount++
    })
    
    manager.setLoading('test', true)
    expect(callCount).toBe(1)
    
    unsubscribe()
    
    manager.setLoading('test', false)
    expect(callCount).toBe(1) // Should not increase
  })

  test('withLoadingState manages loading state', async () => {
    const manager = new LoadingStateManager()
    
    const promise = withLoadingState(
      'test',
      createMockOp('result', 100),
      manager
    )
    
    // Should be loading during execution
    expect(manager.isLoading('test')).toBe(true)
    
    const result = await promise
    
    // Should not be loading after completion
    expect(manager.isLoading('test')).toBe(false)
    expect(result).toBe('result')
  }, 10000)

  test('WorkflowOptimizer tracks workflow duration', async () => {
    const optimizer = new WorkflowOptimizer()
    
    await optimizer.executeWorkflow('test', async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
      return 'done'
    })
    
    const elapsed = optimizer.getElapsedTime()
    expect(elapsed).toBeGreaterThanOrEqual(150)
    expect(elapsed).toBeLessThan(300)
  }, 10000)

  test('WorkflowOptimizer identifies budget violations', async () => {
    const optimizer = new WorkflowOptimizer()
    
    // Fast workflow (within budget)
    await optimizer.executeWorkflow('fast', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return 'done'
    })
    
    expect(optimizer.isWithinBudget()).toBe(true)
  }, 10000)

  test('WorkflowOptimizer calculates remaining time', () => {
    const optimizer = new WorkflowOptimizer()
    optimizer.startWorkflow()
    
    const remaining = optimizer.getRemainingTime()
    
    expect(remaining).toBeGreaterThan(0)
    expect(remaining).toBeLessThanOrEqual(15000)
  })

  test('LoadingStateManager clear removes all states', () => {
    const manager = new LoadingStateManager()
    
    manager.setLoading('key1', true)
    manager.setLoading('key2', true)
    
    expect(manager.getActiveKeys().length).toBe(2)
    
    manager.clear()
    
    expect(manager.getActiveKeys().length).toBe(0)
    expect(manager.isLoading('key1')).toBe(false)
    expect(manager.isLoading('key2')).toBe(false)
  })
})
