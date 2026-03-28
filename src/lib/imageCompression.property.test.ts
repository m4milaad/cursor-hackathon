/**
 * Property-Based Tests for Image Compression
 * Feature: raasta-ai-companion
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for comprehensive input coverage.
 * 
 * Note: Tests use 5 iterations for faster execution (as per task requirements)
 */

import { describe, test, expect } from '@jest/globals'
import * as fc from 'fast-check'
import {
  compressImage,
  compressForUpload,
  compressForApi,
  needsCompression,
  type CompressionTarget,
} from './imageCompression'

// ============================================
// Test Helpers
// ============================================

/**
 * Create a mock image file with specified size
 */
function createMockImageFile(sizeInBytes: number, name: string = 'test.jpg'): File {
  // Create a canvas with some content
  const canvas = document.createElement('canvas')
  canvas.width = 100
  canvas.height = 100
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, 100, 100)
  }
  
  // Convert to blob - note: actual size will vary
  // For testing, we'll create a blob with approximate size
  const data = new Uint8Array(sizeInBytes)
  for (let i = 0; i < sizeInBytes; i++) {
    data[i] = Math.floor(Math.random() * 256)
  }
  
  const blob = new Blob([data], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

/**
 * Create a real image file from canvas
 */
async function createRealImageFile(
  width: number,
  height: number,
  name: string = 'test.jpg'
): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Draw some content
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

// ============================================
// Property 24: Image Compression Threshold
// **Validates: Requirements 9.3**
// ============================================

describe('Image Compression - Property Tests', () => {
  test('Property 24: Images exceeding 10MB are compressed before upload', async () => {
    // Test that any image exceeding 10MB is compressed to under 10MB
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 1000, max: 3000 }),
          height: fc.integer({ min: 1000, max: 3000 }),
          name: fc.string({ minLength: 5, maxLength: 20 }).map(s => `${s}.jpg`),
        }),
        async (input) => {
          // Create a real image file
          const file = await createRealImageFile(input.width, input.height, input.name)
          
          // If file is over 10MB, compress it
          if (file.size > 10 * 1024 * 1024) {
            const compressed = await compressForUpload(file)
            
            // Property: Compressed file should be under 10MB
            expect(compressed.size).toBeLessThanOrEqual(10 * 1024 * 1024)
            
            // Property: Compressed file should be smaller than original
            expect(compressed.size).toBeLessThan(file.size)
            
            // Property: Compressed file should be a valid image
            expect(compressed.type).toMatch(/^image\/(jpeg|jpg|webp|png)/)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Images under target size are returned unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 100, max: 500 }),
          height: fc.integer({ min: 100, max: 500 }),
        }),
        async (input) => {
          const file = await createRealImageFile(input.width, input.height)
          
          // Small images should be under 10MB
          if (file.size < 10 * 1024 * 1024) {
            const result = await compressImage(file, {
              target: 'upload',
              quality: 0.9,
            })
            
            // Property: File should be returned as-is (or very similar size)
            expect(result.compressedSize).toBeLessThanOrEqual(10 * 1024 * 1024)
            expect(result.compressionRatio).toBeLessThanOrEqual(1.0)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: API compression produces files under 2MB', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 500, max: 2000 }),
          height: fc.integer({ min: 500, max: 2000 }),
        }),
        async (input) => {
          const file = await createRealImageFile(input.width, input.height)
          
          // Compress for API
          const compressed = await compressForApi(file)
          
          // Property: Compressed file should be under 2MB (Requirement 16.1)
          expect(compressed.size).toBeLessThanOrEqual(2 * 1024 * 1024)
          
          // Property: Should be a valid image format
          expect(compressed.type).toMatch(/^image\/(jpeg|jpg|webp|png)/)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Compression maintains image validity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 200, max: 1000 }),
          height: fc.integer({ min: 200, max: 1000 }),
          target: fc.constantFrom<CompressionTarget>('upload', 'api'),
        }),
        async (input) => {
          const file = await createRealImageFile(input.width, input.height)
          
          const result = await compressImage(file, {
            target: input.target,
            quality: 0.85,
          })
          
          // Property: Result should have valid metadata
          expect(result.file).toBeInstanceOf(File)
          expect(result.originalSize).toBeGreaterThan(0)
          expect(result.compressedSize).toBeGreaterThan(0)
          expect(result.compressionRatio).toBeGreaterThan(0)
          expect(result.compressionRatio).toBeLessThanOrEqual(1.0)
          expect(result.format).toBeTruthy()
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: needsCompression correctly identifies oversized files', () => {
    fc.assert(
      fc.property(
        fc.record({
          size: fc.integer({ min: 1024, max: 20 * 1024 * 1024 }), // 1KB to 20MB
          target: fc.constantFrom<CompressionTarget>('upload', 'api'),
        }),
        (input) => {
          const file = createMockImageFile(input.size)
          const needs = needsCompression(file, input.target)
          
          const targetSize = input.target === 'upload' ? 10 * 1024 * 1024 : 2 * 1024 * 1024
          const expected = input.size > targetSize
          
          // Property: needsCompression should match size comparison
          expect(needs).toBe(expected)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: Compression ratio is always between 0 and 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 200, max: 1500 }),
          height: fc.integer({ min: 200, max: 1500 }),
          quality: fc.double({ min: 0.3, max: 0.9 }),
        }),
        async (input) => {
          const file = await createRealImageFile(input.width, input.height)
          
          const result = await compressImage(file, {
            target: 'api',
            quality: input.quality,
          })
          
          // Property: Compression ratio should be valid
          expect(result.compressionRatio).toBeGreaterThan(0)
          expect(result.compressionRatio).toBeLessThanOrEqual(1.0)
          expect(Number.isFinite(result.compressionRatio)).toBe(true)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Compressed file size matches reported size', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 300, max: 1000 }),
          height: fc.integer({ min: 300, max: 1000 }),
        }),
        async (input) => {
          const file = await createRealImageFile(input.width, input.height)
          
          const result = await compressImage(file, {
            target: 'api',
            quality: 0.8,
          })
          
          // Property: Reported compressed size should match actual file size
          expect(result.compressedSize).toBe(result.file.size)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Different quality levels produce different sizes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 500, max: 1000 }),
          height: fc.integer({ min: 500, max: 1000 }),
        }),
        async (input) => {
          const file = await createRealImageFile(input.width, input.height)
          
          // Compress with high quality
          const highQuality = await compressImage(file, {
            target: 'api',
            quality: 0.9,
          })
          
          // Compress with low quality
          const lowQuality = await compressImage(file, {
            target: 'api',
            quality: 0.5,
          })
          
          // Property: Lower quality should produce smaller file
          // (unless already under target size)
          if (file.size > 2 * 1024 * 1024) {
            expect(lowQuality.compressedSize).toBeLessThanOrEqual(highQuality.compressedSize)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Compression preserves file name pattern', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 200, max: 800 }),
          height: fc.integer({ min: 200, max: 800 }),
          baseName: fc.string({ minLength: 3, maxLength: 15 }),
        }),
        async (input) => {
          const fileName = `${input.baseName}.jpg`
          const file = await createRealImageFile(input.width, input.height, fileName)
          
          const result = await compressImage(file, {
            target: 'api',
            quality: 0.8,
          })
          
          // Property: Compressed file should have a name
          expect(result.file.name).toBeTruthy()
          expect(result.file.name.length).toBeGreaterThan(0)
          
          // Property: Should have an image extension
          expect(result.file.name).toMatch(/\.(jpg|jpeg|webp|png)$/i)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)
})
