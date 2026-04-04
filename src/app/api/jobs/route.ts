import { NextRequest, NextResponse } from 'next/server'
import { serveJobsList } from '@/lib/jobs/serveJobs'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const result = await serveJobsList(new URL(req.url))

  if (result.source === 'error') {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        data: { jobs: [] },
        source: 'error' as const,
      },
      { status: 503 },
    )
  }

  return NextResponse.json({
    ok: true,
    data: { jobs: result.jobs, scrapeErrors: result.scrapeErrors },
    source: result.source,
  })
}
