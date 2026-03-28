/**
 * Response Caching System
 * 
 * Provides in-memory caching for:
 * - LLM responses (1 hour expiry)
 * - OCR results (1 hour expiry)
 * - Mandi prices (6 hours expiry - integrated from mandi.ts)
 * 
 * Requirements: 16.2, 25.4, 35.1
 */

import crypto from 'crypto'

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  data: T
  timestamp: Date
  expiresAt: Date
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
}

/**
 * Generic in-memory cache with expiration
 */
class InMemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private hits = 0
  private misses = 0

  /**
   * Set a value in the cache with expiration
   */
  set(key: string, value: T, expiryMs: number): void {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiryMs)

    this.cache.set(key, {
      data: value,
      timestamp: now,
      expiresAt,
    })
  }

  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return undefined
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key)
      this.misses++
      return undefined
    }

    this.hits++
    return entry.data
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    // Clean up expired entries first
    this.cleanExpired()

    const total = this.hits + this.misses
    const hitRate = total > 0 ? this.hits / total : 0

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    }
  }

  /**
   * Remove expired entries
   */
  private cleanExpired(): void {
    const now = new Date()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get all keys (for testing)
   */
  keys(): string[] {
    this.cleanExpired()
    return Array.from(this.cache.keys())
  }
}

// ============================================
// Cache Instances
// ============================================

/**
 * LLM response cache (1 hour expiry)
 * Requirement 16.2
 */
const llmCache = new InMemoryCache<string>()

/**
 * OCR result cache (1 hour expiry)
 * Requirement 16.2
 */
const ocrCache = new InMemoryCache<string>()

// ============================================
// Cache Key Generation
// ============================================

/**
 * Generate a cache key from request parameters using hashing
 * Requirement 16.2
 */
export function generateCacheKey(params: Record<string, unknown>): string {
  // Sort keys for consistent hashing
  const sortedKeys = Object.keys(params).sort()
  const normalized = sortedKeys.map(key => `${key}:${JSON.stringify(params[key])}`).join('|')
  
  // Use SHA-256 hash for cache key
  const hash = crypto.createHash('sha256').update(normalized).digest('hex')
  return hash
}

/**
 * Generate cache key for LLM request
 */
export function generateLLMCacheKey(
  mode: string,
  input: string,
  additionalParams?: Record<string, unknown>
): string {
  return generateCacheKey({
    mode,
    input: input.trim().toLowerCase(),
    ...additionalParams,
  })
}

/**
 * Generate cache key for OCR request
 * Uses image hash to identify identical images
 */
export function generateOCRCacheKey(imageData: ArrayBuffer): string {
  // Hash the image data
  const buffer = Buffer.from(imageData)
  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  return `ocr:${hash}`
}

// ============================================
// LLM Response Caching
// ============================================

/**
 * Cache an LLM response
 * Requirement 16.2, 25.4
 */
export function cacheLLMResponse(key: string, response: string): void {
  const ONE_HOUR = 60 * 60 * 1000
  llmCache.set(key, response, ONE_HOUR)
}

/**
 * Get cached LLM response
 * Returns undefined if not found or expired
 * Requirement 16.2
 */
export function getCachedLLMResponse(key: string): string | undefined {
  return llmCache.get(key)
}

/**
 * Check if LLM response is cached
 */
export function hasLLMCache(key: string): boolean {
  return llmCache.has(key)
}

/**
 * Clear LLM cache
 */
export function clearLLMCache(): void {
  llmCache.clear()
}

/**
 * Get LLM cache statistics
 */
export function getLLMCacheStats(): CacheStats {
  return llmCache.getStats()
}

// ============================================
// OCR Result Caching
// ============================================

/**
 * Cache an OCR result
 * Requirement 16.2
 */
export function cacheOCRResult(key: string, text: string): void {
  const ONE_HOUR = 60 * 60 * 1000
  ocrCache.set(key, text, ONE_HOUR)
}

/**
 * Get cached OCR result
 * Returns undefined if not found or expired
 */
export function getCachedOCRResult(key: string): string | undefined {
  return ocrCache.get(key)
}

/**
 * Check if OCR result is cached
 */
export function hasOCRCache(key: string): boolean {
  return ocrCache.has(key)
}

/**
 * Clear OCR cache
 */
export function clearOCRCache(): void {
  ocrCache.clear()
}

/**
 * Get OCR cache statistics
 */
export function getOCRCacheStats(): CacheStats {
  return ocrCache.getStats()
}

// ============================================
// Cache Management
// ============================================

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  llmCache.clear()
  ocrCache.clear()
}

/**
 * Get combined cache statistics
 */
export function getAllCacheStats(): {
  llm: CacheStats
  ocr: CacheStats
  total: CacheStats
} {
  const llmStats = llmCache.getStats()
  const ocrStats = ocrCache.getStats()

  return {
    llm: llmStats,
    ocr: ocrStats,
    total: {
      size: llmStats.size + ocrStats.size,
      hits: llmStats.hits + ocrStats.hits,
      misses: llmStats.misses + ocrStats.misses,
      hitRate:
        llmStats.hits + ocrStats.hits > 0
          ? (llmStats.hits + ocrStats.hits) / (llmStats.hits + ocrStats.hits + llmStats.misses + ocrStats.misses)
          : 0,
    },
  }
}

/**
 * Periodic cleanup of expired entries
 * Should be called periodically (e.g., every 5 minutes)
 */
export function cleanupExpiredEntries(): void {
  llmCache.getStats() // Triggers cleanup
  ocrCache.getStats() // Triggers cleanup
}

// ============================================
// Cache Utilities
// ============================================

/**
 * Get or set cached value with generator function
 * 
 * @param cache - Cache instance to use
 * @param key - Cache key
 * @param generator - Function to generate value if not cached
 * @param expiryMs - Expiry time in milliseconds
 * @returns Cached or generated value
 */
export async function getOrSet<T>(
  cache: InMemoryCache<T>,
  key: string,
  generator: () => Promise<T>,
  expiryMs: number
): Promise<T> {
  const cached = cache.get(key)
  if (cached !== undefined) {
    return cached
  }

  const value = await generator()
  cache.set(key, value, expiryMs)
  return value
}

/**
 * Wrap a function with caching
 * 
 * @param fn - Function to wrap
 * @param keyGenerator - Function to generate cache key from arguments
 * @param expiryMs - Expiry time in milliseconds
 * @returns Wrapped function with caching
 */
export function withCache<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  expiryMs: number
): (...args: TArgs) => Promise<TResult> {
  const cache = new InMemoryCache<TResult>()

  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args)
    return getOrSet(cache, key, () => fn(...args), expiryMs)
  }
}
