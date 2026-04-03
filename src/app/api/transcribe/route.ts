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
    // Whisper will auto-detect language - no need to specify

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: outbound,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Whisper transcription error', err)
      
      // Check if it's a quota error
      const isQuotaError = err.includes('quota') || err.includes('insufficient_quota')
      
      if (requestId) {
        await failLifecycleRequest(requestId, err)
      }
      
      return NextResponse.json({
        ok: false,
        text: '',
        language: 'unknown',
        demo: false,
        error: isQuotaError 
          ? 'OpenAI API quota exceeded. Please add credits or use an alternative AI provider (Google Gemini is free).'
          : 'Transcription service unavailable. Please try again.',
        requestId,
      }, { status: res.status })
    }

    const data = (await res.json()) as { text?: string; language?: string }
    const text = data.text?.trim() ?? ''
    const language = data.language || 'unknown'
    
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
      language,
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
    return NextResponse.json({
      ok: false,
      text: '',
      language: 'unknown',
      demo: false,
      error: error instanceof Error ? error.message : 'Transcription failed. Please try again.',
      requestId,
    }, { status: 500 })
  }
}
