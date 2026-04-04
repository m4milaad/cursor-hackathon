import { NextRequest, NextResponse } from 'next/server'
import { getConvexHttp, api } from '@/lib/jobs/convexServer'
import { parseResumeWithAi } from '@/lib/jobs/jobAi'
import {
  extractResumeText,
  fallbackResumeSkills,
} from '@/lib/jobs/resumeText'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  const convex = getConvexHttp()
  if (!convex) {
    return NextResponse.json(
      { ok: false, error: 'Database not configured', source: 'error' as const },
      { status: 503 },
    )
  }

  const form = await req.formData()
  const file = form.get('file')
  const deviceIdRaw = form.get('deviceId')
  const deviceId =
    typeof deviceIdRaw === 'string' && deviceIdRaw.trim().length > 0
      ? deviceIdRaw.trim()
      : `anon_${globalThis.crypto.randomUUID()}`

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: 'Missing file field', source: 'error' as const },
      { status: 400 },
    )
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const { text, error: extractErr } = await extractResumeText(
    buf,
    file.type || 'application/octet-stream',
    file.name || 'resume',
  )
  if (extractErr || !text.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: extractErr ?? 'Could not extract text from file',
        source: 'error' as const,
      },
      { status: 400 },
    )
  }

  let skills: string[] = []
  let experience: string[] = []
  let roles: string[] = []
  let usedAi = false

  const parsed = await parseResumeWithAi(text)
  if (parsed) {
    skills = parsed.skills
    experience = parsed.experience
    roles = parsed.roles
    usedAi = true
  } else {
    const fb = fallbackResumeSkills(text)
    skills = fb.skills
    experience = fb.experience
    roles = fb.roles
  }

  await convex.mutation(api.jobs.upsertUserJobProfile, {
    deviceId,
    skills,
    resumeData: {
      skills,
      experience,
      roles,
      rawExcerpt: text.slice(0, 1200),
    },
  })

  return NextResponse.json({
    ok: true,
    data: {
      deviceId,
      skills,
      experience,
      roles,
    },
    source: usedAi ? ('ai-only' as const) : ('fallback' as const),
  })
}
