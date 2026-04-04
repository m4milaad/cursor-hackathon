'use client'

import { useI18n } from '@/lib/i18n/context'
import { NewsCorner } from '@/components/NewsCorner'
import Link from 'next/link'
import { useCallback, useEffect, useId, useState } from 'react'
import type { LiveJob } from '@/app/api/taleem/jobs/route'
import { VoiceCvPanel } from '@/components/VoiceCvPanel'
import { ExamPrepPanel } from '@/components/ExamPrepPanel'
import { GoalGuidancePanel } from '@/components/GoalGuidancePanel'

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

type MatchRow = {
  jobId: string
  title: string
  company: string
  location: string
  applyLink: string
  matchScore: number
  matchingSkills: string[]
  missingSkills: string[]
  recommendation: string
}

const DEVICE_KEY = 'raasta-job-device'

export default function TaleemHubPage() {
  const { t } = useI18n()
  const formId = useId()
  const [openFeature, setOpenFeature] = useState<'Jobs' | 'Voice CV' | 'Exam Prep' | null>(null)
  const [jobMatches, setJobMatches] = useState<LiveJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)

  // --- Advanced Job System state ---
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [locationScope, setLocationScope] = useState<'kashmir' | 'india' | 'global'>('kashmir')
  const [jobTypeFilter, setJobTypeFilter] = useState<'any' | 'remote' | 'onsite' | 'hybrid'>('any')
  const [workTypeFilter, setWorkTypeFilter] = useState<'any' | 'full_time' | 'part_time' | 'internship' | 'freelance'>('any')
  const [skillInput, setSkillInput] = useState('')
  const [skillTags, setSkillTags] = useState<string[]>([])
  const [aiMatches, setAiMatches] = useState<MatchRow[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [jobMessage, setJobMessage] = useState<string | null>(null)
  const [jobPhase, setJobPhase] = useState<'idle' | 'scraping' | 'matching' | 'done'>('idle')

  // Init device ID
  useEffect(() => {
    let id = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_KEY) : null
    if (!id) {
      id = globalThis.crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    setDeviceId(id)
  }, [])

  // Auto-load jobs when Jobs modal opens
  useEffect(() => {
    if (openFeature === 'Jobs' && jobMatches.length === 0 && !jobsLoading) {
      setJobsLoading(true)
      setJobMessage('Fetching jobs from scraped sources…')
      setJobPhase('scraping')
      fetch(`/api/taleem/jobs?location=${encodeURIComponent(locationScope)}&job_type=${jobTypeFilter}&work_type=${workTypeFilter}&live=1`)
        .then(r => r.json())
        .then(d => {
          if (d.jobs && d.jobs.length > 0) {
            setJobMatches(d.jobs)
            setJobMessage(`${d.jobs.length} jobs loaded from ${d.source || 'store'}`)
            setJobPhase('done')
          } else {
            setJobMessage(d.scrapeErrors?.length ? `Scrape issues: ${d.scrapeErrors.join('; ')}` : 'No jobs found yet. Ensure FIRECRAWL_API_KEY is set.')
            setJobPhase('idle')
          }
        })
        .catch(() => { setJobMessage('Error fetching jobs.'); setJobPhase('idle') })
        .finally(() => setJobsLoading(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFeature])

  // Refetch jobs when filters change (debounced)
  const refetchJobs = useCallback(async () => {
    setJobsLoading(true)
    setJobMessage('Applying filters…')
    try {
      const skills = skillTags.length > 0 ? `&skills=${encodeURIComponent(skillTags.join(','))}` : ''
      const r = await fetch(`/api/taleem/jobs?location=${encodeURIComponent(locationScope)}&job_type=${jobTypeFilter}&work_type=${workTypeFilter}${skills}&live=1`)
      const d = await r.json()
      if (d.jobs) {
        setJobMatches(d.jobs)
        setJobMessage(d.jobs.length > 0 ? `${d.jobs.length} jobs match your filters` : 'No jobs match these filters.')
      }
    } catch { setJobMessage('Error fetching jobs.') }
    finally { setJobsLoading(false) }
  }, [locationScope, jobTypeFilter, workTypeFilter, skillTags])

  // Run AI matching
  const runAiMatch = useCallback(async () => {
    if (!deviceId) return
    setMatchLoading(true)
    setJobMessage('Running AI skill matching…')
    setJobPhase('matching')
    try {
      const r = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          skills: skillTags,
          location: locationScope,
          job_type: jobTypeFilter,
          work_type: workTypeFilter,
          limit: 12,
        }),
      })
      const d = await r.json()
      if (d.ok && d.data?.matches?.length) {
        setAiMatches(d.data.matches)
        setJobMessage(`${d.data.matches.length} AI-matched jobs ranked for you`)
        setJobPhase('done')
      } else {
        setAiMatches([])
        setJobMessage(d.error ?? 'AI matching returned no results.')
        setJobPhase('done')
      }
    } catch { setJobMessage('AI matching failed.'); setJobPhase('idle') }
    finally { setMatchLoading(false) }
  }, [deviceId, skillTags, locationScope, jobTypeFilter, workTypeFilter])

  // Upload resume
  const uploadResume = useCallback(async (file: File | null) => {
    if (!file || !deviceId) return
    setUploadLoading(true)
    setJobMessage('Parsing resume with AI…')
    try {
      const fd = new FormData()
      fd.set('file', file)
      fd.set('deviceId', deviceId)
      const r = await fetch('/api/upload-resume', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.ok && d.data?.skills?.length) {
        setSkillTags(prev => [...new Set([...prev, ...d.data.skills])])
        setJobMessage(`Resume parsed! ${d.data.skills.length} skills extracted. Run AI Match to see personalized results.`)
        // Also save as manual skills
        await fetch('/api/manual-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, skills: d.data.skills }),
        })
      } else {
        setJobMessage(d.error ?? 'Resume parsing failed.')
      }
    } catch { setJobMessage('Resume upload error.') }
    finally { setUploadLoading(false) }
  }, [deviceId])

  // Add skill tag
  const addSkillTag = () => {
    const val = skillInput.trim()
    if (val && !skillTags.includes(val)) {
      setSkillTags(prev => [...prev, val])
    }
    setSkillInput('')
  }

  // Exam prep is now handled by ExamPrepPanel component

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
              Tell AI your goal and get a personalized roadmap, business plan, scholarship list, or learning resources — all tailored for you.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] p-6 md:p-8">
              <GoalGuidancePanel />
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
              <div className="p-6 md:p-10">
                {/* Status bar */}
                {jobMessage && (
                  <div className="mb-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] px-4 py-3 flex items-center gap-3">
                    {(jobsLoading || matchLoading || uploadLoading) && (
                      <span className="w-4 h-4 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                    <span className="text-sm text-[var(--color-on-surface-variant)]">{jobMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Panel: Controls */}
                  <div className="lg:col-span-5 space-y-5">
                    <p className="text-sm text-[var(--color-on-surface-variant)]">
                      Upload your resume for AI skill extraction, or add skills manually. Then hit <strong>AI Match</strong> to get personalized job rankings.
                    </p>

                    {/* Resume Upload */}
                    <div className="bg-[var(--color-surface-container-low)] border border-dashed border-[var(--color-secondary)] p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <span className="material-symbols-outlined text-[var(--color-secondary)] text-2xl">upload_file</span>
                        <div>
                          <p className="font-label text-xs uppercase tracking-widest text-[var(--color-secondary)]">
                            {uploadLoading ? 'Parsing Resume…' : 'Upload Resume (PDF / DOCX)'}
                          </p>
                          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">AI extracts skills, experience &amp; roles</p>
                        </div>
                        <input
                          id={formId}
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          disabled={uploadLoading || !deviceId}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            void uploadResume(f ?? null)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Location</label>
                        <select
                          className="raasta-input w-full text-sm"
                          value={locationScope}
                          onChange={(e) => setLocationScope(e.target.value as typeof locationScope)}
                        >
                          <option value="kashmir">Kashmir</option>
                          <option value="india">India</option>
                          <option value="global">Global</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Job Type</label>
                        <select
                          className="raasta-input w-full text-sm"
                          value={jobTypeFilter}
                          onChange={(e) => setJobTypeFilter(e.target.value as typeof jobTypeFilter)}
                        >
                          <option value="any">Any</option>
                          <option value="remote">Remote</option>
                          <option value="onsite">On-site</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Work Type</label>
                        <select
                          className="raasta-input w-full text-sm"
                          value={workTypeFilter}
                          onChange={(e) => setWorkTypeFilter(e.target.value as typeof workTypeFilter)}
                        >
                          <option value="any">Any</option>
                          <option value="full_time">Full-time</option>
                          <option value="part_time">Part-time</option>
                          <option value="internship">Internship</option>
                          <option value="freelance">Freelance</option>
                        </select>
                      </div>
                    </div>

                    {/* Skills Input */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Your Skills</label>
                      <div className="flex gap-2">
                        <input
                          className="raasta-input flex-1 text-sm"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag() } }}
                          placeholder="e.g. React, Python, Teaching…"
                        />
                        <button
                          type="button"
                          onClick={addSkillTag}
                          className="bg-[var(--color-secondary)] text-[var(--color-on-secondary)] px-3 py-1 text-xs uppercase tracking-widest"
                        >
                          Add
                        </button>
                      </div>
                      {skillTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {skillTags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 bg-[var(--color-primary-container)] text-[var(--color-on-primary)] px-3 py-1 text-xs"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => setSkillTags(prev => prev.filter(t => t !== tag))}
                                className="hover:text-[var(--color-secondary)] text-sm leading-none">
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void refetchJobs()}
                        disabled={jobsLoading}
                        className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-5 py-2.5 font-label text-[10px] uppercase tracking-[0.15em] hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">search</span>
                        {jobsLoading ? 'Loading…' : 'Fetch Jobs'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void runAiMatch()}
                        disabled={matchLoading || !deviceId}
                        className="border border-[var(--color-secondary)] text-[var(--color-secondary)] px-5 py-2.5 font-label text-[10px] uppercase tracking-[0.15em] hover:bg-[var(--color-secondary)] hover:text-[var(--color-on-secondary)] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">psychology</span>
                        {matchLoading ? 'Matching…' : 'AI Match'}
                      </button>
                    </div>
                  </div>

                  {/* Right Panel: Results */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* AI Matches (if available) */}
                    {aiMatches.length > 0 && (
                      <div>
                        <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-3">
                          AI-Ranked Matches
                        </h4>
                        <div className="space-y-3">
                          {aiMatches.map((m) => (
                            <div
                              key={m.jobId}
                              className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-headline text-lg text-[var(--color-primary)]">{m.title}</p>
                                  <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mt-1">
                                    {m.company} • {m.location}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xl font-bold text-[var(--color-secondary)]">
                                    {m.matchScore}%
                                  </span>
                                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">match</p>
                                </div>
                              </div>
                              <p className="text-sm text-[var(--color-on-surface-variant)] mt-3">{m.recommendation}</p>
                              <div className="flex flex-wrap gap-4 mt-3">
                                {m.matchingSkills?.length > 0 && (
                                  <p className="text-xs">
                                    <span className="text-green-700 dark:text-green-400">✓ </span>
                                    {m.matchingSkills.join(', ')}
                                  </p>
                                )}
                                {m.missingSkills?.length > 0 && (
                                  <p className="text-xs">
                                    <span className="text-amber-700 dark:text-amber-300">↑ Grow: </span>
                                    {m.missingSkills.join(', ')}
                                  </p>
                                )}
                              </div>
                              <a
                                href={m.applyLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-block raasta-btn-primary text-xs"
                              >
                                Apply →
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scraped Job Listings */}
                    <div>
                      <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-3">
                        {aiMatches.length > 0 ? 'All Scraped Jobs' : 'Jobs from Live Sources'}
                      </h4>
                      {jobsLoading && jobMatches.length === 0 && (
                        <div className="flex items-center gap-3 py-8">
                          <span className="w-5 h-5 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-[var(--color-on-surface-variant)]">Scraping job boards…</span>
                        </div>
                      )}
                      <div className="space-y-3">
                        {jobMatches.map((job) => (
                          <div
                            key={job.id || job.title + job.org}
                            className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                          >
                            <div className="min-w-0">
                              <p className="font-headline text-lg">{job.title}</p>
                              <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mt-1">
                                {job.org} • {job.location}
                              </p>
                              {job.skills && (
                                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 truncate">
                                  Skills: {job.skills}
                                </p>
                              )}
                            </div>
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noreferrer"
                              className="raasta-btn-primary text-xs shrink-0"
                            >
                              Apply
                            </a>
                          </div>
                        ))}
                        {jobMatches.length === 0 && !jobsLoading && (
                          <div className="text-sm text-[var(--color-on-surface-variant)] py-6 text-center border border-dashed border-[var(--color-outline-variant)] p-6">
                            <span className="material-symbols-outlined text-3xl mb-2 block opacity-40">work_off</span>
                            No jobs loaded yet. Click <strong>Fetch Jobs</strong> to scrape live job boards, or upload a resume and click <strong>AI Match</strong>.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {openFeature === 'Voice CV' && (
              <VoiceCvPanel deviceId={deviceId} />
            )}

            {openFeature === 'Exam Prep' && (
              <ExamPrepPanel />
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
