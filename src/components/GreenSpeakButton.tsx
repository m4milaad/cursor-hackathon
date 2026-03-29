'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface IntentResult {
  intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown'
  confidence: number
  query: string
  route: string
}

export function GreenSpeakButton() {
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
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Status Display */}
      {(transcript || error || result) && (
        <div className="bg-white border-2 border-green-500 rounded-2xl shadow-2xl p-6 max-w-sm animate-fade-in">
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

      {/* Main Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`
          relative w-20 h-20 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300 transform
          ${isListening 
            ? 'bg-red-500 scale-110 animate-pulse' 
            : isProcessing
            ? 'bg-yellow-500 animate-spin'
            : 'bg-green-500 hover:scale-110 hover:shadow-3xl'
          }
          ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
          disabled:opacity-50
        `}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isProcessing ? (
          <span className="material-symbols-outlined text-white text-4xl animate-spin">
            sync
          </span>
        ) : isListening ? (
          <span className="material-symbols-outlined text-white text-4xl">
            stop
          </span>
        ) : (
          <span className="material-symbols-outlined text-white text-4xl">
            mic
          </span>
        )}

        {/* Pulse animation ring */}
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
        )}
      </button>

      {/* Helper Text */}
      {!isListening && !isProcessing && !transcript && (
        <p className="text-xs text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">
          Tap to speak
        </p>
      )}
    </div>
  )
}
