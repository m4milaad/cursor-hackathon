import { NextResponse } from 'next/server'
import { getTest, saveAttempt, type UserAttempt } from '@/lib/examPrep/examStore'
import { analyzeAttempt } from '@/lib/examPrep/examAi'

export const runtime = 'nodejs'
export const maxDuration = 60

type Body = {
  testId: string
  deviceId: string
  answers: (number | null)[]
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { testId, deviceId, answers } = body
  if (!testId || !deviceId || !Array.isArray(answers)) {
    return NextResponse.json({ ok: false, error: 'testId, deviceId, answers required' }, { status: 400 })
  }

  const test = getTest(testId)
  if (!test) {
    return NextResponse.json({ ok: false, error: 'Test not found' }, { status: 404 })
  }

  // Grade
  let score = 0
  const wrongTopics: string[] = []
  const correctTopics: string[] = []
  const results: { correct: boolean; yourAnswer: number | null; correctAnswer: number }[] = []

  for (let i = 0; i < test.questions.length; i++) {
    const q = test.questions[i]
    const userAns = answers[i] ?? null
    const isCorrect = userAns === q.correctIndex

    results.push({
      correct: isCorrect,
      yourAnswer: userAns,
      correctAnswer: q.correctIndex,
    })

    if (isCorrect) {
      score++
      if (!correctTopics.includes(q.topic)) correctTopics.push(q.topic)
    } else {
      if (!wrongTopics.includes(q.topic)) wrongTopics.push(q.topic)
    }
  }

  const total = test.questions.length
  const scorePercent = total > 0 ? (score / total) * 100 : 0

  // AI analysis
  let analysis: UserAttempt['analysis']
  try {
    analysis = await analyzeAttempt({ wrongTopics, correctTopics, scorePercent })
  } catch {
    analysis = {
      weakTopics: wrongTopics,
      summary: `You scored ${score}/${total} (${scorePercent.toFixed(0)}%).`,
      revision: ['Review the topics you got wrong.'],
    }
  }

  // Save attempt
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const attempt: UserAttempt = {
    id: attemptId,
    testId,
    deviceId,
    answers,
    score,
    total,
    wrongTopics,
    correctTopics,
    submittedAt: Date.now(),
    analysis,
  }
  saveAttempt(attempt)

  // Build detailed results with correct answers revealed
  const detailed = test.questions.map((q, i) => ({
    index: i,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    yourAnswer: answers[i] ?? null,
    correct: results[i].correct,
    topic: q.topic,
    difficulty: q.difficulty,
    tags: q.tags,
  }))

  return NextResponse.json({
    ok: true,
    data: {
      attemptId,
      score,
      total,
      scorePercent: Math.round(scorePercent),
      results: detailed,
      analysis,
    },
  })
}
