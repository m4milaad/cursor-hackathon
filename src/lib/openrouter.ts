/**
 * OpenRouter AI Integration
 * Unified access to multiple AI models including free options
 */

import OpenAI from 'openai'
import type { UiLocale } from '@/lib/localeForLlm'

// Initialize OpenRouter client (uses OpenAI-compatible API)
const apiKey = process.env.OPENROUTER_API_KEY || ''
const appName = process.env.OPENROUTER_APP_NAME || 'RAASTA'
const appUrl = process.env.OPENROUTER_APP_URL || 'http://localhost:3001'

const openrouter = apiKey ? new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': appUrl,
    'X-Title': appName,
  }
}) : null

// Model configurations
const MODELS = {
  // Free models
  FREE_TEXT: 'meta-llama/llama-3.2-3b-instruct:free', // Fast, free, good quality
  FREE_VISION: 'google/gemini-pro-1.5', // Supports images (may have cost)
  FREE_FAST: 'meta-llama/llama-3.2-3b-instruct:free', // Very fast, text only
  
  // Premium models (pay-as-you-go)
  PREMIUM_TEXT: 'openai/gpt-4o-mini', // Best quality/price ratio
  PREMIUM_VISION: 'openai/gpt-4o-mini', // Vision support
  PREMIUM_BEST: 'anthropic/claude-3.5-sonnet', // Highest quality
}

// Default model selection
const DEFAULT_TEXT_MODEL = MODELS.FREE_TEXT
const DEFAULT_VISION_MODEL = MODELS.FREE_VISION

/**
 * Check if OpenRouter is configured
 */
export function isOpenRouterAvailable(): boolean {
  return !!openrouter
}

/**
 * Get language instruction for AI
 */
function getLanguageInstruction(locale: UiLocale): string {
  if (locale === 'en') {
    return 'Respond in English only.'
  }
  
  if (locale === 'ur') {
    return `CRITICAL REQUIREMENT: You MUST respond ENTIRELY in Urdu (اردو) using Arabic/Perso-Arabic script.
Do NOT use English or Latin script at all.
Example of correct format: "یہ ایک دستاویز ہے۔ اس میں اہم معلومات ہیں۔"
Your ENTIRE response must be in Urdu script only.`
  }
  
  if (locale === 'hi') {
    return `CRITICAL REQUIREMENT: You MUST respond ENTIRELY in Hindi (हिंदी) using Devanagari script.
Do NOT use English or Latin script at all.
Example of correct format: "यह एक दस्तावेज़ है। इसमें महत्वपूर्ण जानकारी है।"
Your ENTIRE response must be in Hindi Devanagari script only.`
  }
  
  if (locale === 'ks') {
    return `CRITICAL REQUIREMENT: You MUST respond ENTIRELY in Kashmiri (کٲشُر) using Arabic/Perso-Arabic script.
Do NOT use English or Latin script at all.
Your ENTIRE response must be in Kashmiri script only.`
  }
  
  return `CRITICAL: Respond ONLY in ${locale} language. Do not use English.`
}

/**
 * Generate text response using OpenRouter
 */
export async function generateOpenRouterText(
  systemPrompt: string,
  userPrompt: string,
  locale: UiLocale = 'en',
  model: string = DEFAULT_TEXT_MODEL
): Promise<string> {
  if (!openrouter) {
    throw new Error('OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local')
  }

  try {
    // Add language instruction to system prompt
    const languageInstruction = getLanguageInstruction(locale)
    const enhancedSystemPrompt = `${languageInstruction}\n\n${systemPrompt}`
    
    const completion = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })
    
    const text = completion.choices[0]?.message?.content || ''
    return text.trim()
  } catch (error: any) {
    console.error('OpenRouter text generation error:', error)
    
    // Check if it's a rate limit or model unavailable error
    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.')
    }
    
    if (error?.status === 402) {
      throw new Error('Insufficient credits. Please add credits to your OpenRouter account.')
    }
    
    throw new Error('Failed to generate AI response. Please try again.')
  }
}

/**
 * Analyze image using OpenRouter Vision
 */
