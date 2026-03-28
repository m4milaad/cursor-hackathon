import Link from 'next/link'
import { PageIntro } from '@/components/PageIntro'

const pillars = [
  {
    href: '/taleem/hunarmand',
    emoji: '🚀',
    title: 'Hunarmand',
    subtitle: 'Business coach · schemes · mentor',
  },
  {
    href: '/taleem/sukoon',
    emoji: '🌙',
    title: 'Sukoon',
    subtitle: 'Check-in · peer stories · helpline',
  },
  {
    href: '/taleem/kaam',
    emoji: '💼',
    title: 'Kaam Dhundo',
    subtitle: 'Skills · gigs · freelance',
  },
] as const

const quick = [
  { href: '/taleem/naukri', label: 'Naukri', emoji: '📋' },
  { href: '/taleem/cv', label: 'CV awaaz se', emoji: '📝' },
  { href: '/taleem/exam', label: 'Exam prep', emoji: '📚' },
  { href: '/taleem/scholarship', label: 'Scholarship', emoji: '🎓' },
] as const

export default function TaleemHubPage() {
  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/" backLabel="← Ghar" title="Taleem">
        <p>
          Kashmir ke youth — naukri, skills, dimaag ki sehat, aur apna karobar.
          Teeno raste ek jagah.
        </p>
      </PageIntro>

      <section aria-labelledby="taleem-pillars">
        <span id="taleem-pillars" className="raasta-section-label">
          Teen stambh
        </span>
        <div className="flex flex-col gap-3 sm:gap-4">
          {pillars.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="raasta-card group flex items-center gap-4 p-4 transition hover:-translate-y-px sm:p-5"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--chinar-mist)] text-2xl ring-1 ring-[var(--raasta-border)] transition group-hover:bg-[var(--chinar-glow)] sm:h-14 sm:w-14 sm:rounded-2xl"
                aria-hidden
              >
                {p.emoji}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-display text-lg font-semibold text-[var(--chinar-deep)]">
                  {p.title}
                </p>
                <p className="mt-0.5 text-sm text-[var(--raasta-muted)]">
                  {p.subtitle}
                </p>
              </div>
              <span
                className="shrink-0 text-[var(--chinar-gold)] opacity-60 transition group-hover:opacity-100"
                aria-hidden
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="taleem-quick">
        <span id="taleem-quick" className="raasta-section-label">
          Tez rasta
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {quick.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="raasta-card flex flex-col items-center gap-1.5 px-2 py-4 text-center transition hover:-translate-y-px"
            >
              <span className="text-xl" aria-hidden>
                {q.emoji}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-[var(--chinar-deep)] sm:text-xs">
                {q.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
