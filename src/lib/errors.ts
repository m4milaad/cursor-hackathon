/**
 * Error Handling Utilities for RAASTA AI Companion
 * 
 * This module provides:
 * - ServiceError and ValidationError types
 * - Error message mapping to Roman Urdu
 * - Error logging utility with timestamp and service tracking
 * - PII filtering for log entries
 * - Retry logic with exponential backoff
 * - Context preservation on failures
 */

// ============================================
// Types
// ============================================

export type ServiceName = 'ocr' | 'vision' | 'llm' | 'whisper' | 'tts' | 'mandi'

export interface ServiceError {
  service: ServiceName
  code: string
  message: string
  userMessage: string  // Roman Urdu message for display
  timestamp: Date
  retryable: boolean
  originalError?: unknown
}

export interface ValidationError {
  field: string
  message: string
  userMessage: string  // Roman Urdu message for display
}

// ============================================
// Error Message Mapping to Roman Urdu
// ============================================

const ERROR_MESSAGES: Record<string, string> = {
  // OCR errors
  'ocr_failed': 'Tasveer se text padh na paye. Roshni achhi ho aur dubara photo lein.',
  'ocr_no_text': 'Tasveer mein koi text nahi mila. Saaf aur qareeb se photo lein.',
  'ocr_low_confidence': 'Text theek se nahi padh paye. Behtar roshni mein dobara koshish karen.',
  
  // Vision errors
  'vision_failed': 'Patti ki tasveer se bimari pehchan na paye. Qareeb se aur saaf photo lein.',
  'vision_no_disease': 'Tasveer mein koi bimari nahi mili. Agar masla hai to aur qareeb se photo lein.',
  'vision_unsupported_crop': 'Yeh fasal abhi support nahi hai. Apple, rice, wheat, ya saffron ki photo lein.',
  
  // LLM errors
  'llm_failed': 'Jawab nahi de paye. Thodi der baad dobara koshish karen.',
  'llm_timeout': 'Bohot waqt lag gaya. Dobara koshish karen.',
  'llm_rate_limit': 'Bohot zyada requests ho gayi. Thodi der baad koshish karen.',
  
  // Whisper errors
  'whisper_failed': 'Awaaz samajh nahi aayi. Zor se bolen ya text mein likhen.',
  'whisper_no_audio': 'Koi awaaz record nahi hui. Microphone check karen.',
  'whisper_file_too_large': 'Audio file bohot badi hai. 60 second se kam record karen.',
  
  // TTS errors
  'tts_failed': 'Awaaz nahi bana paye. Text padh len.',
  'tts_not_supported': 'Aapke browser mein awaaz nahi chal sakti. Text padh len.',
  
  // Mandi errors
  'mandi_failed': 'Mandi ki qeemat nahi mil payi. Baad mein dobara koshish karen.',
  'mandi_no_price': 'Is fasal ki qeemat abhi available nahi hai.',
  
  // Network errors
  'network_offline': 'Internet connection nahi hai. Connection check karen.',
  'network_timeout': 'Connection bohot slow hai. Dobara koshish karen.',
  
  // Validation errors
  'invalid_image': 'Tasveer theek nahi hai. JPEG ya PNG file upload karen.',
  'image_too_large': 'Tasveer bohot badi hai. 10MB se choti file upload karen.',
  'invalid_audio': 'Audio file theek nahi hai. Dobara record karen.',
  'empty_input': 'Kuch likhen ya bolen.',
  
  // Permission errors
  'camera_denied': 'Camera ki permission nahi hai. Settings mein permission den.',
  'microphone_denied': 'Microphone ki permission nahi hai. Settings mein permission den.',
  
  // Generic errors
  'unknown_error': 'Kuch galat ho gaya. Dobara koshish karen.',
}

/**
 * Get Roman Urdu error message for error code
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES['unknown_error']
}

// ============================================
// PII Filtering
// ============================================

// Patterns for detecting PII in logs
const PII_PATTERNS = [
  // Phone numbers (Indian format)
  /\b[6-9]\d{9}\b/g,
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Aadhaar numbers (12 digits)
  /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  // PAN numbers
  /\b[A-Z]{5}\d{4}[A-Z]\b/g,
  // Names (common patterns - basic detection)
  /\b(Mr|Mrs|Ms|Dr|Prof)\.?\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\b/g,
]

/**
 * Filter PII from log messages
 * Replaces detected PII with [REDACTED]
 */
