async function postLlm(payload: Record<string, string>): Promise<string> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error('LLM request failed')
  }
  const data = (await res.json()) as { text?: string }
  return data.text ?? ''
}

export async function explainDocumentSimpleUrdu(ocrText: string): Promise<string> {
  return postLlm({ mode: 'samjho', ocrText })
}

export async function explainCropAdvice(
  visionSummary: string,
  mandiHint: string,
): Promise<string> {
  return postLlm({ mode: 'zameen', visionSummary, mandiHint })
}

export async function answerVoiceQuestion(question: string): Promise<string> {
  return postLlm({ mode: 'raah', question })
}
