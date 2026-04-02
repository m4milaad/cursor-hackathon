'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeroScrollAnimation } from '@/components/HeroScrollAnimation'

interface IntentResult {
  intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown'
  confidence: number
  query: string
  route: string
}

export function HomeHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<IntentResult | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        
        setIsProcessing(true)
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError('')
      setTranscript('')
      setResult(null)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('🎤 Processing audio, size:', audioBlob.size)
      
      // Step 1: Transcribe audio (Whisper auto-detects language)
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.webm')

      console.log('📝 Calling transcribe API...')
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed')
      }

      const transcribeData = await transcribeResponse.json()
      const transcribedText = transcribeData.text || ''
      
      console.log('✅ Transcribed:', transcribedText)

      if (!transcribedText) {
        setError('Could not understand audio. Please try again.')
        setIsProcessing(false)
        return
      }

      setTranscript(transcribedText)

      // Step 2: Detect intent and route
      console.log('🎯 Calling intent detection API...')
      const intentResponse = await fetch('/api/intent-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transcribedText }),
      })

      if (!intentResponse.ok) {
        throw new Error('Intent detection failed')
      }

      const intentData: IntentResult = await intentResponse.json()
      console.log('✅ Intent detected:', intentData.intent, 'route:', intentData.route)
      setResult(intentData)

      // Auto-navigate after 2 seconds
      setTimeout(() => {
        console.log('🚀 Navigating to:', intentData.route)
        const params = new URLSearchParams({
          q: transcribedText,
          autoSpeak: 'true'
        })
        router.push(`${intentData.route}?${params.toString()}`)
      }, 2000)
    } catch (err) {
      console.error('❌ Processing error:', err)
      setError('Failed to process audio. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleButtonClick = () => {
    console.log('🔘 Button clicked! isRecording:', isRecording, 'isProcessing:', isProcessing)
    alert('Button clicked! Check console for details.')
    if (isRecording) {
      console.log('⏹️ Stopping recording...')
      stopRecording()
    } else if (!isProcessing) {
      console.log('▶️ Starting recording...')
      startRecording()
    } else {
      console.log('⏳ Already processing, ignoring click')
    }
  }

  return (
    <section ref={containerRef} className="relative w-full h-[220vh] md:h-[250vh]">
      {/* Sticky container that locks during scroll */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center text-center">
        
        {/* The canvas animation sitting in the background */}
        <HeroScrollAnimation scrollContainerRef={containerRef} />
        
        {/* The Hero content floating on top */}
        <div className="relative z-20 flex flex-col items-center pt-20 sm:pt-24 px-4 sm:px-8">
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-[var(--color-secondary)] mb-4 drop-shadow-[0_1px_3px_rgba(255,255,255,0.6)]">
            The Digital Archivist
          </span>
          <h2
            className="font-headline text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-2"
            style={{
              color: 'var(--color-primary-container)',
              textShadow: '0 2px 12px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)',
            }}
          >
            RAASTA
          </h2>
          <p
            className="font-headline italic text-base sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-xl"
            style={{
              color: 'var(--color-on-surface)',
              textShadow: '0 1px 8px rgba(255,255,255,0.5)',
            }}
          >
            Your AI companion for Kashmiri heritage &amp; progress.
          </p>

          {/* Status Display */}
          {(transcript || error || result) && (
            <div className="mb-6 bg-white border-2 border-green-500 rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-sm animate-fade-in">
              {error && (
                <div className="text-red-600 text-sm font-medium">{error}</div>
              )}
              
              {transcript && !result && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">You said:</p>
                  <p className="text-sm font-medium text-gray-900">{transcript}</p>
                </div>
              )}

              {result && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Detected Intent:</p>
                  <p className="text-lg font-bold text-green-600 capitalize mb-2">
                    {result.intent}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Routing to {result.route}...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Primary Hero Mic Button - Dark themed */}
          <div className="relative group cursor-pointer mt-6 sm:mt-8 z-30">
            <button
              onClick={handleButtonClick}
              disabled={isProcessing}
              className={`
                w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center relative z-10 rounded-full shadow-2xl transition-all duration-300
                ${isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : isProcessing
                  ? 'bg-yellow-500'
                  : 'bg-[#143d32] hover:bg-[#0f2e25]'
                }
                ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
                text-white
              `}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isProcessing ? (
                <span className="material-symbols-outlined text-3xl sm:text-4xl animate-spin">
                  sync
                </span>
              ) : isRecording ? (
                <span className="material-symbols-outlined text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stop
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-3xl sm:text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mic
                </span>
              )}

              {/* Pulse animation ring */}
              {isRecording && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
              )}
            </button>
            <div className="absolute -inset-4 border border-[var(--color-secondary)] opacity-20 pointer-events-none rounded-full"></div>
          </div>
          <p
            className="font-label text-[10px] uppercase tracking-widest mt-6 sm:mt-8 opacity-90 max-w-xs"
            style={{
              color: 'var(--color-on-surface)',
              textShadow: '0 1px 6px rgba(255,255,255,0.5)',
            }}
          >
            {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to converse in any language'}
          </p>
        </div>

      </div>
    </section>
  )
}
