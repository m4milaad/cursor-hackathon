import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { reverseGeocodeKeywords } from '@/lib/jobs/geocode'
import { runJobScrape, toConvexRows } from '@/lib/jobs/scrapeEngine'
import type { JobLocationScope } from '@/lib/jobs/types'

/** Legacy card shape used by Taleem hub */
export type LiveJob = {
  title: string
  org: string
  location: string
  match: number
  url: string
  skills: string
  source: string
}

function toLiveJob(row: {
  title: string
  company: string
  location: string
  applyLink: string
  skillsRequired: string[]
  source: string
}): LiveJob {
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

function parseScope(s: string | null): JobLocationScope {
  if (s === 'india' || s === 'global' || s === 'near_me' || s === 'kashmir') return s
  return 'kashmir'
}

export async function serveJobsList(url: URL): Promise<{
  ok: boolean
  jobs: LiveJob[]
  source: 'cache' | 'empty' | 'live' | 'error'
  scrapeErrors?: string[]
  error?: string
}> {
  const convex = getConvexHttp()
  if (!convex) {
    return { ok: false, jobs: [], source: 'error', error: 'Database not configured' }
  }

  const { searchParams } = url
  const locationScope = parseScope(searchParams.get('location'))
  const jobType = (searchParams.get('job_type') ?? 'any') as
    | 'any'
    | 'remote'
    | 'onsite'
    | 'hybrid'
  const workType = (searchParams.get('work_type') ?? 'any') as
    | 'any'
    | 'full_time'
    | 'part_time'
    | 'internship'
    | 'freelance'
  const skillsParam = searchParams.get('skills')
  const skillFilters = skillsParam
    ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const live = searchParams.get('live') === '1'

  let nearKeywords: string[] | undefined
  if (locationScope === 'near_me' && lat && lng) {
    const la = Number(lat)
    const ln = Number(lng)
    if (!Number.isNaN(la) && !Number.isNaN(ln)) {
      nearKeywords = await reverseGeocodeKeywords(la, ln)
    }
  }

  let rows = await convex.query(api.jobs.listJobs, {
    locationScope,
    jobType,
    workType,
    skillFilters,
    nearKeywords,
    limit: 100,
  })

  let scrapeErrors: string[] | undefined

  if (rows.length === 0 && live && process.env.FIRECRAWL_API_KEY) {
    const { jobs: scraped, errors } = await runJobScrape()
    scrapeErrors = errors
    if (scraped.length > 0) {
      await convex.mutation(api.jobs.upsertJobs, {
        jobs: toConvexRows(scraped, Date.now()),
      })
      rows = await convex.query(api.jobs.listJobs, {
        locationScope,
        jobType,
        workType,
        skillFilters,
        nearKeywords,
        limit: 100,
      })
    }
    return {
      ok: true,
      jobs: rows.map(toLiveJob),
      source: rows.length ? 'live' : 'empty',
      scrapeErrors,
    }
  }

  return {
    ok: true,
    jobs: rows.map(toLiveJob),
    source: rows.length ? 'cache' : 'empty',
    scrapeErrors,
  }
}
