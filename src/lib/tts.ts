import type { UiLocale } from '@/lib/localeForLlm'

let utter: SpeechSynthesisUtterance | null = null

export function stopSpeaking(): void {
  speechSynthesis.cancel()
  utter = null
}

const TTS_LANG: Record<UiLocale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ks: 'hi-IN',
}

export function speechLangForUi(locale: UiLocale): string {
  return TTS_LANG[locale] ?? 'en-IN'
}

export function speakForLocale(text: string, locale: UiLocale): Promise<void> {
  return speakText(text, speechLangForUi(locale))
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
    utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.rate = 0.92
    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    speechSynthesis.speak(utter)
  })
}
