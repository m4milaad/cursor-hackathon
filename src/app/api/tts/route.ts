import { NextResponse } from 'next/server'
import { parseUiLocale, type UiLocale } from '@/lib/localeForLlm'

// eidosSpeech - Free TTS API (Microsoft Edge TTS)
// 30 requests/day, 1000 chars per request (free tier)
const EIDOS_TTS_API = 'https://eidosspeech.xyz/api/v1/tts'

/**
 * Get Microsoft Edge TTS voice name for locale
 * Using Indian English voices for best quality
 */
function getEdgeVoice(locale: UiLocale): string {
  const voiceMap: Record<string, string> = {
    en: 'en-IN-NeerjaNeural',      // Indian English Female
    hi: 'hi-IN-SwaraNeural',       // Hindi Female
    ur: 'ur-IN-GulNeural',         // Urdu Female (WORKS!)
    bn: 'bn-IN-TanishaaNeural',    // Bengali Female
    ta: 'ta-IN-PallaviNeural',     // Tamil Female
    te: 'te-IN-ShrutiNeural',      // Telugu Female
    mr: 'mr-IN-AarohiNeural',      // Marathi Female
    gu: 'gu-IN-DhwaniNeural',      // Gujarati Female
    kn: 'kn-IN-SapnaNeural',       // Kannada Female
    ml: 'ml-IN-SobhanaNeural',     // Malayalam Female
    pa: 'pa-IN-SoniaNeural',       // Punjabi Female
    ks: 'hi-IN-SwaraNeural',       // Kashmiri uses Hindi
  }
  
  return voiceMap[locale] || 'en-IN-NeerjaNeural'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text = body.text as string
    const locale = parseUiLocale(body.locale)
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }
    
    // Truncate text to 1000 chars (eidosSpeech free tier limit)
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) : text
    
    // Get Microsoft Edge TTS voice
    const voice = getEdgeVoice(locale)
    
    console.log(`🔊 Generating TTS for locale: ${locale}, voice: ${voice}`)
    console.log(`📝 Text length: ${truncatedText.length} chars`)
    
    // Call eidosSpeech API (FREE - no API key needed for basic usage)
    const response = await fetch(EIDOS_TTS_API, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: truncatedText,
        voice: voice,
        rate: '0.95',
        pitch: '0',
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('❌ eidosSpeech TTS error:', error)
      throw new Error('TTS generation failed')
    }
    
    // Get audio buffer directly (returns MP3)
    const audioBuffer = await response.arrayBuffer()
    
    console.log(`✅ TTS generated: ${audioBuffer.byteLength} bytes`)
    
    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', fallback: true },
      { status: 500 }
    )
  }
}

/**
 * Check if TTS service is available
 */
export async function GET() {
  return NextResponse.json({
    available: true,
    provider: 'eidosspeech-edge-tts',
    free: true,
    limit: '30 requests/day, 1000 chars per request'
  })
}