export function filterPII(text: string): string {
  let filtered = text
  
  for (const pattern of PII_PATTERNS) {
    filtered = filtered.replace(pattern, '[REDACTED]')
  }
  
  return filtered
}

// ============================================
// Error Logging
// ============================================

/**
 * Log error with timestamp and service tracking
 * Automatically filters PII from log entries
 */
export function logError(
  service: ServiceName,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const filteredMessage = filterPII(errorMessage)
  
  // Filter PII from context
  const filteredContext = context ? 
    Object.fromEntries(
      Object.entries(context).map(([key, value]) => [
        key,
        typeof value === 'string' ? filterPII(value) : value
      ])
    ) : undefined
  
  console.error(`[${timestamp}] [${service.toUpperCase()}] ${filteredMessage}`, {
    context: filteredContext,
    stack: error instanceof Error ? error.stack : undefined
  })
}

/**
 * Log info message with PII filtering
 */
export function logInfo(
  service: ServiceName,
  message: string,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString()
  const filteredMessage = filterPII(message)
  
  // Filter PII from context
  const filteredContext = context ? 
    Object.fromEntries(
      Object.entries(context).map(([key, value]) => [
        key,
        typeof value === 'string' ? filterPII(value) : value
      ])
    ) : undefined
  
  console.log(`[${timestamp}] [${service.toUpperCase()}] ${filteredMessage}`, filteredContext)
}

// ============================================
// Error Creation Helpers
// ============================================

/**
 * Create a ServiceError with Roman Urdu message
 */
export function createServiceError(
  service: ServiceName,
  code: string,
  message: string,
  retryable: boolean = true,
  originalError?: unknown
): ServiceError {
  return {
    service,
    code,
    message,
    userMessage: getErrorMessage(code),
    timestamp: new Date(),
    retryable,
    originalError
  }
}

/**
 * Create a ValidationError with Roman Urdu message
 */
export function createValidationError(
  field: string,
  code: string,
  message: string
): ValidationError {
  return {
    field,
    message,
    userMessage: getErrorMessage(code)
  }
}

// ============================================
// Retry Logic with Exponential Backoff
// ============================================

export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryableErrors?: string[]
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: []
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Result of successful function call
 * @throws Last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: unknown
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Check if error is retryable
      if (error instanceof Error && opts.retryableErrors.length > 0) {
        const isRetryable = opts.retryableErrors.some(code => 
          error.message.includes(code)
        )
        if (!isRetryable) {
          throw error
        }
      }
      
      // Don't wait after last attempt
      if (attempt === opts.maxAttempts) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      )
      
      console.log(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// ============================================
// Network Error Detection
// ============================================

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('offline')
    )
  }
  return false
}

/**
 * Check if browser is offline
 */
export function isOffline(): boolean {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return !navigator.onLine
  }
  return false
}

/**
 * Get appropriate error message for network issues
 */
export function getNetworkErrorMessage(): string {
  if (isOffline()) {
    return getErrorMessage('network_offline')
  }
  return getErrorMessage('network_timeout')
}

// ============================================
// Context Preservation
// ============================================

/**
 * Preserve form data in session storage on error
 * Useful for retry without losing user context
 */
export function preserveFormContext(
  formId: string,
  data: Record<string, unknown>
): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      // Filter PII before storing
      const filteredData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          typeof value === 'string' ? filterPII(value) : value
        ])
      )
      
      sessionStorage.setItem(`form_context_${formId}`, JSON.stringify(filteredData))
    } catch (error) {
      console.warn('Failed to preserve form context:', error)
    }
  }
}

/**
 * Restore form data from session storage
 */
export function restoreFormContext(formId: string): Record<string, unknown> | null {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`form_context_${formId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to restore form context:', error)
    }
  }
  return null
}

/**
 * Clear preserved form context
 */
export function clearFormContext(formId: string): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(`form_context_${formId}`)
    } catch (error) {
      console.warn('Failed to clear form context:', error)
    }
  }
}
