import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type Mentor = {
  name: string
  domain: string
  org: string
  contact: string
  profileUrl: string
  source: string
}

const FALLBACK_MENTORS: Mentor[] = [
  { name: 'District Industries Centre (DIC)', domain: 'Business & Entrepreneurship', org: 'J&K Government', contact: 'Visit your district DIC office', profileUrl: 'https://jkindustriescommerce.nic.in', source: 'fallback' },
  { name: 'JKEDI — J&K Entrepreneurship Dev. Institute', domain: 'Startup & Skill Development', org: 'J&K Government', contact: 'jkedi.org', profileUrl: 'https://jkedi.org', source: 'fallback' },
  { name: 'Startup India Hub', domain: 'Funding & Mentorship', org: 'Government of India', contact: 'startupindia.gov.in', profileUrl: 'https://startupindia.gov.in', source: 'fallback' },
]

async function findMentors(ideaCategory: string): Promise<Mentor[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  if (!apiKey || !geminiKey) return []

  const app = new FirecrawlApp({ apiKey })
  try {
    const result = await Promise.race([
      app.v1.search(`${ideaCategory} mentor advisor startup Kashmir India contact LinkedIn`, { limit: 4 }) as Promise<any>,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ])

    const combined = (result?.data ?? [])
      .map((item: any) => `URL: ${item.url}\n${item.markdown || item.description || ''}`)
      .join('\n\n')
      .slice(0, 3000)

    if (!combined.trim()) return []

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `From this web content about ${ideaCategory} mentors and advisors, extract mentor information.
Content: ${combined}

Return ONLY a JSON array (max 4 mentors), no markdown:
[{"name":"person or org name","domain":"their expertise","org":"their organization","contact":"email or phone if available, else empty string","profileUrl":"their website or LinkedIn URL","source":"domain name"},...]

If no real mentors found, return empty array: []`

    const genResult = await model.generateContent(prompt)
    const text = genResult.response.text().trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) return parsed.slice(0, 4)
    }
  } catch (e) {
    console.error('Mentor search failed:', e)
  }
  return []
}

const mentorCache: Record<string, { data: Mentor[]; ts: number }> = {}
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const idea = searchParams.get('idea') || 'business'
  const cacheKey = idea.toLowerCase().slice(0, 50)

  if (mentorCache[cacheKey] && Date.now() - mentorCache[cacheKey].ts < CACHE_TTL) {
    return NextResponse.json({ ok: true, mentors: mentorCache[cacheKey].data, source: 'cache' })
  }

  const mentors = await findMentors(idea)
  const final = mentors.length >= 2 ? [...mentors, ...FALLBACK_MENTORS].slice(0, 5) : FALLBACK_MENTORS

  mentorCache[cacheKey] = { data: final, ts: Date.now() }
  return NextResponse.json({ ok: true, mentors: final, source: mentors.length >= 2 ? 'live' : 'fallback' })
}
