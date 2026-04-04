import { NextRequest, NextResponse } from 'next/server'
import { filterJobs, upsertJobs, getJobCount, type StoredJob } from '@/lib/jobs/jobStore'
import { runJobScrape } from '@/lib/jobs/scrapeEngine'

export type LiveJob = {
  id: string
  title: string
  org: string
  location: string
  match: number
  url: string
  skills: string
  source: string
  jobType: string
  workType: string
  description: string
}

export const runtime = 'nodejs'
export const maxDuration = 120

function toLiveJob(row: StoredJob): LiveJob {
  return {
    id: row.id,
    title: row.title,
    org: row.company,
    location: row.location,
    match: 0,
    url: row.applyLink,
    skills: row.skillsRequired.join(', '),
    source: row.source,
    jobType: row.jobType,
    workType: row.workType,
    description: row.description.slice(0, 300),
  }
}

/**
 * Taleem job listing. Works with local store (no Convex required).
 * Query: location=kashmir|india|global, job_type, work_type, skills, live=1
 */
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

  // If DB is empty and live flag is set, trigger scraping
  const count = getJobCount()
  let scrapeErrors: string[] | undefined

  if ((count === 0 || live) && process.env.FIRECRAWL_API_KEY) {
    try {
      const { jobs: scraped, errors, sourcesUsed } = await runJobScrape()
      scrapeErrors = errors
      if (scraped.length > 0) {
        upsertJobs(scraped)
      }
    } catch (e) {
      scrapeErrors = [e instanceof Error ? e.message : String(e)]
    }
  }

  const rows = filterJobs({
    locationScope,
    jobType,
    workType,
    skillFilters,
    limit: 100,
  })

  return NextResponse.json({
    ok: true,
    jobs: rows.map(toLiveJob),
    source: rows.length ? 'live' : 'empty',
    live: true,
    totalInStore: getJobCount(),
    scrapeErrors,
  })
}
