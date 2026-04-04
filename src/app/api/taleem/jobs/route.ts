import { NextRequest, NextResponse } from 'next/server'
import { serveJobsList, type LiveJob } from '@/lib/jobs/serveJobs'

export type { LiveJob }

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Taleem-compatible job listing. All rows come from the job store (scraped data).
 * Query: location=kashmir|india|global|near_me, job_type, work_type, skills, lat, lng, live=1
 */
export async function GET(req: NextRequest) {
  const result = await serveJobsList(new URL(req.url))

  if (result.source === 'error') {
    return NextResponse.json({
      ok: false,
      jobs: [] as LiveJob[],
      source: 'error',
      live: false,
      error: result.error,
    })
  }

  return NextResponse.json({
    ok: true,
    jobs: result.jobs,
    source: result.source,
    live: result.source === 'live' || result.source === 'cache',
  })
}
