import { NextRequest, NextResponse } from 'next/server'
import { upsertJobs, getJobCount } from '@/lib/jobs/jobStore'
import { runJobScrape } from '@/lib/jobs/scrapeEngine'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * Scheduled job ingestion. Works with local store (no Convex required).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  const okSecret = secret && auth === `Bearer ${secret}`
  if (!okSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
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
      data: { inserted: 0, updated: 0, sourcesUsed, errors, totalInStore: getJobCount() },
      source: 'live' as const,
    })
  }

  const result = upsertJobs(jobs)

  return NextResponse.json({
    ok: true,
    data: {
      ...result,
      jobCount: jobs.length,
      sourcesUsed,
      errors,
      totalInStore: getJobCount(),
    },
    source: 'live' as const,
  })
}
