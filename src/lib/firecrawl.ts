/**
 * Firecrawl web scraping utilities for real-time information
 */

export type ScrapedContent = {
  title: string
  content: string
  url: string
  markdown?: string
}

/**
 * Scrape a URL using Firecrawl API
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent | null> {
  try {
    const response = await fetch('/api/firecrawl/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      console.error('Firecrawl scrape failed:', response.statusText)
      return null
    }

    const data = await response.json()
    return data.content || null
  } catch (error) {
    console.error('Firecrawl error:', error)
    return null
  }
}

/**
 * Search and scrape multiple URLs
 */
export async function searchAndScrape(query: string, limit: number = 3): Promise<ScrapedContent[]> {
  try {
    const response = await fetch('/api/firecrawl/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    })

    if (!response.ok) {
      console.error('Firecrawl search failed:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Firecrawl search error:', error)
    return []
  }
}

/**
 * Get relevant information for Samjho (document understanding)
 */
export async function getSamjhoInfo(topic: string): Promise<string> {
  const query = `Kashmir government documents ${topic} official notices land records`
  const results = await searchAndScrape(query, 2)
  
  if (results.length === 0) {
    return ''
  }

  return results.map(r => r.content).join('\n\n').slice(0, 1000)
}

/**
 * Get relevant information for Zameen (agriculture)
 */
export async function getZameenInfo(topic: string): Promise<string> {
  const query = `Kashmir agriculture ${topic} crop farming mandi prices`
  const results = await searchAndScrape(query, 2)
  
  if (results.length === 0) {
    return ''
  }

  return results.map(r => r.content).join('\n\n').slice(0, 1000)
}

/**
 * Get relevant information for Taleem (education/career)
 */
export async function getTaleemInfo(topic: string): Promise<string> {
  const query = `Kashmir ${topic} education jobs career opportunities scholarships`
  const results = await searchAndScrape(query, 2)
  
  if (results.length === 0) {
    return ''
  }

  return results.map(r => r.content).join('\n\n').slice(0, 1000)
}

/**
 * Get relevant information for Raah (guidance/schemes)
 */
export async function getRaahInfo(topic: string): Promise<string> {
  const query = `Kashmir ${topic} government schemes PM Kisan welfare programs`
  const results = await searchAndScrape(query, 2)
  
  if (results.length === 0) {
    return ''
  }

  return results.map(r => r.content).join('\n\n').slice(0, 1000)
}
