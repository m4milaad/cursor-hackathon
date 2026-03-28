'use client'

import { useI18n } from '@/lib/i18n/context'
import { speakForLocale, stopSpeaking } from '@/lib/tts'

type Props = {
  text: string
  label?: string
}

export function VoiceOutput({ text, label }: Props) {
  const { locale, t } = useI18n()
  const heading = label ?? t('voice.answer')

  if (!text) return null

  return (
    <div className="raasta-voice-out mt-8 text-left">
      {/* Label */}
      <p
        className="mb-3 text-xs font-bold uppercase tracking-[0.16em]"
        style={{
          background: 'linear-gradient(90deg, var(--amber-deep), var(--amber-mid))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {heading}
      </p>

      {/* Response text */}
      <p
        className="text-[1.05rem] leading-[1.7] text-[var(--ink)]"
        style={{ animation: 'typeReveal 0.6s ease-out' }}
      >
        {text}
      </p>

      {/* Audio controls */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className="raasta-btn-secondary inline-flex items-center gap-2 text-sm"
          onClick={() => void speakForLocale(text, locale)}
        >
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--chinar-mid)]"
            style={{ animation: 'breathe 1.5s ease-in-out infinite' }}
            aria-hidden
          />
          {t('voice.listen')}
        </button>
        <button
          type="button"
          className="raasta-ghost text-sm"
          onClick={() => stopSpeaking()}
        >
          {t('voice.stop')}
        </button>
      </div>
    </div>
  )
}
