'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type UseVoiceRecorderOptions = {
  onTranscript: (text: string) => void
  locale?: string
}

function localeToSpeechLang(locale?: string): string {
  switch (locale) {
    case 'ur': return 'ur-PK'
    case 'hi': return 'hi-IN'
    case 'ks': return 'hi-IN' // Kashmiri not widely supported; hi-IN is closest
    case 'en':
    default:   return 'en-US'
  }
}

// Extend window type for browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export function useVoiceRecorder({ onTranscript, locale }: UseVoiceRecorderOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Voice input is not supported in this browser. Please type your message.')
      return
    }

    try {
      // Request mic permission first so we get a clear error if denied
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access was denied. Please allow microphone access and try again.')
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition

    // Set language based on UI locale
    recognition.lang = localeToSpeechLang(locale)
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setRecording(true)
      setTranscribing(false)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (transcript) {
        onTranscript(transcript)
      } else {
        setError('No speech detected. Please try again.')
      }
    }

    recognition.onerror = (event) => {
      setRecording(false)
      setTranscribing(false)
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Microphone access was denied. Please allow microphone access in your browser settings.')
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please speak clearly and try again.')
      } else if (event.error === 'network') {
        setError('Network error during voice recognition. Please check your connection.')
      } else {
        setError(`Voice recognition error: ${event.error}. Please try typing instead.`)
      }
    }

    recognition.onend = () => {
      setRecording(false)
      setTranscribing(false)
      recognitionRef.current = null
    }

    recognition.start()
  }, [onTranscript])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setRecording(false)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    recording,
    transcribing,
    error,
    supported,
    start,
    stop,
    clearError,
  }
}
