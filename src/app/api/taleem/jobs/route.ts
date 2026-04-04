import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

export type LiveJob = {
  title: string
  org: string
  location: string
  match: number
  url: string
  skills: string
  source: string
}

const FALLBACK_JOBS: LiveJob[] = [
  { title: 'Data Entry Assistant', org: 'J&K e-Governance', location: 'Srinagar', match: 78, url: 'https://jkssb.nic.in', skills: 'Computer, Typing', source: 'fallback' },
  { title: 'Field Coordinator', org: 'NABARD J&K', location: 'Baramulla', match: 71, url: 'https://nabard.org', skills: 'Communication, Agriculture', source: 'fallback' },
  { title: 'Remote Support Agent', org: 'BPO India', location: 'Remote', match: 65, url: 'https://naukri.com', skills: 'English, Computer', source: 'fallback' },
]

const SEARCH_QUERIES = [
  'jobs hiring Kashmir Jammu 2025 2026 apply now',
  'JKSSB recruitment 2025 latest notification',
  'remote jobs India freshers 2025 apply',
  'Naukri Kashmir jobs latest openings',
]

function parseJobs(text: string, sourceUrl: string): LiveJob[] {
  const jobs: LiveJob[] = []
  // Match patterns like "Job Title at Company" or table rows with job data
  const lines = text.split('\n').filter(l => l.trim().length > 10)

  for (const line of lines) {
    // Look for lines that look like job listings
    const titleMatch = line.match(/(?:^|\|)\s*([A-Z][A-Za-z\s\/\-]{5,50}(?:Officer|Assistant|Manager|Engineer|Coordinator|Developer|Analyst|Executive|Inspector|Constable|Teacher|Nurse|Technician|Clerk|Supervisor|Intern|Associate))/i)
    if (titleMatch) {
      const orgMatch = line.match(/(?:at|@|–|-)\s*([A-Z][A-Za-z\s&\.]{3,40}(?:Ltd|Inc|Corp|Pvt|Gov|Dept|Board|Authority|Commission|Bank|Institute|College|Hospital)?)/i)
      const locMatch = line.match(/(?:Kashmir|Srinagar|Jammu|Baramulla|Sopore|Anantnag|Pulwama|Kupwara|Remote|Delhi|Mumbai|Bangalore)/i)
      const urlMatch = line.match(/https?:\/\/[^\s]+/)

      jobs.push({
        title: titleMatch[1].trim(),
        org: orgMatch ? orgMatch[1].trim() : 'Government / Private',
        location: locMatch ? locMatch[0] : 'J&K / India',
        match: Math.floor(60 + Math.random() * 30),
        url: urlMatch ? urlMatch[0] : sourceUrl,
        skills: '',
        source: new URL(sourceUrl).hostname,
      })

      if (jobs.length >= 6) break
    }
  }
  return jobs
}

// Simple in-memory cache
const cache: { data: LiveJob[]; ts: number } | null = null
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get('location') || 'Kashmir'
  const skills = searchParams.get('skills') || ''

  // Check cache
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ ok: true, jobs: cache.data, source: 'cache', live: true })
  }

  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: true, jobs: FALLBACK_JOBS, source: 'fallback', live: false })
  }

  const app = new FirecrawlApp({ apiKey })
  const allJobs: LiveJob[] = []

  const query = skills
    ? `${skills} jobs ${location} India 2025 2026 apply`
    : `jobs hiring ${location} Kashmir India 2025 latest`

  try {
    const result = await Promise.race([
      app.v1.search(query, { limit: 5 }) as Promise<any>,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ])

    for (const item of result?.data ?? []) {
      const text = item.markdown || item.description || ''
      const parsed = parseJobs(text, item.url || 'https://naukri.com')
      allJobs.push(...parsed)
    }
  } catch (e) {
    console.error('Job search failed:', e)
  }

  // Try JKSSB directly if no results
  if (allJobs.length < 2) {
    try {
      const jkResult = await Promise.race([
        app.v1.scrapeUrl('https://jkssb.nic.in', { formats: ['markdown'] }) as Promise<any>,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ])
      if (jkResult?.markdown) {
        const parsed = parseJobs(jkResult.markdown, 'https://jkssb.nic.in')
        allJobs.push(...parsed)
      }
    } catch {}
  }

  const jobs = allJobs.length >= 2 ? allJobs.slice(0, 6) : FALLBACK_JOBS

  // Update cache
  ;(global as any).__jobCache = { data: jobs, ts: Date.now() }

  return NextResponse.json({ ok: true, jobs, source: allJobs.length >= 2 ? 'live' : 'fallback', live: allJobs.length >= 2 })
}
