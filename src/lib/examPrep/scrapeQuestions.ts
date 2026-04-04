import Firecrawl from '@mendable/firecrawl-js'
import { extractMcqsFromCorpus } from '@/lib/examPrep/examAi'

export type ScrapeQuestionsResult = {
  corpusChunks: string[]
  errors: string[]
}

/**
 * Firecrawl search for PYQ / question bank pages; returns markdown text for AI extraction.
 */
export async function scrapeExamCorpus(params: {
  examName: string
  subject: string
  topic: string
}): Promise<ScrapeQuestionsResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  const errors: string[] = []
  const chunks: string[] = []
  if (!apiKey) {
    errors.push('FIRECRAWL_API_KEY not configured')
    return { corpusChunks: [], errors }
  }

  const q = `${params.examName} ${params.subject} ${params.topic || ''} previous year questions MCQ answers site:edu OR site:nic.in OR pyq`.trim()
  const q2 = `${params.examName} ${params.subject} objective questions practice India`

  const app = new Firecrawl({ apiKey })
  const queries = [q, q2]

  for (const query of queries) {
    try {
      const searchResult = (await Promise.race([
        app.search(query, {
          limit: 4,
          scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 25_000),
        ),
      ])) as { web?: Array<{ markdown?: string; description?: string; title?: string; url?: string }> }

      const web = searchResult?.web ?? []
      for (const item of web) {
        const text =
          item.markdown ??
          `${item.title ?? ''}\n${item.description ?? ''}`.trim()
        if (text.length > 120) chunks.push(text.slice(0, 12_000))
        else if (item.url?.startsWith('http')) {
          try {
            const doc = (await Promise.race([
              app.scrape(item.url, {
                formats: ['markdown'],
                onlyMainContent: true,
              }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('scrape timeout')), 15_000),
              ),
            ])) as { markdown?: string }
            const md = doc?.markdown ?? ''
            if (md.length > 120) chunks.push(md.slice(0, 12_000))
          } catch {
            /* skip */
          }
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e))
    }
  }

  return { corpusChunks: chunks, errors }
}

export async function extractQuestionsFromScrape(
  chunks: string[],
  defaultTopic: string,
): Promise<ReturnType<typeof extractMcqsFromCorpus>> {
  const corpus = chunks.join('\n\n---\n\n')
  if (corpus.length < 80) return []
  return extractMcqsFromCorpus(corpus, defaultTopic)
}
