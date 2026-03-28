'use client'

import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'

const pillars = [
  {
    href: '/taleem/hunarmand',
    icon: 'rocket_launch',
    titleKey: 'taleem.p.hunarmand.title',
    subKey: 'taleem.p.hunarmand.sub',
  },
  {
    href: '/taleem/sukoon',
    icon: 'dark_mode',
    titleKey: 'taleem.p.sukoon.title',
    subKey: 'taleem.p.sukoon.sub',
  },
  {
    href: '/taleem/kaam',
    icon: 'work',
    titleKey: 'taleem.p.kaam.title',
    subKey: 'taleem.p.kaam.sub',
  },
] as const

const quick = [
  { href: '/taleem/naukri', labelKey: 'taleem.q.naukri', icon: 'content_paste' },
  { href: '/taleem/cv', labelKey: 'taleem.q.cv', icon: 'edit_document' },
  { href: '/taleem/exam', labelKey: 'taleem.q.exam', icon: 'local_library' },
  { href: '/taleem/scholarship', labelKey: 'taleem.q.scholarship', icon: 'school' },
] as const

export default function TaleemHubPage() {
  const { t } = useI18n()

  return (
    <main className="pt-24 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <header className="mb-16 max-w-3xl">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 block">
          Archive 03
        </span>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-[var(--color-primary)] tracking-tight leading-none mb-6">
          {t('taleem.title')}
        </h1>
        <p className="font-headline italic text-xl text-[var(--color-on-surface-variant)] leading-relaxed">
          {t('taleem.lead')}
        </p>
      </header>

      {/* Pillars Layout */}
      <section className="mb-20">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6 block border-b border-[var(--color-outline-variant)] pb-2 opacity-80">
          {t('taleem.pillars')}
        </span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] opacity-90 transition-colors duration-500 cursor-pointer p-8 flex flex-col items-start"
            >
              <span className="material-symbols-outlined text-[var(--color-primary-container)] mb-6 text-4xl group-hover:scale-110 transition-transform">
                {p.icon}
              </span>
              <h3 className="font-headline text-2xl font-bold text-[var(--color-primary)] mb-3">
                {t(p.titleKey)}
              </h3>
              <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed opacity-80 flex-grow">
                {t(p.subKey)}
              </p>
              
              <div className="mt-8 flex items-center gap-2 text-[var(--color-secondary)] font-label text-xs uppercase tracking-widest font-bold group-hover:translate-x-2 transition-transform">
                <span>Explore</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access Layout */}
      <section>
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6 block border-b border-[var(--color-outline-variant)] pb-2 opacity-80">
          {t('taleem.quick')}
        </span>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quick.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] opacity-90 transition-colors p-6 flex flex-col items-center justify-center text-center group"
            >
              <span className="material-symbols-outlined text-[var(--color-secondary)] text-3xl mb-4 group-hover:-translate-y-1 transition-transform">
                {q.icon}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-primary-container)] font-bold">
                {t(q.labelKey)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
