import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type PeerStory = {
  title: string
  body: string
  theme: string
}

const FALLBACK_STORIES: PeerStory[] = [
  {
    title: 'Raza ki kahani — Naukri ki talash',
    body: 'Raza ne 3 saal tak naukri dhundhi. Har jagah se "experience chahiye" suna. Phir usne Fiverr par data entry ka kaam shuru kiya — pehle mahine mein Rs.4000 mile. Chhota tha, lekin uska tha. Aaj woh apne gaon mein 5 logon ko kaam deta hai.',
    theme: 'unemployment',
  },
  {
    title: 'Sana ki himmat — Exam pressure',
    body: 'JKSSB ka form bhara, 6 mahine padha, phir result mein naam nahi aaya. Sana ne rona bhi kiya. Lekin usne ek kaam kiya — syllabus ko 3 hisson mein toda aur rozana sirf ek topic. Doosri baar mein woh pass hui.',
    theme: 'exam_pressure',
  },
]

const STORY_THEMES = [
  'unemployment and job search in Kashmir',
  'exam pressure and JKSSB preparation',
  'family expectations and career choices',
  'starting a small business with no money',
  'mental health and stress in rural youth',
]

async function generateStories(context?: string): Promise<PeerStory[]> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return []

  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const themes = context
      ? `themes related to: ${context}`
      : STORY_THEMES.slice(0, 2).join(' and ')

    const prompt = `Write 2 short, realistic peer stories for rural Kashmir youth dealing with ${themes}.

Each story should:
- Be 80-120 words
- Feel real and relatable, not preachy
- Be written in simple Roman Urdu mixed with English (the way young Kashmiris actually speak)
- Have a hopeful but honest ending
- NOT be generic motivational content

Return ONLY a JSON array, no markdown:
[{"title":"story title in Roman Urdu","body":"story text","theme":"theme_keyword"},...]`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 3)
    }
  } catch (e) {
    console.error('Story generation failed:', e)
  }
  return []
}

// Session-level cache (regenerate per request in dev, cache in prod)
const storyCache: { data: PeerStory[]; ts: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const context = searchParams.get('context') || ''

  // Only use cache when no specific context
  if (!context && storyCache && Date.now() - (storyCache as any).ts < CACHE_TTL) {
    return NextResponse.json({ ok: true, stories: (storyCache as any).data, source: 'cache' })
  }

  const stories = await generateStories(context || undefined)
  const final = stories.length >= 2 ? stories : FALLBACK_STORIES

  if (!context) {
    ;(global as any).__storyCache = { data: final, ts: Date.now() }
  }

  return NextResponse.json({
    ok: true,
    stories: final,
    source: stories.length >= 2 ? 'ai' : 'fallback',
  })
}
