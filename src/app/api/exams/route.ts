import { NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'

export const runtime = 'nodejs'

/** GET /api/exams — exams that have at least one ingested question row */
export async function GET() {
  const convex = getConvexHttp()
  if (!convex) {
    return NextResponse.json(
      { ok: false, error: 'Database not configured', data: { exams: [] } },
      { status: 503 },
    )
  }

  const rows = await convex.query(api.examPrep.listCatalog, { limit: 100 })
  return NextResponse.json({
    ok: true,
    data: {
      exams: rows.map((r) => ({
        examKey: r.examKey,
        examName: r.examName,
        subject: r.subject,
        topic: r.topic,
        questionCount: r.questionCount,
        updatedAt: r.updatedAt,
      })),
    },
  })
}
