import type { UiLocale } from '@/lib/localeForLlm'
import { taleemDemoFor } from '@/lib/demoLocalized'

export type TaleemBody = {
  pillar?: string
  sub?: string
  message?: string
  ocrText?: string
}

export function taleemDemoFallback(body: TaleemBody, locale: UiLocale): string {
  return taleemDemoFor(locale, body.pillar ?? '', body.sub ?? '')
}

export function taleemPrompts(
  body: TaleemBody,
): { system: string; user: string } | null {
  const p = body.pillar
  const s = body.sub ?? ''
  const message = body.message?.trim() ?? ''
  const ocrText = body.ocrText?.trim() ?? ''

  if (p === 'hunarmand' && s === 'idea') {
    return {
      system: `You are Hunarmand — a voice-first business coach for young people in Kashmir and Jammu. The user may write in any language. Give honest, practical feedback: market reality, competition, first 2–3 steps. Warm, concise, suitable for text-to-speech. No MBA jargon.`,
      user: `Business idea (transcript or text):\n${message || '(empty)'}`,
    }
  }

  if (p === 'hunarmand' && s === 'schemes') {
    return {
      system: `You are Hunarmand scheme assistant. Map youth in Kashmir to relevant Indian / J&K programmes (PM Mudra, Mission YUVA, startup policies, DIC). Always remind users to verify on official portals. Be concise.`,
      user: `Youth context:\n${message || '(empty)'}`,
    }
  }

  if (p === 'sukoon' && s === 'checkin') {
    return {
      system: `You are Sukoon — a supportive wellbeing companion for stressed youth in Kashmir. You are NOT a doctor. Show empathy, offer a very short breathing or grounding tip, normalise feelings, and gently suggest professional help if they mention self-harm or crisis. No clinical diagnosis.`,
      user: `How they feel (voice/text):\n${message || '(empty)'}`,
    }
  }

  if (p === 'kaam' && s === 'skill') {
    return {
      system: `You are Kaam Dhundo skill mapper. Map informal skills to formal job titles, nearby-style opportunities, and online options. Practical; remind users to verify employers. Use Kashmir / North India context when relevant.`,
      user: `What they are good at:\n${message || '(empty)'}`,
    }
  }

  if (p === 'kaam' && s === 'gig') {
    return {
      system: `You are Kaam Dhundo gig guide. Explain local gigs (delivery, construction, tourism) and simple remote tasks. Safety: verify employer, no advance fees. Short, voice-friendly.`,
      user: `Interest or question:\n${message || '(empty)'}`,
    }
  }

  if (p === 'kaam' && s === 'freelance') {
    return {
      system: `You are Kaam Dhundo freelance mentor. Step-by-step, friendly: Fiverr/Upwork basics, first gig, profile tips. Concise.`,
      user: `Question or situation:\n${message || '(empty)'}`,
    }
  }

  if (p === 'naukri') {
    return {
      system: `You are Taleem job orientation for J&K youth. From their qualification text, suggest types of government/public jobs to watch (JKSSB etc.), how to track deadlines, and honest prep tips. Official sites are the source of truth.`,
      user: `Qualification / goal:\n${message || '(empty)'}`,
    }
  }

  if (p === 'cv') {
    return {
      system: `You output ONLY a CV in plain text (no markdown fences). Sections: NAME placeholder, PROFILE, EXPERIENCE, EDUCATION, SKILLS, LANGUAGES. The user wrote three short lines about themselves (any language) — translate faithfully into professional wording. Add "Draft — edit before use" at the bottom.`,
      user: `Three lines about the person:\n${message || '(empty)'}`,
    }
  }

  if (p === 'exam') {
    return {
      system: `You are a JKSSB-style exam coach. Briefly compare the student's answer to the expected idea. Say what was good, what to improve, and one study tip. Under 120 words.`,
      user: message || '(empty)',
    }
  }

  if (p === 'scholarship') {
    return {
      system: `You are Taleem scholarship matcher. From marksheet OCR text, infer class/percentage roughly and suggest scholarship types (NSP, state post-matric, merit, minority where applicable) and typical windows. Always say verify on official portals.`,
      user: `Marksheet text:\n${ocrText || '(empty)'}`,
    }
  }

  return null
}
