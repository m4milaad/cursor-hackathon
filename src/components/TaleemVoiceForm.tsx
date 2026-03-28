'use client'

import { VoiceOutput } from '@/components/VoiceOutput'
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
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--raasta-ink)]">
        {label}
      </label>
      <textarea
        className="raasta-input min-h-[100px] w-full resize-y"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="button"
        className="raasta-btn-primary mt-3 w-full sm:w-auto"
        disabled={busy || !text.trim()}
        onClick={() => void run()}
      >
        {busy ? busyText : submitLabel}
      </button>
      <VoiceOutput text={out} />
    </div>
  )
}
