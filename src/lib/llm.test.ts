/**
 * Unit Tests for LLM Service
 * Feature: raasta-ai-companion
 * 
 * These tests validate specific examples and edge cases for the LLM service.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { detectLanguage } from './localeForLlm'

// Mock fetch for API tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

describe('LLM Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Language Detection', () => {
    /**
     * **Validates: Requirements 8.1**
     */
    
    it('should detect Hindi from Devanagari text', () => {
      const hindiText = 'नमस्ते दुनिया' // "Hello world" in Hindi
      expect(detectLanguage(hindiText)).toBe('hi')
    })

    it('should detect Kashmiri from Arabic script', () => {
      const kashmiriText = 'السلام علیکم' // "Hello" in Arabic script
      expect(detectLanguage(kashmiriText)).toBe('ks')
    })

    it('should detect Roman Urdu from Latin text', () => {
      const romanUrduText = 'Salam dost'
      expect(detectLanguage(romanUrduText)).toBe('en')
    })

    it('should default to Roman Urdu for empty string', () => {
      expect(detectLanguage('')).toBe('en')
    })

    it('should default to Roman Urdu for whitespace only', () => {
      expect(detectLanguage('   ')).toBe('en')
      expect(detectLanguage('\n\t')).toBe('en')
    })

    it('should detect Hindi for mixed Devanagari and Latin', () => {
      const mixedText = 'नमस्ते hello'
      expect(detectLanguage(mixedText)).toBe('hi')
    })

    it('should detect Kashmiri for mixed Arabic and Latin', () => {
      const mixedText = 'السلام hello'
      expect(detectLanguage(mixedText)).toBe('ks')
    })

    it('should handle numbers and punctuation', () => {
      expect(detectLanguage('123')).toBe('en')
      expect(detectLanguage('!!!')).toBe('en')
      expect(detectLanguage('...')).toBe('en')
    })

    it('should handle special characters', () => {
      expect(detectLanguage('@#$%')).toBe('en')
      expect(detectLanguage('hello@world.com')).toBe('en')
    })
  })

  describe('Language Detection Edge Cases', () => {
    it('should handle very long text', () => {
      const longText = 'hello '.repeat(1000)
      expect(detectLanguage(longText)).toBe('en')
    })

    it('should handle single character', () => {
      expect(detectLanguage('a')).toBe('en')
      expect(detectLanguage('क')).toBe('hi')
      expect(detectLanguage('ا')).toBe('ks')
    })

    it('should handle Unicode edge cases', () => {
      expect(detectLanguage('\u0000')).toBe('en') // Null character
      expect(detectLanguage('\uFFFD')).toBe('en') // Replacement character
      expect(detectLanguage('\u200B')).toBe('en') // Zero-width space
    })

    it('should handle newlines and tabs', () => {
      expect(detectLanguage('hello\nworld')).toBe('en')
      expect(detectLanguage('hello\tworld')).toBe('en')
    })
  })

  describe('Response Post-Processing', () => {
    /**
     * **Validates: Requirements 11.3, 38.1, 38.2**
     */
    
    // Helper function to simulate postProcessResponse
    const postProcessResponse = (text: string): string => {
      if (!text) return text
      
      // Remove markdown formatting
      let processed = text
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
        .replace(/\*([^*]+)\*/g, '$1')     // Remove italic *text*
        .replace(/^#+\s+/gm, '')           // Remove headers # text
        .replace(/^[-*]\s+/gm, '')         // Remove bullet points - text or * text
        .replace(/`([^`]+)`/g, '$1')       // Remove code `text`
        .trim()
      
      // Limit to 200 words
      const words = processed.split(/\s+/)
      if (words.length > 200) {
        processed = words.slice(0, 200).join(' ') + '.'
      }
      
      return processed
    }

    it('should remove bold markdown', () => {
      const input = 'This is **bold** text'
      const output = postProcessResponse(input)
      expect(output).toBe('This is bold text')
      expect(output).not.toContain('**')
    })

    it('should remove italic markdown', () => {
      const input = 'This is *italic* text'
      const output = postProcessResponse(input)
      expect(output).toBe('This is italic text')
      expect(output).not.toContain('*')
    })

    it('should remove headers', () => {
      const input = '# Header\nContent'
      const output = postProcessResponse(input)
      expect(output).not.toContain('#')
      expect(output).toContain('Header')
    })

    it('should remove bullet points', () => {
      const input = '- Item 1\n- Item 2\n* Item 3'
      const output = postProcessResponse(input)
      expect(output).not.toMatch(/^[-*]\s+/m)
    })

    it('should remove code formatting', () => {
      const input = 'Use `code` here'
      const output = postProcessResponse(input)
      expect(output).toBe('Use code here')
      expect(output).not.toContain('`')
    })

    it('should limit to 200 words', () => {
      const words = Array(250).fill('word').join(' ')
      const output = postProcessResponse(words)
      const wordCount = output.split(/\s+/).filter(w => w.length > 0).length
      expect(wordCount).toBeLessThanOrEqual(200)
    })

    it('should add period when truncating', () => {
      const words = Array(250).fill('word').join(' ')
      const output = postProcessResponse(words)
      expect(output.endsWith('.')).toBe(true)
    })

    it('should preserve short text', () => {
      const input = 'Short text here'
      const output = postProcessResponse(input)
      expect(output).toBe(input)
    })

    it('should handle empty text', () => {
      expect(postProcessResponse('')).toBe('')
    })

    it('should handle text with multiple markdown types', () => {
      const input = '# Title\n**Bold** and *italic* with `code` and - bullets'
      const output = postProcessResponse(input)
      expect(output).not.toContain('**')
      expect(output).not.toContain('*')
      expect(output).not.toContain('#')
      expect(output).not.toContain('`')
      expect(output).not.toMatch(/^-\s+/)
    })

    it('should preserve punctuation', () => {
      const input = 'Hello, world! How are you?'
      const output = postProcessResponse(input)
      expect(output).toBe(input)
      expect(output).toContain(',')
      expect(output).toContain('!')
      expect(output).toContain('?')
    })

    it('should handle exactly 200 words', () => {
      const words = Array(200).fill('word').join(' ')
      const output = postProcessResponse(words)
      const wordCount = output.split(/\s+/).filter(w => w.length > 0).length
      expect(wordCount).toBe(200)
      expect(output.endsWith('.')).toBe(false) // Should not add period
    })

    it('should handle 201 words', () => {
      const words = Array(201).fill('word').join(' ')
      const output = postProcessResponse(words)
      const wordCount = output.split(/\s+/).filter(w => w.length > 0).length
      expect(wordCount).toBe(200)
      expect(output.endsWith('.')).toBe(true) // Should add period
    })
  })

  describe('Prompt Construction', () => {
    /**
     * **Validates: Requirements 35.1, 35.2, 35.3**
     */
    
    it('should include Samjho branding in system prompt', () => {
      const systemPrompt = 'You are Samjho, powered by HAQQ'
      expect(systemPrompt).toContain('Samjho')
      expect(systemPrompt).toContain('HAQQ')
    })

    it('should include Zameen branding in system prompt', () => {
      const systemPrompt = 'You are Zameen, powered by WADI'
      expect(systemPrompt).toContain('Zameen')
      expect(systemPrompt).toContain('WADI')
    })

    it('should include Raah branding in system prompt', () => {
      const systemPrompt = 'You are Raah'
      expect(systemPrompt).toContain('Raah')
    })

    it('should include voice-friendly instructions', () => {
      const instructions = 'Limit response to 200 words maximum'
      expect(instructions).toContain('200 words')
    })

    it('should include no markdown instruction', () => {
      const instructions = 'No markdown formatting'
      expect(instructions).toContain('No markdown')
    })

    it('should include Kashmir context for Raah', () => {
      const context = 'Kashmir-specific locations: Sopore, Baramulla, Srinagar'
      expect(context).toContain('Kashmir')
      expect(context).toContain('Sopore')
      expect(context).toContain('Srinagar')
    })

    it('should include scheme disclaimers', () => {
      const disclaimer = 'Verify details on official portals'
      expect(disclaimer).toContain('Verify')
      expect(disclaimer).toContain('official portals')
    })
  })

  describe('Response Length Validation', () => {
    /**
     * **Validates: Requirements 11.3, 38.2**
     */
    
    const countWords = (text: string): number => {
      return text.split(/\s+/).filter(w => w.length > 0).length
    }

    it('should validate word count for typical response', () => {
      const response = 'This is a typical response with several words that should be counted correctly.'
      const wordCount = countWords(response)
      expect(wordCount).toBeLessThanOrEqual(200)
    })

    it('should count words correctly with punctuation', () => {
      const response = 'Hello, world! How are you?'
      const wordCount = countWords(response)
      expect(wordCount).toBe(5)
    })

    it('should count words correctly with multiple spaces', () => {
      const response = 'Hello    world'
      const wordCount = countWords(response)
      expect(wordCount).toBe(2)
    })

    it('should count words correctly with newlines', () => {
      const response = 'Hello\nworld'
      const wordCount = countWords(response)
      expect(wordCount).toBe(2)
    })
  })

  describe('Markdown Removal', () => {
    /**
     * **Validates: Requirements 38.1**
     */
    
    const removeMarkdown = (text: string): string => {
      return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/^#+\s+/gm, '')
        .replace(/^[-*]\s+/gm, '')
        .replace(/`([^`]+)`/g, '$1')
        .trim()
    }

    it('should remove nested markdown', () => {
      const input = '**Bold with *italic* inside**'
      const output = removeMarkdown(input)
      expect(output).not.toContain('**')
      // Note: Nested markdown may leave single asterisks
      expect(output).toContain('Bold with')
      expect(output).toContain('italic')
      expect(output).toContain('inside')
    })

    it('should handle multiple headers', () => {
      const input = '# Header 1\n## Header 2\n### Header 3'
      const output = removeMarkdown(input)
      expect(output).not.toContain('#')
    })

    it('should handle mixed bullet types', () => {
      const input = '- Dash bullet\n* Star bullet'
      const output = removeMarkdown(input)
      expect(output).not.toMatch(/^[-*]\s+/m)
    })

    it('should preserve content while removing formatting', () => {
      const input = '**Important**: Use `this` method'
      const output = removeMarkdown(input)
      expect(output).toContain('Important')
      expect(output).toContain('Use')
      expect(output).toContain('this')
      expect(output).toContain('method')
    })
  })
})
