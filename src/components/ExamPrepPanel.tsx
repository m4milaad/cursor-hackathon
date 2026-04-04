'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type ClientQuestion = {
  index: number
  question: string
  options: string[]
  topic: string
  difficulty: string
  tags: string[]
}

type ResultQuestion = ClientQuestion & {
  correctIndex: number
  yourAnswer: number | null
  correct: boolean
}

type Analysis = {
  weakTopics: string[]
  summary: string
  revision: string[]
}

type Phase = 'setup' | 'loading' | 'exam' | 'submitting' | 'results'

const EXAM_CATALOG = [
  { exam: 'JKSSB', subjects: ['General Awareness', 'General English', 'Mathematics', 'Computer Science'] },
  { exam: 'NEET', subjects: ['Physics', 'Chemistry', 'Biology'] },
  { exam: 'JEE Main', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { exam: 'UPSC Prelims', subjects: ['General Studies', 'CSAT', 'Indian Polity', 'History', 'Geography', 'Economy'] },
  { exam: 'Class 12 CBSE', subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Computer Science'] },
  { exam: 'Class 10 CBSE', subjects: ['Science', 'Social Science', 'Mathematics', 'English'] },
  { exam: 'SSC CGL', subjects: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension'] },
  { exam: 'GATE', subjects: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'] },
]

const DEVICE_KEY = 'raasta-job-device'

export function ExamPrepPanel() {
  // Setup state
  const [phase, setPhase] = useState<Phase>('setup')
  const [selectedExam, setSelectedExam] = useState(EXAM_CATALOG[0].exam)
  const [customExam, setCustomExam] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(EXAM_CATALOG[0].subjects[0])
  const [customSubject, setCustomSubject] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [questionCount, setQuestionCount] = useState(15)
  const [mode, setMode] = useState<'full' | 'important' | 'repeated'>('full')
  const [difficulty, setDifficulty] = useState<'mixed' | 'easy' | 'medium' | 'hard'>('mixed')
  const [message, setMessage] = useState<string | null>(null)

  const isCustomExam = selectedExam === '__other__'
  const isCustomSubject = selectedSubject === '__other__'
  const resolvedExam = isCustomExam ? customExam.trim() : selectedExam
  const resolvedSubject = isCustomSubject ? customSubject.trim() : selectedSubject

  // Exam state
  const [testId, setTestId] = useState('')
  const [questions, setQuestions] = useState<ClientQuestion[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Results state
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [resultDetails, setResultDetails] = useState<ResultQuestion[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  const [deviceId, setDeviceId] = useState('')

  useEffect(() => {
    let id = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_KEY) : null
    if (!id) { id = globalThis.crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id) }
    setDeviceId(id)
  }, [])

  // Update subject when exam changes
  useEffect(() => {
    if (selectedExam === '__other__') {
      setSelectedSubject('__other__')
    } else {
      const cat = EXAM_CATALOG.find(c => c.exam === selectedExam)
      if (cat) setSelectedSubject(cat.subjects[0])
    }
  }, [selectedExam])

  // Timer
  useEffect(() => {
    if (phase === 'exam' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            void handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const currentSubjects = isCustomExam ? [] : (EXAM_CATALOG.find(c => c.exam === selectedExam)?.subjects ?? [])

  // Generate test
  const generateTest = useCallback(async () => {
    setPhase('loading')
    setMessage('Scraping questions from exam databases & generating AI questions…')

    if (!resolvedExam || !resolvedSubject) {
      setMessage('Please enter an exam name and subject.')
      setPhase('setup')
      return
    }

    try {
      const r = await fetch('/api/exam/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: resolvedExam,
          subject: resolvedSubject,
          topic: topicFilter || undefined,
          count: questionCount,
          mode,
          difficulty,
        }),
      })
      const d = await r.json()
      if (d.ok && d.data?.questions?.length) {
        setTestId(d.data.testId)
        setQuestions(d.data.questions)
        setAnswers(new Array(d.data.questions.length).fill(null))
        setCurrentQ(0)
        setDurationMinutes(d.data.durationMinutes)
        setTimeLeft(d.data.durationMinutes * 60)
        setPhase('exam')
        setMessage(null)
      } else {
        setMessage(d.error || 'Could not generate test. Check API keys.')
        setPhase('setup')
      }
    } catch {
      setMessage('Failed to generate test.')
      setPhase('setup')
    }
  }, [resolvedExam, resolvedSubject, topicFilter, questionCount, mode, difficulty])

  // Submit test
  const handleSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('submitting')
    setMessage('Grading and analyzing your performance…')

    try {
      const r = await fetch('/api/exam/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, deviceId, answers }),
      })
      const d = await r.json()
      if (d.ok && d.data) {
        setScore(d.data.score)
        setTotal(d.data.total)
        setResultDetails(d.data.results)
        setAnalysis(d.data.analysis)
        setPhase('results')
        setMessage(null)
      } else {
        setMessage(d.error || 'Submission failed.')
        setPhase('exam')
      }
    } catch {
      setMessage('Submission error.')
      setPhase('exam')
    }
  }, [testId, deviceId, answers])

  const selectAnswer = (qIdx: number, optIdx: number) => {
    setAnswers(prev => {
      const copy = [...prev]
      copy[qIdx] = optIdx
      return copy
    })
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`
  }

  const answeredCount = answers.filter(a => a !== null).length

  // ── SETUP PHASE ──
  if (phase === 'setup' || phase === 'loading') {
    return (
      <div className="p-6 md:p-10">
        {message && (
          <div className="mb-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] px-4 py-3 flex items-center gap-3">
            {phase === 'loading' && <span className="w-4 h-4 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin shrink-0" />}
            <span className="text-sm text-[var(--color-on-surface-variant)]">{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Select your exam, subject, and mode. AI will scrape real previous year questions and generate a timed test paper.
            </p>

            {/* Exam selector */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Exam</label>
              <select
                className="raasta-input w-full text-sm"
                value={selectedExam}
                onChange={e => setSelectedExam(e.target.value)}
                disabled={phase === 'loading'}
              >
                {EXAM_CATALOG.map(c => <option key={c.exam} value={c.exam}>{c.exam}</option>)}
                <option value="__other__">Other…</option>
              </select>
              {isCustomExam && (
                <input
                  className="raasta-input w-full text-sm mt-2"
                  value={customExam}
                  onChange={e => setCustomExam(e.target.value)}
                  placeholder="e.g. CAT, CLAT, CBSE 12th, ICSE 10th…"
                  autoFocus
                  disabled={phase === 'loading'}
                />
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Subject</label>
              {isCustomExam ? (
                <input
                  className="raasta-input w-full text-sm"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="e.g. Physics, Logical Reasoning, English…"
                  disabled={phase === 'loading'}
                />
              ) : (
                <>
                  <select
                    className="raasta-input w-full text-sm"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    disabled={phase === 'loading'}
                  >
                    {currentSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__other__">Other…</option>
                  </select>
                  {isCustomSubject && (
                    <input
                      className="raasta-input w-full text-sm mt-2"
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      placeholder="e.g. Accountancy, Data Interpretation…"
                      autoFocus
                      disabled={phase === 'loading'}
                    />
                  )}
                </>
              )}
            </div>

            {/* Topic (optional) */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Topic (Optional)</label>
              <input
                className="raasta-input w-full text-sm"
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
                placeholder="e.g. Photosynthesis, Indian Constitution…"
                disabled={phase === 'loading'}
              />
            </div>

            {/* Mode + Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Mode</label>
                <select className="raasta-input w-full text-sm" value={mode} onChange={e => setMode(e.target.value as typeof mode)} disabled={phase === 'loading'}>
                  <option value="full">Full Test</option>
                  <option value="important">Important Only</option>
                  <option value="repeated">Repeated Only</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">Difficulty</label>
                <select className="raasta-input w-full text-sm" value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)} disabled={phase === 'loading'}>
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Question count */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-1">
                Questions: {questionCount}
              </label>
              <input
                type="range"
                min={5} max={50} value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full accent-[var(--color-secondary)]"
                disabled={phase === 'loading'}
              />
            </div>

            {/* Start button */}
            <button
              type="button"
              onClick={() => void generateTest()}
              disabled={phase === 'loading'}
              className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">quiz</span>
              {phase === 'loading' ? 'Generating…' : 'Start Exam'}
            </button>
          </div>

          {/* Right: exam info */}
          <div className="lg:col-span-7">
            <div className="border border-dashed border-[var(--color-outline-variant)] p-8 text-center text-sm text-[var(--color-on-surface-variant)]">
              <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">school</span>
              {phase === 'loading' ? (
                <div className="space-y-2">
                  <span className="w-6 h-6 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin inline-block" />
                  <p>AI is scraping questions from exam databases, tagging importance, and building your paper…</p>
                  <p className="text-xs">This may take 30–60 seconds for first-time exams.</p>
                </div>
              ) : (
                <p>Configure your exam settings and click <strong>Start Exam</strong> to begin a timed AI-powered test.</p>
              )}
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {[
                { icon: 'travel_explore', title: 'PYQ Scraping', desc: 'Real previous year questions' },
                { icon: 'psychology', title: 'AI Generation', desc: 'Pattern-aware questions' },
                { icon: 'analytics', title: 'Smart Analysis', desc: 'Weak areas & revision plan' },
              ].map(f => (
                <div key={f.title} className="border border-[var(--color-outline-variant)] p-4 bg-[var(--color-surface-container-low)]">
                  <span className="material-symbols-outlined text-[var(--color-secondary)] text-xl mb-2 block">{f.icon}</span>
                  <p className="text-xs font-medium uppercase tracking-widest">{f.title}</p>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── EXAM PHASE ──
  if (phase === 'exam') {
    const q = questions[currentQ]
    const isLowTime = timeLeft < 120
    return (
      <div className="p-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-outline-variant)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-label text-xs uppercase tracking-widest text-[var(--color-secondary)]">
              {resolvedExam} · {resolvedSubject}
            </span>
            <span className="text-xs text-[var(--color-on-surface-variant)]">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-mono text-lg font-bold ${isLowTime ? 'text-red-600 animate-pulse' : 'text-[var(--color-primary)]'}`}>
              {formatTime(timeLeft)}
            </span>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              className="bg-[var(--color-secondary)] text-[var(--color-on-secondary)] px-4 py-2 text-[10px] uppercase tracking-widest font-label"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Question navigation sidebar */}
          <div className="lg:col-span-2 border-r border-[var(--color-outline-variant)] p-4">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] mb-3">Questions</p>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 text-xs font-medium border transition-colors ${
                    i === currentQ
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
                      : answers[i] !== null
                        ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] border-[var(--color-secondary)]'
                        : 'border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 text-[10px] text-[var(--color-on-surface-variant)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[var(--color-secondary)] inline-block" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border border-[var(--color-outline-variant)] inline-block" /> Unanswered
              </div>
            </div>
          </div>

          {/* Question area */}
          <div className="lg:col-span-10 p-6 md:p-10">
            {q && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] px-3 py-1 text-xs font-bold">
                    Q{currentQ + 1}
                  </span>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${
                    q.difficulty === 'hard' ? 'text-red-600 border border-red-300' :
                    q.difficulty === 'easy' ? 'text-green-600 border border-green-300' :
                    'text-amber-600 border border-amber-300'
                  }`}>
                    {q.difficulty}
                  </span>
                  {q.tags.map(t => (
                    <span key={t} className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] px-2 py-0.5 border border-[var(--color-secondary)]">
                      {t}
                    </span>
                  ))}
                  <span className="text-[10px] text-[var(--color-on-surface-variant)]">{q.topic}</span>
                </div>

                <p className="font-headline text-lg md:text-xl text-[var(--color-on-surface)] leading-relaxed mb-6">
                  {q.question}
                </p>

                <div className="space-y-3">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectAnswer(currentQ, oi)}
                      className={`w-full text-left p-4 border text-sm transition-all flex items-center gap-3 ${
                        answers[currentQ] === oi
                          ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] border-[var(--color-secondary)]'
                          : 'border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)] bg-[var(--color-surface-container-low)]'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                        answers[currentQ] === oi
                          ? 'border-[var(--color-on-secondary)] text-[var(--color-on-secondary)]'
                          : 'border-[var(--color-outline-variant)]'
                      }`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    disabled={currentQ === 0}
                    onClick={() => setCurrentQ(prev => prev - 1)}
                    className="raasta-btn-secondary text-sm disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  {currentQ < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQ(prev => prev + 1)}
                      className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-5 py-2 text-sm"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleSubmit()}
                      className="bg-[var(--color-secondary)] text-[var(--color-on-secondary)] px-5 py-2 text-sm"
                    >
                      Submit Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── SUBMITTING ──
  if (phase === 'submitting') {
    return (
      <div className="p-10 text-center">
        <span className="w-8 h-8 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin inline-block mb-4" />
        <p className="text-sm">Grading your answers and running AI analysis…</p>
      </div>
    )
  }

  // ── RESULTS PHASE ──
  return (
    <div className="p-6 md:p-10">
      {/* Score header */}
      <div className="text-center mb-8 bg-[var(--color-primary-container)] text-[var(--color-on-primary)] p-8 border border-[var(--color-outline-variant)]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-secondary-fixed)] mb-2">Your Score</p>
        <p className="font-headline text-5xl md:text-6xl font-bold">
          {score}/{total}
        </p>
        <p className="text-lg mt-2">
          {total > 0 ? Math.round((score / total) * 100) : 0}%
        </p>
        <div className="w-full bg-black/10 h-3 mt-4 overflow-hidden">
          <div
            className="h-full bg-[var(--color-secondary)] transition-all duration-1000"
            style={{ width: `${total > 0 ? (score / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Analysis */}
        <div className="lg:col-span-5 space-y-5">
          {analysis && (
            <>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">AI Analysis</h4>
                <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">{analysis.summary}</p>
              </div>

              {analysis.weakTopics?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">Weak Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.weakTopics.map(t => (
                      <span key={t} className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.revision?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">Revision Plan</h4>
                  <ul className="list-disc pl-5 text-sm text-[var(--color-on-surface-variant)] space-y-1">
                    {analysis.revision.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setPhase('setup')
              setQuestions([])
              setAnswers([])
              setResultDetails([])
              setAnalysis(null)
              setMessage(null)
            }}
            className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Take Another Test
          </button>
        </div>

        {/* Right: Question-by-question review */}
        <div className="lg:col-span-7 space-y-3 max-h-[60vh] overflow-y-auto">
          <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">Question Review</h4>
          {resultDetails.map((r, i) => (
            <div
              key={i}
              className={`border p-4 text-sm ${
                r.correct
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-800'
                  : 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${r.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {r.correct ? '✓' : '✗'}
                </span>
                <span className="font-medium">Q{i + 1}</span>
                <span className="text-xs text-[var(--color-on-surface-variant)]">{r.topic}</span>
              </div>
              <p className="mb-2">{r.question}</p>
              <div className="space-y-1">
                {r.options.map((opt, oi) => (
                  <p
                    key={oi}
                    className={`text-xs px-2 py-1 ${
                      oi === r.correctIndex ? 'font-bold text-green-700 dark:text-green-400' : ''
                    } ${oi === r.yourAnswer && oi !== r.correctIndex ? 'text-red-600 line-through' : ''}`}
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                    {oi === r.correctIndex && ' ✓'}
                    {oi === r.yourAnswer && oi !== r.correctIndex && ' (your answer)'}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
