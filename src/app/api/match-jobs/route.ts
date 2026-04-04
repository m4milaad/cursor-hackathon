import { NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { matchJobsWithAi } from '@/lib/jobs/jobAi'

export const runtime = 'nodejs'
export const maxDuration = 120

type Body = {
  deviceId?: string
  skills?: string[]
  location?: 'kashmir' | 'india' | 'global' | 'near_me'
  job_type?: 'any' | 'remote' | 'onsite' | 'hybrid'
  work_type?:
    | 'any'
    | 'full_time'
    | 'part_time'
    | 'internship'
    | 'freelance'
  lat?: number
  lng?: number
  limit?: number
}

export async function POST(req: Request) {
  const convex = getConvexHttp()
  if (!convex) {
    return NextResponse.json(
      { ok: false, error: 'Database not configured', source: 'error' as const },
      { status: 503 },
    )
  }

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
  let resumeSnippet: string | undefined

  if (deviceId) {
    const profile = await convex.query(api.jobs.getUserJobProfile, {
      deviceId,
    })
    if (profile?.skills?.length) {
      skills = [...new Set([...skills, ...profile.skills])]
    }
    resumeSnippet = profile?.resumeData?.rawExcerpt
  }

  const locationScope = body.location ?? 'india'
  const jobType = body.job_type ?? 'any'
  const workType = body.work_type ?? 'any'
  const limitPool = 45

  let nearKeywords: string[] | undefined
  if (
    locationScope === 'near_me' &&
    typeof body.lat === 'number' &&
    typeof body.lng === 'number'
  ) {
    const { reverseGeocodeKeywords } = await import('@/lib/jobs/geocode')
    nearKeywords = await reverseGeocodeKeywords(body.lat, body.lng)
  }

  /** Pool for AI matching: location / type filters only — skill fit is scored by the model. */
  const jobRows = await convex.query(api.jobs.listJobs, {
    locationScope,
    jobType,
    workType,
    skillFilters: undefined,
    nearKeywords,
    limit: limitPool,
  })

  if (jobRows.length === 0) {
    return NextResponse.json({
      ok: true,
      data: { matches: [] },
      source: 'empty' as const,
    })
  }

  const pool = jobRows.slice(0, limitPool).map((j) => ({
    id: j._id as string,
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
    return NextResponse.json(
      {
        ok: false,
        error:
          'AI matching returned no results. Set OPENROUTER_API_KEY or GEMINI_API_KEY.',
        data: { matches: [], jobIdsConsidered: pool.map((p) => p.id) },
        source: 'error' as const,
      },
      { status: 503 },
    )
  }

  const max = Math.min(body.limit ?? 15, 30)
  const top = matches.slice(0, max)

  return NextResponse.json({
    ok: true,
    data: {
      matches: top,
      jobIdsConsidered: pool.map((p) => p.id),
    },
    source: 'ai-only' as const,
  })
}
