/**
 * Unit tests for configuration and environment validation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  getEnvironmentConfig,
  validateEnvironment,
  isDemoMode,
  isServiceInDemoMode,
  getServiceConfig,
  getOpenAIKey,
  getOpenAIModel,
  getCacheDuration,
  isDebugMode,
  getRateLimitPerHour,
  type EnvironmentConfig,
} from './config'

// Store original environment
let originalEnv: NodeJS.ProcessEnv

describe('Configuration Module', () => {
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('getEnvironmentConfig', () => {
    it('should return default values when no env vars are set', () => {
      // Clear all RAASTA-related env vars
      delete process.env.OPENAI_API_KEY
      delete process.env.OPENAI_MODEL
      
      const config = getEnvironmentConfig()
      
      expect(config.OPENAI_API_KEY).toBeUndefined()
      expect(config.OPENAI_MODEL).toBe('gpt-4o-mini')
      expect(config.NODE_ENV).toBeDefined()
    })

    it('should return configured values when env vars are set', () => {
      process.env.OPENAI_API_KEY = 'test-key-123'
      process.env.OPENAI_MODEL = 'gpt-4o'
      process.env.GOOGLE_CLOUD_VISION_KEY = 'vision-key-456'
      
      const config = getEnvironmentConfig()
      
      expect(config.OPENAI_API_KEY).toBe('test-key-123')
      expect(config.OPENAI_MODEL).toBe('gpt-4o')
      expect(config.GOOGLE_CLOUD_VISION_KEY).toBe('vision-key-456')
    })

    it('should trim whitespace from env var values', () => {
      process.env.OPENAI_API_KEY = '  test-key-with-spaces  '
      
      const config = getEnvironmentConfig()
      
      expect(config.OPENAI_API_KEY).toBe('test-key-with-spaces')
    })

    it('should treat empty strings as undefined', () => {
      process.env.OPENAI_API_KEY = ''
      process.env.GOOGLE_CLOUD_VISION_KEY = '   '
      
      const config = getEnvironmentConfig()
      
      expect(config.OPENAI_API_KEY).toBeUndefined()
      expect(config.GOOGLE_CLOUD_VISION_KEY).toBeUndefined()
    })
  })

  describe('validateEnvironment', () => {
    it('should pass validation with no env vars (demo mode)', () => {
      delete process.env.OPENAI_API_KEY
      
      const result = validateEnvironment()
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass validation with valid configuration', () => {
      process.env.OPENAI_API_KEY = 'sk-test123'
      process.env.RATE_LIMIT_PER_HOUR = '100'
      process.env.CACHE_LLM_DURATION = '3600'
      process.env.NODE_ENV = 'production'
      
      const result = validateEnvironment()
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation with invalid numeric values', () => {
      process.env.RATE_LIMIT_PER_HOUR = 'not-a-number'
      process.env.CACHE_LLM_DURATION = '-100'
      
      const result = validateEnvironment()
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.includes('RATE_LIMIT_PER_HOUR'))).toBe(true)
    })

    it('should warn about invalid NODE_ENV values', () => {
      process.env.NODE_ENV = 'invalid-env'
      
      const result = validateEnvironment()
      
      expect(result.warnings.some(w => w.includes('NODE_ENV'))).toBe(true)
    })

    it('should warn about missing API keys in production', () => {
      process.env.NODE_ENV = 'production'
      delete process.env.OPENAI_API_KEY
      delete process.env.GOOGLE_CLOUD_VISION_KEY
      
      const result = validateEnvironment()
      
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('OPENAI_API_KEY'))).toBe(true)
      expect(result.warnings.some(w => w.includes('GOOGLE_CLOUD_VISION_KEY'))).toBe(true)
    })

    it('should not warn about missing API keys in development', () => {
      process.env.NODE_ENV = 'development'
      delete process.env.OPENAI_API_KEY
      
      const result = validateEnvironment()
      
      expect(result.warnings.some(w => w.includes('OPENAI_API_KEY'))).toBe(false)
    })
  })

  describe('isDemoMode', () => {
    it('should return true when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY
      
      expect(isDemoMode()).toBe(true)
    })

    it('should return true when OPENAI_API_KEY is empty', () => {
      process.env.OPENAI_API_KEY = ''
      
      expect(isDemoMode()).toBe(true)
    })

    it('should return false when OPENAI_API_KEY is set', () => {
      process.env.OPENAI_API_KEY = 'sk-test123'
      
      expect(isDemoMode()).toBe(false)
    })
  })

  describe('isServiceInDemoMode', () => {
    it('should return true for LLM when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY
      
      expect(isServiceInDemoMode('llm')).toBe(true)
      expect(isServiceInDemoMode('whisper')).toBe(true)
    })

    it('should return false for LLM when OPENAI_API_KEY is set', () => {
      process.env.OPENAI_API_KEY = 'sk-test123'
      
      expect(isServiceInDemoMode('llm')).toBe(false)
      expect(isServiceInDemoMode('whisper')).toBe(false)
    })

    it('should return true for OCR when GOOGLE_CLOUD_VISION_KEY is not set', () => {
      delete process.env.GOOGLE_CLOUD_VISION_KEY
      
      expect(isServiceInDemoMode('ocr')).toBe(true)
    })

    it('should return false for OCR when GOOGLE_CLOUD_VISION_KEY is set', () => {
      process.env.GOOGLE_CLOUD_VISION_KEY = 'vision-key-123'
      
      expect(isServiceInDemoMode('ocr')).toBe(false)
    })

    it('should return true for vision when ROBOFLOW_API_KEY is not set', () => {
      delete process.env.ROBOFLOW_API_KEY
      
      expect(isServiceInDemoMode('vision')).toBe(true)
    })

    it('should return true for TTS when no TTS keys are set', () => {
      delete process.env.ELEVENLABS_API_KEY
      delete process.env.GOOGLE_CLOUD_TTS_KEY
      
      expect(isServiceInDemoMode('tts')).toBe(true)
    })

    it('should return false for TTS when ELEVENLABS_API_KEY is set', () => {
      process.env.ELEVENLABS_API_KEY = 'eleven-key-123'
      
      expect(isServiceInDemoMode('tts')).toBe(false)
    })

    it('should return true for mandi when MANDI_API_KEY is not set', () => {
      delete process.env.MANDI_API_KEY
      
      expect(isServiceInDemoMode('mandi')).toBe(true)
    })
  })

  describe('getServiceConfig', () => {
    it('should return demo providers when no API keys are set', () => {
      delete process.env.OPENAI_API_KEY
      delete process.env.GOOGLE_CLOUD_VISION_KEY
      delete process.env.ROBOFLOW_API_KEY
      delete process.env.ELEVENLABS_API_KEY
      delete process.env.GOOGLE_CLOUD_TTS_KEY
      delete process.env.MANDI_API_KEY
      
      const config = getServiceConfig()
      
      expect(config.ocrProvider).toBe('demo')
      expect(config.visionProvider).toBe('demo')
      expect(config.ttsProvider).toBe('demo')
      expect(config.mandiProvider).toBe('demo')
    })

    it('should select google-vision when GOOGLE_CLOUD_VISION_KEY is set', () => {
      process.env.GOOGLE_CLOUD_VISION_KEY = 'vision-key-123'
      
      const config = getServiceConfig()
      
      expect(config.ocrProvider).toBe('google-vision')
    })

    it('should select roboflow when ROBOFLOW_API_KEY is set', () => {
      process.env.ROBOFLOW_API_KEY = 'roboflow-key-123'
      
      const config = getServiceConfig()
      
      expect(config.visionProvider).toBe('roboflow')
    })

    it('should select elevenlabs when ELEVENLABS_API_KEY is set', () => {
      process.env.ELEVENLABS_API_KEY = 'eleven-key-123'
      
      const config = getServiceConfig()
      
      expect(config.ttsProvider).toBe('elevenlabs')
    })

    it('should select google-tts when GOOGLE_CLOUD_TTS_KEY is set and ELEVENLABS is not', () => {
      delete process.env.ELEVENLABS_API_KEY
      process.env.GOOGLE_CLOUD_TTS_KEY = 'tts-key-123'
      
      const config = getServiceConfig()
      
      expect(config.ttsProvider).toBe('google-tts')
    })

    it('should select agmarknet when MANDI_API_KEY is set', () => {
      process.env.MANDI_API_KEY = 'mandi-key-123'
      
      const config = getServiceConfig()
      
      expect(config.mandiProvider).toBe('agmarknet')
    })
  })

  describe('Configuration Helpers', () => {
    it('getOpenAIKey should return the API key', () => {
      process.env.OPENAI_API_KEY = 'sk-test123'
      
      expect(getOpenAIKey()).toBe('sk-test123')
    })

    it('getOpenAIModel should return configured model', () => {
      process.env.OPENAI_MODEL = 'gpt-4o'
      
      expect(getOpenAIModel()).toBe('gpt-4o')
    })

    it('getOpenAIModel should return default when not configured', () => {
      delete process.env.OPENAI_MODEL
      
      expect(getOpenAIModel()).toBe('gpt-4o-mini')
    })

    it('getCacheDuration should return configured durations', () => {
      process.env.CACHE_LLM_DURATION = '7200'
      process.env.CACHE_MANDI_DURATION = '10800'
      process.env.CACHE_OCR_DURATION = '1800'
      
      expect(getCacheDuration('llm')).toBe(7200)
      expect(getCacheDuration('mandi')).toBe(10800)
      expect(getCacheDuration('ocr')).toBe(1800)
    })

    it('getCacheDuration should return defaults when not configured', () => {
      delete process.env.CACHE_LLM_DURATION
      delete process.env.CACHE_MANDI_DURATION
      delete process.env.CACHE_OCR_DURATION
      
      expect(getCacheDuration('llm')).toBe(3600)
      expect(getCacheDuration('mandi')).toBe(21600)
      expect(getCacheDuration('ocr')).toBe(3600)
    })

    it('isDebugMode should return true when DEBUG is true', () => {
      process.env.DEBUG = 'true'
      
      expect(isDebugMode()).toBe(true)
    })

    it('isDebugMode should return false when DEBUG is false', () => {
      process.env.DEBUG = 'false'
      
      expect(isDebugMode()).toBe(false)
    })

    it('getRateLimitPerHour should return configured value', () => {
      process.env.RATE_LIMIT_PER_HOUR = '200'
      
      expect(getRateLimitPerHour()).toBe(200)
    })

    it('getRateLimitPerHour should return default when not configured', () => {
      delete process.env.RATE_LIMIT_PER_HOUR
      
      expect(getRateLimitPerHour()).toBe(100)
    })
  })
})
