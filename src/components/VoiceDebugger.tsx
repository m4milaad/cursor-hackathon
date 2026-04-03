'use client'

import { useEffect, useState } from 'react'
import { getAvailableVoices } from '@/lib/tts'

export function VoiceDebugger() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getAvailableVoices()
      setVoices(availableVoices)
    }

    // Load voices
    loadVoices()

    // Voices might load asynchronously
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-[#00271d] text-[#fbf9f4] px-3 py-2 rounded text-xs z-50"
      >
        🔊 Debug Voices
      </button>
    )
  }

  const urduVoices = voices.filter(v => v.lang.startsWith('ur'))
  const hindiVoices = voices.filter(v => v.lang.startsWith('hi'))
  const englishVoices = voices.filter(v => v.lang.startsWith('en'))

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-[#00271d] rounded-lg p-4 max-w-md max-h-96 overflow-y-auto z-50 shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-headline text-sm">Available Voices</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-[#885207] hover:text-[#00271d]"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <p className="font-semibold text-[#00271d] mb-1">
            Urdu Voices ({urduVoices.length})
          </p>
          {urduVoices.length > 0 ? (
            <ul className="list-disc list-inside text-[#414845]">
              {urduVoices.map((v, i) => (
                <li key={i}>
                  {v.name} ({v.lang})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#885207] italic">
              ⚠️ No Urdu voices found. Will use Hindi as fallback.
            </p>
          )}
        </div>

        <div>
          <p className="font-semibold text-[#00271d] mb-1">
            Hindi Voices ({hindiVoices.length})
          </p>
          {hindiVoices.length > 0 ? (
            <ul className="list-disc list-inside text-[#414845]">
              {hindiVoices.map((v, i) => (
                <li key={i}>
                  {v.name} ({v.lang})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#885207] italic">No Hindi voices found</p>
          )}
        </div>

        <div>
          <p className="font-semibold text-[#00271d] mb-1">
            English Voices ({englishVoices.length})
          </p>
          {englishVoices.length > 0 ? (
            <ul className="list-disc list-inside text-[#414845]">
              {englishVoices.slice(0, 3).map((v, i) => (
                <li key={i}>
                  {v.name} ({v.lang})
                </li>
              ))}
              {englishVoices.length > 3 && (
                <li className="text-[#885207]">
                  ... and {englishVoices.length - 3} more
                </li>
              )}
            </ul>
          ) : (
            <p className="text-[#885207] italic">No English voices found</p>
          )}
        </div>

        <div className="pt-2 border-t border-[#e8e3d8]">
          <p className="text-[#885207]">
            Total voices: {voices.length}
          </p>
        </div>

        <div className="pt-2 border-t border-[#e8e3d8]">
          <p className="font-semibold text-[#00271d] mb-1">How to add Urdu voice:</p>
          <ol className="list-decimal list-inside text-[#414845] space-y-1">
            <li>Windows: Settings → Time & Language → Speech → Add voices</li>
            <li>Android: Settings → System → Languages → Text-to-speech</li>
            <li>iOS: Settings → Accessibility → Spoken Content → Voices</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
