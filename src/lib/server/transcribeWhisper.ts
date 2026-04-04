/**
 * OpenAI Whisper transcription — shared by /api/transcribe and /api/upload-audio.
 */

export type WhisperResult = {
  ok: boolean
  text: string
  language: string
  error?: string
}

export async function transcribeWithWhisper(
  file: Blob,
  filename: string,
  options?: { language?: string },
): Promise<WhisperResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      text: '',
      language: 'unknown',
      error: 'OPENAI_API_KEY is not configured',
    }
  }

  const outbound = new FormData()
  outbound.append('file', file, filename)
  outbound.append('model', 'whisper-1')
  if (options?.language && /^[a-z]{2}(-[A-Z]{2})?$/.test(options.language)) {
    outbound.append('language', options.language.slice(0, 2))
  }

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: outbound,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Whisper transcription error', err)
    const isQuota =
      err.includes('quota') || err.includes('insufficient_quota')
    return {
      ok: false,
      text: '',
      language: 'unknown',
      error: isQuota
        ? 'OpenAI API quota exceeded. Add credits or check billing.'
        : 'Transcription failed.',
    }
  }

  const data = (await res.json()) as { text?: string; language?: string }
  const text = data.text?.trim() ?? ''
  const language = data.language ?? 'unknown'
  return { ok: true, text, language }
}
