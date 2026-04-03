/**
 * Browser-based speech recognition (free, no API needed)
 * Works in Chrome, Edge, Safari
 */

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface BrowserSpeechRecognition {
  start: () => void
  stop: () => void
  isSupported: boolean
}

/**
 * Create browser speech recognition instance
 */
export function createBrowserSpeechRecognition(
  language: string = 'en-IN',
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void
): BrowserSpeechRecognition | null {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return null
  }

  // Check for browser support
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    console.warn('Browser does not support speech recognition')
    return {
      start: () => onError('Speech recognition not supported in this browser'),
      stop: () => {},
      isSupported: false
    }
  }

  const recognition = new SpeechRecognition()
  recognition.lang = language
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event: any) => {
    const result = event.results[0]
    if (result) {
      const transcript = result[0].transcript
      const confidence = result[0].confidence
      onResult({
        transcript,
        confidence,
        isFinal: result.isFinal
      })
    }
  }

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error)
    
    let errorMessage = 'Speech recognition error'
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.'
        break
      case 'audio-capture':
        errorMessage = 'Microphone not available. Please check permissions.'
        break
      case 'not-allowed':
        errorMessage = 'Microphone permission denied. Please allow microphone access.'
        break
      case 'network':
        errorMessage = 'Network error. Please check your connection.'
        break
      default:
        errorMessage = `Speech recognition error: ${event.error}`
    }
    
    onError(errorMessage)
  }

  recognition.onend = () => {
    onEnd()
  }

  return {
    start: () => {
      try {
        recognition.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        onError('Failed to start speech recognition')
      }
    },
    stop: () => {
      try {
        recognition.stop()
      } catch (error) {
        console.error('Failed to stop recognition:', error)
      }
    },
    isSupported: true
  }
}

/**
 * Check if browser supports speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  
  return !!(
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition
  )
}

/**
 * Get language code for speech recognition
 */
export function getSpeechRecognitionLanguage(locale: string): string {
  const languageMap: Record<string, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'ur': 'ur-IN',
    'bn': 'bn-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'or': 'or-IN',
    'as': 'as-IN',
    'ks': 'hi-IN', // Kashmiri uses Hindi recognition
    'ne': 'ne-IN',
  }
  
  return languageMap[locale] || 'en-IN'
}
