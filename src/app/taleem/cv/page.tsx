'use client'

import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

const steps = [
  'Tell us who you are.',
  'Share your experience or learning.',
  'Describe what you want next.',
] as const

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
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <section className="px-8 md:px-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <PageIntro
              backHref="/taleem"
              backLabel={t('nav.backTaleem')}
              title={t('cv.title')}
            >
              <p>{t('cv.lead')}</p>
            </PageIntro>
            <div className="raasta-card p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Voice CV Steps
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--raasta-muted)]">
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="overflow-hidden border border-[var(--raasta-border)]">
              <img
                alt="Voice CV visual"
                className="h-[320px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src="https://cdn.dribbble.com/userupload/47064660/file/ed118ed4aa3440362317007c5cfa540e.jpg?resize=752x&vertical=center"
              />
            </div>
            <div className="mt-4 raasta-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Shareable Profile
              </p>
              <p className="mt-3 text-sm text-[var(--raasta-muted)]">
                Convert voice into a clean CV and a shareable link.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <div className="raasta-card p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="raasta-btn-primary"
              disabled={busy || (!s1.trim() && !s2.trim() && !s3.trim())}
              onClick={() => void run()}
            >
              {busy ? t('cv.busy') : t('cv.btn')}
            </button>
            {out ? (
              <button type="button" className="raasta-btn-secondary text-sm" onClick={download}>
                {t('common.downloadTxt')}
              </button>
            ) : null}
          </div>
          <VoiceOutput text={out} label={t('cv.out')} />
        </div>
      </section>
    </main>
  )
}
