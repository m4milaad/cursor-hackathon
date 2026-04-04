import { NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { generateSyntheticMcqs } from '@/lib/examPrep/examAi'
import { hashQuestionContent, makeExamKey } from '@/lib/examPrep/hash'

export const runtime = 'nodejs'
export const maxDuration = 90

/**
 * POST /api/exam-prep/revision-quiz — focused mini-test on weak topics (AI-generated from pool patterns).
 */
type Body = {
  examName: string
  subject: string
  topic?: string
  weakTopics: string[]
  questionCount?: number
  deviceId?: string
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
  const weak = (body.weakTopics ?? []).map((s) => s.trim()).filter(Boolean)
  const n = Math.min(Math.max(body.questionCount ?? 5, 2), 15)

  if (examName.length < 2 || subject.length < 2 || weak.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: 'examName, subject, and weakTopics[] are required',
      },
      { status: 400 },
    )
  }

  const examKey = makeExamKey(examName, subject, topic)
  const rows = await convex.query(api.examPrep.listQuestionsByExam, { examKey })
  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'No question pool for this exam. Scrape first.' },
      { status: 400 },
    )
  }

  const samples = rows
    .filter((r) => weak.some((w) => r.topic.toLowerCase().includes(w.toLowerCase())))
    .slice(0, 6)
  const base = samples.length >= 2 ? samples : rows.slice(0, 6)

  const synth = await generateSyntheticMcqs({
    examName,
    subject,
    topic: weak.join(', '),
    count: n,
    samples: base.map((r) => ({
      question: r.question,
      options: r.options,
      correctIndex: r.correctIndex,
      topic: r.topic,
    })),
  })

  if (synth.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Could not generate revision questions.' },
      { status: 503 },
    )
  }

  const now = Date.now()
  const payload = synth.map((q) => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    contentHash: hashQuestionContent(q.question, q.options),
    tags: ['important'] as string[],
    difficulty: 'medium' as const,
    source: 'ai_revision',
    scrapedAt: now,
    topic: q.topic,
  }))

  await convex.mutation(api.examPrep.upsertQuestions, {
    examKey,
    examName,
    subject,
    topic,
    questions: payload,
  })

  return NextResponse.json({
    ok: true,
    data: {
      questions: synth.map((q, i) => ({
        index: i,
        question: q.question,
        options: q.options,
        topic: q.topic,
      })),
      note: 'Revision set is AI-generated from your weak topics and exam patterns — verify critical facts.',
    },
  })
}
