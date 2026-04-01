'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getGuideAssistance, getFallbackRoute, type GuideResponse } from '@/lib/guideAssistant'

interface GuideAssistantProps {
  userInput: string
  onGuidanceReceived?: (guidance: GuideResponse) => void
  autoNavigate?: boolean
}

export function GuideAssistant({ 
  userInput, 
  onGuidanceReceived,
  autoNavigate = false 
}: GuideAssistantProps) {
  const router = useRouter()
  const [guidance, setGuidance] = useState<GuideResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGetGuidance = async () => {
    if (!userInput.trim()) return

    setLoading(true)
    try {
      // Try API first, fallback to keyword matching
      let result: GuideResponse
      try {
        result = await getGuideAssistance(userInput)
      } catch {
        result = getFallbackRoute(userInput)
      }

      setGuidance(result)
      onGuidanceReceived?.(result)

      // Auto-navigate if enabled
      if (autoNavigate && result.route) {
        setTimeout(() => {
          router.push(result.route!)
        }, 2000) // Give user time to read the guidance
      }
    } catch (error) {
      console.error('Guide assistant error:', error)
      const fallback = getFallbackRoute(userInput)
      setGuidance(fallback)
      onGuidanceReceived?.(fallback)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Samajh raha hoon...
          </p>
        </div>
      </div>
    )
  }

  if (!guidance) {
    return (
      <button
        onClick={handleGetGuidance}
        className="raasta-btn-primary w-full"
      >
        🧭 Guide Karein
      </button>
    )
  }

  return (
    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-6 rounded-lg space-y-4">
      {/* Module Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold rounded-full">
          {guidance.module === 'SAMJHO' && '📄'}
          {guidance.module === 'ZAMEEN' && '🌾'}
          {guidance.module === 'TALEEM' && '🎓'}
          {guidance.module === 'RAAH' && '🧭'}
          {guidance.module}
        </span>
        <span className="text-xs text-[var(--color-on-surface-variant)]">
          {guidance.action.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Message */}
      <p className="text-base text-[var(--color-on-surface)] font-medium">
        {guidance.message}
      </p>

      {/* Steps */}
      <div className="space-y-2">
        {guidance.steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-3 text-sm text-[var(--color-on-surface-variant)]"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </div>
        ))}
      </div>

      {/* Navigation Button */}
      {guidance.route && (
        <button
          onClick={() => router.push(guidance.route!)}
          className="raasta-btn-primary w-full mt-4"
        >
          {guidance.module} mein jayen →
        </button>
      )}
    </div>
  )
}

/**
 * Inline Guide Assistant - shows guidance inline without button
 */
export function InlineGuideAssistant({ userInput }: { userInput: string }) {
  const [guidance, setGuidance] = useState<GuideResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const loadGuidance = async () => {
    if (!userInput.trim() || loading) return

    setLoading(true)
    try {
      let result: GuideResponse
      try {
        result = await getGuideAssistance(userInput)
      } catch {
        result = getFallbackRoute(userInput)
      }
      setGuidance(result)
    } catch (error) {
      console.error('Inline guide error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-load when userInput changes
  if (userInput && !guidance && !loading) {
    void loadGuidance()
  }

  if (loading) {
    return (
      <div className="text-xs text-[var(--color-on-surface-variant)] italic">
        💡 Samajh raha hoon...
      </div>
    )
  }

  if (!guidance) return null

  return (
    <div className="bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] p-4 rounded-lg text-sm space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base">💡</span>
        <span className="font-semibold">Suggestion:</span>
      </div>
      <p>{guidance.message}</p>
      {guidance.route && (
        <button
          onClick={() => router.push(guidance.route!)}
          className="text-xs underline hover:no-underline"
        >
          {guidance.module} mein jayen →
        </button>
      )}
    </div>
  )
}
