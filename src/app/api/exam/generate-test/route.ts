import { NextResponse } from 'next/server'
import {
  getQuestions,
  upsertQuestions,
  getQuestionCount,
  saveTest,
  type TestPaper,
} from '@/lib/examPrep/examStore'
import { scrapeExamCorpus, extractQuestionsFromScrape } from '@/lib/examPrep/scrapeQuestions'
import { tagMcqsBatch, generateSyntheticMcqs } from '@/lib/examPrep/examAi'

export const runtime = 'nodejs'
export const maxDuration = 120

type Body = {
  exam: string
  subject: string
  topic?: string
  count?: number
  mode?: 'full' | 'important' | 'repeated'
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'mixed'
  durationMinutes?: number
}

const EXAM_DURATIONS: Record<string, number> = {
  'NEET': 200,
  'JEE Main': 180,
  'JEE Advanced': 180,
  'UPSC Prelims': 120,
  'JKSSB': 90,
  'Class 10': 60,
  'Class 12': 60,
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const exam = body.exam?.trim()
  const subject = body.subject?.trim()
  if (!exam || !subject) {
    return NextResponse.json({ ok: false, error: 'exam and subject are required' }, { status: 400 })
  }

  const topic = body.topic?.trim() || ''
  const count = Math.min(body.count ?? 20, 50)
  const mode = body.mode ?? 'full'
  const difficulty = body.difficulty ?? 'mixed'
  const defaultDuration = EXAM_DURATIONS[exam] ?? Math.ceil(count * 2)
  const durationMinutes = body.durationMinutes ?? defaultDuration

  // 1. Check existing questions
  let existingCount = getQuestionCount(exam)
  const errors: string[] = []

  // 2. If not enough questions, scrape + extract
  if (existingCount < count) {
    try {
      const { corpusChunks, errors: scrapeErrors } = await scrapeExamCorpus({
        examName: exam,
        subject,
        topic,
      })
      errors.push(...scrapeErrors)

      if (corpusChunks.length > 0) {
        const extracted = await extractQuestionsFromScrape(corpusChunks, topic || subject)
        if (extracted.length > 0) {
          // Tag the questions
          const tags = await tagMcqsBatch(
            extracted.map(q => ({ question: q.question, topic: q.topic }))
          )
          const tagged = extracted.map((q, i) => ({
            ...q,
            tags: tags[i]?.tags ?? [],
            difficulty: tags[i]?.difficulty ?? ('medium' as const),
          }))
          upsertQuestions(tagged, exam, subject, 'scraped')
        }
      }
    } catch (e) {
      errors.push(`scrape: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  existingCount = getQuestionCount(exam)

  // 3. If still not enough, generate synthetic questions
  if (existingCount < count) {
    try {
      const existing = getQuestions({ exam, subject, limit: 6 })
      const synthetic = await generateSyntheticMcqs({
        examName: exam,
        subject,
        topic: topic || subject,
        count: Math.max(count - existingCount, 10),
        samples: existing,
      })
      if (synthetic.length > 0) {
        const tags = await tagMcqsBatch(
          synthetic.map(q => ({ question: q.question, topic: q.topic }))
        )
        const tagged = synthetic.map((q, i) => ({
          ...q,
          tags: tags[i]?.tags ?? [],
          difficulty: tags[i]?.difficulty ?? ('medium' as const),
        }))
        upsertQuestions(tagged, exam, subject, 'ai-generated')
      }
    } catch (e) {
      errors.push(`synth: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 4. Pick questions for the test
  const pool = getQuestions({
    exam,
    subject,
    topic: topic || undefined,
    mode,
    difficulty,
    limit: count,
  })

  if (pool.length === 0) {
    return NextResponse.json({
      ok: false,
      error: 'No questions available. Ensure FIRECRAWL_API_KEY and OPENROUTER_API_KEY are set.',
      errors,
    }, { status: 503 })
  }

  // 5. Create test paper
  const testId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const test: TestPaper = {
    id: testId,
    exam,
    subject,
    topic,
    mode,
    difficulty,
    questions: pool,
    durationMinutes,
    createdAt: Date.now(),
  }

  saveTest(test)

  // Return test without answers for the client
  const clientQuestions = test.questions.map((q, i) => ({
    index: i,
    question: q.question,
    options: q.options,
    topic: q.topic,
    difficulty: q.difficulty,
    tags: q.tags,
  }))

  return NextResponse.json({
    ok: true,
    data: {
      testId,
      exam,
      subject,
      topic,
      mode,
      difficulty,
      questions: clientQuestions,
      totalQuestions: clientQuestions.length,
      durationMinutes,
      questionsInStore: getQuestionCount(exam),
    },
    errors: errors.length > 0 ? errors : undefined,
  })
}
