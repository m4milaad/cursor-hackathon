'use client'

import { transcribeAudio } from '@/lib/whisper'
import { useCallback, useRef, useState } from 'react'

type UseVoiceRecorderOptions = {
  onTranscript: (text: string) => void
}

export function useVoiceRecorder({ onTranscript }: UseVoiceRecorderOptions) {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream.current = stream
      chunks.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorder.current = mr

      mr.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data)
        }
      }

      mr.onstop = async () => {
        setRecording(false)
        mediaStream.current?.getTracks().forEach((track) => track.stop())
        mediaStream.current = null

        setTranscribing(true)
        try {
          const blob = new Blob(chunks.current, { type: 'audio/webm' })
          chunks.current = []
          const result = await transcribeAudio(blob)
          if (!result.text) {
            setError(
              result.demo
                ? 'Transcription is unavailable right now (demo mode).'
                : 'No speech detected. Please try again.',
            )
            return
          }
          onTranscript(result.text)
        } catch {
          setError('Unable to transcribe audio. Please try again.')
        } finally {
          setTranscribing(false)
        }
      }

      mr.start()
      setRecording(true)
    } catch {
      setError('Microphone access was denied.')
    }
  }, [onTranscript])

  const stop = useCallback(() => {
    const mr = mediaRecorder.current
    if (!mr || mr.state === 'inactive') return
    mr.stop()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    recording,
    transcribing,
    error,
    start,
    stop,
    clearError,
  }
}
