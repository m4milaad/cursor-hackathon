import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import {
  demoSamjho,
  demoZameen,
  fallbackRaahAnswer,
} from '@/lib/demoLocalized'
import { localeInstruction, parseUiLocale, type UiLocale } from '@/lib/localeForLlm'
import { taleemDemoFallback, taleemPrompts } from '@/lib/taleem-server'

const MODEL = 'openai/gpt-4o-mini'

function withLocale(system: string, locale: UiLocale): string {
  return `${system.trim()}\n\n${localeInstruction(locale)}`
}

async function aiChat(
  system: string,
  user: string,
): Promise<string | null> {
  try {
    const result = await generateText({
      model: MODEL,
      system,
      prompt: user,
      temperature: 0.4,
    })
    return result.text?.trim() ?? null
  } catch (error) {
    console.error('AI Gateway chat error', error)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      mode?: string
      ocrText?: string
      visionSummary?: string
      mandiHint?: string
      question?: string
      pillar?: string
      sub?: string
      message?: string
      locale?: string
    }
    const locale = parseUiLocale(body.locale)

    if (body.mode === 'samjho' && typeof body.ocrText === 'string') {
      const system = withLocale(
        `You are Samjho, powered by HAQQ. Explain government or legal documents in simple language for people with low literacy. Short paragraphs, warm and clear. Include deadlines and next steps.`,
        locale,
      )
      const user = `Document text:\n${body.ocrText}\n\nExplain what this means and what the reader should do.`
      const text =
        (await aiChat(system, user)) ?? demoSamjho(locale)
      return NextResponse.json({
        text,
        usedModel: true,
      })
    }

    if (body.mode === 'zameen' && typeof body.visionSummary === 'string') {
      const mandi =
        typeof body.mandiHint === 'string' ? body.mandiHint : ''
      const system = withLocale(
        `You are Zameen, powered by WADI. Give practical crop and disease advice. Mention treatment timing and mandi (market) price when data is provided. Keep it voice-friendly.`,
        locale,
      )
      const user = `Vision summary: ${body.visionSummary}\nMarket note: ${mandi}`
      const text =
        (await aiChat(system, user)) ?? demoZameen(locale)
      return NextResponse.json({
        text,
        usedModel: true,
      })
    }

    if (body.mode === 'raah' && typeof body.question === 'string') {
      const system = withLocale(
        `You are Raah, the voice layer of RAASTA. Help people in Kashmir and rural India with government schemes, farming, documents, jobs, and education (Taleem). Be concise. No long bullet lists unless asked.`,
        locale,
      )
      const text =
        (await aiChat(system, body.question)) ??
        fallbackRaahAnswer(body.question, locale)
      return NextResponse.json({
        text,
        usedModel: true,
      })
    }

    if (body.mode === 'taleem' && typeof body.pillar === 'string') {
      const prompts = taleemPrompts({
        pillar: body.pillar,
        sub: body.sub,
        message: body.message,
        ocrText: body.ocrText,
      })
      const fallback = taleemDemoFallback(
        {
          pillar: body.pillar,
          sub: body.sub,
          message: body.message,
          ocrText: body.ocrText,
        },
        locale,
      )
      if (!prompts) {
        return NextResponse.json({ text: fallback, usedModel: false })
      }
      const system = withLocale(prompts.system, locale)
      const text = (await aiChat(system, prompts.user)) ?? fallback
      return NextResponse.json({
        text,
        usedModel: true,
      })
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
