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
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<IntentResult | null>(null)
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Initialize browser speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'ur-PK' // Urdu

        recognitionRef.current.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript
          setTranscript(transcript)
          setIsListening(false)
          setIsProcessing(true)

          // Detect intent
          try {
            const response = await fetch('/api/intent-detection', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: transcript }),
            })

            if (!response.ok) throw new Error('Intent detection failed')

            const data: IntentResult = await response.json()
            setResult(data)

            // Auto-navigate after 2 seconds
            setTimeout(() => {
              router.push(data.route)
            }, 2000)
          } catch (err) {
            setError('Failed to detect intent. Please try again.')
            setIsProcessing(false)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setError('Voice recognition failed. Please try again.')
          setIsListening(false)
          setIsProcessing(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [router])

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition not supported in this browser')
      return
    }

    setError('')
    setTranscript('')
    setResult(null)
    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  return (
    <section ref={containerRef} className="relative w-full h-[250vh]">
      {/* Sticky container that locks during scroll */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center text-center">
        
        {/* The canvas animation sitting in the background */}
        <HeroScrollAnimation scrollContainerRef={containerRef} />
        
        {/* The Hero content floating on top */}
        <div className="relative z-20 flex flex-col items-center pt-24">
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-[var(--color-secondary)] mb-4 drop-shadow-[0_1px_3px_rgba(255,255,255,0.6)]">
            The Digital Archivist
          </span>
          <h2
            className="font-headline text-6xl md:text-8xl font-bold tracking-tighter mb-2"
            style={{
              color: 'var(--color-primary-container)',
              textShadow: '0 2px 12px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)',
            }}
          >
            RAASTA
          </h2>
          <p
            className="font-headline italic text-xl md:text-2xl mb-12"
            style={{
              color: 'var(--color-on-surface)',
              textShadow: '0 1px 8px rgba(255,255,255,0.5)',
            }}
          >
            Your AI companion for Kashmiri heritage &amp; progress.
          </p>

          {/* Status Display */}
          {(transcript || error || result) && (
            <div className="mb-6 bg-white border-2 border-green-500 rounded-2xl shadow-2xl p-6 max-w-sm animate-fade-in">
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

          {/* Primary Hero Mic Button with Green Speak functionality */}
          <div className="relative group cursor-pointer mt-8">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`
                w-28 h-28 md:w-32 md:h-32 flex items-center justify-center relative z-10 rounded-full shadow-2xl transition-all duration-300
                ${isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : isProcessing
                  ? 'bg-yellow-500 animate-spin'
                  : 'bg-[var(--color-primary-container)] hover:opacity-90'
                }
                ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
                text-white
              `}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isProcessing ? (
                <span className="material-symbols-outlined text-4xl animate-spin">
                  sync
                </span>
              ) : isListening ? (
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stop
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mic
                </span>
              )}

              {/* Pulse animation ring */}
              {isListening && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
              )}
            </button>
            <div className="absolute -inset-4 border border-[var(--color-secondary)] opacity-20 pointer-events-none rounded-full"></div>
          </div>
          <p
            className="font-label text-[10px] uppercase tracking-widest mt-8 opacity-90"
            style={{
              color: 'var(--color-on-surface)',
              textShadow: '0 1px 6px rgba(255,255,255,0.5)',
            }}
          >
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to converse in Kashmiri or English'}
          </p>
        </div>

      </div>
    </section>
  )
}
