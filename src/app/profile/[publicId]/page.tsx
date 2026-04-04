import { notFound } from 'next/navigation'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../convex/_generated/api'
import type { Metadata } from 'next'

export const revalidate = 60

type PageProps = { params: Promise<{ publicId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return { title: 'Profile' }
  const client = new ConvexHttpClient(url)
  const doc = await client.query(api.voiceCv.getByPublicId, { publicId })
  if (!doc) return { title: 'Profile' }
  const name = doc.name?.trim() || 'Professional profile'
  return {
    title: `${name} · Voice CV · RAASTA`,
    description: doc.summary.slice(0, 160),
  }
}

export default async function PublicVoiceProfilePage({ params }: PageProps) {
  const { publicId } = await params
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) notFound()

  const client = new ConvexHttpClient(url)
  const doc = await client.query(api.voiceCv.getByPublicId, { publicId })
  if (!doc) notFound()

  const en = doc.cvEnglish

  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] pt-20 pb-16 px-6 md:px-12">
      <div className="max-w-3xl mx-auto border border-[var(--raasta-border)] bg-[var(--color-surface)] p-8 md:p-12 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          Voice CV
        </p>
        <h1 className="mt-3 font-headline text-3xl md:text-4xl text-[var(--color-primary)]">
          {doc.name.trim() || 'Professional profile'}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[var(--raasta-muted)] whitespace-pre-wrap">
          {en?.summary ?? doc.summary}
        </p>

        <Section title="Skills" items={en?.skills ?? doc.skills} />
        <Section title="Experience" items={en?.experience ?? doc.experience} />
        <Section title="Projects" items={en?.projects ?? doc.projects} />
        <Section title="Education" items={en?.education ?? doc.education} />

        {doc.improvements?.length ? (
          <div className="mt-10 pt-8 border-t border-[var(--raasta-border)]">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-secondary)]">
              Suggested improvements
            </h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-[var(--raasta-muted)] space-y-1">
              {doc.improvements.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-10 text-xs text-[var(--raasta-muted)]">
          Language: {doc.detectedLanguage}
          {en ? ' · English version shown where available' : ''}
        </p>
      </div>
    </main>
  )
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null
  return (
    <section className="mt-10">
      <h2 className="font-headline text-lg text-[var(--color-primary)] border-b border-[var(--raasta-border)] pb-2">
        {title}
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-[var(--color-on-surface)]">
        {items.map((line) => (
          <li key={line} className="leading-relaxed">
            • {line}
          </li>
        ))}
      </ul>
    </section>
  )
}
