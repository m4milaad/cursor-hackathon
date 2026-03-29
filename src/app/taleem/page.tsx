'use client'

import { useI18n } from '@/lib/i18n/context'
import { NewsCorner } from '@/components/NewsCorner'
import Link from 'next/link'
import { useMemo, useState } from 'react'

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
    why: 'Find work that actually fits your skills.',
  },
  {
    title: 'Voice CV',
    subtitle: 'Record voice intro',
    items: ['AI converts to CV + profile', 'Shareable link'],
    href: '/taleem/cv',
    icon: 'graphic_eq',
    why: 'No typing. Just speak and get hired.',
  },
  {
    title: 'Exam Prep',
    subtitle: 'Topic-wise practice',
    items: ['AI quizzes', 'Smart revision'],
    href: '/taleem/exam',
    icon: 'local_library',
    why: 'Study smarter, not harder.',
  },
] as const

export default function TaleemHubPage() {
  const { t } = useI18n()
  const [openFeature, setOpenFeature] = useState<'Jobs' | 'Voice CV' | 'Exam Prep' | null>(null)
  const [jobLocation, setJobLocation] = useState('Srinagar')
  const [voiceMode, setVoiceMode] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [examTopic, setExamTopic] = useState('JKSSB - General Awareness')

  const jobMatches = useMemo(
    () => [
      { title: 'Agri Field Coordinator', org: 'Pampore Co-Op', match: 86, location: 'Pampore' },
      { title: 'Data Entry Assistant', org: 'Srinagar Hub', match: 74, location: 'Srinagar' },
      { title: 'Supply Chain Intern', org: 'Kashmir Traders', match: 69, location: 'Baramulla' },
    ],
    [],
  )

  const quizItems = useMemo(
    () => [
      { q: 'What is the capital of Jammu & Kashmir (summer)?', a: 'Srinagar' },
      { q: 'Which river is known as the lifeline of Kashmir?', a: 'Jhelum' },
      { q: 'What does RTI stand for?', a: 'Right to Information' },
    ],
    [],
  )

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
            <button
              key={f.title}
              type="button"
              onClick={() => setOpenFeature(f.title)}
              className="group bg-[var(--color-primary-container)] text-[var(--color-on-primary)] p-8 border-l-4 border-[var(--color-secondary)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] text-left"
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
              <p className="mt-6 text-xs uppercase tracking-widest text-[var(--color-secondary-fixed-dim)]">
                {f.why}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* News Corner */}
      <section className="px-8 md:px-24 pb-20">
        <NewsCorner field="taleem" title="Taleem Live Updates" />
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

      {openFeature ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.55)] px-4 sm:px-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-5xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 p-6 md:p-10 border-b border-[var(--color-outline-variant)]">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-3">
                  Taleem Tools
                </p>
                <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-[var(--color-primary)]">
                  {openFeature}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenFeature(null)}
                className="raasta-btn-secondary text-sm self-start"
              >
                Close
              </button>
            </div>

            {openFeature === 'Jobs' && (
              <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                    Smart matches update as your profile grows. Apply in a single tap using your saved profile.
                  </p>
                  <label className="text-xs uppercase tracking-widest text-[var(--color-secondary)]">
                    Location
                  </label>
                  <input
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="raasta-input w-full mt-2"
                    placeholder="Enter your district"
                  />
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="bg-[var(--color-surface-container-low)] p-4 border border-[var(--color-outline-variant)]">
                      <p className="font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">
                        AI Suggestions
                      </p>
                      <p>Agri assistant, Warehouse planner, Community educator</p>
                    </div>
                    <div className="bg-[var(--color-surface-container-low)] p-4 border border-[var(--color-outline-variant)]">
                      <p className="font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">
                        One-Click Apply
                      </p>
                      <p>Uses your saved CV + Voice intro to fill the form instantly.</p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="space-y-4">
                    {jobMatches.map((job) => (
                      <div
                        key={job.title}
                        className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <p className="font-headline text-lg">{job.title}</p>
                          <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mt-1">
                            {job.org} • {job.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[var(--color-secondary)] font-bold">
                            {job.match}% match
                          </span>
                          <button className="raasta-btn-primary">Apply</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {openFeature === 'Voice CV' && (
              <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                    Record once, we format it into a clean CV and shareable profile link.
                  </p>
                  <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-5">
                    <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">
                      Language
                    </p>
                    <div className="flex gap-2">
                      {['Urdu', 'Kashmiri', 'English'].map((lang) => (
                        <span
                          key={lang}
                          className="border border-[var(--color-outline-variant)] px-3 py-1 text-xs uppercase tracking-widest"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] p-6 border border-[var(--color-outline-variant)]">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary-fixed)] mb-4">
                      Voice Intro
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setVoiceMode((prev) =>
                            prev === 'recording' ? 'processing' : 'recording',
                          )
                        }
                        className="w-14 h-14 rounded-full bg-[var(--color-secondary)] text-[var(--color-on-secondary)] flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined">
                          {voiceMode === 'recording' ? 'stop' : 'mic'}
                        </span>
                      </button>
                      <div>
                        <p className="font-headline text-lg">
                          {voiceMode === 'recording'
                            ? 'Recording...'
                            : voiceMode === 'processing'
                            ? 'Processing voice to CV'
                            : 'Tap to record'}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-[var(--color-secondary-fixed-dim)]">
                          Multilingual supported
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceMode('processing')}
                      className="mt-6 w-full bg-[var(--color-secondary)] text-[var(--color-on-secondary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-opacity-90 transition-colors"
                    >
                      Generate CV & Profile
                    </button>
                    <div className="mt-6 bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] p-4 text-sm border border-[var(--color-outline-variant)]">
                      Shareable profile link will appear here after generation.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {openFeature === 'Exam Prep' && (
              <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                    Choose a topic and start a focused practice session with smart revision.
                  </p>
                  <label className="text-xs uppercase tracking-widest text-[var(--color-secondary)]">
                    Topic
                  </label>
                  <select
                    value={examTopic}
                    onChange={(e) => setExamTopic(e.target.value)}
                    className="raasta-input w-full mt-2"
                  >
                    <option>JKSSB - General Awareness</option>
                    <option>Police Recruitment - Aptitude</option>
                    <option>Class 12 - Biology</option>
                  </select>
                  <div className="mt-6 bg-[var(--color-surface-container-low)] p-4 border border-[var(--color-outline-variant)] text-sm">
                    Smart revision will prioritize weak areas after your first quiz.
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-6">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
                      AI Quiz
                    </p>
                    <div className="space-y-4">
                      {quizItems.map((item) => (
                        <div
                          key={item.q}
                          className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4 text-sm"
                        >
                          <p className="font-headline text-base text-[var(--color-primary)]">{item.q}</p>
                          <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                            Answer: {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button className="mt-6 w-full bg-[var(--color-secondary)] text-[var(--color-on-secondary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-opacity-90 transition-colors">
                      Start Practice
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Footer Continuity */}
      <section className="px-8 md:px-24 pb-24">
        <div className="border-t border-[var(--color-outline-variant)] pt-6 text-[10px] uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
          {t('taleem.lead')}
        </div>
      </section>
    </main>
  )
}
