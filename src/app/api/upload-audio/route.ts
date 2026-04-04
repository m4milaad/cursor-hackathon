import { NextResponse } from 'next/server'
import { transcribeWithWhisper } from '@/lib/server/transcribeWhisper'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * POST /api/upload-audio — multipart form: file (audio), optional language (ur|en|hi|... ISO-639-1)
 * Returns transcript from OpenAI Whisper. No dummy text.
 */
export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid form' },
      { status: 400 },
    )
  }

  const file = form.get('file')
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing audio file' },
      { status: 400 },
    )
  }

  const langRaw = form.get('language')
  const language =
    typeof langRaw === 'string' && langRaw.length >= 2
      ? langRaw.slice(0, 5)
      : undefined

  const result = await transcribeWithWhisper(file, 'audio.webm', {
    language: language?.replace('_', '-'),
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        transcript: '',
        language: result.language,
        error: result.error ?? 'Transcription failed',
      },
      { status: result.error?.includes('not configured') ? 503 : 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    transcript: result.text,
    language: result.language,
  })
}
