'use client'

import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'

const categories = [
  {
    href: '/taleem/hunarmand',
    title: 'Hunarmand',
    subtitle: 'Skills & Business',
    image: '/assets/taleem-hunarmand.svg',
  },
  {
    href: '/taleem/sukoon',
    title: 'Sukoon',
    subtitle: 'Mental Wellness',
    image: '/assets/taleem-sukoon.svg',
  },
  {
    href: '/taleem/kaam',
    title: 'Kaam Dundho',
    subtitle: 'Career Discovery',
    image: '/assets/taleem-kaam.svg',
  },
] as const

const featureStrip = [
  {
    title: 'Jobs',
    subtitle: 'Location-based jobs',
    items: ['Skill match %', 'Apply directly'],
    href: '/taleem/naukri',
    icon: 'work',
  },
  {
    title: 'Voice CV',
    subtitle: 'Record voice intro',
    items: ['AI converts to CV + profile', 'Shareable link'],
    href: '/taleem/cv',
    icon: 'graphic_eq',
  },
  {
    title: 'Exam Prep',
    subtitle: 'Topic-wise practice',
    items: ['AI quizzes', 'Smart revision'],
    href: '/taleem/exam',
    icon: 'local_library',
  },
] as const

export default function TaleemHubPage() {
  const { t } = useI18n()

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen text-[var(--color-on-surface)]">
      {/* Hero Section */}
      <section className="px-8 md:px-24 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
            Archive 03
          </p>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-[var(--color-primary)] leading-[1.05]">
            Taleem — <br />
            <span className="italic font-normal">Build Your Future</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-[var(--color-on-surface-variant)] mt-6 max-w-xl leading-relaxed">
            Skills. Careers. Clarity. A guided system to turn your questions into momentum.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/taleem/kaam"
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-secondary)] transition-colors"
            >
              Start the Journey
            </Link>
            <Link
              href="/taleem/hunarmand"
              className="border border-[var(--color-outline-variant)] px-6 py-3 font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Explore Skills
            </Link>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="group relative h-[360px] md:h-[420px] overflow-hidden border border-[var(--color-outline-variant)] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <img
              alt="Taleem illustration"
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop"
            />
            <div className="absolute bottom-0 left-0 bg-[var(--color-primary)] px-6 py-4 text-[var(--color-on-primary)]">
              <p className="font-headline italic text-lg tracking-tight">Paths, not forms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="px-8 md:px-24 pb-20">
        <div className="flex items-end justify-between gap-6 border-b border-[var(--color-outline-variant)] pb-4 mb-8">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-2">
              Pillars
            </p>
            <h2 className="font-headline text-3xl md:text-4xl text-[var(--color-primary)]">
              Your learning map
            </h2>
          </div>
          <div></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group relative overflow-hidden border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
            >
              <div className="absolute inset-0">
                <img
                  alt={`${c.title} visual`}
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  src={c.image}
                />
                <div className="absolute inset-0 bg-[rgba(0,13,8,0.45)] opacity-60 group-hover:opacity-30 transition-opacity" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full p-8 min-h-[260px]">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary-fixed)] mb-3">
                    {c.subtitle}
                  </p>
                  <h3 className="font-headline text-3xl text-[var(--color-on-primary)]">
                    {c.title}
                  </h3>
                </div>
                <div className="mt-8 flex items-center gap-2 text-[var(--color-secondary-fixed-dim)] font-label text-xs uppercase tracking-widest">
                  <span>Enter</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Strip */}
      <section className="px-8 md:px-24 pb-20">
        <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)] pb-4 mb-8">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-2">
              Feature Block
            </p>
            <h2 className="font-headline text-3xl md:text-4xl text-[var(--color-primary)]">
              Premium tools, human pace
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] hidden md:block">
            Market Pulse inspired
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureStrip.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group bg-[var(--color-primary-container)] text-[var(--color-on-primary)] p-8 border-l-4 border-[var(--color-secondary)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary-fixed)] mb-2">
                    {f.subtitle}
                  </p>
                  <h3 className="font-headline text-2xl">{f.title}</h3>
                </div>
                <span className="material-symbols-outlined text-[var(--color-secondary-fixed)] text-3xl group-hover:scale-110 transition-transform">
                  {f.icon}
                </span>
              </div>
              <div className="space-y-3 text-sm text-[var(--color-secondary-fixed)]">
                {f.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive AI Section */}
      <section className="px-8 md:px-24 pb-24">
        <div className="bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
              Interactive Tool
            </p>
            <h2 className="font-headline text-3xl md:text-4xl text-[var(--color-primary)] leading-tight">
              What do you want to build or become?
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-4 leading-relaxed">
              Speak or type, and Taleem responds like a guide. No blank forms. Just a conversation that moves you forward.
            </p>
            <div className="mt-8 flex gap-3">
              <button className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-secondary)] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-base">mic</span>
                Speak
              </button>
              <button className="border border-[var(--color-outline-variant)] px-6 py-3 font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-base">edit</span>
                Type
              </button>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-[var(--color-on-primary)] font-label text-xs uppercase">
                  AI
                </div>
                <div>
                  <p className="font-headline text-lg text-[var(--color-primary)]">
                    Tell me about your goal.
                  </p>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    Example: I want to open a small shop or prepare for JKSSB.
                  </p>
                </div>
              </div>
              <div className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 min-h-[120px] text-sm text-[var(--color-on-surface-variant)]">
                Start typing your plan here...
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  'Business plan outline',
                  'Skill roadmap in 6 weeks',
                  'Scholarships to watch',
                ].map((s) => (
                  <div
                    key={s}
                    className="border border-[var(--color-outline-variant)] p-4 text-sm bg-[var(--color-surface-container-lowest)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    {s}
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full bg-[var(--color-secondary)] text-[var(--color-on-secondary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-opacity-90 transition-colors">
                Get Guidance
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Continuity */}
      <section className="px-8 md:px-24 pb-24">
        <div className="border-t border-[var(--color-outline-variant)] pt-6 text-[10px] uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
          {t('taleem.lead')}
        </div>
      </section>
    </main>
  )
}
