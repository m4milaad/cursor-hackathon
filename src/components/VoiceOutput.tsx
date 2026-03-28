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
    <div className="raasta-voice-out mt-6 text-left">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--raasta-muted)]">
        {heading}
      </p>
      <p className="text-[1.05rem] leading-relaxed text-[var(--raasta-ink)]">
        {text}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="raasta-btn-secondary text-sm"
          onClick={() => void speakForLocale(text, locale)}
        >
          ▶ {t('voice.listen')}
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
