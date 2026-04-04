import { NextRequest, NextResponse } from 'next/server'
import { filterJobs, upsertJobs, getJobCount, type StoredJob } from '@/lib/jobs/jobStore'
import { runJobScrape } from '@/lib/jobs/scrapeEngine'

export const runtime = 'nodejs'
export const maxDuration = 60

type LiveJob = {
  title: string
  org: string
  location: string
  match: number
  url: string
  skills: string
  source: string
}

function toLiveJob(row: StoredJob): LiveJob {
  return {
    title: row.title,
    org: row.company,
    location: row.location,
    match: 0,
    url: row.applyLink,
    skills: row.skillsRequired.join(', '),
    source: row.source,
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const locationScope = searchParams.get('location') ?? 'india'
  const jobType = searchParams.get('job_type') ?? 'any'
  const workType = searchParams.get('work_type') ?? 'any'
  const skillsParam = searchParams.get('skills')
  const skillFilters = skillsParam
    ? skillsParam.split(',').map(s => s.trim()).filter(Boolean)
    : undefined
  const live = searchParams.get('live') === '1'

  // Auto-scrape if empty
  let scrapeErrors: string[] | undefined
  const count = getJobCount()
  if ((count === 0 || live) && process.env.FIRECRAWL_API_KEY) {
    try {
      const { jobs: scraped, errors } = await runJobScrape()
      scrapeErrors = errors
      if (scraped.length > 0) upsertJobs(scraped)
    } catch (e) {
      scrapeErrors = [e instanceof Error ? e.message : String(e)]
    }
  }

  const rows = filterJobs({ locationScope, jobType, workType, skillFilters, limit: 100 })

  return NextResponse.json({
    ok: true,
    data: { jobs: rows.map(toLiveJob), scrapeErrors },
    source: rows.length ? 'live' : 'empty',
  })
}
