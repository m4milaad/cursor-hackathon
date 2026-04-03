/**
 * Google Gemini AI Integration
 * Free alternative to OpenAI with vision support
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { UiLocale } from '@/lib/localeForLlm'

// Initialize Gemini client
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Models
const TEXT_MODEL = 'gemini-1.5-flash' // Fast, free
const VISION_MODEL = 'gemini-1.5-flash' // Supports images

/**
 * Check if Gemini is configured
 */
export function isGeminiAvailable(): boolean {
  return !!genAI
}

/**
 * Get language instruction for Gemini
 */
function getLanguageInstruction(locale: UiLocale): string {
  if (locale === 'en') {
    return 'Respond in English only.'
  }
  
  if (locale === 'ur') {
    return `CRITICAL: You MUST respond ENTIRELY in Urdu (اردو) using Arabic/Perso-Arabic script. 
Do NOT use English or Latin script. 
Example: "یہ ایک دستاویز ہے۔ اس میں اہم معلومات ہیں۔"
Your entire response must be in Urdu script.`
  }
  
  if (locale === 'hi') {
    return `CRITICAL: You MUST respond ENTIRELY in Hindi (हिंदी) using Devanagari script.
Do NOT use English or Latin script.
Example: "यह एक दस्तावेज़ है। इसमें महत्वपूर्ण जानकारी है।"
Your entire response must be in Hindi Devanagari script.`
  }
  
  if (locale === 'ks') {
    return `CRITICAL: You MUST respond ENTIRELY in Kashmiri (کٲشُر) using Arabic/Perso-Arabic script.
Do NOT use English or Latin script.
Your entire response must be in Kashmiri script.`
  }
  
  return `Respond in ${locale} language only. Do not use English.`
}

/**
 * Generate text response using Gemini
 */
export async function generateGeminiText(
  systemPrompt: string,
  userPrompt: string,
  locale: UiLocale = 'en'
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY to .env.local')
  }

  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL })
    
    // Combine system prompt with language instruction
    const languageInstruction = getLanguageInstruction(locale)
    const fullPrompt = `${languageInstruction}\n\n${systemPrompt}\n\nUser: ${userPrompt}`
    
    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const text = response.text()
    
    return text.trim()
  } catch (error) {
    console.error('Gemini text generation error:', error)
    throw new Error('Failed to generate AI response. Please try again.')
  }
}

/**
 * Analyze image using Gemini Vision
 */
export async function analyzeImageWithGemini(
  imageData: string | Buffer,
  prompt: string,
  locale: UiLocale = 'en'
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY to .env.local')
  }

  try {
    const model = genAI.getGenerativeModel({ model: VISION_MODEL })
    
    // Convert image to base64 if it's a Buffer
    const base64Image = Buffer.isBuffer(imageData) 
      ? imageData.toString('base64')
      : imageData.replace(/^data:image\/\w+;base64,/, '')
    
    // Add language instruction
    const languageInstruction = getLanguageInstruction(locale)
    const fullPrompt = `${languageInstruction}\n\n${prompt}`
    
    const result = await model.generateContent([
      fullPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      }
    ])
    
    const response = result.response
    const text = response.text()
    
    return text.trim()
  } catch (error) {
    console.error('Gemini vision analysis error:', error)
    throw new Error('Failed to analyze image. Please try again.')
  }
}

/**
 * Detect intent from user query
 */
export async function detectIntentWithGemini(
  query: string
): Promise<{
  intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown'
  confidence: number
  route: string
}> {
  if (!genAI) {
    throw new Error('Gemini API key not configured')
  }

  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL })
    
    const prompt = `You are an intent classifier for a voice-first AI assistant.

Classify the user's query into ONE of these categories:
- samjho: Documents, notices, certificates, forms, legal papers
- zameen: Crops, farming, agriculture, diseases, mandi prices
- taleem: Jobs, CV, career, exams, scholarships, education
- raah: General guidance, life advice, emotional support, unclear queries

User query: "${query}"

Respond with ONLY a JSON object in this exact format:
{
  "intent": "samjho",
  "confidence": 0.95
}

No other text. Just the JSON.`

    const result = await model.generateContent(prompt)
    const response = result.response.text().trim()
    
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
    console.error('Gemini intent detection error:', error)
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
    lowerQuery.includes('certificate')
  ) {
    return { intent: 'samjho', confidence: 0.7, route: '/samjho' }
  }
  
  // Zameen keywords
  if (
    lowerQuery.includes('crop') ||
    lowerQuery.includes('fasal') ||
    lowerQuery.includes('farm') ||
    lowerQuery.includes('disease') ||
    lowerQuery.includes('mandi')
  ) {
    return { intent: 'zameen', confidence: 0.7, route: '/zameen' }
  }
  
  // Taleem keywords
  if (
    lowerQuery.includes('job') ||
    lowerQuery.includes('naukri') ||
    lowerQuery.includes('cv') ||
    lowerQuery.includes('career') ||
    lowerQuery.includes('exam')
  ) {
    return { intent: 'taleem', confidence: 0.7, route: '/taleem' }
  }
  
  // Default to Raah
  return { intent: 'raah', confidence: 0.5, route: '/raah' }
}

/**
 * Transcribe audio using browser Web Speech API
 * (Alternative to OpenAI Whisper - free and built-in)
 */
export function createBrowserSpeechRecognition(
  language: string = 'en-IN',
  onResult: (text: string) => void,
  onError: (error: string) => void
): {
  start: () => void
  stop: () => void
} | null {
  if (typeof window === 'undefined') return null
  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    return null
  }
  
  const recognition = new SpeechRecognition()
  recognition.lang = language
  recognition.continuous = false
  recognition.interimResults = false
  
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }
  
  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error')
  }
  
  return {
    start: () => recognition.start(),
    stop: () => recognition.stop()
  }
}
