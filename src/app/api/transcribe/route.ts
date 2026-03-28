import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY
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

  if (!key) {
    await new Promise((r) => setTimeout(r, 500))
    return NextResponse.json({ text: '', demo: true })
  }

  const outbound = new FormData()
  outbound.append('file', file, 'audio.webm')
  outbound.append('model', 'whisper-1')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: outbound,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Whisper error', err)
    return NextResponse.json(
      { text: '', error: 'Transcription failed' },
      { status: 502 },
    )
  }

  const data = (await res.json()) as { text?: string }
  return NextResponse.json({
    text: data.text?.trim() ?? '',
    demo: false,
  })
}
