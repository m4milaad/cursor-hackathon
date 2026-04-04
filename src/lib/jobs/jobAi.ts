import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  generateOpenRouterStructured,
  isOpenRouterAvailable,
} from '@/lib/openrouter'
import type { MatchedJob, NormalizedJob, ResumeParseResult } from '@/lib/jobs/types'

function parseJsonArray<T>(raw: string): T[] | null {
  const m = raw.match(/\[[\s\S]*\]/)
  if (!m) return null
  try {
    const v = JSON.parse(m[0]) as T[]
    return Array.isArray(v) ? v : null
  } catch {
    return null
  }
}

function parseJsonObject<T>(raw: string): T | null {
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    return JSON.parse(m[0]) as T
  } catch {
    return null
  }
}

async function geminiJson(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text().trim() || null
  } catch (e) {
    console.error('Gemini JSON error:', e)
    return null
  }
}

const RESUME_SYSTEM = `You extract structured data from resume/CV text. Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"skills":["..."],"experience":["short bullet strings"],"roles":["target job titles or domains"]}
Use English. If a field is empty, use [].`

const EXTRACT_JOBS_SYSTEM = `You extract job postings from web page markdown. Each job must reflect real content from the text; invent nothing.
Respond with ONLY a JSON array (no markdown) of objects:
[{"title":"string","company":"string","location":"string","job_type":"remote"|"onsite"|"hybrid"|"unknown","work_type":"full_time"|"part_time"|"internship"|"freelance"|"unknown","skills_required":["..."],"description":"string (<=400 chars)","apply_link":"absolute URL if present else page URL"}]
Limit to at most 12 items. Empty array if none.`

const MATCH_SYSTEM = `You are a career matching engine. Compare the user profile to each job. Scores must reflect semantic fit (skills, roles, seniority), not keyword overlap alone.
Respond with ONLY JSON array:
[{"job_id":"string","match_score":0-100,"matching_skills":["..."],"missing_skills":["..."],"recommendation":"one sentence"}]
Use job_id values exactly as given. English only.`

export async function parseResumeWithAi(text: string): Promise<ResumeParseResult | null> {
  const user = `Resume text:\n${text.slice(0, 14_000)}`
  if (isOpenRouterAvailable()) {
    try {
      const raw = await generateOpenRouterStructured(RESUME_SYSTEM, user)
      const parsed = parseJsonObject<ResumeParseResult>(raw)
      if (parsed?.skills && parsed?.experience && parsed?.roles) return parsed
    } catch (e) {
      console.error('OpenRouter resume parse:', e)
    }
  }
  const g = await geminiJson(`${RESUME_SYSTEM}\n\n${user}`)
  if (!g) return null
  const parsed = parseJsonObject<ResumeParseResult>(g)
  if (parsed?.skills && parsed?.experience && parsed?.roles) return parsed
  return null
}

export async function extractJobsFromMarkdownWithAi(
  chunks: { url: string; markdown: string; source: string }[],
): Promise<NormalizedJob[]> {
  const body = chunks
    .map(
      (c, i) =>
        `--- Source ${i + 1}: ${c.source} | ${c.url} ---\n${c.markdown.slice(0, 8000)}`,
    )
    .join('\n\n')
    .slice(0, 24_000)

  const user = `Extract job listings from:\n${body}`

  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(EXTRACT_JOBS_SYSTEM, user)
    } catch (e) {
      console.error('OpenRouter job extract:', e)
    }
  }
  if (!raw) {
    raw = await geminiJson(`${EXTRACT_JOBS_SYSTEM}\n\n${user}`)
  }
  if (!raw) return []

  type Row = {
    title: string
    company: string
    location: string
    job_type: string
    work_type: string
    skills_required: string[]
    description: string
    apply_link: string
  }
  const arr = parseJsonArray<Row>(raw)
  if (!arr?.length) return []

  const out: NormalizedJob[] = []
  for (const row of arr) {
    if (!row.title?.trim() || !row.apply_link?.trim()) continue
    out.push({
      title: row.title.trim(),
      company: (row.company ?? 'Unknown').trim(),
      location: (row.location ?? '').trim() || 'Not specified',
      jobType: normalizeJobType(row.job_type),
      workType: normalizeWorkType(row.work_type),
      skillsRequired: Array.isArray(row.skills_required) ? row.skills_required.map((s) => String(s).trim()).filter(Boolean) : [],
      description: (row.description ?? '').slice(0, 2000),
      applyLink: row.apply_link.trim(),
      source: 'ai_extract',
    })
  }
  return out
}

function normalizeJobType(
  s: string,
): 'remote' | 'onsite' | 'hybrid' | 'unknown' {
  const x = (s ?? '').toLowerCase()
  if (x === 'remote') return 'remote'
  if (x === 'onsite' || x === 'on-site') return 'onsite'
  if (x === 'hybrid') return 'hybrid'
  return 'unknown'
}

function normalizeWorkType(
  s: string,
): 'full_time' | 'part_time' | 'internship' | 'freelance' | 'unknown' {
  const x = (s ?? '').toLowerCase().replace('-', '_')
  if (x === 'full_time' || x === 'fulltime') return 'full_time'
  if (x === 'part_time' || x === 'parttime') return 'part_time'
  if (x === 'internship') return 'internship'
  if (x === 'freelance' || x === 'contract') return 'freelance'
  return 'unknown'
}

type JobForMatch = {
  id: string
  title: string
  company: string
  location: string
  description: string
  skillsRequired: string[]
  applyLink: string
}

export async function matchJobsWithAi(
  userSkills: string[],
  resumeSnippet: string | undefined,
  jobs: JobForMatch[],
): Promise<MatchedJob[]> {
  if (jobs.length === 0) return []

  const jobLines = jobs.map(
    (j) =>
      ({
        job_id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        skills: j.skillsRequired,
        description: j.description.slice(0, 600),
        apply: j.applyLink,
      }) as Record<string, unknown>,
  )

  const profile = {
    skills: userSkills,
    resume_excerpt: (resumeSnippet ?? '').slice(0, 2000),
  }

  const user = `User profile:\n${JSON.stringify(profile)}\n\nJobs:\n${JSON.stringify(jobLines)}`

  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(MATCH_SYSTEM, user)
    } catch (e) {
      console.error('OpenRouter match:', e)
    }
  }
  if (!raw) {
    raw = await geminiJson(`${MATCH_SYSTEM}\n\n${user}`)
  }
  if (!raw) return []

  type MRow = {
    job_id: string
    match_score: number
    matching_skills: string[]
    missing_skills: string[]
    recommendation: string
  }
  const arr = parseJsonArray<MRow>(raw)
  if (!arr?.length) return []

  const jobMap = new Map(jobs.map((j) => [j.id, j]))
  const matched: MatchedJob[] = []
  for (const row of arr) {
    const j = jobMap.get(row.job_id)
    if (!j) continue
    matched.push({
      jobId: row.job_id,
      title: j.title,
      company: j.company,
      location: j.location,
      applyLink: j.applyLink,
      matchScore: Math.min(100, Math.max(0, Number(row.match_score) || 0)),
      matchingSkills: Array.isArray(row.matching_skills) ? row.matching_skills : [],
      missingSkills: Array.isArray(row.missing_skills) ? row.missing_skills : [],
      recommendation: String(row.recommendation ?? '').slice(0, 500),
    })
  }
  matched.sort((a, b) => b.matchScore - a.matchScore)
  return matched
}
