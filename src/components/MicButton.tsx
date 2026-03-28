'use client'

import { useI18n } from '@/lib/i18n/context'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

type Props = {
  navigateToRaah?: boolean
  onActivate?: () => void
}

export function MicButton({ navigateToRaah = false, onActivate }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pulse, setPulse] = useState(false)
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onPress = useCallback(() => {
    setPulse(true)
    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    pulseTimer.current = setTimeout(() => setPulse(false), 520)
    if (onActivate) {
      onActivate()
      return
    }
    if (navigateToRaah) router.push('/raah')
  }, [navigateToRaah, onActivate, router])

  return (
    <div className="relative flex items-center justify-center">
      {/* Concentric breathing rings */}
      <span
        className="absolute h-[9rem] w-[9rem] rounded-full sm:h-[10.5rem] sm:w-[10.5rem]"
        style={{
          border: '1px solid rgba(30, 92, 74, 0.06)',
          animation: 'breathe 3s ease-in-out infinite',
        }}
        aria-hidden
      />
      <span
        className="absolute h-[11rem] w-[11rem] rounded-full sm:h-[13rem] sm:w-[13rem]"
        style={{
          border: '1px solid rgba(30, 92, 74, 0.04)',
          animation: 'breathe 3s ease-in-out 0.5s infinite',
        }}
        aria-hidden
      />
      <span
        className="absolute h-[13rem] w-[13rem] rounded-full sm:h-[15.5rem] sm:w-[15.5rem]"
        style={{
          border: '1px solid rgba(30, 92, 74, 0.02)',
          animation: 'breathe 3s ease-in-out 1s infinite',
        }}
        aria-hidden
      />

      {/* Ambient glow aura */}
      <span
        className="absolute h-[7.5rem] w-[7.5rem] rounded-full sm:h-[9rem] sm:w-[9rem]"
        style={{
          background: 'radial-gradient(circle, rgba(30, 92, 74, 0.08) 0%, rgba(196, 131, 58, 0.04) 50%, transparent 70%)',
          animation: 'breathe 4s ease-in-out infinite',
        }}
        aria-hidden
      />

      {/* Main button */}
      <button
        type="button"
        className={`relative z-[1] flex h-[7rem] w-[7rem] items-center justify-center rounded-full text-4xl text-[#faf8f4] transition-all duration-300 hover:scale-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--amber-mid)] active:scale-95 sm:h-[8rem] sm:w-[8rem] sm:text-5xl ${pulse ? 'raasta-mic-pulse' : ''}`}
        style={{
          background: 'linear-gradient(145deg, var(--chinar-forest) 0%, var(--chinar-mid) 50%, var(--chinar-light) 100%)',
          boxShadow: 'var(--shadow-mic)',
          border: '4px solid var(--mic-ring)',
        }}
        onClick={onPress}
        aria-label={
          onActivate ? t('mic.ariaListening') : t('mic.ariaOpenRaah')
        }
      >
        <span aria-hidden>🎤</span>

        {/* Inner shimmer */}
        <span
          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 60%)',
          }}
          aria-hidden
        />
      </button>
    </div>
  )
}
