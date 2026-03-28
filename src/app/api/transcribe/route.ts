import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: 'Missing audio file' }, { status: 400 })
  }

  // Use OpenAI Whisper API through the gateway or directly
  // The AI Gateway supports whisper at: https://gateway.vercel.ai/v1/audio/transcriptions
  const gatewayUrl = 'https://gateway.vercel.ai/v1/audio/transcriptions'
  
  try {
    const outbound = new FormData()
    outbound.append('file', file, 'audio.webm')
    outbound.append('model', 'whisper-1')

    const res = await fetch(gatewayUrl, {
      method: 'POST',
      body: outbound,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Whisper transcription error', err)
      // Fallback to demo mode
      return NextResponse.json({
        text: '',
        demo: true,
        error: 'Transcription service unavailable',
      })
    }

    const data = (await res.json()) as { text?: string }
    return NextResponse.json({
      text: data.text?.trim() ?? '',
      demo: false,
    })
  } catch (error) {
    console.error('Transcription error', error)
    // Return demo mode fallback
    return NextResponse.json({
      text: '',
      demo: true,
      error: 'Transcription failed',
    })
  }
}
