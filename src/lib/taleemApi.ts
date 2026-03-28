import type { UiLocale } from '@/lib/localeForLlm'

export type TaleemRequest = {
  locale: UiLocale
  pillar: string
  sub?: string
  message?: string
  ocrText?: string
}

export async function taleemLlm(req: TaleemRequest): Promise<string> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'taleem', ...req }),
  })
  if (!res.ok) throw new Error('Taleem LLM failed')
  const data = (await res.json()) as { text?: string }
  return data.text ?? ''
}
