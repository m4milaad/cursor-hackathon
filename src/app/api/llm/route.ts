import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import {
  demoSamjho,
  demoZameen,
  fallbackRaahAnswer,
} from '@/lib/demoLocalized'
import { localeInstruction, parseUiLocale, type UiLocale } from '@/lib/localeForLlm'
import { taleemDemoFallback, taleemPrompts } from '@/lib/taleem-server'
import {
  completeLifecycleRequest,
  createLifecycleRequest,
  failLifecycleRequest,
} from '@/lib/server/convexLifecycle'

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
  let requestId: string | null = null
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
      requestId = await createLifecycleRequest({
        mode: 'samjho',
        locale,
        input: body.ocrText,
      })
      const system = withLocale(
        `You are Samjho, powered by HAQQ. Explain government or legal documents in simple language for people with low literacy. Short paragraphs, warm and clear. Include deadlines and next steps.`,
        locale,
      )
      const user = `Document text:\n${body.ocrText}\n\nExplain what this means and what the reader should do.`
      const aiText = await aiChat(system, user)
      const text = aiText ?? demoSamjho(locale)
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'demo',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    if (body.mode === 'zameen' && typeof body.visionSummary === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'zameen',
        locale,
        input: body.visionSummary,
      })
      const mandi =
        typeof body.mandiHint === 'string' ? body.mandiHint : ''
      const system = withLocale(
        `You are Zameen, powered by WADI. Give practical crop and disease advice. Mention treatment timing and mandi (market) price when data is provided. Keep it voice-friendly.`,
        locale,
      )
      const user = `Vision summary: ${body.visionSummary}\nMarket note: ${mandi}`
      const aiText = await aiChat(system, user)
      const text = aiText ?? demoZameen(locale)
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'demo',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    if (body.mode === 'raah' && typeof body.question === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'raah',
        locale,
        input: body.question,
      })
      const system = withLocale(
        `You are Raah, the voice layer of RAASTA. Help people in Kashmir and rural India with government schemes, farming, documents, jobs, and education (Taleem). Be concise. No long bullet lists unless asked.`,
        locale,
      )
      const aiText = await aiChat(system, body.question)
      const text =
        aiText ??
        fallbackRaahAnswer(body.question, locale)
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'demo',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    if (body.mode === 'taleem' && typeof body.pillar === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'taleem',
        locale,
        input: body.message ?? body.ocrText ?? '',
        pillar: body.pillar,
        sub: body.sub,
      })
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
        if (requestId) {
          await completeLifecycleRequest(requestId, fallback, 'demo')
        }
        return NextResponse.json({
          ok: true,
          text: fallback,
          demo: true,
          usedModel: false,
          requestId,
        })
      }
      const system = withLocale(prompts.system, locale)
      const aiText = await aiChat(system, prompts.user)
      const text = aiText ?? fallback
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'demo',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid payload', demo: false },
      { status: 400 },
    )
  } catch (error) {
    if (requestId) {
      await failLifecycleRequest(
        requestId,
        error instanceof Error ? error.message : 'LLM route failed',
      )
    }
    return NextResponse.json(
      { ok: false, error: 'Bad request', demo: true, requestId },
      { status: 400 },
    )
  }
}
