'use client'

import { PageIntro } from '@/components/PageIntro'
import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'

const pillars = [
  {
    href: '/taleem/hunarmand',
    emoji: '🚀',
    titleKey: 'taleem.p.hunarmand.title',
    subKey: 'taleem.p.hunarmand.sub',
  },
  {
    href: '/taleem/sukoon',
    emoji: '🌙',
    titleKey: 'taleem.p.sukoon.title',
    subKey: 'taleem.p.sukoon.sub',
  },
  {
    href: '/taleem/kaam',
    emoji: '💼',
    titleKey: 'taleem.p.kaam.title',
    subKey: 'taleem.p.kaam.sub',
  },
] as const

const quick = [
  { href: '/taleem/naukri', labelKey: 'taleem.q.naukri', emoji: '📋' },
  { href: '/taleem/cv', labelKey: 'taleem.q.cv', emoji: '📝' },
  { href: '/taleem/exam', labelKey: 'taleem.q.exam', emoji: '📚' },
  { href: '/taleem/scholarship', labelKey: 'taleem.q.scholarship', emoji: '🎓' },
] as const

export default function TaleemHubPage() {
  const { t } = useI18n()

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/"
        backLabel={t('nav.backHome')}
        title={t('taleem.title')}
      >
        <p>{t('taleem.lead')}</p>
      </PageIntro>

      <section aria-labelledby="taleem-pillars">
        <span id="taleem-pillars" className="raasta-section-label">
          {t('taleem.pillars')}
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
                  {t(p.titleKey)}
                </p>
                <p className="mt-0.5 text-sm text-[var(--raasta-muted)]">
                  {t(p.subKey)}
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
          {t('taleem.quick')}
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
                {t(q.labelKey)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
