/**
 * Environment configuration and validation utilities for RAASTA AI Companion
 * 
 * This module provides:
 * - Environment variable validation
 * - Service provider selection based on available API keys
 * - Demo mode detection
 * - Type-safe configuration access
 */

// ============================================
// Environment Configuration Types
// ============================================

export interface EnvironmentConfig {
  // OpenAI Configuration
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  
  // Google Cloud Vision Configuration
  GOOGLE_CLOUD_VISION_KEY?: string
  
  // Roboflow Configuration
  ROBOFLOW_API_KEY?: string
  ROBOFLOW_MODEL_ID?: string
  
  // ElevenLabs Configuration
  ELEVENLABS_API_KEY?: string
  ELEVENLABS_VOICE_ID?: string
  
  // Google Cloud TTS Configuration
  GOOGLE_CLOUD_TTS_KEY?: string
  
  // Mandi API Configuration
  MANDI_API_KEY?: string
  MANDI_API_ENDPOINT?: string
  
  // Application Configuration
  NODE_ENV?: string
  DEBUG?: string
  RATE_LIMIT_PER_HOUR?: string
  
  // Cache Configuration
  CACHE_LLM_DURATION?: string
  CACHE_MANDI_DURATION?: string
  CACHE_OCR_DURATION?: string
}

export type OcrProvider = 'google-vision' | 'tesseract' | 'demo'
export type VisionProvider = 'roboflow' | 'custom' | 'demo'
export type TtsProvider = 'elevenlabs' | 'google-tts' | 'browser' | 'demo'
export type MandiProvider = 'agmarknet' | 'demo'

export interface ServiceConfig {
  ocrProvider: OcrProvider
  visionProvider: VisionProvider
  ttsProvider: TtsProvider
  mandiProvider: MandiProvider
}

// ============================================
// Environment Variable Access
// ============================================

/**
 * Safely access environment variables with type checking
 * Only server-side environment variables are accessible
 */
function getEnvVar(key: keyof EnvironmentConfig): string | undefined {
  // In Next.js, process.env is only available server-side
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key]
    // Validate that the value is a string if it exists
    if (value !== undefined && typeof value === 'string') {
      return value.trim() || undefined
    }
  }
  return undefined
}

/**
 * Get all environment configuration
 * This should only be called server-side
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
    OPENAI_MODEL: getEnvVar('OPENAI_MODEL') || 'gpt-4o-mini',
    GOOGLE_CLOUD_VISION_KEY: getEnvVar('GOOGLE_CLOUD_VISION_KEY'),
    ROBOFLOW_API_KEY: getEnvVar('ROBOFLOW_API_KEY'),
    ROBOFLOW_MODEL_ID: getEnvVar('ROBOFLOW_MODEL_ID'),
    ELEVENLABS_API_KEY: getEnvVar('ELEVENLABS_API_KEY'),
    ELEVENLABS_VOICE_ID: getEnvVar('ELEVENLABS_VOICE_ID'),
    GOOGLE_CLOUD_TTS_KEY: getEnvVar('GOOGLE_CLOUD_TTS_KEY'),
    MANDI_API_KEY: getEnvVar('MANDI_API_KEY'),
    MANDI_API_ENDPOINT: getEnvVar('MANDI_API_ENDPOINT') || 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
    NODE_ENV: getEnvVar('NODE_ENV') || 'development',
    DEBUG: getEnvVar('DEBUG') || 'false',
    RATE_LIMIT_PER_HOUR: getEnvVar('RATE_LIMIT_PER_HOUR') || '100',
    CACHE_LLM_DURATION: getEnvVar('CACHE_LLM_DURATION') || '3600',
    CACHE_MANDI_DURATION: getEnvVar('CACHE_MANDI_DURATION') || '21600',
    CACHE_OCR_DURATION: getEnvVar('CACHE_OCR_DURATION') || '3600',
  }
}

// ============================================
// Environment Validation
// ============================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate environment variables
 * Checks for required keys and validates format
 * 
 * Note: No keys are strictly required - the app works in demo mode without any keys
 * This validation provides warnings for production deployments
 */
