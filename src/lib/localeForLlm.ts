export const UI_LOCALES = [
  'en',
  'hi',
  'ur',
  'ks',
] as const

export type UiLocale = (typeof UI_LOCALES)[number]

const LOCALE_LABELS: Record<UiLocale, { name: string; script: string }> = {
  en: { name: 'English', script: 'Latin' },
  hi: { name: 'Hindi', script: 'Devanagari' },
  ur: { name: 'Urdu', script: 'Arabic (Perso-Arabic)' },
  ks: { name: 'Kashmiri', script: 'Arabic (Perso-Arabic)' },
}

export function parseUiLocale(value: unknown): UiLocale {
  if (typeof value !== 'string') return 'en'
  if ((UI_LOCALES as readonly string[]).includes(value)) {
    return value as UiLocale
  }
  return 'en'
}

/** BCP-47 tag for browser `SpeechRecognition`. */
export function speechRecognitionLang(locale: UiLocale): string {
  if (locale === 'en') return 'en-IN'
  return `${locale}-IN`
}

/** Appended to every LLM system prompt so replies match the UI language. */
export function localeInstruction(locale: UiLocale): string {
  const info = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en
  
  if (locale === 'en') {
    return `OUTPUT LANGUAGE: Respond entirely in English. Keep sentences short and clear for text-to-speech.`
  }
  
  if (locale === 'ur') {
    return `OUTPUT LANGUAGE REQUIREMENT (CRITICAL):
- You MUST respond ENTIRELY in Urdu (اردو) using Arabic/Perso-Arabic script
- Do NOT use English words or Latin script
- Write RIGHT-TO-LEFT in proper Urdu script
- Use simple, conversational Urdu that farmers and common people can understand
- Keep sentences short and clear for text-to-speech
- Example format: "یہ ایک دستاویز ہے۔ اس میں اہم معلومات ہیں۔"

IMPORTANT: Your entire response must be in Urdu script only. No English allowed.`
  }
  
  if (locale === 'hi') {
    return `OUTPUT LANGUAGE REQUIREMENT (CRITICAL):
- You MUST respond ENTIRELY in Hindi (हिंदी) using Devanagari script
- Do NOT use English words or Latin script
- Use simple, conversational Hindi that common people can understand
- Keep sentences short and clear for text-to-speech
- Example format: "यह एक दस्तावेज़ है। इसमें महत्वपूर्ण जानकारी है।"

IMPORTANT: Your entire response must be in Hindi Devanagari script only. No English allowed.`
  }
  
  if (locale === 'ks') {
    return `OUTPUT LANGUAGE REQUIREMENT (CRITICAL):
- You MUST respond ENTIRELY in Kashmiri (کٲشُر) using Arabic/Perso-Arabic script
- Do NOT use English words or Latin script
- Write RIGHT-TO-LEFT in proper Kashmiri script
- Use simple, conversational Kashmiri that local people can understand
- Keep sentences short and clear for text-to-speech

IMPORTANT: Your entire response must be in Kashmiri script only. No English allowed.`
  }
  
  return `OUTPUT LANGUAGE REQUIREMENT (CRITICAL):
- You MUST respond ENTIRELY in ${info.name} using ${info.script} script
- Do NOT use English words or Latin script
- Use simple, conversational language that common people can understand
- Keep sentences short and clear for text-to-speech

IMPORTANT: Your entire response must be in ${info.name} script only. No English allowed.`
}

export function localeLabel(locale: UiLocale): string {
  return LOCALE_LABELS[locale]?.name ?? 'English'
}
