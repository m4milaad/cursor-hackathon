import { NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { analyzeAttempt } from '@/lib/examPrep/examAi'
export const runtime = 'nodejs'
export const maxDuration = 60

type Answer = {
  questionId: string
  selectedIndex: number
}

type Body = {
  testPublicId: string
  deviceId: string
  answers: Answer[]
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

  const testPublicId = body.testPublicId?.trim()
  const deviceId = body.deviceId?.trim()
  if (!testPublicId || !deviceId || !Array.isArray(body.answers)) {
    return NextResponse.json(
      { ok: false, error: 'testPublicId, deviceId, and answers[] are required' },
      { status: 400 },
    )
  }

  const test = await convex.query(api.examPrep.getTestByPublicId, {
    publicTestId: testPublicId,
  })
  if (!test) {
    return NextResponse.json({ ok: false, error: 'Test not found' }, { status: 404 })
  }

  const questions = await convex.query(api.examPrep.getQuestionsByIds, {
    ids: test.questionIds,
  })
  const map = new Map(
    questions.map((q) => [q._id as string, q]),
  )

  let correct = 0
  const wrongTopics: string[] = []
  const correctTopics: string[] = []

  for (const a of body.answers) {
    const q = map.get(a.questionId)
    if (!q) continue
    if (Number(a.selectedIndex) === q.correctIndex) {
      correct++
      correctTopics.push(q.topic)
    } else {
      wrongTopics.push(q.topic)
    }
  }

  const total = test.questionIds.length
  const scorePercent = total > 0 ? (correct / total) * 100 : 0
  const analysis = await analyzeAttempt({
    wrongTopics,
    correctTopics,
    scorePercent,
  })

  await convex.mutation(api.examPrep.recordExamAttempt, {
    deviceId,
    testPublicId,
    answersJson: JSON.stringify(body.answers),
    scorePercent,
    correctCount: correct,
    totalCount: total,
    weakTopics: analysis.weakTopics,
    analysisSummary: analysis.summary,
    revisionSuggestions: analysis.revision,
  })

  return NextResponse.json({
    ok: true,
    data: {
      scorePercent: Math.round(scorePercent * 10) / 10,
      correctCount: correct,
      totalCount: total,
      weakTopics: analysis.weakTopics,
      summary: analysis.summary,
      revisionSuggestions: analysis.revision,
    },
  })
}
