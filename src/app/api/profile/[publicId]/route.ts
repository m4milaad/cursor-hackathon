import { NextResponse } from 'next/server'
import { getCvByPublicId } from '@/lib/voiceCv/cvStore'

export const runtime = 'nodejs'

/**
 * GET /api/profile/[publicId] — JSON for the public Voice CV (no auth).
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params
  if (!publicId?.trim()) {
    return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
  }

  const doc = getCvByPublicId(publicId.trim())

  if (!doc) {
    return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    data: {
      publicId: doc.publicId,
      name: doc.name,
      summary: doc.summary,
      skills: doc.skills,
      experience: doc.experience,
      projects: doc.projects,
      education: doc.education,
      detectedLanguage: doc.detectedLanguage,
      improvements: doc.improvements,
      inferredSkillNotes: doc.inferredSkillNotes,
      cvEnglish: doc.cvEnglish,
      createdAt: doc.createdAt,
    },
  })
}
