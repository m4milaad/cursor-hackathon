import { NextResponse } from 'next/server'
import { filterJobs, getUserProfile, upsertJobs, getJobCount } from '@/lib/jobs/jobStore'
import { matchJobsWithAi } from '@/lib/jobs/jobAi'
import { runJobScrape } from '@/lib/jobs/scrapeEngine'

export const runtime = 'nodejs'
export const maxDuration = 120

type Body = {
  deviceId?: string
  skills?: string[]
  location?: 'kashmir' | 'india' | 'global' | 'near_me'
  job_type?: 'any' | 'remote' | 'onsite' | 'hybrid'
  work_type?: 'any' | 'full_time' | 'part_time' | 'internship' | 'freelance'
  limit?: number
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON', source: 'error' as const },
      { status: 400 },
    )
  }

  const deviceId = body.deviceId?.trim()
  let skills = body.skills ?? []

  // Merge skills from profile
  if (deviceId) {
    const profile = getUserProfile(deviceId)
    if (profile?.skills?.length) {
      skills = [...new Set([...skills, ...profile.skills])]
    }
  }

  const locationScope = body.location ?? 'india'
  const jobType = body.job_type ?? 'any'
  const workType = body.work_type ?? 'any'

  // Auto-scrape if no jobs in store
  if (getJobCount() === 0 && process.env.FIRECRAWL_API_KEY) {
    try {
      const { jobs: scraped } = await runJobScrape()
      if (scraped.length > 0) upsertJobs(scraped)
    } catch { /* ignore */ }
  }

  // Get a pool of jobs for AI matching (no skill filter — let AI score)
  const jobRows = filterJobs({
    locationScope,
    jobType,
    workType,
    limit: 45,
  })

  if (jobRows.length === 0) {
    return NextResponse.json({
      ok: true,
      data: { matches: [] },
      source: 'empty' as const,
      message: 'No jobs in store. Ensure FIRECRAWL_API_KEY is set and scraping has run.',
    })
  }

  const pool = jobRows.map(j => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    description: j.description,
    skillsRequired: j.skillsRequired,
    applyLink: j.applyLink,
  }))

  const userSkills =
    skills.length > 0
      ? skills
      : ['General professional', 'Open to learning', 'Communication']

  const resumeSnippet = deviceId ? getUserProfile(deviceId)?.resumeData?.rawExcerpt : undefined

  let matches: Awaited<ReturnType<typeof matchJobsWithAi>>
  try {
    matches = await matchJobsWithAi(userSkills, resumeSnippet, pool)
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : 'AI matching failed',
        data: { matches: [] },
        source: 'error' as const,
      },
      { status: 502 },
    )
  }

  if (pool.length > 0 && matches.length === 0) {
    return NextResponse.json({
      ok: false,
      error: 'AI matching returned no results. Set OPENROUTER_API_KEY or GEMINI_API_KEY.',
      data: { matches: [], jobIdsConsidered: pool.map(p => p.id) },
      source: 'error' as const,
    }, { status: 503 })
  }

  const max = Math.min(body.limit ?? 15, 30)
  const top = matches.slice(0, max)

  return NextResponse.json({
    ok: true,
    data: {
      matches: top,
      jobIdsConsidered: pool.map(p => p.id),
    },
    source: 'ai-only' as const,
  })
}
