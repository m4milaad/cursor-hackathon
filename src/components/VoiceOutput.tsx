'use client'

import { speakText, stopSpeaking } from '@/lib/tts'

type Props = {
  text: string
  label?: string
}

export function VoiceOutput({ text, label = 'Jawaab' }: Props) {
  if (!text) return null

  return (
    <div className="raasta-voice-out mt-6 text-left">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--raasta-muted)]">
        {label}
      </p>
      <p className="text-[1.05rem] leading-relaxed text-[var(--raasta-ink)]">
        {text}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="raasta-btn-secondary text-sm"
          onClick={() => speakText(text)}
        >
          ▶ Suno
        </button>
        <button
          type="button"
          className="raasta-ghost text-sm"
          onClick={() => stopSpeaking()}
        >
          Rok dein
        </button>
      </div>
    </div>
  )
}
