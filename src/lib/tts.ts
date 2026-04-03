import type { UiLocale } from '@/lib/localeForLlm'

let utter: SpeechSynthesisUtterance | null = null
let currentAudio: HTMLAudioElement | null = null

export function stopSpeaking(): void {
  // Stop browser TTS
  speechSynthesis.cancel()
  utter = null
  
  // Stop cloud TTS audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

const TTS_LANG: Record<UiLocale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ur: 'ur-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
  sd: 'sd-IN',
  ks: 'hi-IN',
  ne: 'ne-IN',
  kok: 'kok-IN',
  mai: 'mai-IN',
  doi: 'doi-IN',
  sat: 'sat-IN',
  mni: 'mni-IN',
  brx: 'brx-IN',
  sa: 'sa-IN',
}

export function speechLangForUi(locale: UiLocale): string {
  return TTS_LANG[locale] ?? 'en-IN'
}

/**
 * Speak text using cloud TTS (primary) or browser TTS (fallback)
 * This ensures voice works for ALL users without requiring voice installation
 */
export async function speakForLocale(text: string, locale: UiLocale): Promise<void> {
  try {
    // Try cloud TTS first (works for all users)
    console.log(`🔊 Attempting cloud TTS for locale: ${locale}`)
    await speakWithCloudTTS(text, locale)
    console.log('✅ Cloud TTS completed successfully')
  } catch (error) {
    // Fallback to browser TTS if cloud fails
    console.warn('⚠️ Cloud TTS failed, falling back to browser TTS:', error)
    await speakText(text, speechLangForUi(locale))
  }
}

/**
 * Cloud TTS implementation (works for all users)
 */
async function speakWithCloudTTS(text: string, locale: UiLocale): Promise<void> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, locale })
  })
  
  if (!response.ok) {
    const data = await response.json()
    if (data.fallback) {
      throw new Error('Cloud TTS not available, use fallback')
    }
    throw new Error('TTS API failed')
  }
  
  // Get audio blob
  const audioBlob = await response.blob()
  
  // Play audio
  const audioUrl = URL.createObjectURL(audioBlob)
  currentAudio = new Audio(audioUrl)
  
  return new Promise((resolve, reject) => {
    if (!currentAudio) {
      reject(new Error('Audio element not created'))
      return
    }
    
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      currentAudio = null
      resolve()
    }
    
    currentAudio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl)
      currentAudio = null
      reject(error)
    }
    
    currentAudio.play().catch(error => {
      URL.revokeObjectURL(audioUrl)
      currentAudio = null
      reject(error)
    })
  })
}

/**
 * Get available voices for a specific language
 */
function getVoiceForLang(lang: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  
  console.log(`🔍 Looking for voice for language: ${lang}`)
  console.log(`📋 Available voices:`, voices.map(v => `${v.name} (${v.lang})`).join(', '))
  
  // Try exact match first (e.g., "ur-IN")
  let voice = voices.find(v => v.lang === lang)
  if (voice) {
    console.log(`✅ Found exact match: ${voice.name} (${voice.lang})`)
    return voice
  }
  
  // Try language prefix match (e.g., "ur" for "ur-IN")
  const langPrefix = lang.split('-')[0]
  voice = voices.find(v => v.lang.startsWith(langPrefix))
  if (voice) {
    console.log(`✅ Found prefix match: ${voice.name} (${voice.lang})`)
    return voice
  }
  
  // For Urdu, try Hindi as fallback (similar phonetics and script)
  if (langPrefix === 'ur') {
    console.log('⚠️ No Urdu voice found, trying Hindi fallback...')
    
    // Try to find Hindi voice
    voice = voices.find(v => v.lang.startsWith('hi'))
    if (voice) {
      console.log(`✅ Using Hindi voice as fallback: ${voice.name} (${voice.lang})`)
      return voice
    }
    
    // Try to find any Indian English voice as last resort
    voice = voices.find(v => v.lang === 'en-IN')
    if (voice) {
      console.log(`⚠️ Using Indian English voice as last resort: ${voice.name} (${voice.lang})`)
      return voice
    }
  }
  
  // For Kashmiri, use Hindi
  if (langPrefix === 'ks') {
    console.log('⚠️ No Kashmiri voice found, trying Hindi fallback...')
    voice = voices.find(v => v.lang.startsWith('hi'))
    if (voice) {
      console.log(`✅ Using Hindi voice for Kashmiri: ${voice.name} (${voice.lang})`)
      return voice
    }
  }
  
  console.warn(`❌ No suitable voice found for ${lang}`)
  return null
}

/**
 * Browser TTS for demos. Swap for ElevenLabs / Google Cloud TTS with keys.
 */
export function speakText(text: string, lang = 'en-IN'): Promise<void> {
  return new Promise((resolve) => {
    stopSpeaking()
    if (!text || !window.speechSynthesis) {
      resolve()
      return
    }
    
    // Wait for voices to load
    const speak = () => {
      utter = new SpeechSynthesisUtterance(text)
      utter.lang = lang
      utter.rate = 0.92
      utter.pitch = 1.0
      utter.volume = 1.0
      
      // Try to find and set a specific voice for the language
      const voice = getVoiceForLang(lang)
      if (voice) {
        utter.voice = voice
        console.log(`🔊 Speaking with voice: ${voice.name} (${voice.lang})`)
        console.log(`📝 Text to speak: ${text.substring(0, 50)}...`)
      } else {
        console.warn(`⚠️ No voice found for ${lang}, browser will use default`)
        console.warn(`⚠️ This may result in English voice for non-English text`)
        console.warn(`💡 To fix: Install ${lang} voice in your system settings`)
      }
      
      utter.onend = () => {
        console.log('✅ Speech completed')
        resolve()
      }
      utter.onerror = (error) => {
        console.error('❌ Speech error:', error)
        resolve()
      }
      
      speechSynthesis.speak(utter)
    }
    
    // Voices might not be loaded yet
    const voices = speechSynthesis.getVoices()
    if (voices.length > 0) {
      speak()
    } else {
      // Wait for voices to load
      console.log('⏳ Waiting for voices to load...')
      speechSynthesis.onvoiceschanged = () => {
        console.log('✅ Voices loaded')
        speak()
      }
      
      // Fallback timeout in case onvoiceschanged doesn't fire
      setTimeout(() => {
        if (speechSynthesis.getVoices().length > 0) {
          speak()
        } else {
          console.warn('⚠️ Voices still not loaded, speaking anyway')
          speak()
        }
      }, 1000)
    }
  })
}

/**
 * Get list of available voices for debugging
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices()
}

/**
 * Check if a specific language is supported
 */
export function isLanguageSupported(locale: UiLocale): boolean {
  const lang = speechLangForUi(locale)
  const voices = speechSynthesis.getVoices()
  const langPrefix = lang.split('-')[0]
  return voices.some(v => v.lang.startsWith(langPrefix))
}
