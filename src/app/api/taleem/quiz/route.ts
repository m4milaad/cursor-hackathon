import { NextRequest, NextResponse } from 'next/server'
import Firecrawl from '@mendable/firecrawl-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type QuizItem = {
  q: string
  a: string
  topic: string
}

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

  const app = new Firecrawl({ apiKey })
  try {
    const result = await Promise.race([
      app.search(`${topic} previous year questions answers India exam`, {
        limit: 3,
        scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
      }) as Promise<{ web?: { markdown?: string }[] }>,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ])

    const combined = (result?.web ?? [])
      .map((item) => item.markdown || '')
      .join('\n\n')
      .slice(0, 3000)

    if (!combined.trim()) return []

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

const quizCache: Record<string, { data: QuizItem[]; ts: number }> = {}
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic') || 'JKSSB General Awareness'

  if (quizCache[topic] && Date.now() - quizCache[topic].ts < CACHE_TTL) {
    return NextResponse.json({ ok: true, quiz: quizCache[topic].data, source: 'cache' })
  }

  let quiz = await scrapeAndGenerate(topic)
  if (quiz.length < 3) quiz = await generateWithGemini(topic)
  if (quiz.length < 3) {
    return NextResponse.json({
      ok: false,
      quiz: [] as QuizItem[],
      source: 'empty',
      error:
        'No quiz could be generated. Configure FIRECRAWL_API_KEY and GEMINI_API_KEY, or use Taleem Exam Prep.',
    })
  }

  quizCache[topic] = { data: quiz, ts: Date.now() }
  return NextResponse.json({ ok: true, quiz, source: 'ai' })
}
