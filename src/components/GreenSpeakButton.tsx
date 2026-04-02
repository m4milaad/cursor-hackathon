'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface IntentResult {
  intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown'
  confidence: number
  query: string
  route: string
  detectedLanguage?: string
}

export function GreenSpeakButton() {
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
        // Pass the query and detected language to the target page
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
    if (isRecording) {
      stopRecording()
    } else if (!isProcessing) {
      startRecording()
    }
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
        onClick={handleButtonClick}
        disabled={isProcessing}
        className={`
          relative w-20 h-20 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300 transform
          ${isRecording 
            ? 'bg-red-500 scale-110 animate-pulse' 
            : isProcessing
            ? 'bg-yellow-500'
            : 'bg-green-500 hover:scale-110 hover:shadow-3xl'
          }
          ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
          disabled:opacity-50
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isProcessing ? (
          <span className="material-symbols-outlined text-white text-4xl animate-spin">
            sync
          </span>
        ) : isRecording ? (
          <span className="material-symbols-outlined text-white text-4xl">
            stop
          </span>
        ) : (
          <span className="material-symbols-outlined text-white text-4xl">
            mic
          </span>
        )}

        {/* Pulse animation ring */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
        )}
      </button>

      {/* Helper Text */}
      {!isRecording && !isProcessing && !transcript && (
        <p className="text-xs text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">
          Tap to speak in any language
        </p>
      )}
    </div>
  )
}
