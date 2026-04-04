import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type QuizItem = {
  q: string
  a: string
  topic: string
}

const FALLBACK_QUIZ: QuizItem[] = [
  { q: 'What is the capital of Jammu & Kashmir (summer)?', a: 'Srinagar', topic: 'General' },
  { q: 'Which river is known as the lifeline of Kashmir?', a: 'Jhelum', topic: 'Geography' },
  { q: 'What does RTI stand for?', a: 'Right to Information', topic: 'Civics' },
  { q: 'Who is the head of a district in J&K?', a: 'Deputy Commissioner (DC)', topic: 'Administration' },
  { q: 'What is the full form of JKSSB?', a: 'Jammu & Kashmir Services Selection Board', topic: 'General' },
]

async function generateWithGemini(topic: string): Promise<QuizItem[]> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return []
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `Generate exactly 5 multiple-choice style quiz questions for the exam topic: "${topic}".
Focus on J&K / India context where relevant.
Return ONLY a JSON array with this exact format, no markdown:
[{"q":"question text","a":"correct answer","topic":"${topic}"},...]`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 5)
    }
  } catch (e) {
    console.error('Gemini quiz generation failed:', e)
  }
  return []
}

async function scrapeAndGenerate(topic: string): Promise<QuizItem[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return []

  const app = new FirecrawlApp({ apiKey })
  try {
    const result = await Promise.race([
      app.v1.search(`${topic} previous year questions answers India exam`, { limit: 3 }) as Promise<any>,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ])

    const combined = (result?.data ?? [])
      .map((item: any) => item.markdown || item.description || '')
      .join('\n\n')
      .slice(0, 3000)

    if (!combined.trim()) return []

    // Use Gemini to extract/generate questions from scraped content
    const key = process.env.GEMINI_API_KEY
    if (!key) return []

    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `Based on this exam content about "${topic}", generate exactly 5 quiz questions with answers.
Content: ${combined}

Return ONLY a JSON array, no markdown:
[{"q":"question","a":"answer","topic":"${topic}"},...]`

    const genResult = await model.generateContent(prompt)
    const text = genResult.response.text().trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 5)
    }
  } catch (e) {
    console.error('Scrape+generate quiz failed:', e)
  }
  return []
}

// Cache per topic
const quizCache: Record<string, { data: QuizItem[]; ts: number }> = {}
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic') || 'JKSSB General Awareness'

  if (quizCache[topic] && Date.now() - quizCache[topic].ts < CACHE_TTL) {
    return NextResponse.json({ ok: true, quiz: quizCache[topic].data, source: 'cache' })
  }

  // Try scrape + AI first, then AI-only, then fallback
  let quiz = await scrapeAndGenerate(topic)
  if (quiz.length < 3) quiz = await generateWithGemini(topic)
  if (quiz.length < 3) quiz = FALLBACK_QUIZ

  quizCache[topic] = { data: quiz, ts: Date.now() }
  return NextResponse.json({ ok: true, quiz, source: quiz === FALLBACK_QUIZ ? 'fallback' : 'ai' })
}
