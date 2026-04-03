import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Firecrawl API key not configured' },
        { status: 500 }
      )
    }

    console.log('🔥 Firecrawl scraping:', url)

    const app = new FirecrawlApp({ apiKey })
    
    const scrapeResult = await app.scrape(url, {
      formats: ['markdown', 'html'],
    }) as any

    if (!scrapeResult.success) {
      throw new Error('Scrape failed')
    }

    console.log('✅ Firecrawl scraped successfully')

    return NextResponse.json({
      ok: true,
      content: {
        title: scrapeResult.metadata?.title || 'Untitled',
        content: scrapeResult.markdown || scrapeResult.html || '',
        url: url,
        markdown: scrapeResult.markdown,
      },
    })
  } catch (error) {
    console.error('❌ Firecrawl scrape error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape URL' },
      { status: 500 }
    )
  }
}