export async function analyzeImageWithOpenRouter(
  imageBase64: string,
  prompt: string,
  locale: UiLocale = 'en',
  model: string = DEFAULT_VISION_MODEL
): Promise<string> {
  if (!openrouter) {
    throw new Error('OpenRouter API key not configured')
  }

  try {
    // Add language instruction
    const languageInstruction = getLanguageInstruction(locale)
    const enhancedPrompt = `${languageInstruction}\n\n${prompt}`
    
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    const completion = await openrouter.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: enhancedPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })
    
    const text = completion.choices[0]?.message?.content || ''
    return text.trim()
  } catch (error: any) {
    console.error('OpenRouter vision analysis error:', error)
    
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.')
    }
    
    if (error?.status === 402) {
      throw new Error('Insufficient credits. Please add credits to your OpenRouter account.')
    }
    
    throw new Error('Failed to analyze image. Please try again.')
  }
}

/**
 * Detect intent from user query
 */
export async function detectIntentWithOpenRouter(
  query: string,
  model: string = DEFAULT_TEXT_MODEL
): Promise<{
  intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown'
  confidence: number
  route: string
}> {
  if (!openrouter) {
    throw new Error('OpenRouter API key not configured')
  }

  try {
    const systemPrompt = `You are an intent classifier for a voice-first AI assistant.

Classify the user's query into ONE of these categories:
- samjho: Documents, notices, certificates, forms, legal papers
- zameen: Crops, farming, agriculture, diseases, mandi prices
- taleem: Jobs, CV, career, exams, scholarships, education
- raah: General guidance, life advice, emotional support, unclear queries

Respond with ONLY a JSON object in this exact format:
{"intent": "samjho", "confidence": 0.95}

No other text. Just the JSON.`

    const completion = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Classify this query: "${query}"` }
      ],
      temperature: 0.3,
      max_tokens: 100,
    })
    
    const response = completion.choices[0]?.message?.content || '{}'
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    
    const data = JSON.parse(jsonMatch[0])
    const intent = data.intent || 'raah'
    const confidence = data.confidence || 0.5
    
    return {
      intent,
      confidence,
      route: `/${intent}`
    }
  } catch (error) {
    console.error('OpenRouter intent detection error:', error)
    // Fallback to keyword matching
    return fallbackIntentDetection(query)
  }
}

/**
 * Fallback intent detection using keywords
 */
function fallbackIntentDetection(query: string): {
  intent: 'samjho' | 'zameen' | 'taleem' | 'raah'
  confidence: number
  route: string
} {
  const lowerQuery = query.toLowerCase()
  
  // Samjho keywords
  if (
    lowerQuery.includes('document') ||
    lowerQuery.includes('notice') ||
    lowerQuery.includes('kagaz') ||
    lowerQuery.includes('form') ||
    lowerQuery.includes('certificate') ||
    lowerQuery.includes('samjho')
  ) {
    return { intent: 'samjho', confidence: 0.7, route: '/samjho' }
  }
  
  // Zameen keywords
  if (
    lowerQuery.includes('crop') ||
    lowerQuery.includes('fasal') ||
    lowerQuery.includes('farm') ||
    lowerQuery.includes('disease') ||
    lowerQuery.includes('mandi') ||
    lowerQuery.includes('zameen')
  ) {
    return { intent: 'zameen', confidence: 0.7, route: '/zameen' }
  }
  
  // Taleem keywords
  if (
    lowerQuery.includes('job') ||
    lowerQuery.includes('naukri') ||
    lowerQuery.includes('cv') ||
    lowerQuery.includes('career') ||
    lowerQuery.includes('exam') ||
    lowerQuery.includes('taleem')
  ) {
    return { intent: 'taleem', confidence: 0.7, route: '/taleem' }
  }
  
  // Default to Raah
  return { intent: 'raah', confidence: 0.5, route: '/raah' }
}

/**
 * Get available models
 */
export function getAvailableModels() {
  return MODELS
}

/**
 * Structured JSON-oriented completion (no locale wrapper). Use for resume parsing and job matching.
 */
export async function generateOpenRouterStructured(
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_TEXT_MODEL,
): Promise<string> {
  if (!openrouter) {
    throw new Error('OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local')
  }

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  })

  return (completion.choices[0]?.message?.content ?? '').trim()
}

/**
 * Test OpenRouter connection
 */
export async function testOpenRouterConnection(): Promise<boolean> {
  if (!openrouter) return false
  
  try {
    const completion = await openrouter.chat.completions.create({
      model: DEFAULT_TEXT_MODEL,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    })
    
    return !!completion.choices[0]?.message?.content
  } catch (error) {
    console.error('OpenRouter connection test failed:', error)
    return false
  }
}
