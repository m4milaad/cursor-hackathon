/**
 * Unit Tests for TTS Service
 * Feature: raasta-ai-companion
 * 
 * Tests cover:
 * - Language selection logic
 * - Provider selection
 * - State management
 * - Error handling
 * 
 * Note: Browser-specific functionality (speechSynthesis, Audio) is tested
 * through integration tests in the browser environment.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock the config module
jest.mock('./config', () => ({
  getEnvironmentConfig: jest.fn(() => ({
    ELEVENLABS_API_KEY: undefined,
    ELEVENLABS_VOICE_ID: undefined,
    GOOGLE_CLOUD_TTS_KEY: undefined,
  })),
}))

// Import after mocking
import {
  speechLangForUi,
  getPlaybackState,
  clearAudioCache,
} from './tts'

describe('TTS Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearAudioCache()
  })

  describe('Language Selection', () => {
    it('should map UI locale to correct speech language', () => {
      expect(speechLangForUi('en')).toBe('en-IN')
      expect(speechLangForUi('hi')).toBe('hi-IN')
      expect(speechLangForUi('ks')).toBe('hi-IN') // Kashmiri uses Hindi voice
    })

    it('should default to en-IN for unknown locale', () => {
      // @ts-expect-error - Testing invalid input
      expect(speechLangForUi('unknown')).toBe('en-IN')
    })

    it('should return valid language codes', () => {
      const locales: Array<'en' | 'hi' | 'ks'> = ['en', 'hi', 'ks']
      
      for (const locale of locales) {
        const langCode = speechLangForUi(locale)
        expect(langCode).toMatch(/^[a-z]{2}-[A-Z]{2}$/)
        expect(langCode).toBeTruthy()
      }
    })
  })

  describe('Playback State Management', () => {
    it('should initialize with default state', () => {
      const state = getPlaybackState()
      
      expect(state.isPlaying).toBe(false)
      expect(state.currentText).toBe('')
      expect(state.provider).toBe('browser')
    })

    it('should return a copy of state (not reference)', () => {
      const state1 = getPlaybackState()
      const state2 = getPlaybackState()
      
      expect(state1).toEqual(state2)
      expect(state1).not.toBe(state2) // Different objects
    })
  })

  describe('Cache Management', () => {
    it('should clear audio cache without errors', () => {
      expect(() => clearAudioCache()).not.toThrow()
    })

    it('should allow multiple cache clears', () => {
      clearAudioCache()
      clearAudioCache()
      clearAudioCache()
      
      expect(true).toBe(true) // No errors thrown
    })
  })

  describe('Type Safety', () => {
    it('should export correct types', () => {
      const state = getPlaybackState()
      
      expect(typeof state.isPlaying).toBe('boolean')
      expect(typeof state.currentText).toBe('string')
      expect(typeof state.provider).toBe('string')
    })

    it('should handle all locale types', () => {
      const locales: Array<'en' | 'hi' | 'ks'> = ['en', 'hi', 'ks']
      
      for (const locale of locales) {
        const result = speechLangForUi(locale)
        expect(typeof result).toBe('string')
      }
    })
  })

  describe('Error Resilience', () => {
    it('should handle invalid locale gracefully', () => {
      // @ts-expect-error - Testing invalid input
      const result = speechLangForUi(null)
      expect(result).toBe('en-IN')
    })

    it('should handle undefined locale', () => {
      // @ts-expect-error - Testing invalid input
      const result = speechLangForUi(undefined)
      expect(result).toBe('en-IN')
    })

    it('should handle empty string locale', () => {
      // @ts-expect-error - Testing invalid input
      const result = speechLangForUi('')
      expect(result).toBe('en-IN')
    })
  })

  describe('Language Code Format', () => {
    it('should return language codes in correct format', () => {
      const codes = [
        speechLangForUi('en'),
        speechLangForUi('hi'),
        speechLangForUi('ks'),
      ]
      
      for (const code of codes) {
        // Should match pattern: xx-XX (e.g., en-IN, hi-IN)
        expect(code).toMatch(/^[a-z]{2}-[A-Z]{2}$/)
      }
    })

    it('should use Indian locale for all languages', () => {
      expect(speechLangForUi('en')).toContain('-IN')
      expect(speechLangForUi('hi')).toContain('-IN')
      expect(speechLangForUi('ks')).toContain('-IN')
    })
  })

  describe('Kashmiri Language Handling', () => {
    it('should map Kashmiri to Hindi voice', () => {
      const kashmiriLang = speechLangForUi('ks')
      const hindiLang = speechLangForUi('hi')
      
      expect(kashmiriLang).toBe(hindiLang)
      expect(kashmiriLang).toBe('hi-IN')
    })
  })
})
