export type TranscribeResult = { text: string; demo: boolean }

export async function transcribeAudio(blob: Blob): Promise<TranscribeResult> {
  const form = new FormData()
  form.append('file', blob, 'clip.webm')
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
