import { NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

export type MandiPrice = {
  commodity: string
  price: string
  unit: string
  market: string
  change: string
  changePositive: boolean
}

const FALLBACK_PRICES: MandiPrice[] = [
  { commodity: 'Saffron (Grade A)', price: 'Rs.245,000', unit: 'kg', market: 'Pampore Hub', change: '', changePositive: true },
  { commodity: 'Walnuts (Shelled)', price: 'Rs.290', unit: 'kg', market: 'Srinagar Central', change: '', changePositive: true },
  { commodity: 'Apples (Kullu)', price: 'Rs.120', unit: 'kg', market: 'Sopore Mandi', change: '', changePositive: true },
]

type SearchItem = { url: string; title: string; markdown?: string; description?: string }

// Commodity search configs
const COMMODITIES = [
  {
    key: 'apple',
    label: 'Apples (Kullu)',
    unit: 'kg',
    market: 'Sopore Mandi',
    query: 'Apple mandi price today Jammu Kashmir per kg quintal site:commodityonline.com OR site:kisandeals.com',
  },
  {
    key: 'walnut',
    label: 'Walnuts (Shelled)',
    unit: 'kg',
    market: 'Srinagar Central',
    query: 'Walnut mandi price today Jammu Kashmir per kg site:commodityonline.com OR site:kisandeals.com',
  },
  {
    key: 'saffron',
    label: 'Saffron (Grade A)',
    unit: 'kg',
    market: 'Pampore Hub',
    query: 'Saffron mandi price today India per kg quintal site:commodityonline.com',
  },
]

// Extract a price (in Rs/kg) from scraped text
function extractPrice(text: string): number | null {
  // Patterns: ₹9750/Quintal, ₹290/kg, Rs.290/kg, ₹ 9,750 per quintal
  const patterns = [
    /[₹Rs\.]+\s*([\d,]+)\s*(?:\/|per)\s*quintal/i,
    /[₹Rs\.]+\s*([\d,]+)\s*(?:\/|per)\s*kg/i,
    /average[^₹\d]*([\d,]+)\s*(?:\/|per)\s*(?:quintal|kg)/i,
    /price[^₹\d]*([\d,]+)\s*(?:\/|per)\s*(?:quintal|kg)/i,
    /rate[^₹\d]*([\d,]+)\s*(?:\/|per)\s*(?:quintal|kg)/i,
    /([\d,]+)\s*(?:\/|per)\s*quintal/i,
    /([\d,]+)\s*(?:\/|per)\s*kg/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const raw = parseFloat(match[1].replace(/,/g, ''))
      if (isNaN(raw) || raw <= 0) continue
      // Convert quintal to kg if needed
      const isQuintal = pattern.source.includes('quintal')
      return isQuintal ? raw / 100 : raw
    }
  }
  return null
}

function formatPrice(pricePerKg: number): string {
  return `Rs.${Math.round(pricePerKg).toLocaleString('en-IN')}`
}

export async function GET() {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    return NextResponse.json({ prices: FALLBACK_PRICES, source: 'fallback', live: false })
  }

  const app = new FirecrawlApp({ apiKey })
  const results: MandiPrice[] = []

  for (const commodity of COMMODITIES) {
    try {
      console.log(`🔍 Searching: ${commodity.key}`)
      const searchResult = await Promise.race([
        app.v1.search(commodity.query, { limit: 2 }) as Promise<{ data: SearchItem[] }>,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
      ])

      const items = searchResult?.data ?? []
      let pricePerKg: number | null = null

      for (const item of items) {
        const text = item.markdown || item.description || ''
        pricePerKg = extractPrice(text)
        if (pricePerKg) {
          console.log(`✅ ${commodity.key}: Rs.${pricePerKg}/kg from ${item.url}`)
          break
        }
      }

      if (pricePerKg) {
        results.push({
          commodity: commodity.label,
          price: formatPrice(pricePerKg),
          unit: commodity.unit,
          market: commodity.market,
          change: '',
          changePositive: true,
        })
      }
    } catch (e) {
      console.log(`⚠️ ${commodity.key} failed:`, (e as Error).message)
    }
  }

  if (results.length === 0) {
    console.log('⚠️ No live prices found, returning fallback')
    return NextResponse.json({ prices: FALLBACK_PRICES, source: 'fallback', live: false })
  }

  // Fill in any missing commodities from fallback
  const found = new Set(results.map((r) => r.commodity))
  for (const fb of FALLBACK_PRICES) {
    if (!found.has(fb.commodity)) results.push(fb)
  }

  console.log(`✅ Returning ${results.length} live mandi prices`)
  return NextResponse.json({ prices: results, source: 'commodityonline.com', live: true })
}
