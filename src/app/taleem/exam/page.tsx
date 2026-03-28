'use client'

import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

const examCards = [
  { title: 'Topic Practice', body: 'Break subjects into clear, daily chunks.' },
  { title: 'AI Quizzes', body: 'Short questions with instant feedback.' },
  { title: 'Smart Revision', body: 'Weak topics repeat more often.' },
  { title: 'Progress Tracking', body: 'Accuracy and consistency snapshots.' },
] as const

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
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <section className="px-8 md:px-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <PageIntro
              backHref="/taleem"
              backLabel={t('nav.backTaleem')}
              title={t('exam.title')}
            >
              <p>{t('exam.lead')}</p>
            </PageIntro>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {examCards.map((card) => (
                <div key={card.title} className="raasta-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    Prep
                  </p>
                  <h3 className="mt-2 font-headline text-xl text-[var(--color-primary)]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--raasta-muted)]">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="overflow-hidden border border-[var(--raasta-border)]">
              <img
                alt="Exam prep visual"
                className="h-[320px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src="https://i.pinimg.com/736x/05/a9/41/05a94145c536490427f7a433cefb3679.jpg"
              />
            </div>
            <div className="mt-4 raasta-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Daily Practice
              </p>
              <p className="mt-3 text-sm text-[var(--raasta-muted)]">
                Short questions, consistent rhythm, smarter revision.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <div className="raasta-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
            Practice Question
          </p>
          <div className="mt-3 text-sm leading-relaxed text-[var(--raasta-ink)]">
            {demoQ}
          </div>

          <label className="mt-6 mb-1 block text-sm font-medium text-[var(--raasta-ink)]">
            {t('exam.answerLabel')}
          </label>
          <textarea
            className="raasta-input min-h-[120px] w-full resize-y"
            placeholder={t('exam.placeholder')}
            value={ans}
            onChange={(e) => setAns(e.target.value)}
          />
          <button
            type="button"
            className="raasta-btn-primary mt-4"
            disabled={busy || !ans.trim()}
            onClick={() => void run()}
          >
            {busy ? t('exam.busy') : t('exam.btn')}
          </button>

          <VoiceOutput text={out} label={t('exam.out')} />
        </div>
      </section>
    </main>
  )
}
