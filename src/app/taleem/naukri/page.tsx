'use client'

import { PageIntro } from '@/components/PageIntro'
import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'
import { useCallback, useEffect, useId, useState } from 'react'

const DEVICE_KEY = 'raasta-job-device'

type JobRow = {
  title: string
  org: string
  location: string
  match: number
  url: string
  skills: string
  source: string
}

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

export default function NaukriPage() {
  const { t } = useI18n()
  const formId = useId()
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [locationScope, setLocationScope] = useState<
    'kashmir' | 'india' | 'global' | 'near_me'
  >('kashmir')
  const [jobType, setJobType] = useState<'any' | 'remote' | 'onsite' | 'hybrid'>(
    'any',
  )
  const [workType, setWorkType] = useState<
    'any' | 'full_time' | 'part_time' | 'internship' | 'freelance'
  >('any')
  const [skillInput, setSkillInput] = useState('')
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null,
  )

  useEffect(() => {
    let id = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_KEY) : null
    if (!id) {
      id = globalThis.crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    setDeviceId(id)
  }, [])

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    params.set('location', locationScope)
    params.set('job_type', jobType)
    params.set('work_type', workType)
    const skills = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (skills.length) params.set('skills', skills.join(','))
    if (locationScope === 'near_me' && latLng) {
      params.set('lat', String(latLng.lat))
      params.set('lng', String(latLng.lng))
    }
    params.set('live', '1')
    return params.toString()
  }, [locationScope, jobType, workType, skillInput, latLng])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const r = await fetch(`/api/jobs?${buildQuery()}`)
      const d = (await r.json()) as {
        ok?: boolean
        data?: { jobs?: JobRow[]; scrapeErrors?: string[] }
      }
      if (d.ok && d.data?.jobs) {
        setJobs(d.data.jobs)
        if (d.data.jobs.length === 0) {
          setMessage(
            'No jobs in database yet. Ensure FIRECRAWL_API_KEY and run a scrape (cron or /api/cron/scrape-jobs).',
          )
        }
      } else {
        setJobs([])
        setMessage('Could not load jobs. Check Convex URL and keys.')
      }
    } catch {
      setMessage('Network error loading jobs.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [buildQuery])

  const requestNearMe = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not available in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationScope('near_me')
        setMessage('Location captured. Fetch jobs to use Near me.')
      },
      () => setMessage('Could not read your location. Allow permission or pick a region.'),
    )
  }

  const runMatch = async () => {
    if (!deviceId) return
    setMatchLoading(true)
    setMessage(null)
    try {
      const skills = skillInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const r = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          skills,
          location: locationScope,
          job_type: jobType,
          work_type: workType,
          lat: latLng?.lat,
          lng: latLng?.lng,
          limit: 12,
        }),
      })
      const d = (await r.json()) as {
        ok?: boolean
        data?: { matches?: MatchRow[] }
        error?: string
      }
      if (d.ok && d.data?.matches) {
        setMatches(d.data.matches)
        if (d.data.matches.length === 0) {
          setMessage('No matches. Try loading jobs first or widening filters.')
        }
      } else {
        setMatches([])
        setMessage(d.error ?? 'Matching failed.')
      }
    } catch {
      setMessage('Network error during matching.')
      setMatches([])
    } finally {
      setMatchLoading(false)
    }
  }

  const uploadResume = async (file: File | null) => {
    if (!file || !deviceId) return
    setUploadLoading(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.set('file', file)
      fd.set('deviceId', deviceId)
      const r = await fetch('/api/upload-resume', { method: 'POST', body: fd })
      const d = (await r.json()) as {
        ok?: boolean
        data?: { skills?: string[] }
        error?: string
      }
      if (d.ok && d.data?.skills) {
        setSkillInput(d.data.skills.join(', '))
        setMessage('Resume parsed. Skills updated — run AI match or save manual skills.')
        await fetch('/api/manual-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, skills: d.data.skills }),
        })
      } else {
        setMessage(d.error ?? 'Resume upload failed.')
      }
    } catch {
      setMessage('Resume upload failed.')
    } finally {
      setUploadLoading(false)
    }
  }

  const saveManualSkills = async () => {
    if (!deviceId) return
    const skills = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    setLoading(true)
    try {
      await fetch('/api/manual-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, skills }),
      })
      setMessage('Skills saved on this device.')
    } catch {
      setMessage('Could not save skills.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <section className="px-8 md:px-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <PageIntro
              backHref="/taleem"
              backLabel={t('nav.backTaleem')}
              title={t('naukri.title')}
            >
              <p>{t('naukri.lead')}</p>
            </PageIntro>
            <p className="mt-4 text-sm text-[var(--raasta-muted)] max-w-xl">
              Upload a resume for AI skill extraction, set filters, then load scraped
              jobs and run AI matching — no hardcoded listings.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="raasta-card p-5 border border-[var(--raasta-border)]">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Your profile
              </p>
              <p className="mt-2 text-sm text-[var(--raasta-muted)]">
                Device ID:{' '}
                <code className="text-xs break-all">
                  {deviceId ?? '…'}
                </code>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-8">
        <div className="raasta-card p-6 max-w-4xl space-y-5">
          <h2 className="font-headline text-xl text-[var(--color-primary)]">
            Filters
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="text-[var(--raasta-muted)]">Location</span>
              <select
                className="mt-1 w-full border border-[var(--raasta-border)] bg-transparent px-3 py-2 text-sm"
                value={locationScope}
                onChange={(e) =>
                  setLocationScope(e.target.value as typeof locationScope)
                }
              >
                <option value="kashmir">Kashmir</option>
                <option value="india">India</option>
                <option value="global">Global</option>
                <option value="near_me">Near me</option>
              </select>
            </label>
            <div className="flex flex-col gap-2 justify-end">
              <button
                type="button"
                className="text-sm border border-[var(--raasta-border)] px-3 py-2 hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-colors"
                onClick={requestNearMe}
              >
                Use my location (Near me)
              </button>
              {latLng && (
                <span className="text-xs text-[var(--raasta-muted)]">
                  {latLng.lat.toFixed(3)}, {latLng.lng.toFixed(3)}
                </span>
              )}
            </div>
            <label className="block text-sm">
              <span className="text-[var(--raasta-muted)]">Job type</span>
              <select
                className="mt-1 w-full border border-[var(--raasta-border)] bg-transparent px-3 py-2 text-sm"
                value={jobType}
                onChange={(e) =>
                  setJobType(e.target.value as typeof jobType)
                }
              >
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[var(--raasta-muted)]">Work type</span>
              <select
                className="mt-1 w-full border border-[var(--raasta-border)] bg-transparent px-3 py-2 text-sm"
                value={workType}
                onChange={(e) =>
                  setWorkType(e.target.value as typeof workType)
                }
              >
                <option value="any">Any</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance / Contract</option>
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-[var(--raasta-muted)]">
              Skills (comma-separated, or from resume)
            </span>
            <input
              className="mt-1 w-full border border-[var(--raasta-border)] bg-transparent px-3 py-2 text-sm"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React, Python, Teaching"
            />
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-4 py-2 text-xs uppercase tracking-[0.15em]"
              disabled={loading}
              onClick={() => void fetchJobs()}
            >
              {loading ? 'Loading…' : 'Load jobs from database'}
            </button>
            <button
              type="button"
              className="border border-[var(--raasta-border)] px-4 py-2 text-xs uppercase tracking-[0.15em]"
              disabled={matchLoading || !deviceId}
              onClick={() => void runMatch()}
            >
              {matchLoading ? 'Matching…' : 'AI match jobs'}
            </button>
            <button
              type="button"
              className="border border-[var(--raasta-border)] px-4 py-2 text-xs uppercase tracking-[0.15em]"
              disabled={loading || !deviceId}
              onClick={() => void saveManualSkills()}
            >
              Save skills
            </button>
            <label className="text-xs uppercase tracking-[0.15em] cursor-pointer border border-dashed border-[var(--raasta-border)] px-4 py-2">
              {uploadLoading ? 'Parsing…' : 'Upload resume'}
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
          {message && (
            <p className="text-sm text-[var(--color-secondary)]">{message}</p>
          )}
        </div>
      </section>

      <section className="px-8 md:px-24 pb-12 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-headline text-lg text-[var(--color-primary)] mb-3">
            Filtered jobs (scraped)
          </h3>
          <ul className="space-y-3">
            {jobs.map((j) => (
              <li key={j.url + j.title} className="raasta-card p-4 text-sm">
                <p className="font-medium text-[var(--color-primary)]">
                  {j.title}
                </p>
                <p className="text-[var(--raasta-muted)]">{j.org}</p>
                <p className="text-xs mt-1">{j.location}</p>
                {j.skills ? (
                  <p className="text-xs mt-2 text-[var(--raasta-muted)]">
                    Skills: {j.skills}
                  </p>
                ) : null}
                <a
                  href={j.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-xs uppercase tracking-[0.15em] text-[var(--color-secondary)]"
                >
                  Apply
                </a>
              </li>
            ))}
            {jobs.length === 0 && !loading && (
              <li className="text-sm text-[var(--raasta-muted)]">
                No rows yet. Use &quot;Load jobs&quot; (triggers ingest when DB is
                empty and Firecrawl is configured).
              </li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="font-headline text-lg text-[var(--color-primary)] mb-3">
            AI-ranked matches
          </h3>
          <ul className="space-y-3">
            {matches.map((m) => (
              <li key={m.jobId} className="raasta-card p-4 text-sm">
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-[var(--color-primary)]">
                    {m.title}
                  </p>
                  <span className="text-[var(--color-secondary)] shrink-0">
                    {m.matchScore}%
                  </span>
                </div>
                <p className="text-[var(--raasta-muted)]">{m.company}</p>
                <p className="text-xs mt-1">{m.location}</p>
                <p className="mt-2 text-xs">{m.recommendation}</p>
                {m.matchingSkills?.length ? (
                  <p className="text-xs mt-1 text-green-700 dark:text-green-400">
                    Match: {m.matchingSkills.join(', ')}
                  </p>
                ) : null}
                {m.missingSkills?.length ? (
                  <p className="text-xs mt-1 text-amber-800 dark:text-amber-200">
                    Grow: {m.missingSkills.join(', ')}
                  </p>
                ) : null}
                <a
                  href={m.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-xs uppercase tracking-[0.15em] text-[var(--color-secondary)]"
                >
                  Apply
                </a>
              </li>
            ))}
            {matches.length === 0 && !matchLoading && (
              <li className="text-sm text-[var(--raasta-muted)]">
                Run AI match after loading jobs and adding skills or a resume.
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <p className="text-sm text-[var(--raasta-muted)]">
          APIs:{' '}
          <code className="text-xs">GET /api/jobs</code>,{' '}
          <code className="text-xs">POST /api/upload-resume</code>,{' '}
          <code className="text-xs">POST /api/match-jobs</code>,{' '}
          <code className="text-xs">POST /api/manual-skills</code>,{' '}
          <code className="text-xs">GET /api/cron/scrape-jobs</code> (scheduled).
          Configure{' '}
          <Link href="/taleem" className="underline">
            Taleem
          </Link>{' '}
          hub jobs strip uses <code className="text-xs">/api/taleem/jobs</code>.
        </p>
      </section>
    </main>
  )
}
