'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

type Props = {
  /** Navigate to Raah (home screen). */
  navigateToRaah?: boolean
  /** Primary mic action on Raah — e.g. browser speech recognition. */
  onActivate?: () => void
}

export function MicButton({ navigateToRaah = false, onActivate }: Props) {
  const router = useRouter()
  const [pulse, setPulse] = useState(false)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onPress = useCallback(() => {
    setPulse(true)
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => setPulse(false), 520)
    if (onActivate) {
      onActivate()
      return
    }
    if (navigateToRaah) router.push('/raah')
  }, [navigateToRaah, onActivate, router])

  return (
    <button
      type="button"
      className={`raasta-mic relative z-[1] flex h-[6.75rem] w-[6.75rem] items-center justify-center rounded-full border-[5px] border-[var(--mic-ring)] bg-gradient-to-br from-[var(--chinar-deep)] via-[var(--chinar-mid)] to-[var(--chinar-light)] text-4xl text-[#faf8f4] shadow-[var(--shadow-mic)] transition hover:scale-[1.03] hover:shadow-[0_16px_44px_rgba(20,61,50,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--chinar-amber)] active:scale-95 ${pulse ? 'raasta-mic-pulse' : ''}`}
      onClick={onPress}
      aria-label={
        onActivate
          ? 'Start listening with microphone'
          : 'Open voice assistant Raah'
      }
    >
      <span aria-hidden>🎤</span>
    </button>
  )
}
