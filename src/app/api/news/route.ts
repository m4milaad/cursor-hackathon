import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

const TOPIC_QUERIES: Record<string, string> = {
  zameen: 'Kashmir agriculture mandi prices crop farming latest news',
  taleem: 'Kashmir education jobs scholarships career opportunities latest',
  raah: 'Kashmir government schemes PM Kisan welfare programs latest',
  samjho: 'Kashmir land records government notices legal documents latest',
}

const MAX_ITEMS = 5

type NewsItem = {
  title: string
  link: string
  pubDate: string
  source: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const field = (searchParams.get('field') || 'zameen').toLowerCase()
  const query = TOPIC_QUERIES[field] || TOPIC_QUERIES.zameen

  try {
    const apiKey = process.env.FIRECRAWL_API_KEY
    
    // If Firecrawl is available, use it for better results
    if (apiKey) {
      console.log(`🔍 Fetching news for ${field} using Firecrawl...`)
      
      try {
        const app = new FirecrawlApp({ apiKey })
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Firecrawl timeout')), 8000)
        )
        
        const searchPromise = app.search(query, {
          limit: MAX_ITEMS,
        }) as Promise<any>
        
        const searchResult = await Promise.race([searchPromise, timeoutPromise])

        if (searchResult && searchResult.data) {
          const items: NewsItem[] = searchResult.data.map((item: any) => ({
            title: item.title || 'Untitled',
            link: item.url || '#',
            pubDate: new Date().toISOString(),
            source: item.url ? new URL(item.url).hostname : 'Web',
          }))
          
          console.log(`✅ Found ${items.length} news items for ${field}`)
          return NextResponse.json({ items })
        }
      } catch (firecrawlError) {
        console.log(`⚠️ Firecrawl failed for ${field}, falling back to RSS:`, firecrawlError)
      }
    }
    
    // Fallback to Google News RSS
    console.log(`📰 Using Google News RSS for ${field}`)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`
    
    const response = await fetch(rssUrl, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (!response.ok) {
      console.log(`❌ RSS fetch failed for ${field}`)
      return NextResponse.json({ items: [] })
    }
    
    const xml = await response.text()
    const items = parseRss(xml)
    
    console.log(`✅ Found ${items.length} RSS news items for ${field}`)
    return NextResponse.json({ items })
  } catch (error) {
    console.error(`❌ News fetch error for ${field}:`, error)
    return NextResponse.json({ items: [] })
  }
}

const decodeHtml = (input: string) =>
  input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

const extractTag = (block: string, tag: string) => {
  const cdata = new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, 'i').exec(block)
  if (cdata?.[1]) return decodeHtml(cdata[1])
  const normal = new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 'i').exec(block)
  return normal?.[1] ? decodeHtml(normal[1]) : ''
}

const parseRss = (xml: string) => {
  const items: NewsItem[] = []
  const matcher = /<item>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null = null
  while ((match = matcher.exec(xml)) && items.length < MAX_ITEMS) {
    const block = match[1]
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    const pubDate = extractTag(block, 'pubDate')
    const source = extractTag(block, 'source')
    if (title && link) {
      items.push({ title, link, pubDate, source })
    }
  }
  return items
}
