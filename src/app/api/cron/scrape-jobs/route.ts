import { NextRequest, NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { runJobScrape, toConvexRows } from '@/lib/jobs/scrapeEngine'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * Scheduled job ingestion. Protect with CRON_SECRET (Vercel Cron sends Authorization header).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  const okSecret =
    secret &&
    auth === `Bearer ${secret}`
  if (!okSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const convex = getConvexHttp()
  if (!convex) {
    return NextResponse.json(
      { ok: false, error: 'NEXT_PUBLIC_CONVEX_URL missing' },
      { status: 503 },
    )
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { ok: false, error: 'FIRECRAWL_API_KEY missing' },
      { status: 503 },
    )
  }

  const { jobs, sourcesUsed, errors } = await runJobScrape()
  if (jobs.length === 0) {
    return NextResponse.json({
      ok: true,
      data: { inserted: 0, updated: 0, sourcesUsed, errors },
      source: 'live' as const,
    })
  }

  const result = await convex.mutation(api.jobs.upsertJobs, {
    jobs: toConvexRows(jobs, Date.now()),
  })

  return NextResponse.json({
    ok: true,
    data: {
      ...result,
      jobCount: jobs.length,
      sourcesUsed,
      errors,
    },
    source: 'live' as const,
  })
}
