'use client'

import { MicButton } from '@/components/MicButton'
import { useI18n } from '@/lib/i18n/context'
import { answerVoiceQuestion } from '@/lib/llm'
import { speechRecognitionLang } from '@/lib/localeForLlm'
import { speakForLocale, stopSpeaking } from '@/lib/tts'
import { transcribeAudio } from '@/lib/whisper'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type WebSpeechRec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  onresult:
    | ((ev: { results: Array<Array<{ transcript: string }>> }) => void)
    | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechControl = {
  start: () => void
  onResult: (handler: (spokenText: string) => void) => void
  onError: (handler: () => void) => void
  onEnd: (handler: () => void) => void
}

function createSpeechRecognition(lang: string): SpeechControl | null {
  const W = window as unknown as {
    SpeechRecognition?: new () => WebSpeechRec
    webkitSpeechRecognition?: new () => WebSpeechRec
  }
  const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = lang
  rec.continuous = false
  rec.interimResults = false
  return {
    start: () => rec.start(),
    onResult: (cb) => {
      rec.onresult = (e) => {
        const t = e.results[0]?.[0]?.transcript ?? ''
        cb(t)
      }
    },
    onError: (cb) => {
      rec.onerror = () => cb()
    },
    onEnd: (cb) => {
      rec.onend = () => cb()
    },
  }
}

