/**
 * Cloud-based Text-to-Speech
 * Works for all users without requiring voice installation
 */

import type { UiLocale } from '@/lib/localeForLlm'

/**
 * Get Google Cloud TTS voice name for locale
 */
function getGoogleVoiceForLocale(locale: UiLocale): { languageCode: string; name: string } {
  const voiceMap: Record<UiLocale, { languageCode: string; name: string }> = {
    en: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' },
    hi: { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D' },
    ur: { languageCode: 'ur-IN', name: 'ur-IN-Wavenet-A' }, // Urdu voice
    bn: { languageCode: 'bn-IN', name: 'bn-IN-Wavenet-A' },
    ta: { languageCode: 'ta-IN', name: 'ta-IN-Wavenet-A' },
    te: { languageCode: 'te-IN', name: 'te-IN-Standard-A' },
    mr: { languageCode: 'mr-IN', name: 'mr-IN-Wavenet-A' },
    gu: { languageCode: 'gu-IN', name: 'gu-IN-Wavenet-A' },
    kn: { languageCode: 'kn-IN', name: 'kn-IN-Wavenet-A' },
    ml: { languageCode: 'ml-IN', name: 'ml-IN-Wavenet-A' },
    pa: { languageCode: 'pa-IN', name: 'pa-IN-Wavenet-A' },
    or: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // Fallback
    as: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // Fallback
    sd: { languageCode: 'ur-IN', name: 'ur-IN-Wavenet-A' }, // Use Urdu
    ks: { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D' }, // Use Hindi for Kashmiri
    ne: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // Fallback
    kok: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // Fallback
    mai: { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D' }, // Use Hindi
    doi: { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D' }, // Use Hindi
    sat: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // Fallback
    mni: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // Fallback
    brx: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // Fallback
    sa: { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D' }, // Use Hindi for Sanskrit
  }
  
  return voiceMap[locale] || { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }
}

/**
 * Speak text using cloud TTS (works for all users)
 */
export async function speakWithCloudTTS(
  text: string,
  locale: UiLocale = 'en'
): Promise<void> {
  try {
    console.log(`🔊 Cloud TTS: Speaking in ${locale}`)
    
    // Call our TTS API endpoint
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, locale })
    })
    
    if (!response.ok) {
      throw new Error('TTS API failed')
    }
    
    // Get audio blob
    const audioBlob = await response.blob()
    
    // Play audio
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        console.log('✅ Cloud TTS: Speech completed')
        resolve()
      }
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl)
        console.error('❌ Cloud TTS: Audio playback error', error)
        reject(error)
      }
      
      audio.play().catch(error => {
        console.error('❌ Cloud TTS: Failed to play audio', error)
        reject(error)
      })
    })
  } catch (error) {
    console.error('❌ Cloud TTS error:', error)
    throw error
  }
}

/**
 * Check if cloud TTS is available
 */
export async function isCloudTTSAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/tts/check')
    return response.ok
  } catch {
    return false
  }
}

/**
 * Generate TTS request for Google Cloud
 */
export function generateGoogleTTSRequest(text: string, locale: UiLocale) {
  const voice = getGoogleVoiceForLocale(locale)
  
  return {
    input: { text },
    voice: {
      languageCode: voice.languageCode,
      name: voice.name,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.95,
      pitch: 0,
      volumeGainDb: 0,
    },
  }
}
