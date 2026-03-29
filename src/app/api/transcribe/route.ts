import { NextResponse } from 'next/server'
import {
  completeLifecycleRequest,
  createLifecycleRequest,
  failLifecycleRequest,
} from '@/lib/server/convexLifecycle'

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

  const apiKey = process.env.OPENAI_API_KEY
  requestId = await createLifecycleRequest({
    mode: 'transcribe',
    locale: 'en',
    input: `audio:${file.size}`,
  })

  if (!apiKey) {
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
    const outbound = new FormData()
    outbound.append('file', file, 'audio.webm')
    outbound.append('model', 'whisper-1')

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: outbound,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Whisper transcription error', err)
      if (requestId) {
        await failLifecycleRequest(requestId, err)
      }
      // Fallback to demo mode
      return NextResponse.json({
        ok: true,
        text: '',
        demo: true,
        error: 'Transcription service unavailable',
        requestId,
      })
    }

    const data = (await res.json()) as { text?: string }
    const text = data.text?.trim() ?? ''
    if (requestId) {
      await completeLifecycleRequest(
        requestId,
        text || 'Transcription succeeded with empty result',
        'openai-whisper',
      )
    }
    return NextResponse.json({
      ok: true,
      text,
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
    // Return demo mode fallback
    return NextResponse.json({
      ok: true,
      text: '',
      demo: true,
      error: 'Transcription failed',
      requestId,
    })
  }
}
