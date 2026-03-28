'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { useMemo, useState } from 'react'

const wellnessCards = [
  { title: 'Voice Venting', body: 'Speak freely. The AI listens without judgment.' },
  { title: 'Daily Calm', body: '2-minute breathing and grounding routines.' },
  { title: 'Mood Tracker', body: 'Track patterns and reflect weekly.' },
  { title: 'Crisis Support', body: 'If distress is detected, we guide to help.' },
] as const

const STORY_KEYS = [
  { titleKey: 'suk.story1t', bodyKey: 'suk.story1b' },
  { titleKey: 'suk.story2t', bodyKey: 'suk.story2b' },
] as const

export default function SukoonPage() {
  const { locale, t } = useI18n()
  const [tab, setTab] = useState<string>('checkin')

  const tabs = useMemo(
    () => [
      { id: 'checkin', label: t('tab.checkin') },
      { id: 'stories', label: t('tab.stories') },
      { id: 'helpline', label: t('tab.helpline') },
    ],
    [t],
  )

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <section className="px-8 md:px-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <PageIntro
              backHref="/taleem"
              backLabel={t('nav.backTaleem')}
              title={t('sukoon.title')}
            >
              <p>{t('sukoon.lead')}</p>
            </PageIntro>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wellnessCards.map((card) => (
                <div key={card.title} className="raasta-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    Support
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
                alt="Sukoon visual"
                className="h-[320px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src="https://headartworks.com/cdn/shop/articles/DALL_E_2024-09-16_17.32.54_-_A_serene_and_calming_image_to_accompany_a_blog_about_natural_aromatherapy_incense_The_image_features_a_beautifully_lit_space_with_soft_warm_tones_A_set_of.webp?v=1726523239"
              />
            </div>
            <div className="mt-4 raasta-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Safe Space
              </p>
              <p className="mt-3 text-sm text-[var(--raasta-muted)]">
                A calmer, slower interface that helps you breathe and feel heard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <TaleemSubTabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === 'checkin' && (
          <>
            <TaleemVoiceForm
              label={t('suk.check.label')}
              placeholder={t('suk.check.ph')}
              submitLabel={t('suk.check.btn')}
              onSubmit={(message) =>
                taleemLlm({ locale, pillar: 'sukoon', sub: 'checkin', message })
              }
            />
            <p className="mt-4 text-xs text-[var(--raasta-muted)]">
              {t('suk.warn')}
            </p>
          </>
        )}

        {tab === 'stories' && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STORY_KEYS.map((s) => (
              <li key={s.titleKey} className="raasta-card p-5">
                <p className="font-headline text-lg text-[var(--color-primary)]">
                  {t(s.titleKey)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--raasta-ink)]">
                  {t(s.bodyKey)}
                </p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'helpline' && (
          <div className="raasta-card p-6 space-y-4">
            <p className="text-sm text-[var(--raasta-muted)]">{t('suk.help.p')}</p>
            <a
              href="tel:9999666555"
              className="block rounded-[var(--radius-lg)] border-2 border-[var(--color-secondary)] bg-[var(--color-secondary-fixed)] px-4 py-4 text-center font-semibold text-[var(--color-primary)]"
            >
              {t('suk.help.v')}
            </a>
            <a
              href="tel:9152987821"
              className="raasta-btn-secondary block text-center"
            >
              {t('suk.help.i')}
            </a>
            <p className="text-xs text-[var(--raasta-muted)]">{t('suk.help.e')}</p>
          </div>
        )}
      </section>
    </main>
  )
}
