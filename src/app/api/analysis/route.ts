import { NextRequest, NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'

export const runtime = 'nodejs'

/** GET /api/analysis?deviceId=... — recent exam attempts with AI feedback */
export async function GET(req: NextRequest) {
  const convex = getConvexHttp()
  if (!convex) {
    return NextResponse.json(
      { ok: false, error: 'Database not configured', data: { attempts: [] } },
      { status: 503 },
    )
  }

  const deviceId = req.nextUrl.searchParams.get('deviceId')?.trim()
  if (!deviceId) {
    return NextResponse.json(
      { ok: false, error: 'deviceId query parameter is required' },
      { status: 400 },
    )
  }

  const attempts = await convex.query(api.examPrep.listExamAttempts, {
    deviceId,
    limit: 15,
  })

  return NextResponse.json({
    ok: true,
    data: {
      attempts: attempts.map((a) => ({
        testPublicId: a.testPublicId,
        scorePercent: a.scorePercent,
        correctCount: a.correctCount,
        totalCount: a.totalCount,
        weakTopics: a.weakTopics,
        analysisSummary: a.analysisSummary,
        revisionSuggestions: a.revisionSuggestions,
        createdAt: a.createdAt,
      })),
    },
  })
}
