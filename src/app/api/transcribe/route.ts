import { NextResponse } from 'next/server'
import {
  completeLifecycleRequest,
  createLifecycleRequest,
  failLifecycleRequest,
} from '@/lib/server/convexLifecycle'
import { transcribeWithWhisper } from '@/lib/server/transcribeWhisper'

export async function POST(req: Request) {
  let requestId: string | null = null
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing audio file', demo: false },
      { status: 400 },
    )
  }

  requestId = await createLifecycleRequest({
    mode: 'transcribe',
    locale: 'en',
    input: `audio:${file.size}`,
  })

  if (!process.env.OPENAI_API_KEY) {
    if (requestId) {
      await completeLifecycleRequest(
        requestId,
        'Transcription unavailable: missing OPENAI_API_KEY',
        'demo',
      )
    }
    return NextResponse.json({
      ok: true,
      text: '',
      demo: true,
      error: 'OPENAI_API_KEY is not configured',
      requestId,
    })
  }

  try {
    const data = await transcribeWithWhisper(file, 'audio.webm')

    if (!data.ok) {
      if (requestId) {
        await failLifecycleRequest(requestId, data.error ?? 'whisper failed')
      }
      return NextResponse.json(
        {
          ok: false,
          text: '',
          language: data.language,
          demo: false,
          error: data.error,
          requestId,
        },
        { status: 502 },
      )
    }

    if (requestId) {
      await completeLifecycleRequest(
        requestId,
        data.text || 'Transcription succeeded with empty result',
        'openai-whisper',
      )
    }
    return NextResponse.json({
      ok: true,
      text: data.text,
      language: data.language,
      demo: false,
      requestId,
    })
  } catch (error) {
    console.error('Transcription error', error)
    if (requestId) {
      await failLifecycleRequest(
        requestId,
        error instanceof Error ? error.message : 'Transcription failed',
      )
    }
    return NextResponse.json(
      {
        ok: false,
        text: '',
        language: 'unknown',
        demo: false,
        error:
          error instanceof Error
            ? error.message
            : 'Transcription failed. Please try again.',
        requestId,
      },
      { status: 500 },
    )
  }
}
