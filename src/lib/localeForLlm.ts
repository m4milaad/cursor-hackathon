export const UI_LOCALES = [
  'en',
  'hi',
  'ur',
  'bn',
  'ta',
  'te',
  'mr',
  'gu',
  'kn',
  'ml',
  'pa',
  'or',
  'as',
  'sd',
  'ks',
  'ne',
  'kok',
  'mai',
  'doi',
  'sat',
  'mni',
  'brx',
  'sa',
] as const

export type UiLocale = (typeof UI_LOCALES)[number]

const LOCALE_LABELS: Record<UiLocale, { name: string; script: string }> = {
  en: { name: 'English', script: 'Latin' },
  hi: { name: 'Hindi', script: 'Devanagari' },
  ur: { name: 'Urdu', script: 'Arabic (Perso-Arabic)' },
  bn: { name: 'Bengali', script: 'Bengali' },
  ta: { name: 'Tamil', script: 'Tamil' },
  te: { name: 'Telugu', script: 'Telugu' },
  mr: { name: 'Marathi', script: 'Devanagari' },
  gu: { name: 'Gujarati', script: 'Gujarati' },
  kn: { name: 'Kannada', script: 'Kannada' },
  ml: { name: 'Malayalam', script: 'Malayalam' },
  pa: { name: 'Punjabi', script: 'Gurmukhi' },
  or: { name: 'Odia', script: 'Odia' },
  as: { name: 'Assamese', script: 'Assamese' },
  sd: { name: 'Sindhi', script: 'Arabic (Perso-Arabic)' },
  ks: { name: 'Kashmiri', script: 'Arabic (Perso-Arabic)' },
  ne: { name: 'Nepali', script: 'Devanagari' },
  kok: { name: 'Konkani', script: 'Devanagari' },
  mai: { name: 'Maithili', script: 'Devanagari' },
  doi: { name: 'Dogri', script: 'Devanagari' },
  sat: { name: 'Santali', script: 'Ol Chiki' },
  mni: { name: 'Manipuri (Meitei)', script: 'Meitei Mayek' },
  brx: { name: 'Bodo', script: 'Devanagari' },
  sa: { name: 'Sanskrit', script: 'Devanagari' },
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
  return `OUTPUT LANGUAGE: Respond entirely in ${info.name} using ${info.script} script. Keep sentences short and clear for text-to-speech.`
}

export function localeLabel(locale: UiLocale): string {
  return LOCALE_LABELS[locale]?.name ?? 'English'
}
