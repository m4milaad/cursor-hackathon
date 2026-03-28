import { NextResponse } from 'next/server'
import {
  DEMO_PM_KISAN,
  DEMO_SAMJHO_EXPLANATION,
  DEMO_ZAMEEN_RESULT,
} from '@/lib/demoCopy'
import { taleemDemoFallback, taleemPrompts } from '@/lib/taleem-server'

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

async function openaiChat(
  system: string,
  user: string,
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
    }),
  })
  if (!res.ok) {
    console.error('OpenAI chat error', await res.text())
    return null
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content?.trim() ?? null
}

function fallbackRaah(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('pm kisan') || q.includes('kisan') || q.includes('yojana')) {
    return DEMO_PM_KISAN
  }
  if (q.includes('seb') || q.includes('apple') || q.includes('fasal')) {
    return `Is mausam mein seb ke liye spray aur nami par nazar rakhein. Zameen mode se pattiyon ki tasveer bhej kar beemaari jaanch sakte hain.`
  }
  if (q.includes('kagaz') || q.includes('notice') || q.includes('document')) {
    return `Samjho mode mein kagaz ki tasveer lein — hum aapko seedhe alfaz mein samjha denge.`
  }
  return `Main RAASTA hoon. Aap Samjho se kagaz, Zameen se fasal, Taleem se naukri / CV / exam / scholarship, aur mujhse seedhe sawaal Urdu, Hindi ya Kashmiri (Roman) mein poochh sakte hain.`
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
    }

    if (body.mode === 'samjho' && typeof body.ocrText === 'string') {
      const system = `You are Samjho, powered by HAQQ. Explain government or legal documents in simple spoken language for people with low literacy. Use Roman Urdu by default; use Kashmiri (Latin script) phrases only when the document or user context clearly fits Kashmir. Short paragraphs, warm and clear. Include deadlines and next steps.`
      const user = `Document text:\n${body.ocrText}\n\nExplain what this means and what the reader should do.`
      const text = (await openaiChat(system, user)) ?? DEMO_SAMJHO_EXPLANATION
      return NextResponse.json({
        text,
        usedModel: Boolean(process.env.OPENAI_API_KEY),
      })
    }

    if (body.mode === 'zameen' && typeof body.visionSummary === 'string') {
      const mandi =
        typeof body.mandiHint === 'string' ? body.mandiHint : ''
      const system = `You are Zameen, powered by WADI. Give practical crop and disease advice in Roman Urdu or Kashmiri (Latin script) as fits the user. Mention treatment timing and mandi (market) price when data is provided. Keep it voice-friendly.`
      const user = `Vision summary: ${body.visionSummary}\nMarket note: ${mandi}`
      const text = (await openaiChat(system, user)) ?? DEMO_ZAMEEN_RESULT
      return NextResponse.json({
        text,
        usedModel: Boolean(process.env.OPENAI_API_KEY),
      })
    }

    if (body.mode === 'raah' && typeof body.question === 'string') {
      const system = `You are Raah, the voice layer of RAASTA. Help rural people in Kashmir and India with government schemes, farming, documents, jobs, and education (Taleem). Answer in concise Roman Urdu / Hindi / Kashmiri (Latin) mix as appropriate for text-to-speech. No long bullet lists unless asked.`
      const text =
        (await openaiChat(system, body.question)) ??
        fallbackRaah(body.question)
      return NextResponse.json({
        text,
        usedModel: Boolean(process.env.OPENAI_API_KEY),
      })
    }

    if (body.mode === 'taleem' && typeof body.pillar === 'string') {
      const prompts = taleemPrompts({
        pillar: body.pillar,
        sub: body.sub,
        message: body.message,
        ocrText: body.ocrText,
      })
      const fallback = taleemDemoFallback({
        pillar: body.pillar,
        sub: body.sub,
        message: body.message,
        ocrText: body.ocrText,
      })
      if (!prompts) {
        return NextResponse.json({ text: fallback, usedModel: false })
      }
      const text = (await openaiChat(prompts.system, prompts.user)) ?? fallback
      return NextResponse.json({
        text,
        usedModel: Boolean(process.env.OPENAI_API_KEY),
      })
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
