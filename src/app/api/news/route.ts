const TOPIC_QUERIES: Record<string, string> = {
  zameen: 'agriculture Kashmir mandi crop soil irrigation research',
  taleem: 'education Kashmir schools universities research',
  raah: 'mental health Kashmir youth wellbeing counseling guidance',
  samjho: 'land records legal notice Kashmir government circular documentation',
}

const MAX_ITEMS = 8

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
  const items: Array<{ title: string; link: string; pubDate: string; source: string }> = []
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const field = (searchParams.get('field') || 'zameen').toLowerCase()
  const query = TOPIC_QUERIES[field] || TOPIC_QUERIES.zameen

  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`

  try {
    const response = await fetch(rssUrl, { cache: 'no-store' })
    if (!response.ok) {
      return Response.json({ items: [] }, { status: 200 })
    }
    const xml = await response.text()
    const items = parseRss(xml)
    return Response.json({ items }, { status: 200 })
  } catch {
    return Response.json({ items: [] }, { status: 200 })
  }
}
