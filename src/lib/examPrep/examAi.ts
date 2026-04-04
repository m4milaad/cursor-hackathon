import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  generateOpenRouterStructured,
  isOpenRouterAvailable,
} from '@/lib/openrouter'

export type ExtractedMcq = {
  question: string
  options: string[]
  correctIndex: number
  topic: string
}

export type TaggedMcq = ExtractedMcq & {
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

function parseJsonArray<T>(raw: string): T[] | null {
  const m = raw.match(/\[[\s\S]*\]/)
  if (!m) return null
  try {
    const v = JSON.parse(m[0]) as T[]
    return Array.isArray(v) ? v : null
  } catch {
    return null
  }
}

async function geminiText(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text().trim() || null
  } catch (e) {
    console.error('Gemini exam AI:', e)
    return null
  }
}

const EXTRACT_SYSTEM = `You extract ONLY multiple-choice questions found in or implied by the text. Output ONLY a JSON array (no markdown), each item:
{"question":"...","options":["four strings"],"correctIndex":0,"topic":"short topic label"}
Rules: exactly 4 options when possible; correctIndex is 0-based; if the text does not contain a clear MCQ, return []. Do not invent names of real exams' exact leaked papers — paraphrase from given content only.`

export async function extractMcqsFromCorpus(
  corpus: string,
  defaultTopic: string,
): Promise<ExtractedMcq[]> {
  const user = `Default topic label if missing: "${defaultTopic}".\n\nText:\n${corpus.slice(0, 14_000)}`
  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(EXTRACT_SYSTEM, user)
    } catch {
      /* */
    }
  }
  if (!raw) raw = await geminiText(`${EXTRACT_SYSTEM}\n\n${user}`)
  if (!raw) return []
  type Row = {
    question: string
    options: string[]
    correctIndex: number
    topic?: string
  }
  const arr = parseJsonArray<Row>(raw)
  if (!arr?.length) return []
  const out: ExtractedMcq[] = []
  for (const row of arr) {
    if (!row.question?.trim() || !Array.isArray(row.options) || row.options.length < 2)
      continue
    const opts = row.options.map((o) => String(o).trim()).filter(Boolean)
    const ci = Math.min(Math.max(0, Number(row.correctIndex) || 0), opts.length - 1)
    out.push({
      question: row.question.trim(),
      options: opts,
      correctIndex: ci,
      topic: (row.topic ?? defaultTopic).trim() || defaultTopic,
    })
  }
  return out
}

const TAG_SYSTEM = `You tag MCQs for exam prep. Output ONLY JSON array, same length as input, each:
{"tags":["important"|"repeated"] (subset, can be empty),"difficulty":"easy"|"medium"|"hard"}
Use "repeated" if the question stem resembles frequently asked patterns; "important" for high-yield concepts.`

export async function tagMcqsBatch(
  items: { question: string; topic: string }[],
): Promise<{ tags: string[]; difficulty: 'easy' | 'medium' | 'hard' }[]> {
  if (items.length === 0) return []
  const user = JSON.stringify(items.map((i) => ({ q: i.question, topic: i.topic })))
  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(TAG_SYSTEM, user)
    } catch {
      /* */
    }
  }
  if (!raw) raw = await geminiText(`${TAG_SYSTEM}\n\n${user}`)
  if (!raw) {
    return items.map(() => ({ tags: [], difficulty: 'medium' as const }))
  }
  type Row = { tags?: string[]; difficulty?: string }
  const arr = parseJsonArray<Row>(raw)
  if (!arr || arr.length !== items.length) {
    return items.map(() => ({ tags: [], difficulty: 'medium' as const }))
  }
  return arr.map((r) => ({
    tags: (r.tags ?? []).filter((t) => t === 'important' || t === 'repeated'),
    difficulty:
      r.difficulty === 'easy' || r.difficulty === 'hard'
        ? r.difficulty
        : 'medium',
  }))
}

const SYNTH_SYSTEM = `You write NEW multiple-choice questions for an Indian exam context. You are given sample questions to match style and difficulty — do NOT copy them; create original stems with different scenarios.
Output ONLY JSON array:
{"question":"","options":["four options"],"correctIndex":0,"topic":""}
Generate exactly the number requested.`

export async function generateSyntheticMcqs(params: {
  examName: string
  subject: string
  topic: string
  count: number
  samples: ExtractedMcq[]
}): Promise<ExtractedMcq[]> {
  const user = `Exam: ${params.examName}\nSubject: ${params.subject}\nTopic: ${params.topic}\nCount: ${params.count}\n\nSample style (do not copy):\n${JSON.stringify(params.samples.slice(0, 6)).slice(0, 6000)}`
  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(SYNTH_SYSTEM, user)
    } catch {
      /* */
    }
  }
  if (!raw) raw = await geminiText(`${SYNTH_SYSTEM}\n\n${user}`)
  if (!raw) return []
  type Row = {
    question: string
    options: string[]
    correctIndex: number
    topic?: string
  }
  const arr = parseJsonArray<Row>(raw)
  if (!arr?.length) return []
  const out: ExtractedMcq[] = []
  for (const row of arr) {
    if (!row.question?.trim() || !Array.isArray(row.options) || row.options.length < 2)
      continue
    const opts = row.options.map((o) => String(o).trim()).filter(Boolean)
    if (opts.length < 2) continue
    const ci = Math.min(Math.max(0, Number(row.correctIndex) || 0), opts.length - 1)
    out.push({
      question: row.question.trim(),
      options: opts,
      correctIndex: ci,
      topic: (row.topic ?? params.topic).trim(),
    })
    if (out.length >= params.count) break
  }
  return out
}

const ANALYSIS_SYSTEM = `You analyze a test result. Output ONLY JSON:
{"weakTopics":["topic1"],"summary":"2-3 sentences","revision":["actionable bullet strings"]}
Base analysis only on the wrong-question topics provided.`

export async function analyzeAttempt(input: {
  wrongTopics: string[]
  correctTopics: string[]
  scorePercent: number
}): Promise<{
  weakTopics: string[]
  summary: string
  revision: string[]
}> {
  const user = JSON.stringify(input)
  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(ANALYSIS_SYSTEM, user)
    } catch {
      /* */
    }
  }
  if (!raw) raw = await geminiText(`${ANALYSIS_SYSTEM}\n\n${user}`)
  if (!raw) {
    return {
      weakTopics: input.wrongTopics.slice(0, 8),
      summary: `Score: ${input.scorePercent.toFixed(0)}%. Review topics you missed.`,
      revision: ['Redo practice on weak topics listed above.'],
    }
  }
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) {
    return {
      weakTopics: input.wrongTopics,
      summary: 'Review incorrect answers.',
      revision: [],
    }
  }
  try {
    const p = JSON.parse(m[0]) as {
      weakTopics?: string[]
      summary?: string
      revision?: string[]
    }
    return {
      weakTopics: Array.isArray(p.weakTopics) ? p.weakTopics : input.wrongTopics,
      summary: String(p.summary ?? ''),
      revision: Array.isArray(p.revision) ? p.revision : [],
    }
  } catch {
    return {
      weakTopics: input.wrongTopics,
      summary: 'Review incorrect answers.',
      revision: [],
    }
  }
}
