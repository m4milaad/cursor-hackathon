'use client'

import { ImageUploader } from '@/components/ImageUploader'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { extractMarksheetText } from '@/lib/ocr'
import { taleemLlm } from '@/lib/taleemApi'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

const scholarshipCards = [
  { title: 'Smart Finder', body: 'Match by income, course, and location.' },
  { title: 'Eligibility Check', body: 'Quickly see what you qualify for.' },
  { title: 'Application Guide', body: 'Step-by-step help for forms and docs.' },
  { title: 'Deadline Tracker', body: 'Never miss a window again.' },
] as const

export default function ScholarshipPage() {
  const { locale, t } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    if (!file) return
    setBusy(true)
    setOut('')
    try {
      const ocrText = await extractMarksheetText(file)
      const text = await taleemLlm({ locale, pillar: 'scholarship', ocrText })
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
              title={t('sch.title')}
            >
              <p>{t('sch.lead')}</p>
            </PageIntro>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scholarshipCards.map((card) => (
                <div key={card.title} className="raasta-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    Scholarships
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
                alt="Scholarship visual"
                className="h-[320px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src="https://marketplace.canva.com/EAGtQCcp8qM/1/0/640w/canva-purple-and-white-modern-scholarship-program-instagram-post-MBNi__SvVAw.jpg"
              />
            </div>
            <div className="mt-4 raasta-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Access
              </p>
              <p className="mt-3 text-sm text-[var(--raasta-muted)]">
                Upload your marksheet to get matched and guided.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <div className="raasta-card p-6 md:p-8">
          <ImageUploader label={t('sch.upload')} onFile={setFile} capture="environment" />

          <button
            type="button"
            className="raasta-btn-primary mt-6"
            disabled={!file || busy}
            onClick={() => void run()}
          >
            {busy ? t('sch.loading') : t('sch.btn')}
          </button>

          <VoiceOutput text={out} label={t('sch.out')} />
        </div>
      </section>
    </main>
  )
}
