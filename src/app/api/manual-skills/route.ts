import { NextResponse } from 'next/server'
import { upsertUserProfile } from '@/lib/jobs/jobStore'

export const runtime = 'nodejs'

type Body = {
  deviceId: string
  skills: string[]
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON', source: 'error' as const },
      { status: 400 },
    )
  }

  if (!body.deviceId?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'deviceId is required', source: 'error' as const },
      { status: 400 },
    )
  }
  if (!Array.isArray(body.skills)) {
    return NextResponse.json(
      { ok: false, error: 'skills must be an array', source: 'error' as const },
      { status: 400 },
    )
  }

  const skills = body.skills
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 80)

  upsertUserProfile({
    deviceId: body.deviceId.trim(),
    skills,
  })

  return NextResponse.json({
    ok: true,
    data: { deviceId: body.deviceId.trim(), skills },
    source: 'live' as const,
  })
}
