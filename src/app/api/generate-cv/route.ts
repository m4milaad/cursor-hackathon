import { NextResponse } from 'next/server'
import {
  generateVoiceCvFromTranscript,
  translateCvToEnglish,
} from '@/lib/voiceCv/cvAi'
import { saveCv, newPublicId } from '@/lib/voiceCv/cvStore'
import { upsertUserProfile } from '@/lib/jobs/jobStore'

export const runtime = 'nodejs'
export const maxDuration = 120

type Body = {
  transcript: string
  /** UI hint: ur | ks | en | auto */
  language?: string
  deviceId?: string
  translateToEnglish?: boolean
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : ''
  if (transcript.length < 8) {
    return NextResponse.json(
      { ok: false, error: 'Transcript too short. Provide at least a few sentences.' },
      { status: 400 },
    )
  }

  const ai = await generateVoiceCvFromTranscript(transcript, body.language)
  if (!ai) {
    return NextResponse.json(
      {
        ok: false,
        error: 'CV generation failed. Set OPENROUTER_API_KEY or GEMINI_API_KEY.',
      },
      { status: 503 },
    )
  }

  let cvEnglish = undefined
  if (body.translateToEnglish) {
    cvEnglish = (await translateCvToEnglish(ai.cv)) ?? undefined
  }

  const publicId = newPublicId()
  const deviceId = body.deviceId?.trim()

  // Save CV to local store
  saveCv({
    publicId,
    deviceId: deviceId || undefined,
    name: ai.cv.name,
    summary: ai.cv.summary,
    skills: ai.cv.skills,
    experience: ai.cv.experience,
    projects: ai.cv.projects,
    education: ai.cv.education,
    transcript,
    detectedLanguage: body.language ?? 'auto',
    improvements: ai.improvements,
    inferredSkillNotes: ai.inferredSkillNotes || undefined,
    cvEnglish,
  })

  // Also update job profile for matching
  if (deviceId) {
    const allSkills = [...new Set([...ai.cv.skills])]
    upsertUserProfile({
      deviceId,
      skills: allSkills,
      resumeData: {
        skills: allSkills,
        experience: ai.cv.experience,
        roles: ai.cv.skills.slice(0, 12),
        rawExcerpt: `${ai.cv.summary}\n${ai.cv.experience.join(' ')}`.slice(0, 2000),
      },
    })
  }

  const origin =
    req.headers.get('x-forwarded-host') && req.headers.get('x-forwarded-proto')
      ? `${req.headers.get('x-forwarded-proto')}://${req.headers.get('x-forwarded-host')}`
      : req.headers.get('host')
        ? `${req.headers.get('x-forwarded-proto') ?? 'http'}://${req.headers.get('host')}`
        : ''

  return NextResponse.json({
    ok: true,
    data: {
      publicId,
      profilePath: `/profile/${publicId}`,
      profileUrl: origin ? `${origin}/profile/${publicId}` : `/profile/${publicId}`,
      cv: ai.cv,
      improvements: ai.improvements,
      inferredSkillNotes: ai.inferredSkillNotes,
      cvEnglish: cvEnglish ?? null,
    },
  })
}
