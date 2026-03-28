'use client'

import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

export default function CvPage() {
  const { locale, t } = useI18n()
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [s3, setS3] = useState('')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    if (!s1.trim() && !s2.trim() && !s3.trim()) return
    setBusy(true)
    setOut('')
    const message = `Sentence 1: ${s1.trim()}\nSentence 2: ${s2.trim()}\nSentence 3: ${s3.trim()}`
    try {
      const text = await taleemLlm({ locale, pillar: 'cv', message })
      setOut(text)
      await speakForLocale(t('cv.ttsDone'), locale)
    } finally {
      setBusy(false)
    }
  }

  function download() {
    if (!out) return
    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'raasta-cv-en.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel={t('nav.backTaleem')}
        title={t('cv.title')}
      >
        <p>{t('cv.lead')}</p>
      </PageIntro>

      <div className="mt-2 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--raasta-muted)]">
            {t('cv.l1')}
          </label>
          <textarea
            className="raasta-input min-h-[72px] w-full resize-y"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--raasta-muted)]">
            {t('cv.l2')}
          </label>
          <textarea
            className="raasta-input min-h-[72px] w-full resize-y"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--raasta-muted)]">
            {t('cv.l3')}
          </label>
          <textarea
            className="raasta-input min-h-[72px] w-full resize-y"
            value={s3}
            onChange={(e) => setS3(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        className="raasta-btn-primary mt-4 w-full"
        disabled={busy || (!s1.trim() && !s2.trim() && !s3.trim())}
        onClick={() => void run()}
      >
        {busy ? t('cv.busy') : t('cv.btn')}
      </button>

      {out ? (
        <button
          type="button"
          className="raasta-btn-secondary mt-3 text-sm"
          onClick={download}
        >
          ⬇ {t('common.downloadTxt')}
        </button>
      ) : null}

      <VoiceOutput text={out} label={t('cv.out')} />
    </div>
  )
}
