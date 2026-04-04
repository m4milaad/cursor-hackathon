'use client'

import { PageIntro } from '@/components/PageIntro'
import { useWhisperRecorder } from '@/hooks/useWhisperRecorder'
import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

const DEVICE_KEY = 'raasta-job-device'

type CvJson = {
  name: string
  summary: string
  skills: string[]
  experience: string[]
  projects: string[]
  education: string[]
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

export default function CvPage() {
  const { t } = useI18n()
  const whisper = useWhisperRecorder()
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [langHint, setLangHint] = useState<'auto' | 'ur' | 'en' | 'hi'>('auto')
  const [transcript, setTranscript] = useState('')
  const [detectedLang, setDetectedLang] = useState<string | null>(null)
  const [translateEn, setTranslateEn] = useState(false)
  const [cvBusy, setCvBusy] = useState(false)
  const [cvData, setCvData] = useState<CvJson | null>(null)
  const [improvements, setImprovements] = useState<string[]>([])
  const [profilePath, setProfilePath] = useState<string | null>(null)
  const [matchRows, setMatchRows] = useState<MatchRow[]>([])
  const [matchBusy, setMatchBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let id = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_KEY) : null
    if (!id) {
      id = globalThis.crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    setDeviceId(id)
  }, [])

  const onRecordDone = useCallback(
    (result: { transcript: string; language: string; error?: string }) => {
      if (result.transcript) {
        setTranscript((prev) =>
          prev.trim() ? `${prev.trim()}\n${result.transcript}` : result.transcript,
        )
      }
      setDetectedLang(result.language)
      if (result.error && result.error !== 'empty') {
        setMsg(result.error)
      }
    },
    [],
  )

  const toggleRecord = () => {
    setMsg(null)
    whisper.setError(null)
    if (whisper.recording) {
      whisper.stop()
      return
    }
    void whisper.record(langHint, onRecordDone)
  }

  const generateCv = async () => {
    if (!transcript.trim() || transcript.trim().length < 8) {
      setMsg('Speak or type a bit more before generating your CV.')
      return
    }
    setCvBusy(true)
    setMsg(null)
    setCvData(null)
    setImprovements([])
    setProfilePath(null)
    try {
      const r = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          language: langHint === 'auto' ? detectedLang ?? 'auto' : langHint,
          deviceId: deviceId ?? undefined,
          translateToEnglish: translateEn,
        }),
      })
      const d = (await r.json()) as {
        ok?: boolean
        data?: {
          cv?: CvJson
          improvements?: string[]
          profilePath?: string
        }
        error?: string
      }
      if (d.ok && d.data?.cv) {
        setCvData(d.data.cv)
        setImprovements(d.data.improvements ?? [])
        setProfilePath(d.data.profilePath ?? null)
        setMsg('CV saved. Share your public link or find jobs below.')
      } else {
        setMsg(d.error ?? 'Could not generate CV.')
      }
    } catch {
      setMsg('Network error.')
    } finally {
      setCvBusy(false)
    }
  }

  const runJobMatch = async () => {
    if (!deviceId) return
    setMatchBusy(true)
    setMsg(null)
    try {
      const r = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          location: 'india',
          job_type: 'any',
          work_type: 'any',
          limit: 8,
        }),
      })
      const d = (await r.json()) as {
        ok?: boolean
        data?: { matches?: MatchRow[] }
        error?: string
      }
      if (d.ok && d.data?.matches) {
        setMatchRows(d.data.matches)
        if (d.data.matches.length === 0) {
          setMsg('No job matches yet — add jobs to the database from Naukri tools.')
        }
      } else {
        setMatchRows([])
        setMsg(d.error ?? 'Job matching failed.')
      }
    } catch {
      setMsg('Job matching request failed.')
    } finally {
      setMatchBusy(false)
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
              title={t('cv.title')}
            >
              <p>{t('cv.lead')}</p>
            </PageIntro>
            <p className="mt-4 text-sm text-[var(--raasta-muted)] max-w-xl">
              Record in <strong>English</strong>, <strong>Urdu</strong>, or{' '}
              <strong>Kashmiri</strong> — Whisper turns audio into text, then AI builds
              your CV (nothing is hardcoded). You get a shareable profile link and can
              match jobs from your skills.
            </p>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <div className="raasta-card p-6 md:p-8 max-w-4xl space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="text-[var(--raasta-muted)]">Speech language hint</span>
              <select
                className="mt-1 w-full border border-[var(--raasta-border)] bg-transparent px-3 py-2 text-sm"
                value={langHint}
                onChange={(e) =>
                  setLangHint(e.target.value as typeof langHint)
                }
              >
                <option value="auto">Auto-detect</option>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="hi">Hindi / Kashmiri (closest)</option>
              </select>
            </label>
            <label className="flex items-end gap-2 pb-1 cursor-pointer">
              <input
                type="checkbox"
                checked={translateEn}
                onChange={(e) => setTranslateEn(e.target.checked)}
              />
              <span className="text-sm text-[var(--raasta-muted)]">
                Also generate English CV for public page
              </span>
            </label>
          </div>

          <div>
            <button
              type="button"
              className={`w-full sm:w-auto px-8 py-4 text-sm uppercase tracking-[0.2em] border-2 transition-colors ${
                whisper.recording
                  ? 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-on-surface)]'
                  : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)]'
              }`}
              disabled={whisper.processing || cvBusy}
              onClick={toggleRecord}
            >
              {whisper.processing
                ? 'Transcribing…'
                : whisper.recording
                  ? 'Tap to stop'
                  : 'Tap to record'}
            </button>
            {detectedLang && (
              <p className="mt-2 text-xs text-[var(--raasta-muted)]">
                Last detect: {detectedLang}
              </p>
            )}
          </div>

          <label className="block text-sm">
            <span className="text-[var(--raasta-muted)]">Transcript (edit freely)</span>
            <textarea
              className="raasta-input mt-1 min-h-[160px] w-full resize-y"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech appears here, or type your story directly…"
            />
          </label>

          {whisper.error ? (
            <p className="text-sm text-[var(--color-error)]">{whisper.error}</p>
          ) : null}
          {msg ? (
            <p className="text-sm text-[var(--color-secondary)]">{msg}</p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="raasta-btn-primary"
              disabled={cvBusy || whisper.recording || whisper.processing}
              onClick={() => void generateCv()}
            >
              {cvBusy ? 'Building CV…' : 'Generate CV with AI'}
            </button>
            {profilePath ? (
              <Link
                href={profilePath}
                className="raasta-btn-secondary text-sm inline-flex items-center"
                target="_blank"
                rel="noreferrer"
              >
                Open public profile
              </Link>
            ) : null}
            <button
              type="button"
              className="raasta-btn-secondary text-sm"
              disabled={matchBusy || !deviceId}
              onClick={() => void runJobMatch()}
            >
              {matchBusy ? 'Matching…' : 'Match jobs from this CV'}
            </button>
          </div>

          {cvData ? (
            <div className="mt-8 space-y-6 border-t border-[var(--raasta-border)] pt-8">
              <h2 className="font-headline text-xl text-[var(--color-primary)]">
                {cvData.name || 'Your CV'}
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {cvData.summary}
              </p>
              <CvList title="Skills" items={cvData.skills} />
              <CvList title="Experience" items={cvData.experience} />
              <CvList title="Projects" items={cvData.projects} />
              <CvList title="Education" items={cvData.education} />
            </div>
          ) : null}

          {improvements.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm uppercase tracking-[0.15em] text-[var(--color-secondary)]">
                AI suggestions
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-[var(--raasta-muted)] space-y-1">
                {improvements.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {matchRows.length > 0 ? (
            <div className="mt-8 border-t border-[var(--raasta-border)] pt-8">
              <h3 className="font-headline text-lg text-[var(--color-primary)] mb-3">
                Job matches
              </h3>
              <ul className="space-y-3">
                {matchRows.map((m) => (
                  <li key={m.jobId} className="raasta-card p-4 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-[var(--color-primary)]">
                        {m.title}
                      </span>
                      <span className="text-[var(--color-secondary)]">
                        {m.matchScore}%
                      </span>
                    </div>
                    <p className="text-[var(--raasta-muted)]">{m.company}</p>
                    <p className="text-xs mt-1">{m.recommendation}</p>
                    <a
                      href={m.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-secondary)]"
                    >
                      Apply
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

function CvList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null
  return (
    <div>
      <h3 className="text-sm font-medium text-[var(--color-primary)] border-b border-[var(--raasta-border)] pb-1">
        {title}
      </h3>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((x) => (
          <li key={x}>• {x}</li>
        ))}
      </ul>
    </div>
  )
}
