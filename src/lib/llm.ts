import type { UiLocale } from '@/lib/localeForLlm'

async function postLlm(payload: Record<string, string>): Promise<string> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json()) as {
    ok?: boolean
    text?: string
    error?: string
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.error ?? 'LLM request failed')
  }
  return data.text ?? ''
}

export async function explainDocumentSimpleUrdu(
  ocrText: string,
  locale: UiLocale,
): Promise<string> {
  return postLlm({ mode: 'samjho', ocrText, locale })
}

export async function explainCropAdvice(
  visionSummary: string,
  mandiHint: string,
  locale: UiLocale,
): Promise<string> {
  return postLlm({ mode: 'zameen', visionSummary, mandiHint, locale })
}

export async function answerVoiceQuestion(
  question: string,
  locale: UiLocale,
): Promise<string> {
  return postLlm({ mode: 'raah', question, locale })
}
