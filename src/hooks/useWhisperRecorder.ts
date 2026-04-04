'use client'

import { useCallback, useRef, useState } from 'react'
import { uploadAudioForTranscript } from '@/lib/whisper'

type LangHint = 'auto' | 'ur' | 'en' | 'hi'

function hintToWhisperCode(h: LangHint): string | undefined {
  if (h === 'auto') return undefined
  return h
}

export function useWhisperRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    const mr = mediaRecorder.current
    if (mr && mr.state !== 'inactive') mr.stop()
  }, [])

  const record = useCallback(
    async (
      language: LangHint,
      onDone: (result: {
        transcript: string
        language: string
        error?: string
      }) => void,
    ) => {
      setError(null)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        chunks.current = []
        const mr = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4',
        })
        mediaRecorder.current = mr

        mr.ondataavailable = (e) => {
          if (e.data.size) chunks.current.push(e.data)
        }

        mr.onstop = async () => {
          setRecording(false)
          stream.getTracks().forEach((t) => t.stop())
          streamRef.current = null
          const type = mr.mimeType || 'audio/webm'
          const blob = new Blob(chunks.current, { type })
          chunks.current = []
          setProcessing(true)
          try {
            const r = await uploadAudioForTranscript(
              blob,
              hintToWhisperCode(language),
            )
            if (!r.ok) {
              setError(r.error ?? 'Transcription failed')
              onDone({
                transcript: '',
                language: r.language,
                error: r.error,
              })
              return
            }
            if (!r.transcript.trim()) {
              setError('No speech detected. Try again or type your story.')
              onDone({ transcript: '', language: r.language, error: 'empty' })
              return
            }
            onDone({ transcript: r.transcript, language: r.language })
          } catch {
            setError('Network error during transcription.')
            onDone({ transcript: '', language: 'unknown', error: 'network' })
          } finally {
            setProcessing(false)
          }
        }

        mr.start()
        setRecording(true)
      } catch {
        setError('Microphone permission denied or unavailable.')
      }
    },
    [],
  )

  return { recording, processing, error, setError, record, stop }
}
