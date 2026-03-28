import {
  DEMO_CV,
  DEMO_EXAM_FEEDBACK,
  DEMO_HUNARMAND_IDEA,
  DEMO_HUNARMAND_SCHEMES,
  DEMO_KAAM_FREELANCE,
  DEMO_KAAM_GIG,
  DEMO_KAAM_SKILL,
  DEMO_NAUKRI,
  DEMO_SCHOLARSHIP,
  DEMO_SUKOON_CHECKIN,
} from '@/lib/taleemDemos'

export type TaleemBody = {
  pillar?: string
  sub?: string
  message?: string
  ocrText?: string
}

export function taleemDemoFallback(body: TaleemBody): string {
  const p = body.pillar ?? ''
  const s = body.sub ?? ''
  if (p === 'hunarmand' && s === 'idea') return DEMO_HUNARMAND_IDEA
  if (p === 'hunarmand' && s === 'schemes') return DEMO_HUNARMAND_SCHEMES
  if (p === 'sukoon' && s === 'checkin') return DEMO_SUKOON_CHECKIN
  if (p === 'kaam' && s === 'skill') return DEMO_KAAM_SKILL
  if (p === 'kaam' && s === 'gig') return DEMO_KAAM_GIG
  if (p === 'kaam' && s === 'freelance') return DEMO_KAAM_FREELANCE
  if (p === 'naukri') return DEMO_NAUKRI
  if (p === 'cv') return DEMO_CV
  if (p === 'exam') return DEMO_EXAM_FEEDBACK
  if (p === 'scholarship') return DEMO_SCHOLARSHIP
  return `Taleem: pillar "${p}" samajh nahi aaya — dubara koshish karein.`
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
      system: `You are Hunarmand — a voice-first business coach for young people in Kashmir and Jammu. The user speaks in Urdu/Hindi (may be Roman script). Give honest, practical feedback: market reality, competition, first 2–3 steps. Roman Urdu, warm, concise for voice. No MBA jargon.`,
      user: `Business idea (voice transcript or text):\n${message || '(empty)'}`,
    }
  }

  if (p === 'hunarmand' && s === 'schemes') {
    return {
      system: `You are Hunarmand scheme assistant. Map youth in Kashmir to directionally relevant Indian / J&K programs (e.g. PM Mudra, Mission YUVA, startup policies, DIC). Always say "official portal par verify karein". Roman Urdu, short.`,
      user: `Youth context:\n${message || '(empty)'}`,
    }
  }

  if (p === 'sukoon' && s === 'checkin') {
    return {
      system: `You are Sukoon — supportive wellbeing companion for unemployed or stressed youth in Kashmir. You are NOT a doctor. Respond with empathy in Roman Urdu, very short breathing or grounding tip, normalize feelings, and gently suggest professional help if they mention self-harm or crisis. No clinical diagnosis.`,
      user: `How they feel (voice/text):\n${message || '(empty)'}`,
    }
  }

  if (p === 'kaam' && s === 'skill') {
    return {
      system: `You are Kaam Dhundo skill mapper. Informal skills → formal job titles + nearby-style opportunities + online options. Roman Urdu, practical, mention verifying employers. Kashmir / North India context when relevant.`,
      user: `What they are good at:\n${message || '(empty)'}`,
    }
  }

  if (p === 'kaam' && s === 'gig') {
    return {
      system: `You are Kaam Dhundo gig guide. Explain local gigs (delivery, construction, tourism) and simple remote tasks in Roman Urdu. Safety: verify employer, no advance fees. Short, voice-friendly.`,
      user: `Interest or question:\n${message || '(empty)'}`,
    }
  }

  if (p === 'kaam' && s === 'freelance') {
    return {
      system: `You are Kaam Dhundo freelance mentor. Step-by-step friend style: Fiverr/Upwork basics, first gig, profile tips. Roman Urdu, concise.`,
      user: `Question or situation:\n${message || '(empty)'}`,
    }
  }

  if (p === 'naukri') {
    return {
      system: `You are Taleem job orientation assistant for J&K youth. Based on qualification text, suggest types of government / public jobs to watch (JKSSB etc.), how to track deadlines, and honest prep tips. Roman Urdu. Say official sites are source of truth.`,
      user: `Qualification / goal:\n${message || '(empty)'}`,
    }
  }

  if (p === 'cv') {
    return {
      system: `You output ONLY a clean English CV in plain text (no markdown fences). Sections: NAME placeholder, PROFILE, EXPERIENCE, EDUCATION, SKILLS, LANGUAGES. User gave 3 short self-descriptions in Urdu/Roman Urdu — translate ideas faithfully into professional English. Add line at bottom "Draft — edit before use".`,
      user: `Three things about the person (Urdu / Roman Urdu):\n${message || '(empty)'}`,
    }
  }

  if (p === 'exam') {
    return {
      system: `You are JKSSB-style exam coach. Compare student answer to the model intent briefly. Roman Urdu feedback: what was good, what to improve, one study tip. Keep under 120 words.`,
      user: message || '(empty)',
    }
  }

  if (p === 'scholarship') {
    return {
      system: `You are Taleem scholarship matcher. From marksheet OCR text, infer class/percentage roughly and suggest scholarship TYPES (NSP, state post-matric, merit, minority where applicable) and typical application windows. Roman Urdu. Always say verify on official portals.`,
      user: `Marksheet text:\n${ocrText || '(empty)'}`,
    }
  }

  return null
}
