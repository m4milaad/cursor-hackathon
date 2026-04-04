import { NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

export type Helpline = {
  name: string
  phone: string
  type: 'crisis' | 'ngo' | 'government' | 'private'
  coverage: string
  description: string
}

// These are real, verified national helplines — kept as guaranteed fallback
const VERIFIED_HELPLINES: Helpline[] = [
  {
    name: 'Vandrevala Foundation',
    phone: '9999666555',
    type: 'ngo',
    coverage: 'India (24/7)',
    description: 'Free mental health helpline, available in multiple languages including Hindi and Urdu.',
  },
  {
    name: 'iCall — TISS',
    phone: '9152987821',
    type: 'ngo',
    coverage: 'India',
    description: 'Psychosocial support by trained counsellors. Mon–Sat 8am–10pm.',
  },
  {
    name: 'KIRAN Mental Health',
    phone: '1800-599-0019',
    type: 'government',
    coverage: 'India (24/7, Free)',
    description: 'Government of India free helpline for mental health support and crisis intervention.',
  },
  {
    name: 'Snehi',
    phone: '044-24640050',
    type: 'ngo',
    coverage: 'India',
    description: 'Emotional support and suicide prevention helpline.',
  },
]

async function scrapeAdditionalHelplines(): Promise<Helpline[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return []

  const app = new FirecrawlApp({ apiKey })
  try {
    const result = await Promise.race([
      app.v1.search('mental health helpline psychiatrist NGO Jammu Kashmir contact number 2025', { limit: 3 }) as Promise<any>,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ])

    const extras: Helpline[] = []
    for (const item of result?.data ?? []) {
      const text = item.markdown || item.description || ''
      // Extract phone numbers with context
      const phoneMatches = text.matchAll(/([A-Za-z\s&]{5,40})[:\-–]\s*(\+?[0-9\-\s]{8,15})/g)
      for (const match of phoneMatches) {
        const name = match[1].trim()
        const phone = match[2].replace(/\s/g, '').trim()
        if (phone.length >= 8 && !VERIFIED_HELPLINES.find(h => h.phone === phone)) {
          extras.push({
            name,
            phone,
            type: 'ngo',
            coverage: 'J&K / India',
            description: `Found via ${new URL(item.url || 'https://example.com').hostname}`,
          })
          if (extras.length >= 3) break
        }
      }
      if (extras.length >= 3) break
    }
    return extras
  } catch (e) {
    console.error('Helpline scrape failed:', e)
    return []
  }
}

// Cache for 24 hours
let helplineCache: { data: Helpline[]; ts: number } | null = null
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function GET() {
  if (helplineCache && Date.now() - helplineCache.ts < CACHE_TTL) {
    return NextResponse.json({ ok: true, helplines: helplineCache.data, source: 'cache' })
  }

  const extras = await scrapeAdditionalHelplines()
  const helplines = [...VERIFIED_HELPLINES, ...extras]

  helplineCache = { data: helplines, ts: Date.now() }

  return NextResponse.json({
    ok: true,
    helplines,
    source: extras.length > 0 ? 'live+verified' : 'verified',
  })
}
