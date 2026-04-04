'use client'

import { PageIntro } from '@/components/PageIntro'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DEVICE_KEY = 'raasta-exam-device'

type ExamRow = {
  examKey: string
  examName: string
  subject: string
  topic: string
  questionCount: number
}

type ClientQ = {
  id: string
  question: string
  options: string[]
  topic: string
}

export default function ExamPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [exams, setExams] = useState<ExamRow[]>([])
  const [examName, setExamName] = useState('NEET')
  const [subject, setSubject] = useState('Physics')
  const [topic, setTopic] = useState('Mechanics')
  const [scrapeBusy, setScrapeBusy] = useState(false)
  const [genBusy, setGenBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const [qCount, setQCount] = useState(10)
  const [durationMin, setDurationMin] = useState(60)
  const [mode, setMode] = useState<'full' | 'important' | 'repeated'>('full')
  const [difficulty, setDifficulty] = useState<
    'all' | 'easy' | 'medium' | 'hard' | 'mixed'
  >('mixed')

  const [testId, setTestId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<ClientQ[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [phase, setPhase] = useState<'setup' | 'exam' | 'result'>('setup')
  const [remaining, setRemaining] = useState(0)
  const [submitBusy, setSubmitBusy] = useState(false)
  const [result, setResult] = useState<{
    scorePercent: number
    correctCount: number
    totalCount: number
    weakTopics: string[]
    summary: string
    revisionSuggestions: string[]
  } | null>(null)
  const autoSubmitted = useRef(false)
  const prevRemaining = useRef<number | null>(null)

  useEffect(() => {
    let id = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_KEY) : null
    if (!id) {
      id = globalThis.crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    setDeviceId(id)
  }, [])

  const loadExams = useCallback(async () => {
    try {
      const r = await fetch('/api/exams')
      const d = (await r.json()) as {
        ok?: boolean
        data?: { exams?: ExamRow[] }
      }
      if (d.ok && d.data?.exams) setExams(d.data.exams)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    void loadExams()
  }, [loadExams])

  useEffect(() => {
    if (phase !== 'exam') return
    const t = setInterval(() => {
      setRemaining((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  const submitAnswers = useCallback(async () => {
    if (!testId || !deviceId || questions.length === 0) return
    if (autoSubmitted.current) return
    autoSubmitted.current = true
    setSubmitBusy(true)
    try {
      const ans = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? -1,
      }))
      const r = await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPublicId: testId,
          deviceId,
          answers: ans,
        }),
      })
      const d = (await r.json()) as {
        ok?: boolean
        data?: {
          scorePercent: number
          correctCount: number
          totalCount: number
          weakTopics: string[]
          summary: string
          revisionSuggestions: string[]
        }
      }
      if (d.ok && d.data) {
        setResult({
          scorePercent: d.data.scorePercent,
          correctCount: d.data.correctCount,
          totalCount: d.data.totalCount,
          weakTopics: d.data.weakTopics ?? [],
          summary: d.data.summary ?? '',
          revisionSuggestions: d.data.revisionSuggestions ?? [],
        })
        setPhase('result')
      } else {
        autoSubmitted.current = false
        setMsg('Submit failed.')
      }
    } catch {
      autoSubmitted.current = false
      setMsg('Submit network error.')
    } finally {
      setSubmitBusy(false)
    }
  }, [testId, deviceId, questions, answers])

  useEffect(() => {
    if (phase !== 'exam') {
      prevRemaining.current = null
      return
    }
    const prev = prevRemaining.current
    prevRemaining.current = remaining
    if (
      prev !== null &&
      prev > 0 &&
      remaining === 0 &&
      testId &&
      questions.length > 0 &&
      !autoSubmitted.current
    ) {
      void submitAnswers()
    }
  }, [remaining, phase, testId, questions.length, submitAnswers])

  const runScrape = async () => {
    setScrapeBusy(true)
    setMsg(null)
    try {
      const r = await fetch('/api/scrape-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examName, subject, topic }),
      })
      const d = (await r.json()) as { ok?: boolean; data?: { inserted?: number } }
      if (d.ok) {
        setMsg(
          `Ingested ${d.data?.inserted ?? 0} new question(s). You can generate a test.`,
        )
        void loadExams()
      } else {
        setMsg('Scrape did not complete. Check API keys (FIRECRAWL, OpenRouter/Gemini).')
      }
    } catch {
      setMsg('Network error during scrape.')
    } finally {
      setScrapeBusy(false)
    }
  }

  const runGenerate = async () => {
    setGenBusy(true)
    setMsg(null)
    try {
      const r = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName,
          subject,
          topic,
          questionCount: qCount,
          durationMinutes: durationMin,
          mode,
          difficulty,
        }),
      })
      const d = (await r.json()) as {
        ok?: boolean
        data?: {
          testId?: string
          durationSeconds?: number
          questions?: ClientQ[]
        }
        error?: string
      }
      if (d.ok && d.data?.testId && d.data.questions?.length) {
        autoSubmitted.current = false
        prevRemaining.current = null
        setTestId(d.data.testId)
        setRemaining(d.data.durationSeconds ?? durationMin * 60)
        setQuestions(d.data.questions)
        setAnswers({})
        setIndex(0)
        setPhase('exam')
        setResult(null)
      } else {
        setMsg(d.error ?? 'Could not generate test. Scrape questions first.')
      }
    } catch {
      setMsg('Network error.')
    } finally {
      setGenBusy(false)
    }
  }

  const manualSubmit = () => {
    autoSubmitted.current = false
    void submitAnswers()
  }

  const fmt = useMemo(() => {
    const m = Math.floor(remaining / 60)
    const s = remaining % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [remaining])

  const cur = questions[index]

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <section className="px-8 md:px-24 pb-12">
        <PageIntro
          backHref="/taleem"
          backLabel="Back to Taleem"
          title="Exam Prep"
        >
          <p>
            Dynamic engine: scrape real PYQ-style content, AI extracts & tags questions,
            then timed tests with AI feedback. No hardcoded question bank.
          </p>
        </PageIntro>
        <p className="mt-4 text-sm text-[var(--raasta-muted)] max-w-2xl">
          APIs:{' '}
          <code className="text-xs">GET /api/exams</code>,{' '}
          <code className="text-xs">POST /api/scrape-questions</code>,{' '}
          <code className="text-xs">POST /api/generate-test</code>,{' '}
          <code className="text-xs">POST /api/submit-test</code>,{' '}
          <code className="text-xs">GET /api/analysis</code>
        </p>
      </section>

      {phase === 'setup' && (
        <section className="px-8 md:px-24 pb-24 max-w-3xl space-y-6">
          <div className="raasta-card p-6 space-y-4">
            <h2 className="font-headline text-lg text-[var(--color-primary)]">
              1. Exam & scrape
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                Exam name
                <input
                  className="raasta-input mt-1 w-full"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Subject
                <input
                  className="raasta-input mt-1 w-full"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                Topic (optional)
                <input
                  className="raasta-input mt-1 w-full"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              className="raasta-btn-secondary text-sm"
              disabled={scrapeBusy}
              onClick={() => void runScrape()}
            >
              {scrapeBusy ? 'Scraping…' : 'Fetch & store questions (Firecrawl + AI)'}
            </button>
            {exams.length > 0 ? (
              <div className="text-xs text-[var(--raasta-muted)]">
                In DB:{' '}
                {exams.slice(0, 5).map((e) => (
                  <span key={e.examKey} className="mr-2">
                    {e.examName} · {e.subject} ({e.questionCount})
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="raasta-card p-6 space-y-4">
            <h2 className="font-headline text-lg text-[var(--color-primary)]">
              2. Generate timed test
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                Questions
                <input
                  type="number"
                  min={3}
                  max={50}
                  className="raasta-input mt-1 w-full"
                  value={qCount}
                  onChange={(e) => setQCount(Number(e.target.value))}
                />
              </label>
              <label className="text-sm">
                Minutes
                <input
                  type="number"
                  min={5}
                  max={240}
                  className="raasta-input mt-1 w-full"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                />
              </label>
              <label className="text-sm">
                Mode
                <select
                  className="raasta-input mt-1 w-full"
                  value={mode}
                  onChange={(e) =>
                    setMode(e.target.value as typeof mode)
                  }
                >
                  <option value="full">Full mix</option>
                  <option value="important">Important-tagged</option>
                  <option value="repeated">Repeated-pattern</option>
                </select>
              </label>
              <label className="text-sm">
                Difficulty
                <select
                  className="raasta-input mt-1 w-full"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as typeof difficulty)
                  }
                >
                  <option value="mixed">Mixed</option>
                  <option value="all">All (no filter)</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              className="raasta-btn-primary"
              disabled={genBusy}
              onClick={() => void runGenerate()}
            >
              {genBusy ? 'Generating…' : 'Start exam simulation'}
            </button>
            {msg ? (
              <p className="text-sm text-[var(--color-secondary)]">{msg}</p>
            ) : null}
          </div>
        </section>
      )}

      {phase === 'exam' && cur && (
        <section className="px-8 md:px-24 pb-24">
          <div className="max-w-3xl mx-auto raasta-card p-6">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[var(--raasta-border)] pb-3">
              <span className="text-sm font-medium text-[var(--color-primary)]">
                Q {index + 1} / {questions.length}
              </span>
              <span
                className={`font-mono text-lg ${remaining < 300 ? 'text-[var(--color-error)]' : ''}`}
              >
                {fmt}
              </span>
            </div>
            <p className="text-xs text-[var(--raasta-muted)] mt-2">{cur.topic}</p>
            <p className="mt-4 text-sm leading-relaxed">{cur.question}</p>
            <ul className="mt-4 space-y-2">
              {cur.options.map((opt, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 border text-sm transition-colors ${
                      answers[cur.id] === i
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'border-[var(--raasta-border)] hover:bg-black/5'
                    }`}
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [cur.id]: i }))
                    }
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className="raasta-btn-secondary text-sm"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="raasta-btn-secondary text-sm"
                disabled={index >= questions.length - 1}
                onClick={() =>
                  setIndex((i) => Math.min(questions.length - 1, i + 1))
                }
              >
                Next
              </button>
              <button
                type="button"
                className="raasta-btn-primary text-sm ml-auto"
                disabled={submitBusy}
                onClick={() => manualSubmit()}
              >
                {submitBusy ? 'Submitting…' : 'Submit test'}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === 'result' && result && (
        <section className="px-8 md:px-24 pb-24 max-w-3xl">
          <div className="raasta-card p-6 space-y-4">
            <h2 className="font-headline text-xl text-[var(--color-primary)]">
              Result
            </h2>
            <p className="text-2xl font-headline">
              {result.scorePercent}%{' '}
              <span className="text-sm text-[var(--raasta-muted)]">
                ({result.correctCount}/{result.totalCount})
              </span>
            </p>
            <p className="text-sm leading-relaxed">{result.summary}</p>
            {result.weakTopics.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-secondary)]">
                  Weak areas
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {result.weakTopics.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {result.revisionSuggestions.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-secondary)]">
                  Revision ideas
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {result.revisionSuggestions.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-4">
              <button
                type="button"
                className="raasta-btn-secondary text-sm"
                onClick={() => {
                  setPhase('setup')
                  setTestId(null)
                  setQuestions([])
                }}
              >
                Back to setup
              </button>
              <Link href="/taleem" className="raasta-btn-primary text-sm inline-flex items-center">
                Taleem hub
              </Link>
            </div>
            <p className="text-xs text-[var(--raasta-muted)]">
              Full history: GET /api/analysis?deviceId=… (same device id as this browser).
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
