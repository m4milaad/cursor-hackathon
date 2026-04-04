import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  generateOpenRouterStructured,
  isOpenRouterAvailable,
} from '@/lib/openrouter'

export type VoiceCvJson = {
  name: string
  summary: string
  skills: string[]
  experience: string[]
  projects: string[]
  education: string[]
}

export type VoiceCvAiResult = {
  cv: VoiceCvJson
  improvements: string[]
  inferredSkillNotes: string
}

function parseJsonObject<T>(raw: string): T | null {
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    return JSON.parse(m[0]) as T
  } catch {
    return null
  }
}

async function geminiJson(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text().trim() || null
  } catch (e) {
    console.error('Gemini CV error:', e)
    return null
  }
}

const CV_SYSTEM = `You convert spoken job-seeker input into a professional CV. Output ONLY valid JSON (no markdown).
Shape:
{
  "name": "string or empty if unknown",
  "summary": "2-4 sentences, professional",
  "skills": ["canonical skill names — infer technologies e.g. if they said they made a website, include HTML, CSS, JavaScript"],
  "experience": ["bullet strings"],
  "projects": ["bullet strings"],
  "education": ["bullet strings"],
  "improvements": ["2-5 concrete suggestions e.g. add metrics, quantify impact, add dates"],
  "inferred_skill_notes": "one short sentence on what you inferred"
}
Rules:
- Do NOT invent employers, degrees, or dates that contradict the input; you may generalize ("Various web projects") if details are missing.
- Extract skills even when implied (e.g. "I teach children" → Teaching, Communication).
- Improve grammar and clarity in the written sections only.
- If input is too thin, keep arrays minimal but honest — never fabricate employers or schools.
- Use English for the JSON string values unless the user clearly wants another language in summary (still use Latin script for skill names where standard).`

export async function generateVoiceCvFromTranscript(
  transcript: string,
  _uiLanguage?: string,
): Promise<VoiceCvAiResult | null> {
  const user = `Spoken input (may be Urdu, Kashmiri, English, or mixed):\n${transcript.slice(0, 12_000)}`

  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(CV_SYSTEM, user)
    } catch (e) {
      console.error('OpenRouter CV:', e)
    }
  }
  if (!raw) {
    raw = await geminiJson(`${CV_SYSTEM}\n\n${user}`)
  }
  if (!raw) return null

  type Row = VoiceCvJson & {
    improvements?: string[]
    inferred_skill_notes?: string
  }
  const parsed = parseJsonObject<Row>(raw)
  if (!parsed?.summary && !parsed?.skills?.length) return null

  const cv: VoiceCvJson = {
    name: String(parsed.name ?? '').trim(),
    summary: String(parsed.summary ?? '').trim(),
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.map((s) => String(s).trim()).filter(Boolean)
      : [],
    experience: Array.isArray(parsed.experience)
      ? parsed.experience.map((s) => String(s).trim()).filter(Boolean)
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((s) => String(s).trim()).filter(Boolean)
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((s) => String(s).trim()).filter(Boolean)
      : [],
  }

  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.map((s) => String(s).trim()).filter(Boolean).slice(0, 8)
    : []

  return {
    cv,
    improvements,
    inferredSkillNotes: String(parsed.inferred_skill_notes ?? '').trim(),
  }
}

const TRANSLATE_SYSTEM = `Translate the following CV fields into clear professional English. Output ONLY JSON:
{"summary":"","skills":[],"experience":[],"projects":[],"education":[]}
Keep meaning; do not add fake employers or degrees.`

export async function translateCvToEnglish(cv: VoiceCvJson): Promise<
  | {
      summary: string
      skills: string[]
      experience: string[]
      projects: string[]
      education: string[]
    }
  | null
> {
  const user = JSON.stringify({
    summary: cv.summary,
    skills: cv.skills,
    experience: cv.experience,
    projects: cv.projects,
    education: cv.education,
  })

  let raw: string | null = null
  if (isOpenRouterAvailable()) {
    try {
      raw = await generateOpenRouterStructured(TRANSLATE_SYSTEM, user)
    } catch {
      /* fall through */
    }
  }
  if (!raw) {
    raw = await geminiJson(`${TRANSLATE_SYSTEM}\n\n${user}`)
  }
  if (!raw) return null
  const parsed = parseJsonObject<{
    summary?: string
    skills?: string[]
    experience?: string[]
    projects?: string[]
    education?: string[]
  }>(raw)
  if (!parsed) return null
  return {
    summary: String(parsed.summary ?? ''),
    skills: Array.isArray(parsed.skills) ? parsed.skills.map(String) : [],
    experience: Array.isArray(parsed.experience)
      ? parsed.experience.map(String)
      : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects.map(String) : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map(String)
      : [],
  }
}
