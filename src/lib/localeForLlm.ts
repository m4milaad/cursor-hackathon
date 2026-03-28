export type UiLocale = 'en' | 'hi' | 'ks'

export function parseUiLocale(value: unknown): UiLocale {
  if (value === 'hi' || value === 'ks') return value
  return 'en'
}

/** BCP-47 tag for browser `SpeechRecognition` (Kashmiri engines are rare — use Hindi). */
export function speechRecognitionLang(locale: UiLocale): string {
  switch (locale) {
    case 'en':
      return 'en-IN'
    case 'hi':
      return 'hi-IN'
    case 'ks':
    default:
      return 'hi-IN'
  }
}

/** Appended to every LLM system prompt so replies match the UI language. */
export function localeInstruction(locale: UiLocale): string {
  switch (locale) {
    case 'hi':
      return 'OUTPUT LANGUAGE: Respond entirely in Hindi using Devanagari script. Keep sentences short and clear for text-to-speech.'
    case 'ks':
      return 'OUTPUT LANGUAGE: Respond entirely in Kashmiri using Arabic (Perso-Arabic) script. Keep sentences short and clear for text-to-speech.'
    default:
      return 'OUTPUT LANGUAGE: Respond entirely in clear, simple English. Keep sentences short for text-to-speech.'
  }
}
