'use client'

import { MicButton } from '@/components/MicButton'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
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
        /* noop */
      }
    }
  }, [])

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/"
        backLabel={t('nav.backHome')}
        title={t('raah.title')}
      >
        <p>{t('raah.lead')}</p>
      </PageIntro>

      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-center text-xs text-[var(--raasta-muted)]">
          {t('raah.micHelp')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <MicButton onActivate={startBrowserSTT} />
          <button
            type="button"
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${recording ? 'bg-gradient-to-br from-[var(--chinar-amber)] to-[var(--chinar-gold)] text-[#faf8f4] shadow-sm' : 'raasta-btn-secondary'}`}
            onClick={recording ? stopRecordWhisper : startRecordWhisper}
            disabled={busy || browserListen}
          >
            {recording ? t('raah.whisperStop') : t('raah.whisperRec')}
          </button>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-[var(--chinar-gold)] underline decoration-[var(--chinar-amber)] underline-offset-2"
          onClick={() => {
            const q = t('raah.demoQuery')
            setQuestion(q)
            void ask(q)
          }}
          disabled={busy}
        >
          {t('raah.demoPm')}
        </button>
      </div>

      {recErr ? (
        <p
          className="raasta-card mt-4 border-[rgba(196,131,58,0.35)] bg-[var(--chinar-glow)] px-3 py-3 text-sm leading-relaxed text-[var(--raasta-ink)]"
          role="status"
        >
          {recErr}
        </p>
      ) : null}

      <div className="mt-6">
        <label htmlFor="raah-q" className="sr-only">
          {t('raah.askLabel')}
        </label>
        <textarea
          id="raah-q"
          rows={3}
          className="raasta-input w-full resize-none"
          placeholder={t('raah.placeholder')}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="button"
          className="raasta-btn-primary mt-3 w-full"
          disabled={busy || !question.trim()}
          onClick={() => void ask(question)}
        >
          {busy ? t('common.thinking') : t('common.send')}
        </button>
      </div>

      <VoiceOutput text={answer} label={t('raah.out')} />
    </div>
  )
}
