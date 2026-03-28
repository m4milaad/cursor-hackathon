'use client'

import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

export default function ExamPage() {
  const { locale, t } = useI18n()
  const [ans, setAns] = useState('')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)

  const demoQ = t('exam.demoQuestion')

  async function run() {
    const trimmed = ans.trim()
    if (!trimmed) return
    setBusy(true)
    setOut('')
    const message = `Question:\n${demoQ}\n\nStudent answer:\n${trimmed}`
    try {
      const text = await taleemLlm({ locale, pillar: 'exam', message })
      setOut(text)
      await speakForLocale(text, locale)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel={t('nav.backTaleem')}
        title={t('exam.title')}
      >
        <p>{t('exam.lead')}</p>
      </PageIntro>

      <div className="raasta-card mt-2 p-4 text-sm leading-relaxed text-[var(--raasta-ink)]">
        {demoQ}
      </div>

      <label className="mt-4 mb-1 block text-sm font-medium text-[var(--raasta-ink)]">
        {t('exam.answerLabel')}
      </label>
      <textarea
        className="raasta-input min-h-[88px] w-full resize-y"
        placeholder={t('exam.placeholder')}
        value={ans}
        onChange={(e) => setAns(e.target.value)}
      />
      <button
        type="button"
        className="raasta-btn-primary mt-3 w-full"
        disabled={busy || !ans.trim()}
        onClick={() => void run()}
      >
        {busy ? t('exam.busy') : t('exam.btn')}
      </button>

      <VoiceOutput text={out} label={t('exam.out')} />
    </div>
  )
}
