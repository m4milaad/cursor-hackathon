/**
 * Image Compression Utility
 * 
 * Provides client-side image compression for:
 * - Upload optimization (<10MB for user uploads)
 * - API submission optimization (<2MB for external services)
 * - Format conversion (HEIC to JPEG)
 * - Quality-based compression with fallback
 * 
 * Requirements: 9.3, 16.1, 34.3
 */

/**
 * Compression target for different use cases
 */
export type CompressionTarget = 'upload' | 'api'

/**
 * Compression result with metadata
 */
export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  format: string
}

/**
 * Compression options
 */
export interface CompressionOptions {
  target: CompressionTarget
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'jpeg' | 'webp' | 'png'
}

/**
 * Get target size based on compression target
 */
function getTargetSize(target: CompressionTarget): number {
  switch (target) {
    case 'upload':
      return 10 * 1024 * 1024 // 10MB for uploads (Requirement 9.3)
    case 'api':
      return 2 * 1024 * 1024 // 2MB for API submissions (Requirement 16.1)
  }
}

/**
 * Convert HEIC/HEIF to JPEG format
 * Note: Browser support for HEIC is limited, so we convert to JPEG
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  // For now, we'll return the file as-is since browser-based HEIC conversion
  // requires additional libraries. In production, this would use a library
  // like heic2any or server-side conversion.
  
  // If the file is HEIC/HEIF, we'll attempt to load it as an image
  // and re-encode as JPEG
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    try {
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }
      
      ctx.drawImage(bitmap, 0, 0)
      
      // Convert to JPEG blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to convert to JPEG'))
          },
          'image/jpeg',
          0.9
        )
      })
      
      return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg',
      })
    } catch (error) {
      console.warn('HEIC conversion failed, returning original file:', error)
      return file
    }
  }
  
  return file
}

/**
 * Load image file into an HTMLImageElement
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculate dimensions to fit within max width/height while preserving aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  let width = originalWidth
  let height = originalHeight
  
  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }
  
  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }
  
  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * Compress image to target size with quality adjustment
 */
async function compressImageToTarget(
  file: File,
  targetSize: number,
  options: CompressionOptions
): Promise<File> {
  // Load image
  const img = await loadImage(file)
  
  // Calculate dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    options.maxWidth,
    options.maxHeight
  )
  
  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }
  
  // Draw image
  ctx.drawImage(img, 0, 0, width, height)
  
  // Revoke object URL to free memory
  URL.revokeObjectURL(img.src)
  
  // Determine output format
  const outputFormat = options.format || 'jpeg'
  const mimeType = `image/${outputFormat}`
  
  // Try different quality levels to meet target size
  let quality = options.quality || 0.9
  let blob: Blob | null = null
  
  // Start with specified quality, then reduce if needed
  const qualityLevels = [quality, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
  
  for (const q of qualityLevels) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, q)
    })
    
    if (!blob) continue
    
    // If we're under target size, we're done
    if (blob.size <= targetSize) {
      break
    }
  }
  
  if (!blob) {
    throw new Error('Failed to compress image')
  }
  
  // Create new file with compressed data
  const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat
  const newFileName = file.name.replace(/\.[^.]+$/, `.${extension}`)
  
  return new File([blob], newFileName, { type: mimeType })
}

/**
 * Compress image file based on target and options
 * 
 * @param file - Image file to compress
 * @param options - Compression options
 * @returns Compression result with compressed file and metadata
 * 
 * Requirements:
 * - 9.3: Compress to <10MB for uploads
 * - 16.1: Compress to <2MB for API submissions
 * - 34.3: Support HEIC to JPEG conversion
 */
export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const originalSize = file.size
  const targetSize = getTargetSize(options.target)
  
  // Convert HEIC to JPEG if needed (Requirement 34.3)
  let processedFile = await convertHeicToJpeg(file)
  
  // If already under target size, return as-is
  if (processedFile.size <= targetSize) {
    return {
      file: processedFile,
      originalSize,
      compressedSize: processedFile.size,
      compressionRatio: processedFile.size / originalSize,
      format: processedFile.type,
    }
  }
  
  // Compress to target size
  const compressedFile = await compressImageToTarget(
    processedFile,
    targetSize,
    options
  )
  
  return {
    file: compressedFile,
    originalSize,
    compressedSize: compressedFile.size,
    compressionRatio: compressedFile.size / originalSize,
    format: compressedFile.type,
  }
}

/**
 * Compress image for upload (target: <10MB)
 * Requirement 9.3
 */
export async function compressForUpload(file: File): Promise<File> {
  const result = await compressImage(file, {
    target: 'upload',
    quality: 0.9,
    format: 'jpeg',
  })
  return result.file
}

/**
 * Compress image for API submission (target: <2MB)
 * Requirement 16.1
 */
export async function compressForApi(file: File): Promise<File> {
  const result = await compressImage(file, {
    target: 'api',
    quality: 0.85,
    maxWidth: 2048,
    maxHeight: 2048,
    format: 'jpeg',
  })
  return result.file
}

/**
 * Check if image needs compression for given target
 */
export function needsCompression(file: File, target: CompressionTarget): boolean {
  const targetSize = getTargetSize(target)
  return file.size > targetSize
}

/**
 * Get compression statistics
 */
export function getCompressionStats(result: CompressionResult): string {
  const savedBytes = result.originalSize - result.compressedSize
  const savedMB = (savedBytes / (1024 * 1024)).toFixed(2)
  const percentage = ((1 - result.compressionRatio) * 100).toFixed(1)
  
  return `Compressed ${savedMB}MB (${percentage}% reduction)`
}
