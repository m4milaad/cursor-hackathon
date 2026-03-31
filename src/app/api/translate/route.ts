import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { localeLabel, parseUiLocale } from '@/lib/localeForLlm'

const MODEL = 'openai/gpt-4o-mini'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; locale?: string }
    const text = typeof body.text === 'string' ? body.text.trim() : ''
    const locale = parseUiLocale(body.locale)
    if (!text) {
      return NextResponse.json({ ok: false, text: '' }, { status: 400 })
    }

    const language = localeLabel(locale)
    const result = await generateText({
      model: MODEL,
      system: `You are a translation engine. Translate UI text into ${language}. Preserve placeholders like {name} exactly. Keep tone concise and neutral.`,
      prompt: text,
      temperature: 0.2,
    })

    return NextResponse.json({
      ok: true,
      text: result.text?.trim() ?? text,
    })
  } catch (error) {
    console.error('Translate route error', error)
    return NextResponse.json({ ok: false, text: '' }, { status: 500 })
  }
}
