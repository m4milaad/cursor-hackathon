import { NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { generateSyntheticMcqs } from '@/lib/examPrep/examAi'
import { hashQuestionContent, makeExamKey } from '@/lib/examPrep/hash'
import {
  filterPool,
  pickMixedDifficulty,
  shuffle,
  type ExamQuestionDoc,
} from '@/lib/examPrep/pickQuestions'

export const runtime = 'nodejs'
export const maxDuration = 120

type Body = {
  examName: string
  subject: string
  topic?: string
  questionCount?: number
  durationMinutes?: number
  mode?: 'full' | 'important' | 'repeated'
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'mixed'
}

function newTestId(): string {
  const bytes = new Uint8Array(12)
  globalThis.crypto.getRandomValues(bytes)
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `et_${hex}`
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
  const n = Math.min(Math.max(body.questionCount ?? 10, 3), 50)
  const durationMinutes = Math.min(Math.max(body.durationMinutes ?? 60, 5), 240)
  const mode = body.mode ?? 'full'
  const difficulty = body.difficulty ?? 'mixed'

  if (examName.length < 2 || subject.length < 2) {
    return NextResponse.json(
      { ok: false, error: 'examName and subject are required' },
      { status: 400 },
    )
  }

  const examKey = makeExamKey(examName, subject, topic)
  const rows = await convex.query(api.examPrep.listQuestionsByExam, { examKey })

  if (rows.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'No questions for this exam yet. Run POST /api/scrape-questions first.',
      },
      { status: 400 },
    )
  }

  let pool = filterPool(rows, mode, difficulty)
  if (pool.length === 0) {
    pool = [...rows]
  }

  let picked: ExamQuestionDoc[]
  if (difficulty === 'mixed') {
    picked = pickMixedDifficulty(pool, n)
  } else {
    picked = shuffle(pool).slice(0, n)
  }

  const need = n - picked.length

  if (need > 0) {
    const samples = rows.slice(0, 8).map((r) => ({
      question: r.question,
      options: r.options,
      correctIndex: r.correctIndex,
      topic: r.topic,
    }))
    const synth = await generateSyntheticMcqs({
      examName,
      subject,
      topic,
      count: need,
      samples,
    })
    if (synth.length > 0) {
      const now = Date.now()
      const tagged = synth.map((q) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        contentHash: hashQuestionContent(q.question, q.options),
        tags: ['important'] as string[],
        difficulty: 'medium' as const,
        source: 'ai_pattern',
        scrapedAt: now,
        topic: q.topic,
      }))
      const up = await convex.mutation(api.examPrep.upsertQuestions, {
        examKey,
        examName,
        subject,
        topic,
        questions: tagged,
      })
      const newIds = up.insertedIds ?? []
      const newDocs = await convex.query(api.examPrep.getQuestionsByIds, {
        ids: newIds,
      })
      picked = [...picked, ...newDocs].slice(0, n)
    }
  }

  picked = picked.slice(0, n)
  if (picked.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Could not assemble a test paper.' },
      { status: 400 },
    )
  }

  const publicTestId = newTestId()
  const questionIds = picked.map((p) => p._id)

  await convex.mutation(api.examPrep.createExamTest, {
    publicTestId,
    examKey,
    examName,
    subject,
    mode,
    durationSeconds: durationMinutes * 60,
    questionIds,
    sectionsJson: JSON.stringify([
      { title: 'Section A — Multiple choice', questionIndices: picked.map((_, i) => i) },
    ]),
  })

  const clientQuestions = picked.map((q) => ({
    id: q._id,
    question: q.question,
    options: q.options,
    topic: q.topic,
  }))

  return NextResponse.json({
    ok: true,
    data: {
      testId: publicTestId,
      examKey,
      durationSeconds: durationMinutes * 60,
      mode,
      questions: clientQuestions,
    },
  })
}
