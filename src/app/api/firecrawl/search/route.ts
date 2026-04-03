import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 3 } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
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

    console.log('🔍 Firecrawl searching:', query)

    const app = new FirecrawlApp({ apiKey })
    
    const searchResult = await app.search(query, {
      limit: Math.min(limit, 5), // Max 5 results
    }) as any

    if (!searchResult || !searchResult.data) {
      throw new Error('Search failed')
    }

    console.log(`✅ Firecrawl found ${searchResult.data.length} results`)

    const results = searchResult.data.map((item: any) => ({
      title: item.title || 'Untitled',
      content: item.markdown || item.content || '',
      url: item.url || '',
      markdown: item.markdown,
    }))

    return NextResponse.json({
      ok: true,
      results,
    })
  } catch (error) {
    console.error('❌ Firecrawl search error:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
