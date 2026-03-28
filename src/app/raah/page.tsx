'use client'

import { MicButton } from '@/components/MicButton'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { answerVoiceQuestion } from '@/lib/llm'
import { speakText, stopSpeaking } from '@/lib/tts'
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

function createSpeechRecognition(): SpeechControl | null {
  const W = window as unknown as {
    SpeechRecognition?: new () => WebSpeechRec
    webkitSpeechRecognition?: new () => WebSpeechRec
  }
  const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = 'hi-IN'
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
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [browserListen, setBrowserListen] = useState(false)
  const [recErr, setRecErr] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const ask = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setBusy(true)
    setAnswer('')
    stopSpeaking()
    try {
      const a = await answerVoiceQuestion(trimmed)
      setAnswer(a)
      await speakText(a)
    } finally {
      setBusy(false)
    }
  }, [])

  const startBrowserSTT = useCallback(() => {
    const api = createSpeechRecognition()
    if (!api) {
      setRecErr(
        'Is browser mein live recognition limit ho sakti hai — neeche type karein.',
      )
      return
    }
    setRecErr(null)
    setBrowserListen(true)
    api.onResult((t) => {
      setQuestion(t)
      setBrowserListen(false)
      void ask(t)
    })
    api.onError(() => {
      setBrowserListen(false)
      setRecErr('Sun na paye — dubara koshish ya type karein.')
    })
    api.onEnd(() => setBrowserListen(false))
    try {
      api.start()
    } catch {
      setBrowserListen(false)
      setRecErr('Mic start na ho saka.')
    }
  }, [ask])

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
        stream.getTracks().forEach((t) => t.stop())
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
              demo
                ? 'Server par OPENAI_API_KEY set karein Whisper ke liye, ya neeche "PM Kisan" / type karein.'
                : 'Whisper ne kuch na suna — dubara boliye.',
            )
          }
        } catch {
          setRecErr('Transcription fail — type karke bhejein.')
        } finally {
          setBusy(false)
        }
      }
      mr.start()
      setRecording(true)
    } catch {
      setRecErr('Microphone ki ijazat darkaar hai.')
    }
  }, [ask])

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
      <PageIntro backHref="/" backLabel="← Ghar" title="Raah">
        <p>
          Urdu, Hindi ya Kashmiri (Roman) — Whisper + LLM + TTS. Yojana, fasal,
          kagaz.
        </p>
      </PageIntro>

      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-center text-xs text-[var(--raasta-muted)]">
          Bada mic — browser sunega. Whisper ke liye record.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <MicButton onActivate={startBrowserSTT} />
          <button
            type="button"
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${recording ? 'bg-gradient-to-br from-[var(--chinar-amber)] to-[var(--chinar-gold)] text-[#faf8f4] shadow-sm' : 'raasta-btn-secondary'}`}
            onClick={recording ? stopRecordWhisper : startRecordWhisper}
            disabled={busy || browserListen}
          >
            {recording ? '● Rok' : '⏺ Whisper'}
          </button>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-[var(--chinar-gold)] underline decoration-[var(--chinar-amber)] underline-offset-2"
          onClick={() => {
            const q = 'Mujhe PM Kisan yojana ke baare mein batao'
            setQuestion(q)
            void ask(q)
          }}
          disabled={busy}
        >
          Demo: PM Kisan (script)
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
          Sawal
        </label>
        <textarea
          id="raah-q"
          rows={3}
          className="raasta-input w-full resize-none"
          placeholder="Yahan likh sakte hain: e.g. Yeh kagaz kyaa kehta hai?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="button"
          className="raasta-btn-primary mt-3 w-full"
          disabled={busy || !question.trim()}
          onClick={() => void ask(question)}
        >
          {busy ? 'Soch rahe hain…' : 'Bhejein'}
        </button>
      </div>

      <VoiceOutput text={answer} label="Raah ka jawab" />
    </div>
  )
}