export function validateEnvironment(): ValidationResult {
  const config = getEnvironmentConfig()
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate string types
  const stringKeys: (keyof EnvironmentConfig)[] = [
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'GOOGLE_CLOUD_VISION_KEY',
    'ROBOFLOW_API_KEY',
    'ROBOFLOW_MODEL_ID',
    'ELEVENLABS_API_KEY',
    'ELEVENLABS_VOICE_ID',
    'GOOGLE_CLOUD_TTS_KEY',
    'MANDI_API_KEY',
    'MANDI_API_ENDPOINT',
    'NODE_ENV',
    'DEBUG',
    'RATE_LIMIT_PER_HOUR',
    'CACHE_LLM_DURATION',
    'CACHE_MANDI_DURATION',
    'CACHE_OCR_DURATION',
  ]
  
  for (const key of stringKeys) {
    const value = config[key]
    if (value !== undefined && typeof value !== 'string') {
      errors.push(`${key} must be a string, got ${typeof value}`)
    }
  }
  
  // Validate numeric configuration values
  const numericKeys: (keyof EnvironmentConfig)[] = [
    'RATE_LIMIT_PER_HOUR',
    'CACHE_LLM_DURATION',
    'CACHE_MANDI_DURATION',
    'CACHE_OCR_DURATION',
  ]
  
  for (const key of numericKeys) {
    const value = config[key]
    if (value !== undefined) {
      const num = parseInt(value, 10)
      if (isNaN(num) || num < 0) {
        errors.push(`${key} must be a positive number, got "${value}"`)
      }
    }
  }
  
  // Validate NODE_ENV
  if (config.NODE_ENV && !['development', 'production', 'test'].includes(config.NODE_ENV)) {
    warnings.push(`NODE_ENV should be 'development', 'production', or 'test', got "${config.NODE_ENV}"`)
  }
  
  // Validate DEBUG
  if (config.DEBUG && !['true', 'false'].includes(config.DEBUG.toLowerCase())) {
    warnings.push(`DEBUG should be 'true' or 'false', got "${config.DEBUG}"`)
  }
  
  // Production warnings
  if (config.NODE_ENV === 'production') {
    if (!config.OPENAI_API_KEY) {
      warnings.push('OPENAI_API_KEY not configured - running in demo mode for LLM and Whisper')
    }
    if (!config.GOOGLE_CLOUD_VISION_KEY) {
      warnings.push('GOOGLE_CLOUD_VISION_KEY not configured - using Tesseract.js or demo OCR')
    }
    if (!config.ROBOFLOW_API_KEY) {
      warnings.push('ROBOFLOW_API_KEY not configured - using demo crop disease detection')
    }
    if (!config.ELEVENLABS_API_KEY && !config.GOOGLE_CLOUD_TTS_KEY) {
      warnings.push('No TTS API keys configured - using browser speechSynthesis')
    }
    if (!config.MANDI_API_KEY) {
      warnings.push('MANDI_API_KEY not configured - using demo mandi prices')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================
// Demo Mode Detection
// ============================================

/**
 * Check if the application is running in demo mode
 * Demo mode is active when OPENAI_API_KEY is not configured
 * 
 * @returns true if demo mode is active, false if production mode
 */
export function isDemoMode(): boolean {
  const config = getEnvironmentConfig()
  return !config.OPENAI_API_KEY || config.OPENAI_API_KEY.length === 0
}

/**
 * Check if a specific service should use demo mode
 */
export function isServiceInDemoMode(service: 'ocr' | 'vision' | 'llm' | 'whisper' | 'tts' | 'mandi'): boolean {
  const config = getEnvironmentConfig()
  
  switch (service) {
    case 'llm':
    case 'whisper':
      return !config.OPENAI_API_KEY
    case 'ocr':
      return !config.GOOGLE_CLOUD_VISION_KEY
    case 'vision':
      return !config.ROBOFLOW_API_KEY
    case 'tts':
      return !config.ELEVENLABS_API_KEY && !config.GOOGLE_CLOUD_TTS_KEY
    case 'mandi':
      return !config.MANDI_API_KEY
    default:
      return true
  }
}

// ============================================
// Service Provider Selection
// ============================================

/**
 * Determine which service providers to use based on available API keys
 * This implements the graceful degradation strategy:
 * - Use premium services when API keys are available
 * - Fall back to free alternatives when possible
 * - Use demo mode as final fallback
 */
export function getServiceConfig(): ServiceConfig {
  const config = getEnvironmentConfig()
  
  // OCR Provider Selection
  let ocrProvider: OcrProvider = 'demo'
  if (config.GOOGLE_CLOUD_VISION_KEY) {
    ocrProvider = 'google-vision'
  } else if (typeof window !== 'undefined') {
    // Tesseract.js can be used client-side
    ocrProvider = 'tesseract'
  }
  
  // Vision Provider Selection
  let visionProvider: VisionProvider = 'demo'
  if (config.ROBOFLOW_API_KEY) {
    visionProvider = 'roboflow'
  }
  // Custom model would be selected here if available
  
  // TTS Provider Selection
  let ttsProvider: TtsProvider = 'demo'
  if (config.ELEVENLABS_API_KEY) {
    ttsProvider = 'elevenlabs'
  } else if (config.GOOGLE_CLOUD_TTS_KEY) {
    ttsProvider = 'google-tts'
  } else if (typeof window !== 'undefined' && window.speechSynthesis) {
    ttsProvider = 'browser'
  }
  
  // Mandi Provider Selection
  let mandiProvider: MandiProvider = 'demo'
  if (config.MANDI_API_KEY) {
    mandiProvider = 'agmarknet'
  }
  
  return {
    ocrProvider,
    visionProvider,
    ttsProvider,
    mandiProvider,
  }
}

// ============================================
// Configuration Helpers
// ============================================

/**
 * Get OpenAI API key (server-side only)
 */
export function getOpenAIKey(): string | undefined {
  return getEnvVar('OPENAI_API_KEY')
}

/**
 * Get OpenAI model name
 */
export function getOpenAIModel(): string {
  return getEnvVar('OPENAI_MODEL') || 'gpt-4o-mini'
}

/**
 * Get cache duration for a specific service (in seconds)
 */
export function getCacheDuration(service: 'llm' | 'mandi' | 'ocr'): number {
  const config = getEnvironmentConfig()
  
  switch (service) {
    case 'llm':
      return parseInt(config.CACHE_LLM_DURATION || '3600', 10)
    case 'mandi':
      return parseInt(config.CACHE_MANDI_DURATION || '21600', 10)
    case 'ocr':
      return parseInt(config.CACHE_OCR_DURATION || '3600', 10)
    default:
      return 3600
  }
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  const config = getEnvironmentConfig()
  return config.DEBUG?.toLowerCase() === 'true'
}

/**
 * Get rate limit per hour
 */
export function getRateLimitPerHour(): number {
  const config = getEnvironmentConfig()
  return parseInt(config.RATE_LIMIT_PER_HOUR || '100', 10)
}

// ============================================
// Initialization and Logging
// ============================================

/**
 * Log configuration status (server-side only)
 * Should be called during application startup
 */
export function logConfigurationStatus(): void {
  // Only log on server-side
  if (typeof window !== 'undefined') {
    return
  }
  
  const validation = validateEnvironment()
  const serviceConfig = getServiceConfig()
  const demoMode = isDemoMode()
  
  console.log('=== RAASTA Configuration Status ===')
  console.log(`Mode: ${demoMode ? 'DEMO' : 'PRODUCTION'}`)
  console.log(`Environment: ${getEnvironmentConfig().NODE_ENV}`)
  console.log('\nService Providers:')
  console.log(`  OCR: ${serviceConfig.ocrProvider}`)
  console.log(`  Vision: ${serviceConfig.visionProvider}`)
  console.log(`  TTS: ${serviceConfig.ttsProvider}`)
  console.log(`  Mandi: ${serviceConfig.mandiProvider}`)
  
  if (validation.warnings.length > 0) {
    console.log('\nWarnings:')
    validation.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`))
  }
  
  if (validation.errors.length > 0) {
    console.log('\nErrors:')
    validation.errors.forEach(error => console.log(`  ❌ ${error}`))
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('\n✅ Configuration is valid')
  }
  
  console.log('===================================\n')
}
