'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type CvJson = {
  name: string
  summary: string
  skills: string[]
  experience: string[]
  projects: string[]
  education: string[]
}

type Phase = 'idle' | 'recording' | 'transcribing' | 'generating' | 'done'

const LANG_MAP: Record<string, string> = {
  Urdu: 'ur',
  Kashmiri: 'ks',
  English: 'en',
  Auto: 'auto',
}

export function VoiceCvPanel({ deviceId }: { deviceId: string | null }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [language, setLanguage] = useState('Auto')
  const [transcript, setTranscript] = useState('')
  const [editingTranscript, setEditingTranscript] = useState(false)
  const [cv, setCv] = useState<CvJson | null>(null)
  const [improvements, setImprovements] = useState<string[]>([])
  const [inferredNotes, setInferredNotes] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [profilePath, setProfilePath] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [recordDuration, setRecordDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      }

      mr.start(250)
      mediaRecorderRef.current = mr
      setPhase('recording')
      setRecordDuration(0)
      setMessage(null)
      setCv(null)
      setProfileUrl('')
      setTranscript('')

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setMessage('Microphone access denied. Please allow microphone permission.')
    }
  }, [])

  // Stop recording & transcribe
  const stopAndTranscribe = useCallback(async () => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state !== 'recording') return

    mr.stop()
    setPhase('transcribing')
    setMessage('Sending audio to Whisper for transcription…')

    // Wait for chunks to finalize
    await new Promise(resolve => setTimeout(resolve, 400))

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
    if (audioBlob.size < 1000) {
      setMessage('Recording too short. Please speak for at least a few seconds.')
      setPhase('idle')
      return
    }

    const fd = new FormData()
    fd.set('file', audioBlob, 'voice.webm')
    const langCode = LANG_MAP[language]
    if (langCode && langCode !== 'auto') fd.set('language', langCode)

    try {
      const r = await fetch('/api/upload-audio', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.ok && d.transcript?.trim()) {
        setTranscript(d.transcript)
        setMessage(`Transcribed (${d.language || language}): "${d.transcript.slice(0, 80)}…"`)
      } else {
        setMessage(d.error || 'Transcription failed. Check OPENAI_API_KEY.')
        setPhase('idle')
        return
      }
    } catch {
      setMessage('Transcription request failed.')
      setPhase('idle')
      return
    }

    setPhase('idle') // Ready to generate
  }, [language])

  // Generate CV from transcript
  const generateCv = useCallback(async () => {
    if (!transcript.trim() || transcript.length < 8) {
      setMessage('Transcript is too short. Record again or type more details.')
      return
    }
    setPhase('generating')
    setMessage('AI is building your professional CV…')

    try {
      const r = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          language: LANG_MAP[language] || 'auto',
          deviceId: deviceId || undefined,
          translateToEnglish: language !== 'English',
        }),
      })
      const d = await r.json()
      if (d.ok && d.data?.cv) {
        setCv(d.data.cv)
        setImprovements(d.data.improvements || [])
        setInferredNotes(d.data.inferredSkillNotes || '')
        setProfilePath(d.data.profilePath || '')
        setProfileUrl(d.data.profileUrl || d.data.profilePath || '')
        setPhase('done')
        setMessage('CV generated! Your shareable profile is ready.')
      } else {
        setMessage(d.error || 'CV generation failed.')
        setPhase('idle')
      }
    } catch {
      setMessage('CV generation request failed.')
      setPhase('idle')
    }
  }, [transcript, language, deviceId])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="p-6 md:p-10">
      {/* Status bar */}
      {message && (
        <div className="mb-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] px-4 py-3 flex items-center gap-3">
          {(phase === 'transcribing' || phase === 'generating') && (
            <span className="w-4 h-4 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <span className="text-sm text-[var(--color-on-surface-variant)]">{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Recording + Controls */}
        <div className="lg:col-span-5 space-y-5">
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Speak about yourself — your name, skills, experience, projects, education. AI converts your voice into a professional CV.
          </p>

          {/* Language selector */}
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-4">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">Language</p>
            <div className="flex gap-2">
              {['Auto', 'Urdu', 'Kashmiri', 'English'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
                    language === lang
                      ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] border-[var(--color-secondary)]'
                      : 'border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Record button */}
          <div className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] p-6 border border-[var(--color-outline-variant)]">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary-fixed)] mb-4">
              Voice Intro
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={phase === 'recording' ? stopAndTranscribe : startRecording}
                disabled={phase === 'transcribing' || phase === 'generating'}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  phase === 'recording'
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] hover:scale-105'
                } disabled:opacity-50`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {phase === 'recording' ? 'stop' : 'mic'}
                </span>
              </button>
              <div>
                <p className="font-headline text-lg">
                  {phase === 'recording' && `Recording… ${formatTime(recordDuration)}`}
                  {phase === 'transcribing' && 'Transcribing with Whisper…'}
                  {phase === 'generating' && 'Building your CV…'}
                  {phase === 'done' && 'CV Ready!'}
                  {phase === 'idle' && (transcript ? 'Ready to generate' : 'Tap to record')}
                </p>
                <p className="text-xs uppercase tracking-widest text-[var(--color-secondary-fixed-dim)]">
                  {phase === 'recording' ? 'Click stop when done' : 'Urdu · Kashmiri · English'}
                </p>
              </div>
            </div>
          </div>

          {/* Transcript area */}
          {transcript && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)]">Transcript</p>
                <button
                  type="button"
                  onClick={() => setEditingTranscript(!editingTranscript)}
                  className="text-xs text-[var(--color-secondary)] underline"
                >
                  {editingTranscript ? 'Done editing' : 'Edit'}
                </button>
              </div>
              {editingTranscript ? (
                <textarea
                  className="raasta-input w-full text-sm min-h-[100px]"
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                />
              ) : (
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-4 text-sm text-[var(--color-on-surface-variant)] max-h-[150px] overflow-y-auto">
                  "{transcript}"
                </div>
              )}
            </div>
          )}

          {/* Generate button */}
          {transcript && phase !== 'done' && (
            <button
              type="button"
              onClick={() => void generateCv()}
              disabled={phase === 'generating' || phase === 'transcribing'}
              className="w-full bg-[var(--color-secondary)] text-[var(--color-on-secondary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              {phase === 'generating' ? 'Generating…' : 'Generate CV & Profile'}
            </button>
          )}

          {/* Profile link */}
          {profilePath && (
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] mb-2">Shareable Profile</p>
              <Link
                href={profilePath}
                target="_blank"
                className="text-sm text-[var(--color-secondary)] underline break-all"
              >
                {profileUrl || profilePath}
              </Link>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(profileUrl || `${window.location.origin}${profilePath}`) ; setMessage('Link copied!') }}
                className="mt-2 text-xs border border-[var(--color-outline-variant)] px-3 py-1 hover:bg-[var(--color-surface-container-low)]"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: CV Preview */}
        <div className="lg:col-span-7">
          {!cv && phase !== 'generating' && (
            <div className="border border-dashed border-[var(--color-outline-variant)] p-8 text-center text-sm text-[var(--color-on-surface-variant)]">
              <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">description</span>
              Your AI-generated CV will appear here after recording and generating.
            </div>
          )}

          {phase === 'generating' && (
            <div className="border border-[var(--color-outline-variant)] p-8 text-center">
              <span className="w-6 h-6 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin inline-block mb-3" />
              <p className="text-sm">AI is analyzing your speech and building your CV…</p>
            </div>
          )}

          {cv && (
            <div className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 md:p-8 space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-secondary)] mb-1">Voice CV</p>
                <h3 className="font-headline text-2xl text-[var(--color-primary)]">
                  {cv.name || 'Professional Profile'}
                </h3>
              </div>

              {cv.summary && (
                <div>
                  <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">Summary</h4>
                  <p className="text-sm leading-relaxed text-[var(--color-on-surface-variant)]">{cv.summary}</p>
                </div>
              )}

              {cv.skills?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.map(s => (
                      <span key={s} className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] px-3 py-1 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cv.experience?.length > 0 && (
                <CvSection title="Experience" items={cv.experience} />
              )}

              {cv.projects?.length > 0 && (
                <CvSection title="Projects" items={cv.projects} />
              )}

              {cv.education?.length > 0 && (
                <CvSection title="Education" items={cv.education} />
              )}

              {improvements.length > 0 && (
                <div className="pt-4 border-t border-[var(--color-outline-variant)]">
                  <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">
                    AI Suggested Improvements
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-[var(--color-on-surface-variant)] space-y-1">
                    {improvements.map(s => <li key={s}>{s}</li>)}
                  </ul>
                </div>
              )}

              {inferredNotes && (
                <p className="text-xs italic text-[var(--color-on-surface-variant)]">
                  AI Note: {inferredNotes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CvSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] mb-2">{title}</h4>
      <ul className="space-y-1 text-sm text-[var(--color-on-surface)]">
        {items.map(line => (
          <li key={line} className="leading-relaxed">• {line}</li>
        ))}
      </ul>
    </div>
  )
}