export default function RaahPage() {
  const { locale, t } = useI18n()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [browserListen, setBrowserListen] = useState(false)
  const [recErr, setRecErr] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const ask = useCallback(
    async (q: string) => {
      const trimmed = q.trim()
      if (!trimmed) return
      setBusy(true)
      setAnswer('')
      stopSpeaking()
      try {
        const a = await answerVoiceQuestion(trimmed, locale)
        setAnswer(a)
        await speakForLocale(a, locale)
      } finally {
        setBusy(false)
      }
    },
    [locale],
  )

  const startBrowserSTT = useCallback(() => {
    const api = createSpeechRecognition(speechRecognitionLang(locale))
    if (!api) {
      setRecErr(t('raah.errBrowser'))
      return
    }
    setRecErr(null)
    setBrowserListen(true)
    api.onResult((spoken) => {
      setQuestion(spoken)
      setBrowserListen(false)
      void ask(spoken)
    })
    api.onError(() => {
      setBrowserListen(false)
      setRecErr(t('raah.errHear'))
    })
    api.onEnd(() => setBrowserListen(false))
    try {
      api.start()
    } catch {
      setBrowserListen(false)
      setRecErr(t('raah.errMicStart'))
    }
  }, [ask, locale, t])

  const stopRecordWhisper = useCallback(() => {
    const mr = mediaRecorder.current
    if (!mr || mr.state === 'inactive') return
    mr.stop()
  }, [])

  const startRecordWhisper = useCallback(async () => {
    setRecErr(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorder.current = mr
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data)
      }
      mr.onstop = async () => {
        setRecording(false)
        stream.getTracks().forEach((tr) => tr.stop())
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        chunks.current = []
        setBusy(true)
        setAnswer('')
        stopSpeaking()
        try {
          const { text, demo } = await transcribeAudio(blob)
          if (text) {
            setQuestion(text)
            await ask(text)
          } else {
            setRecErr(demo ? t('raah.errWhisperKey') : t('raah.errWhisperEmpty'))
          }
        } catch {
          setRecErr(t('raah.errTranscribe'))
        } finally {
          setBusy(false)
        }
      }
      mr.start()
      setRecording(true)
    } catch {
      setRecErr(t('raah.errMicPerm'))
    }
  }, [ask, t])

  useEffect(() => {
    return () => {
      stopSpeaking()
      try {
        mediaRecorder.current?.stop()
      } catch {
      }
    }
  }, [])

  const featureBlocks = useMemo(
    () => [
      {
        title: 'Life Direction Engine',
        body: 'AI breaks decisions into clear options, pros and cons, and realistic outcomes.',
        image: 'https://marketplace.canva.com/EAGGBznhnPM/2/0/1600w/canva-beige-minimal-flowchart-infographic-graph-y3gbDR3e6jU.jpg',
      },
      {
        title: 'Talk To Raah',
        body: 'Type or speak. Raah responds like a mentor and keeps your context.',
        image: 'https://cdn.dribbble.com/userupload/45012934/file/c1ee8cab33fc844ef8b396b422cf1fd2.png?resize=752x&vertical=center',
      },
      {
        title: 'Overthinking Breaker',
        body: 'Turn chaos into steps. Fear into facts. Clarity into action.',
        image: 'https://previews.123rf.com/images/ngupakarti/ngupakarti2108/ngupakarti210800381/173207070-young-woman-have-thinking-problem-and-frustrated-continuous-line-drawing-minimalist-style-vector.jpg',
      },
      {
        title: 'Path Builder',
        body: 'From current position to goal, a clear roadmap of steps.',
        image: 'https://www.slideteam.net/media/catalog/product/cache/1280x720/4/_/4_quarter_ux_ui_roadmap_timeline_powerpoint_template_slide01.jpg',
      },
      {
        title: 'Life Journal',
        body: 'Private space to reflect. Optional AI insights, always yours.',
        image: 'https://cdn.shopify.com/s/files/1/1201/4358/files/IMG_4784.jpg?v=1693378975',
      },
      {
        title: 'Decision Helper',
        body: 'Side by side choices, outcomes, and a grounded suggestion.',
        image: 'https://cdn.vectorstock.com/i/1000v/96/04/decision-balance-icon-vector-45359604.jpg',
      },
      {
        title: 'Daily Check In',
        body: 'Small reflections that keep you steady every day.',
        image: 'https://cdn.dribbble.com/userupload/42977537/file/original-6fe3abd13557142c453999fd62eda832.jpg?resize=752x&vertical=center',
      },
    ],
    [],
  )

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById('talk-to-raah')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        className="fixed bottom-6 right-6 z-50 bg-[var(--color-secondary)] text-[var(--color-on-secondary)] px-5 py-3 font-label text-[10px] uppercase tracking-[0.2em] shadow-lg hover:opacity-90"
      >
        If You Feel Lost
      </button>

      <section className="px-8 md:px-24 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
            Archive 04
          </p>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-[var(--color-primary)] leading-[1.05]">
            Raah - <br />
            <span className="italic font-normal">Find Your Way</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-[var(--color-on-surface-variant)] mt-6 max-w-xl leading-relaxed">
            When you feel lost, we help you move forward. Guidance, support, and direction in one place.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('talk-to-raah')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-secondary)] transition-colors"
            >
              Start Your Journey
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('talk-to-raah')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="border border-[var(--color-outline-variant)] px-6 py-3 font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Talk to Raah
            </button>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="relative h-[360px] md:h-[420px] overflow-hidden border border-[var(--color-outline-variant)] shadow-[0_20px_60px_rgba(0,0,0,0.08)] group">
            <img
              alt="Raah hero"
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              src="https://ichef.bbci.co.uk/images/ic/1920xn/p03q9b9x.jpg"
            />
            <div className="absolute bottom-0 left-0 bg-[var(--color-primary)] px-6 py-4 text-[var(--color-on-primary)]">
              <p className="font-headline italic text-lg tracking-tight">Direction, not noise.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-16">
        <div className="border-t border-[var(--color-outline-variant)] pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6">
            <h2 className="font-headline text-3xl md:text-4xl text-[var(--color-primary)]">
              What Raah Actually Does
            </h2>
            <p className="mt-4 text-[var(--color-on-surface-variant)] text-sm leading-relaxed">
              Raah is your AI life companion. A mentor, therapist-lite, career advisor, and life planner combined into one calm system.
            </p>
          </div>
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Confusion', 'Decisions', 'Overthinking', 'Direction'].map((item) => (
              <div key={item} className="raasta-card p-5">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  Support
                </p>
                <p className="mt-3 font-headline text-xl text-[var(--color-primary)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <div className="flex items-end justify-between gap-6 border-b border-[var(--color-outline-variant)] pb-4 mb-8">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-2">
              Core System
            </p>
            <h2 className="font-headline text-3xl md:text-4xl text-[var(--color-primary)]">
              Life Navigation Modules
            </h2>
          </div>
          <p className="text-sm text-[var(--color-on-surface-variant)] max-w-sm">
            Each module turns uncertainty into a clearer next step.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureBlocks.map((f) => (
            <div key={f.title} className="group border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] overflow-hidden">
              <div className="h-44 overflow-hidden">
                <img
                  alt={f.title}
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  src={f.image}
                />
              </div>
              <div className="p-6">
                <h3 className="font-headline text-xl text-[var(--color-primary)]">{f.title}</h3>
                <p className="mt-3 text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="talk-to-raah" className="px-8 md:px-24 pb-24">
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] opacity-95 p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col space-y-8">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] border-b border-[var(--color-outline-variant)] pb-2 opacity-80 block">
                Talk To Raah
              </span>

              <p className="text-sm font-label uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                {t('raah.micHelp')}
              </p>

              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors group cursor-pointer">
                <div className="relative mb-8">
                  <MicButton onActivate={startBrowserSTT} />
                </div>

                <button
                  type="button"
                  className={`w-full mt-4 font-label text-[10px] uppercase tracking-widest px-8 py-3 transition-colors duration-300 ${
                    recording
                      ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] animate-pulse'
                      : 'bg-[var(--color-primary-container)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary)]'
                  }`}
                  onClick={recording ? stopRecordWhisper : startRecordWhisper}
                  disabled={busy || browserListen}
                >
                  {recording ? t('raah.whisperStop') : t('raah.whisperRec')}
                </button>
              </div>

              <button
                type="button"
                className="text-[10px] font-label font-bold uppercase tracking-widest text-[var(--color-secondary)] hover:opacity-80 transition-opacity self-start"
                onClick={() => {
                  const q = t('raah.demoQuery')
                  setQuestion(q)
                  void ask(q)
                }}
                disabled={busy}
              >
                {t('raah.demoPm')}
              </button>

              {recErr && (
                <div className="mt-4 border-l-2 border-[var(--color-error)] bg-[var(--color-error-container)] p-4 text-xs font-label uppercase tracking-widest text-[var(--color-error)]">
                  {recErr}
                </div>
              )}

              <div className="pt-4 border-t border-[var(--color-outline-variant)]">
                <label
                  htmlFor="raah-q"
                  className="font-label text-[10px] uppercase tracking-widest text-[var(--color-primary-container)] mb-3 block"
                >
                  Manual Entry
                </label>
                <textarea
                  id="raah-q"
                  rows={3}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] p-4 font-body text-sm text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-secondary)] resize-none transition-colors"
                  placeholder={t('raah.placeholder')}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <button
                  type="button"
                  className={`mt-4 bg-[var(--color-surface-tint)] text-[var(--color-on-primary)] font-label text-[10px] uppercase tracking-[0.2em] w-full py-4 hover:opacity-90 transition-opacity ${
                    busy ? 'opacity-50' : ''
                  }`}
                  disabled={busy || !question.trim()}
                  onClick={() => void ask(question)}
                >
                  {busy ? t('common.thinking') : t('common.send')}
                </button>
              </div>
            </div>

            <div className="border-l border-[var(--color-outline-variant)] opacity-90 pl-0 lg:pl-12">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] border-b border-[var(--color-outline-variant)] pb-2 opacity-80 block mb-8">
                Intelligence Transcript
              </span>
              <div className="h-full min-h-[400px]">
                {answer ? (
                  <div className="font-body text-lg text-[var(--color-on-surface)] leading-relaxed italic border-l-4 border-[var(--color-primary)] pl-6 py-2">
                    {answer}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-40 font-headline text-2xl italic text-[var(--color-outline)]">
                    Contextual insights will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
