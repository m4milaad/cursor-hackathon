import { NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { tagMcqsBatch } from '@/lib/examPrep/examAi'
import { hashQuestionContent, makeExamKey } from '@/lib/examPrep/hash'
import {
  extractQuestionsFromScrape,
  scrapeExamCorpus,
} from '@/lib/examPrep/scrapeQuestions'

export const runtime = 'nodejs'
export const maxDuration = 300

type Body = {
  examName: string
  subject: string
  topic?: string
}

export async function POST(req: Request) {
  const convex = getConvexHttp()
  if (!convex) {
    return NextResponse.json(
      { ok: false, error: 'Database not configured' },
      { status: 503 },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const examName = body.examName?.trim() || ''
  const subject = body.subject?.trim() || ''
  const topic = (body.topic ?? '').trim() || 'general'
  if (examName.length < 2 || subject.length < 2) {
    return NextResponse.json(
      { ok: false, error: 'examName and subject are required' },
      { status: 400 },
    )
  }

  const examKey = makeExamKey(examName, subject, topic)
  const { corpusChunks, errors } = await scrapeExamCorpus({
    examName,
    subject,
    topic,
  })

  const extracted = await extractQuestionsFromScrape(corpusChunks, topic)
  if (extracted.length === 0) {
    return NextResponse.json({
      ok: true,
      data: {
        examKey,
        inserted: 0,
        corpusErrors: errors,
        message:
          'No questions extracted. Try a different topic or ensure FIRECRAWL_API_KEY and AI keys are set.',
      },
    })
  }

  const tagMeta = await tagMcqsBatch(
    extracted.map((e) => ({ question: e.question, topic: e.topic })),
  )

  const now = Date.now()
  const payload = extracted.map((e, i) => {
    const t = tagMeta[i] ?? { tags: [] as string[], difficulty: 'medium' as const }
    const opts = e.options.length >= 4 ? e.options.slice(0, 4) : e.options
    const ci = Math.min(e.correctIndex, opts.length - 1)
    return {
      question: e.question,
      options: opts,
      correctIndex: ci,
      contentHash: hashQuestionContent(e.question, opts),
      tags: t.tags,
      difficulty: t.difficulty,
      source: 'scrape_ai',
      scrapedAt: now,
      topic: e.topic,
    }
  })

  const result = await convex.mutation(api.examPrep.upsertQuestions, {
    examKey,
    examName,
    subject,
    topic,
    questions: payload,
  })

  return NextResponse.json({
    ok: true,
    data: {
      examKey,
      inserted: result.inserted,
      totalForExam: result.totalForExam,
      corpusErrors: errors,
    },
  })
}
