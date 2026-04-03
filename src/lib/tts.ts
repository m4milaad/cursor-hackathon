import type { UiLocale } from '@/lib/localeForLlm'

let utter: SpeechSynthesisUtterance | null = null

export function stopSpeaking(): void {
  speechSynthesis.cancel()
  utter = null
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

export function speakForLocale(text: string, locale: UiLocale): Promise<void> {
  return speakText(text, speechLangForUi(locale))
}

/**
 * Get available voices for a specific language
 */
function getVoiceForLang(lang: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  
  // Try exact match first (e.g., "ur-IN")
  let voice = voices.find(v => v.lang === lang)
  if (voice) return voice
  
  // Try language prefix match (e.g., "ur" for "ur-IN")
  const langPrefix = lang.split('-')[0]
  voice = voices.find(v => v.lang.startsWith(langPrefix))
  if (voice) return voice
  
  // For Urdu, try Hindi as fallback (similar phonetics)
  if (langPrefix === 'ur') {
    voice = voices.find(v => v.lang.startsWith('hi'))
    if (voice) {
      console.log('⚠️ No Urdu voice found, using Hindi voice as fallback')
      return voice
    }
  }
  
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
      
      // Try to find and set a specific voice for the language
      const voice = getVoiceForLang(lang)
      if (voice) {
        utter.voice = voice
        console.log(`🔊 Using voice: ${voice.name} (${voice.lang})`)
      } else {
        console.warn(`⚠️ No voice found for ${lang}, using default`)
      }
      
      utter.onend = () => resolve()
      utter.onerror = () => resolve()
      speechSynthesis.speak(utter)
    }
    
    // Voices might not be loaded yet
    const voices = speechSynthesis.getVoices()
    if (voices.length > 0) {
      speak()
    } else {
      // Wait for voices to load
      speechSynthesis.onvoiceschanged = () => {
        speak()
      }
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
