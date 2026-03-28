'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'

const jobCards = [
  { title: 'Location-Based Jobs', body: 'Nearby opportunities with filters for remote or part-time.' },
  { title: 'Skill Match', body: 'See your match percentage and improve it.' },
  { title: 'One-Click Apply', body: 'Use Voice CV or profile to apply faster.' },
  { title: 'Local Work', body: 'Agriculture, crafts, and small-business roles.' },
] as const

export default function NaukriPage() {
  const { locale, t } = useI18n()

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <section className="px-8 md:px-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <PageIntro
              backHref="/taleem"
              backLabel={t('nav.backTaleem')}
              title={t('naukri.title')}
            >
              <p>{t('naukri.lead')}</p>
            </PageIntro>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {jobCards.map((card) => (
                <div key={card.title} className="raasta-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    Jobs
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
                alt="Jobs visual"
                className="h-[320px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src="https://cdn.dribbble.com/userupload/16157342/file/original-0e26ffcc46ea4f0c32dac16fca68a9c0.png?format=webp&resize=400x300&vertical=center"
              />
            </div>
            <div className="mt-4 raasta-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Employment Hub
              </p>
              <p className="mt-3 text-sm text-[var(--raasta-muted)]">
                Get matched, apply fast, and track alerts in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <TaleemVoiceForm
          label={t('naukri.label')}
          placeholder={t('naukri.ph')}
          submitLabel={t('naukri.btn')}
          onSubmit={(message) => taleemLlm({ locale, pillar: 'naukri', message })}
        />
      </section>
    </main>
  )
}
