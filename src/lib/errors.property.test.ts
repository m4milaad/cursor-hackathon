/**
 * Property-Based Tests for Error Handling
 * 
 * **Validates: Requirements 7.1**
 * 
 * Property 18: Error Messages in Roman Urdu
 * For any API failure or system error, the displayed error message SHALL be in Roman Urdu script.
 */

import { fc, test } from '@fast-check/jest'
import {
  createServiceError,
  createValidationError,
  getErrorMessage,
  filterPII,
  type ServiceName
} from './errors'

// ============================================
// Property 18: Error Messages in Roman Urdu
// ============================================

describe('Property 18: Error Messages in Roman Urdu', () => {
  /**
   * **Validates: Requirements 7.1**
   * 
   * For any service error, the userMessage SHALL be in Roman Urdu script
   */
  test.prop([
    fc.constantFrom<ServiceName>('ocr', 'vision', 'llm', 'whisper', 'tts', 'mandi'),
    fc.constantFrom(
      'ocr_failed', 'vision_failed', 'llm_failed', 'whisper_failed', 
      'tts_failed', 'mandi_failed', 'network_offline', 'unknown_error'
    ),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.boolean()
  ], { numRuns: 5 })(
    'service errors have Roman Urdu user messages',
    (service, code, message, retryable) => {
      const error = createServiceError(service, code, message, retryable)
      
      // User message should be non-empty
      expect(error.userMessage).toBeTruthy()
      expect(error.userMessage.length).toBeGreaterThan(0)
      
      // User message should be in Roman Urdu (contains Urdu words in Latin script)
      // Check for common Roman Urdu words
      const romanUrduWords = [
        'nahi', 'hai', 'karen', 'koshish', 'dobara', 'baad', 'mein',
        'tasveer', 'awaaz', 'text', 'photo', 'lein', 'bolen', 'likhen'
      ]
      
      const hasRomanUrdu = romanUrduWords.some(word => 
        error.userMessage.toLowerCase().includes(word)
      )
      
      expect(hasRomanUrdu).toBe(true)
      
      // Should not contain technical English error messages
      expect(error.userMessage).not.toMatch(/error|exception|failed|undefined|null/i)
    }
  )

  /**
   * **Validates: Requirements 7.1**
   * 
   * For any validation error, the userMessage SHALL be in Roman Urdu script
   */
  test.prop([
    fc.constantFrom('image', 'audio', 'text', 'file'),
    fc.constantFrom(
      'invalid_image', 'image_too_large', 'invalid_audio', 'empty_input'
    ),
    fc.string({ minLength: 1, maxLength: 100 })
  ], { numRuns: 5 })(
    'validation errors have Roman Urdu user messages',
    (field, code, message) => {
      const error = createValidationError(field, code, message)
      
      // User message should be non-empty
      expect(error.userMessage).toBeTruthy()
      expect(error.userMessage.length).toBeGreaterThan(0)
      
      // User message should be in Roman Urdu
      const romanUrduWords = [
        'nahi', 'hai', 'karen', 'koshish', 'dobara', 'baad', 'mein',
        'tasveer', 'awaaz', 'text', 'photo', 'lein', 'bolen', 'likhen',
        'theek', 'badi', 'choti', 'upload'
      ]
      
      const hasRomanUrdu = romanUrduWords.some(word => 
        error.userMessage.toLowerCase().includes(word)
      )
      
      expect(hasRomanUrdu).toBe(true)
    }
  )

  /**
   * **Validates: Requirements 7.1**
   * 
   * All error codes should map to Roman Urdu messages
   */
  test.prop([
    fc.constantFrom(
      'ocr_failed', 'ocr_no_text', 'ocr_low_confidence',
      'vision_failed', 'vision_no_disease', 'vision_unsupported_crop',
      'llm_failed', 'llm_timeout', 'llm_rate_limit',
      'whisper_failed', 'whisper_no_audio', 'whisper_file_too_large',
      'tts_failed', 'tts_not_supported',
      'mandi_failed', 'mandi_no_price',
      'network_offline', 'network_timeout',
      'invalid_image', 'image_too_large', 'invalid_audio', 'empty_input',
      'camera_denied', 'microphone_denied',
      'unknown_error'
    )
  ], { numRuns: 5 })(
    'all error codes map to Roman Urdu messages',
    (code) => {
      const message = getErrorMessage(code)
      
      // Message should be non-empty
      expect(message).toBeTruthy()
      expect(message.length).toBeGreaterThan(0)
      
      // Message should contain Roman Urdu words
      const romanUrduWords = [
        'nahi', 'hai', 'karen', 'koshish', 'dobara', 'baad', 'mein',
        'tasveer', 'awaaz', 'text', 'photo', 'lein', 'bolen', 'likhen',
        'theek', 'badi', 'choti', 'upload', 'paye', 'mila', 'galat',
        'qareeb', 'saaf', 'roshni', 'achhi', 'zyada', 'bohot', 'waqt',
        'connection', 'internet', 'microphone', 'camera', 'permission',
        'settings', 'den', 'check', 'record', 'file', 'fasal', 'qeemat',
        'mandi', 'patti', 'bimari'
      ]
      
      const hasRomanUrdu = romanUrduWords.some(word => 
        message.toLowerCase().includes(word)
      )
      
      expect(hasRomanUrdu).toBe(true)
    }
  )
})

