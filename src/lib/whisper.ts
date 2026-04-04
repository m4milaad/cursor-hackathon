export type TranscribeResult = { text: string; demo: boolean }

export async function transcribeAudio(blob: Blob, locale?: string): Promise<TranscribeResult> {
  const form = new FormData()
  form.append('file', blob, 'clip.webm')
  if (locale) form.append('locale', locale)
  const res = await fetch('/api/transcribe', { method: 'POST', body: form })
  const data = (await res.json()) as {
    ok?: boolean
    text?: string
    demo?: boolean
    error?: string
  }
  if (!res.ok || data.ok === false) {
    return { text: '', demo: true }
  }
  return {
    text: data.text?.trim() ?? '',
    demo: Boolean(data.demo),
  }
}

/** Voice CV: Whisper via /api/upload-audio (returns transcript + language). */
export async function uploadAudioForTranscript(
  blob: Blob,
  languageHint?: string,
): Promise<{
  ok: boolean
  transcript: string
  language: string
  error?: string
}> {
  const form = new FormData()
  form.append('file', blob, 'recording.webm')
  if (languageHint && languageHint !== 'auto') {
    form.append('language', languageHint)
  }
  const res = await fetch('/api/upload-audio', { method: 'POST', body: form })
  const data = (await res.json()) as {
    ok?: boolean
    transcript?: string
    language?: string
    error?: string
  }
  if (!res.ok || !data.ok) {
    return {
      ok: false,
      transcript: '',
      language: 'unknown',
      error: data.error ?? 'Transcription failed',
    }
  }
  return {
    ok: true,
    transcript: data.transcript?.trim() ?? '',
    language: data.language ?? 'unknown',
  }
}
