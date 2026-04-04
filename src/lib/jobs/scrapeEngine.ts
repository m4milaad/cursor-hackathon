import Firecrawl from '@mendable/firecrawl-js'
import { extractJobsFromMarkdownWithAi } from '@/lib/jobs/jobAi'
import { hashApplyLink } from '@/lib/jobs/hash'
import type { NormalizedJob } from '@/lib/jobs/types'

export type ScrapeResult = {
  jobs: NormalizedJob[]
  sourcesUsed: string[]
  errors: string[]
}

/**
 * Search queries targeting public job board pages (via Firecrawl search index).
 * We do not scrape LinkedIn/Indeed HTML directly — we use search results / landing pages.
 */
const SOURCE_QUERIES: { source: string; queries: string[] }[] = [
  {
    source: 'linkedin_jobs',
    queries: [
      'site:linkedin.com/jobs software engineer India 2026',
      'site:linkedin.com/jobs Kashmir remote hiring',
    ],
  },
  {
    source: 'indeed',
    queries: [
      'site:in.indeed.com jobs Srinagar Kashmir',
      'site:in.indeed.com remote developer India',
    ],
  },
  {
    source: 'naukri',
    queries: [
      'site:naukri.com jobs Kashmir',
      'site:naukri.com software engineer Jammu',
    ],
  },
  {
    source: 'internshala',
    queries: [
      'site:internshala.com internships work from home',
      'site:internshala.com Kashmir internship',
    ],
  },
  {
    source: 'remoteok',
    queries: [
      'site:remoteok.com remote developer',
      'site:weworkremotely.com remote jobs',
    ],
  },
]

function heuristicJobsFromLine(
  line: string,
  pageUrl: string,
  source: string,
): NormalizedJob | null {
  const titleMatch = line.match(
    /([A-Z][A-Za-z0-9\s\/\-–—]{4,60}(?:Engineer|Developer|Manager|Analyst|Designer|Intern|Associate|Executive|Specialist|Lead|Consultant|Coordinator))/,
  )
  if (!titleMatch) return null
  const title = titleMatch[1].replace(/\s+/g, ' ').trim()
  const urlMatch = line.match(/https?:\/\/[^\s\])"'<>]+/)
  const applyLink = urlMatch?.[0] ?? pageUrl
  const locMatch = line.match(
    /(Kashmir|Srinagar|Jammu|India|Remote|Delhi|Mumbai|Bangalore|Bengaluru|Hyderabad|Pune|Chennai)/i,
  )
  const blob = `${line} ${title}`
  return {
    title,
    company: 'See listing',
    location: locMatch ? locMatch[1] : 'India',
    jobType: /\bremote\b|wfh|work from home/i.test(blob) ? 'remote' : 'unknown',
    workType: /\bintern\b|internship/i.test(blob)
      ? 'internship'
      : /\bpart[\s-]?time\b/i.test(blob)
        ? 'part_time'
        : /\bcontract\b|freelance/i.test(blob)
          ? 'freelance'
          : 'full_time',
    skillsRequired: [],
    description: line.slice(0, 500),
    applyLink,
    source,
  }
}

function heuristicExtract(
  markdown: string,
  pageUrl: string,
  source: string,
): NormalizedJob[] {
  const jobs: NormalizedJob[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    if (line.trim().length < 20) continue
    const j = heuristicJobsFromLine(line, pageUrl, source)
    if (j) jobs.push(j)
    if (jobs.length >= 8) break
  }
  return jobs
}

export async function runJobScrape(): Promise<ScrapeResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  const errors: string[] = []
  const sourcesUsed: string[] = []
  const chunks: { url: string; markdown: string; source: string }[] = []

  if (!apiKey) {
    errors.push('FIRECRAWL_API_KEY not configured')
    return { jobs: [], sourcesUsed, errors }
  }

  const app = new Firecrawl({ apiKey })

  for (const group of SOURCE_QUERIES) {
    for (const q of group.queries) {
      try {
        const searchResult = (await Promise.race([
          app.search(q, {
            limit: 3,
            scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('search timeout')), 18_000),
          ),
        ])) as { web?: Array<{ url?: string; markdown?: string; title?: string; description?: string }> }

        const data = searchResult?.web ?? []
        for (const item of data) {
          const url = item.url || ''
          const md =
            item.markdown ??
            `${item.title ?? ''}\n${item.description ?? ''}`.trim()
          if (md.length > 80) {
            chunks.push({
              url: url || 'https://invalid.invalid',
              markdown: md,
              source: group.source,
            })
            if (!sourcesUsed.includes(group.source)) sourcesUsed.push(group.source)
          } else if (url.startsWith('http')) {
            try {
              const doc = (await Promise.race([
                app.scrape(url, { formats: ['markdown'], onlyMainContent: true }),
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('scrape timeout')), 12_000),
                ),
              ])) as { markdown?: string }
              const scraped = doc?.markdown ?? ''
              if (scraped.length > 80) {
                chunks.push({ url, markdown: scraped, source: group.source })
                if (!sourcesUsed.includes(group.source)) sourcesUsed.push(group.source)
              }
            } catch {
              /* skip bad URLs */
            }
          }
        }
      } catch (e) {
        errors.push(`${group.source}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
  }

  if (chunks.length === 0) {
    return { jobs: [], sourcesUsed, errors }
  }

  let normalized: NormalizedJob[] = []
  try {
    normalized = await extractJobsFromMarkdownWithAi(chunks)
  } catch (e) {
    errors.push(`ai_extract: ${e instanceof Error ? e.message : String(e)}`)
  }

  if (normalized.length === 0) {
    for (const c of chunks.slice(0, 6)) {
      normalized.push(...heuristicExtract(c.markdown, c.url, c.source))
    }
  }

  const seen = new Set<string>()
  const deduped: NormalizedJob[] = []
  for (const j of normalized) {
    const h = hashApplyLink(j.applyLink)
    if (seen.has(h)) continue
    seen.add(h)
    deduped.push({ ...j, applyLink: j.applyLink.split('#')[0] })
  }

  return { jobs: deduped, sourcesUsed, errors }
}

export type ConvexJobRow = {
  title: string
  company: string
  location: string
  jobType: NormalizedJob['jobType']
  workType: NormalizedJob['workType']
  skillsRequired: string[]
  description: string
  applyLink: string
  applyLinkHash: string
  source: string
  scrapedAt: number
}

export function toConvexRows(
  jobs: NormalizedJob[],
  scrapedAt: number,
): ConvexJobRow[] {
  return jobs.map((j) => ({
    title: j.title,
    company: j.company,
    location: j.location,
    jobType: j.jobType,
    workType: j.workType,
    skillsRequired: j.skillsRequired,
    description: j.description,
    applyLink: j.applyLink,
    applyLinkHash: hashApplyLink(j.applyLink),
    source: j.source,
    scrapedAt,
  }))
}