// ============================================
// Additional Property Tests
// ============================================

describe('PII Filtering Properties', () => {
  /**
   * **Validates: Requirements 20.5**
   * 
   * For any log entry, the content SHALL not contain PII patterns
   */
  test.prop([
    fc.string({ minLength: 10, maxLength: 200 }),
    fc.constantFrom(
      '9876543210',  // Phone number
      'test@example.com',  // Email
      '1234 5678 9012',  // Aadhaar
      'ABCDE1234F'  // PAN
    )
  ], { numRuns: 5 })(
    'PII patterns are filtered from text',
    (text, pii) => {
      const textWithPII = `${text} ${pii}`
      const filtered = filterPII(textWithPII)
      
      // PII should be replaced with [REDACTED]
      expect(filtered).toContain('[REDACTED]')
      
      // Original PII should not be present
      expect(filtered).not.toContain(pii)
    }
  )

  /**
   * Test that non-PII text is preserved
   */
  test.prop([
    fc.string({ minLength: 10, maxLength: 200 })
      .filter(s => !s.match(/\b[6-9]\d{9}\b/))  // No phone numbers
      .filter(s => !s.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/))  // No emails
  ], { numRuns: 5 })(
    'non-PII text is preserved',
    (text) => {
      const filtered = filterPII(text)
      
      // Text without PII should remain unchanged
      expect(filtered).toBe(text)
    }
  )
})

describe('Error Structure Properties', () => {
  /**
   * Service errors should have all required fields
   */
  test.prop([
    fc.constantFrom<ServiceName>('ocr', 'vision', 'llm', 'whisper', 'tts', 'mandi'),
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.boolean()
  ], { numRuns: 5 })(
    'service errors have all required fields',
    (service, code, message, retryable) => {
      const error = createServiceError(service, code, message, retryable)
      
      expect(error.service).toBe(service)
      expect(error.code).toBe(code)
      expect(error.message).toBe(message)
      expect(error.userMessage).toBeTruthy()
      expect(error.timestamp).toBeInstanceOf(Date)
      expect(error.retryable).toBe(retryable)
    }
  )

  /**
   * Validation errors should have all required fields
   */
  test.prop([
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.string({ minLength: 1, maxLength: 200 })
  ], { numRuns: 5 })(
    'validation errors have all required fields',
    (field, code, message) => {
      const error = createValidationError(field, code, message)
      
      expect(error.field).toBe(field)
      expect(error.message).toBe(message)
      expect(error.userMessage).toBeTruthy()
    }
  )
})
