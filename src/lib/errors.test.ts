/**
 * Unit Tests for Error Handling
 * 
 * Tests:
 * - Error message localization
 * - Retry logic and backoff timing
 * - Context preservation on failure
 * - PII filtering
 * - Network error detection
 * 
 * **Validates: Requirements 7.1, 7.3, 20.5**
 */

import {
  createServiceError,
  createValidationError,
  getErrorMessage,
  filterPII,
  logError,
  logInfo,
  retryWithBackoff,
  isNetworkError,
  isOffline,
  getNetworkErrorMessage,
  preserveFormContext,
  restoreFormContext,
  clearFormContext
} from './errors'

// ============================================
// Error Message Localization Tests
// ============================================

describe('Error Message Localization', () => {
  /**
   * **Validates: Requirements 7.1**
   */
  test('OCR errors return Roman Urdu messages', () => {
    const error = createServiceError('ocr', 'ocr_failed', 'OCR processing failed')
    
    expect(error.userMessage).toBe('Tasveer se text padh na paye. Roshni achhi ho aur dubara photo lein.')
    expect(error.service).toBe('ocr')
    expect(error.code).toBe('ocr_failed')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('Vision errors return Roman Urdu messages', () => {
    const error = createServiceError('vision', 'vision_failed', 'Vision analysis failed')
    
    expect(error.userMessage).toBe('Patti ki tasveer se bimari pehchan na paye. Qareeb se aur saaf photo lein.')
    expect(error.service).toBe('vision')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('LLM errors return Roman Urdu messages', () => {
    const error = createServiceError('llm', 'llm_failed', 'LLM request failed')
    
    expect(error.userMessage).toBe('Jawab nahi de paye. Thodi der baad dobara koshish karen.')
    expect(error.service).toBe('llm')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('Whisper errors return Roman Urdu messages', () => {
    const error = createServiceError('whisper', 'whisper_failed', 'Transcription failed')
    
    expect(error.userMessage).toBe('Awaaz samajh nahi aayi. Zor se bolen ya text mein likhen.')
    expect(error.service).toBe('whisper')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('TTS errors return Roman Urdu messages', () => {
    const error = createServiceError('tts', 'tts_failed', 'TTS synthesis failed')
    
    expect(error.userMessage).toBe('Awaaz nahi bana paye. Text padh len.')
    expect(error.service).toBe('tts')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('Mandi errors return Roman Urdu messages', () => {
    const error = createServiceError('mandi', 'mandi_failed', 'Mandi API failed')
    
    expect(error.userMessage).toBe('Mandi ki qeemat nahi mil payi. Baad mein dobara koshish karen.')
    expect(error.service).toBe('mandi')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('Network errors return Roman Urdu messages', () => {
    const offlineMessage = getErrorMessage('network_offline')
    const timeoutMessage = getErrorMessage('network_timeout')
    
    expect(offlineMessage).toBe('Internet connection nahi hai. Connection check karen.')
    expect(timeoutMessage).toBe('Connection bohot slow hai. Dobara koshish karen.')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('Validation errors return Roman Urdu messages', () => {
    const imageError = createValidationError('image', 'invalid_image', 'Invalid image format')
    const audioError = createValidationError('audio', 'invalid_audio', 'Invalid audio format')
    
    expect(imageError.userMessage).toBe('Tasveer theek nahi hai. JPEG ya PNG file upload karen.')
    expect(audioError.userMessage).toBe('Audio file theek nahi hai. Dobara record karen.')
  })

  /**
   * **Validates: Requirements 7.1**
   */
  test('Unknown error codes return default Roman Urdu message', () => {
    const message = getErrorMessage('some_unknown_code')
    
    expect(message).toBe('Kuch galat ho gaya. Dobara koshish karen.')
  })
})

// ============================================
// Retry Logic Tests
// ============================================

describe('Retry Logic and Backoff Timing', () => {
  /**
   * **Validates: Requirements 7.3**
   */
  test('retries function on failure', async () => {
    let attempts = 0
    const fn = jest.fn(async () => {
      attempts++
      if (attempts < 3) {
        throw new Error('Temporary failure')
      }
      return 'success'
    })

    const result = await retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelayMs: 10,
      maxDelayMs: 100
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  /**
   * **Validates: Requirements 7.3**
   */
  test('throws error after max attempts', async () => {
    const fn = jest.fn(async () => {
      throw new Error('Persistent failure')
    })

    await expect(
      retryWithBackoff(fn, {
        maxAttempts: 2,
        initialDelayMs: 10
      })
    ).rejects.toThrow('Persistent failure')

    expect(fn).toHaveBeenCalledTimes(2)
  })

  /**
   * **Validates: Requirements 7.3**
   */
  test('succeeds on first attempt without retry', async () => {
    const fn = jest.fn(async () => 'success')

    const result = await retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelayMs: 10
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  /**
   * **Validates: Requirements 7.3**
   */
  test('respects retryable error codes', async () => {
    const fn = jest.fn(async () => {
      throw new Error('Non-retryable error')
    })

    await expect(
      retryWithBackoff(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        retryableErrors: ['timeout', 'network']
      })
    ).rejects.toThrow('Non-retryable error')

    // Should fail immediately without retries
    expect(fn).toHaveBeenCalledTimes(1)
  })

  /**
   * **Validates: Requirements 7.3**
   */
  test('retries on retryable error codes', async () => {
    let attempts = 0
    const fn = jest.fn(async () => {
      attempts++
      if (attempts < 2) {
        throw new Error('Network timeout error')
      }
      return 'success'
    })

    const result = await retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelayMs: 10,
      retryableErrors: ['timeout', 'network']
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

// ============================================
// Context Preservation Tests
// ============================================

describe('Context Preservation on Failure', () => {
  beforeEach(() => {
    // Mock sessionStorage for tests
    const storage: Record<string, string> = {}
    
    Object.defineProperty(global, 'sessionStorage', {
      value: {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value },
        removeItem: (key: string) => { delete storage[key] },
        clear: () => { Object.keys(storage).forEach(key => delete storage[key]) }
      },
      writable: true
    })
    
    // Clear storage before each test
    sessionStorage.clear()
  })

  /**
   * **Validates: Requirements 7.3**
   */
  test('preserves form context in session storage', () => {
    const formData = {
      question: 'PM Kisan yojana kya hai?',
      mode: 'raah'
    }

    preserveFormContext('raah-form', formData)

    const restored = restoreFormContext('raah-form')
    expect(restored).toEqual(formData)
  })

  /**
   * **Validates: Requirements 7.3**
   */
  test('returns null for non-existent form context', () => {
    const restored = restoreFormContext('non-existent-form')
    expect(restored).toBeNull()
  })

  /**
   * **Validates: Requirements 7.3**
   */
  test('clears form context', () => {
    const formData = { text: 'test' }
    
    preserveFormContext('test-form', formData)
    expect(restoreFormContext('test-form')).toEqual(formData)
    
    clearFormContext('test-form')
    expect(restoreFormContext('test-form')).toBeNull()
  })

  /**
   * **Validates: Requirements 7.3, 20.5**
   */
  test('filters PII when preserving context', () => {
    const formData = {
      name: 'John Doe',
      phone: '9876543210',
      email: 'test@example.com',
      message: 'My Aadhaar is 1234 5678 9012'
    }

    preserveFormContext('sensitive-form', formData)

    const restored = restoreFormContext('sensitive-form')
    
    // PII should be redacted
    expect(restored?.phone).toBe('[REDACTED]')
    expect(restored?.email).toBe('[REDACTED]')
    expect(restored?.message).toContain('[REDACTED]')
  })
})

// ============================================
// PII Filtering Tests
// ============================================

describe('PII Filtering', () => {
  /**
   * **Validates: Requirements 20.5**
   */
  test('filters phone numbers', () => {
    const text = 'Call me at 9876543210 or 8765432109'
    const filtered = filterPII(text)
    
    expect(filtered).not.toContain('9876543210')
    expect(filtered).not.toContain('8765432109')
    expect(filtered).toContain('[REDACTED]')
  })

  /**
   * **Validates: Requirements 20.5**
   */
  test('filters email addresses', () => {
    const text = 'Contact me at test@example.com or user@domain.org'
    const filtered = filterPII(text)
    
    expect(filtered).not.toContain('test@example.com')
    expect(filtered).not.toContain('user@domain.org')
    expect(filtered).toContain('[REDACTED]')
  })

  /**
   * **Validates: Requirements 20.5**
   */
  test('filters Aadhaar numbers', () => {
    const text = 'My Aadhaar is 1234 5678 9012'
    const filtered = filterPII(text)
    
    expect(filtered).not.toContain('1234 5678 9012')
    expect(filtered).toContain('[REDACTED]')
  })

  /**
   * **Validates: Requirements 20.5**
   */
  test('filters PAN numbers', () => {
    const text = 'PAN: ABCDE1234F'
    const filtered = filterPII(text)
    
    expect(filtered).not.toContain('ABCDE1234F')
    expect(filtered).toContain('[REDACTED]')
  })

  /**
   * **Validates: Requirements 20.5**
   */
  test('preserves non-PII text', () => {
    const text = 'PM Kisan yojana kya hai? Mujhe jankari chahiye.'
    const filtered = filterPII(text)
    
    expect(filtered).toBe(text)
  })

  /**
   * **Validates: Requirements 20.5**
   */
  test('filters multiple PII patterns in same text', () => {
    const text = 'Contact John at 9876543210 or john@example.com. Aadhaar: 1234 5678 9012'
    const filtered = filterPII(text)
    
    expect(filtered).not.toContain('9876543210')
    expect(filtered).not.toContain('john@example.com')
    expect(filtered).not.toContain('1234 5678 9012')
    expect(filtered).toContain('[REDACTED]')
  })
})

// ============================================
// Error Logging Tests
// ============================================

describe('Error Logging', () => {
  let consoleErrorSpy: jest.SpyInstance
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleLogSpy.mockRestore()
  })

  /**
   * **Validates: Requirements 7.5**
   */
  test('logs errors with timestamp and service', () => {
    const error = new Error('Test error')
    logError('ocr', error)

    expect(consoleErrorSpy).toHaveBeenCalled()
    const logCall = consoleErrorSpy.mock.calls[0][0]
    
    expect(logCall).toContain('[OCR]')
    expect(logCall).toContain('Test error')
    expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  /**
   * **Validates: Requirements 7.5, 20.5**
   */
  test('filters PII from error logs', () => {
    const error = new Error('User 9876543210 failed to authenticate')
    logError('llm', error)

    expect(consoleErrorSpy).toHaveBeenCalled()
    const logCall = consoleErrorSpy.mock.calls[0][0]
    
    expect(logCall).not.toContain('9876543210')
    expect(logCall).toContain('[REDACTED]')
  })

  /**
   * **Validates: Requirements 7.5, 20.5**
   */
  test('filters PII from context in logs', () => {
    const error = new Error('Processing failed')
    const context = {
      userId: 'user123',
      phone: '9876543210',
      email: 'test@example.com'
    }
    
    logError('vision', error, context)

    expect(consoleErrorSpy).toHaveBeenCalled()
    const logContext = consoleErrorSpy.mock.calls[0][1]
    
    expect(logContext.context.phone).toBe('[REDACTED]')
    expect(logContext.context.email).toBe('[REDACTED]')
    expect(logContext.context.userId).toBe('user123')
  })

  /**
   * **Validates: Requirements 7.5**
   */
  test('logs info messages with service name', () => {
    logInfo('mandi', 'Price fetched successfully')

    expect(consoleLogSpy).toHaveBeenCalled()
    const logCall = consoleLogSpy.mock.calls[0][0]
    
    expect(logCall).toContain('[MANDI]')
    expect(logCall).toContain('Price fetched successfully')
  })
})

// ============================================
// Network Error Detection Tests
// ============================================

describe('Network Error Detection', () => {
  /**
   * **Validates: Requirements 7.4**
   */
  test('detects network errors', () => {
    const networkError = new Error('Network request failed')
    const fetchError = new Error('Failed to fetch')
    const timeoutError = new Error('Request timeout')
    const regularError = new Error('Something went wrong')

    expect(isNetworkError(networkError)).toBe(true)
    expect(isNetworkError(fetchError)).toBe(true)
    expect(isNetworkError(timeoutError)).toBe(true)
    expect(isNetworkError(regularError)).toBe(false)
  })

  /**
   * **Validates: Requirements 7.4**
   */
  test('returns appropriate network error message', () => {
    const message = getNetworkErrorMessage()
    
    expect(message).toBeTruthy()
    expect(message.length).toBeGreaterThan(0)
    // Should be in Roman Urdu
    expect(message).toMatch(/connection|internet|karen/i)
  })
})

// ============================================
// Error Structure Tests
// ============================================

describe('Error Structure', () => {
  test('ServiceError has all required fields', () => {
    const error = createServiceError('ocr', 'ocr_failed', 'Test error', true)

    expect(error).toHaveProperty('service')
    expect(error).toHaveProperty('code')
    expect(error).toHaveProperty('message')
    expect(error).toHaveProperty('userMessage')
    expect(error).toHaveProperty('timestamp')
    expect(error).toHaveProperty('retryable')
    
    expect(error.timestamp).toBeInstanceOf(Date)
  })

  test('ValidationError has all required fields', () => {
    const error = createValidationError('image', 'invalid_image', 'Invalid format')

    expect(error).toHaveProperty('field')
    expect(error).toHaveProperty('message')
    expect(error).toHaveProperty('userMessage')
  })

  test('ServiceError can store original error', () => {
    const originalError = new Error('Original error')
    const error = createServiceError('llm', 'llm_failed', 'Test', true, originalError)

    expect(error.originalError).toBe(originalError)
  })
})
