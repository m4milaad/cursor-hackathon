'use client'

import { VoiceOutput } from '@/components/VoiceOutput'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useI18n } from '@/lib/i18n/context'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

type Props = {
  label: string
  placeholder: string
  submitLabel: string
  onSubmit: (text: string) => Promise<string>
  busyMessage?: string
}

export function TaleemVoiceForm({
  label,
  placeholder,
  submitLabel,
  onSubmit,
  busyMessage,
}: Props) {
  const { locale, t } = useI18n()
  const busyText = busyMessage ?? t('common.thinking')
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)
  const voice = useVoiceRecorder({
    locale,
    onTranscript: (spokenText) => {
      setText((previous) =>
        previous.trim() ? `${previous.trim()} ${spokenText}` : spokenText,
      )
    },
  })

  async function run() {
    const trimmed = text.trim()
    if (!trimmed) return
    setBusy(true)
    setOut('')
    try {
      const reply = await onSubmit(trimmed)
      setOut(reply)
      await speakForLocale(reply, locale)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="raasta-card p-6 md:p-8">
      <label className="mb-2 block text-sm font-medium text-[var(--raasta-ink)]">
        {label}
      </label>
      <textarea
        className="raasta-input min-h-[120px] w-full resize-y"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`raasta-btn-secondary text-sm flex items-center gap-2 ${voice.recording ? 'border-red-500 text-red-600' : ''}`}
          disabled={busy || !voice.supported}
          onClick={() => {
            voice.clearError()
            if (voice.recording) {
              voice.stop()
            } else {
              void voice.start()
            }
          }}
        >
          {voice.recording ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Stop Mic
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">mic</span>
              Use Mic
            </>
          )}
        </button>
        <button
          type="button"
          className="raasta-btn-primary"
          disabled={busy || voice.recording || voice.transcribing || !text.trim()}
          onClick={() => void run()}
        >
          {busy ? busyText : submitLabel}
        </button>
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--raasta-muted)]">
          Voice input + voice-ready response
        </span>
      </div>
      {voice.error ? (
        <p className="mt-3 text-xs text-[var(--color-error)]">{voice.error}</p>
      ) : null}
      {!voice.supported ? (
        <p className="mt-3 text-xs text-[var(--raasta-muted)]">
          Voice input not supported in this browser — please type your message.
        </p>
      ) : null}
      <VoiceOutput text={out} />
    </div>
  )
}
