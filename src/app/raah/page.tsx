'use client'

import { MicButton } from '@/components/MicButton'
import { useI18n } from '@/lib/i18n/context'
import { answerVoiceQuestion } from '@/lib/llm'
import { speechRecognitionLang } from '@/lib/localeForLlm'
import { speakForLocale, stopSpeaking } from '@/lib/tts'
import { transcribeAudio } from '@/lib/whisper'
import { useCallback, useEffect, useRef, useState } from 'react'

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
            setRecErr(
              demo ? t('raah.errWhisperKey') : t('raah.errWhisperEmpty'),
            )
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

  return (
    <main className="pt-24 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <header className="mb-16 max-w-3xl">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 block">
          Archive 04
        </span>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-[var(--color-primary)] tracking-tight leading-none mb-6">
          {t('raah.title')}
        </h1>
        <p className="font-headline italic text-xl text-[var(--color-on-surface-variant)] leading-relaxed">
          {t('raah.lead')}
        </p>
      </header>

      {/* Main Container */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] opacity-95 p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Interaction Column */}
          <div className="flex flex-col space-y-8">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] border-b border-[var(--color-outline-variant)] pb-2 opacity-80 block">
              Audio Protocol
            </span>
            
            <p className="text-sm font-label uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              {t('raah.micHelp')}
            </p>

            {/* Mic Array */}
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors group cursor-pointer">
              <div className="relative mb-8">
                <MicButton onActivate={startBrowserSTT} />
              </div>
              
              <button
                type="button"
                className={`w-full mt-4 font-label text-[10px] uppercase tracking-widest px-8 py-3 transition-colors duration-300 ${
                  recording ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] animate-pulse' : 'bg-[var(--color-primary-container)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary)]'
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

            {/* Error display */}
            {recErr && (
              <div className="mt-4 border-l-2 border-[var(--color-error)] bg-[var(--color-error-container)] p-4 text-xs font-label uppercase tracking-widest text-[var(--color-error)]">
                {recErr}
              </div>
            )}

            {/* Text Input Block */}
            <div className="pt-4 border-t border-[var(--color-outline-variant)]">
               <label htmlFor="raah-q" className="font-label text-[10px] uppercase tracking-widest text-[var(--color-primary-container)] mb-3 block">
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
                 className={`mt-4 bg-[var(--color-surface-tint)] text-[var(--color-on-primary)] font-label text-[10px] uppercase tracking-[0.2em] w-full py-4 hover:opacity-90 transition-opacity ${busy ? 'opacity-50' : ''}`}
                 disabled={busy || !question.trim()}
                 onClick={() => void ask(question)}
               >
                 {busy ? t('common.thinking') : t('common.send')}
               </button>
            </div>
          </div>

          {/* Response Column */}
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
    </main>
  )
}
