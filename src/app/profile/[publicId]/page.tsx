'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type CvData = {
  publicId: string
  name: string
  summary: string
  skills: string[]
  experience: string[]
  projects: string[]
  education: string[]
  detectedLanguage: string
  improvements: string[]
  inferredSkillNotes?: string
  cvEnglish?: {
    summary: string
    skills: string[]
    experience: string[]
    projects: string[]
    education: string[]
  }
  createdAt: number
}

export default function PublicVoiceProfilePage() {
  const params = useParams<{ publicId: string }>()
  const [doc, setDoc] = useState<CvData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.publicId) return
    fetch(`/api/profile/${encodeURIComponent(params.publicId)}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.data) setDoc(d.data)
        else setError(d.error ?? 'Profile not found')
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [params.publicId])

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] pt-24 pb-16 px-6 md:px-12 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading profile…</span>
        </div>
      </main>
    )
  }

  if (error || !doc) {
    return (
      <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] pt-24 pb-16 px-6 md:px-12 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl opacity-30 mb-4 block">person_off</span>
          <p className="text-lg">{error ?? 'Profile not found'}</p>
          <Link href="/taleem" className="mt-4 inline-block text-sm text-[var(--color-secondary)] underline">
            Back to Taleem
          </Link>
        </div>
      </main>
    )
  }

  const en = doc.cvEnglish

  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] pt-24 pb-16 px-6 md:px-12">
      <div className="max-w-3xl mx-auto border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-8 md:p-12 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Voice CV
          </p>
          <Link
            href="/taleem"
            className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] transition-colors"
          >
            ← Back
          </Link>
        </div>
        <h1 className="mt-3 font-headline text-3xl md:text-4xl text-[var(--color-primary)]">
          {doc.name.trim() || 'Professional Profile'}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[var(--color-on-surface-variant)] whitespace-pre-wrap">
          {en?.summary ?? doc.summary}
        </p>

        <Section title="Skills" items={en?.skills ?? doc.skills} isSkills />
        <Section title="Experience" items={en?.experience ?? doc.experience} />
        <Section title="Projects" items={en?.projects ?? doc.projects} />
        <Section title="Education" items={en?.education ?? doc.education} />

        {doc.improvements?.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[var(--color-outline-variant)]">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-secondary)]">
              AI Suggested Improvements
            </h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-[var(--color-on-surface-variant)] space-y-1">
              {doc.improvements.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {doc.inferredSkillNotes && (
          <p className="mt-6 text-xs text-[var(--color-on-surface-variant)] italic">
            AI Note: {doc.inferredSkillNotes}
          </p>
        )}

        <div className="mt-10 pt-6 border-t border-[var(--color-outline-variant)] flex items-center justify-between text-xs text-[var(--color-on-surface-variant)]">
          <span>Language: {doc.detectedLanguage}{en ? ' · English version shown' : ''}</span>
          <span>Generated via RAASTA AI</span>
        </div>
      </div>
    </main>
  )
}

function Section({ title, items, isSkills }: { title: string; items: string[]; isSkills?: boolean }) {
  if (!items?.length) return null
  return (
    <section className="mt-10">
      <h2 className="font-headline text-lg text-[var(--color-primary)] border-b border-[var(--color-outline-variant)] pb-2">
        {title}
      </h2>
      {isSkills ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map(skill => (
            <span
              key={skill}
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] px-3 py-1 text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-on-surface)]">
          {items.map(line => (
            <li key={line} className="leading-relaxed">• {line}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
