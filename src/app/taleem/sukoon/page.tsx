'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { useEffect, useMemo, useState } from 'react'
import type { PeerStory } from '@/app/api/taleem/stories/route'
import type { Helpline } from '@/app/api/taleem/helplines/route'

const wellnessCards = [
  { title: 'Voice Venting', body: 'Speak freely. The AI listens without judgment.' },
  { title: 'Daily Calm', body: '2-minute breathing and grounding routines.' },
  { title: 'Mood Tracker', body: 'Track patterns and reflect weekly.' },
  { title: 'Crisis Support', body: 'If distress is detected, we guide to help.' },
] as const

export default function SukoonPage() {
  const { locale, t } = useI18n()
  const [tab, setTab] = useState<string>('checkin')
  const [stories, setStories] = useState<PeerStory[]>([])
  const [storiesLoading, setStoriesLoading] = useState(false)
  const [helplines, setHelplines] = useState<Helpline[]>([])
  const [helplinesLoading, setHelplinesLoading] = useState(false)
  const [lastCheckin, setLastCheckin] = useState('')

  const tabs = useMemo(
    () => [
      { id: 'checkin', label: t('tab.checkin') },
      { id: 'stories', label: t('tab.stories') },
      { id: 'helpline', label: t('tab.helpline') },
    ],
    [t],
  )

  // Fetch AI-generated stories when tab opens
  useEffect(() => {
    if (tab === 'stories' && stories.length === 0) {
      setStoriesLoading(true)
      const ctx = lastCheckin ? `&context=${encodeURIComponent(lastCheckin.slice(0, 100))}` : ''
      fetch(`/api/taleem/stories${ctx}`)
        .then(r => r.json())
        .then(d => { if (d.stories) setStories(d.stories) })
        .catch(() => {})
        .finally(() => setStoriesLoading(false))
    }
  }, [tab, stories.length, lastCheckin])

  // Fetch dynamic helplines when tab opens
  useEffect(() => {
    if (tab === 'helpline' && helplines.length === 0) {
      setHelplinesLoading(true)
      fetch('/api/taleem/helplines')
        .then(r => r.json())
        .then(d => { if (d.helplines) setHelplines(d.helplines) })
        .catch(() => {})
        .finally(() => setHelplinesLoading(false))
    }
  }, [tab, helplines.length])

  const handleCheckin = async (message: string) => {
    setLastCheckin(message)
    setStories([]) // reset stories so they regenerate with new context
    return taleemLlm({ locale, pillar: 'sukoon', sub: 'checkin', message })
  }

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
              onSubmit={handleCheckin}
            />
            <p className="mt-4 text-xs text-[var(--raasta-muted)]">
              {t('suk.warn')}
            </p>
          </>
        )}

        {tab === 'stories' && (
          <div>
            {storiesLoading ? (
              <div className="flex items-center gap-3 py-10 opacity-60">
                <span className="w-4 h-4 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Generating peer stories...</span>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stories.map((s, i) => (
                  <li key={i} className="raasta-card p-5">
                    <p className="font-headline text-lg text-[var(--color-primary)]">
                      {s.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--raasta-ink)]">
                      {s.body}
                    </p>
                    {s.theme && (
                      <p className="mt-3 text-xs uppercase tracking-widest text-[var(--color-secondary)] opacity-60">
                        {s.theme.replace(/_/g, ' ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'helpline' && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--raasta-muted)]">{t('suk.help.p')}</p>
            {helplinesLoading ? (
              <div className="flex items-center gap-3 py-6 opacity-60">
                <span className="w-4 h-4 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading helplines...</span>
              </div>
            ) : helplines.length === 0 ? (
              <div className="raasta-card p-6 space-y-4">
                <a href="tel:9999666555" className="block rounded-[var(--radius-lg)] border-2 border-[var(--color-secondary)] bg-[var(--color-secondary-fixed)] px-4 py-4 text-center font-semibold text-[var(--color-primary)]">
                  Vandrevala Foundation — 9999666555
                </a>
                <a href="tel:9152987821" className="raasta-btn-secondary block text-center">
                  iCall (TISS) — 9152987821
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helplines.map((h, i) => (
                  <div key={i} className={`raasta-card p-5 ${h.type === 'crisis' || i === 0 ? 'border-2 border-[var(--color-secondary)]' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-headline text-base text-[var(--color-primary)]">{h.name}</p>
                        <p className="text-xs uppercase tracking-widest text-[var(--color-secondary)] mt-1">{h.type} • {h.coverage}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${h.type === 'government' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {h.type}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--raasta-muted)]">{h.description}</p>
                    <a
                      href={`tel:${h.phone.replace(/\D/g, '')}`}
                      className="mt-3 block text-center bg-[var(--color-primary)] text-[var(--color-on-primary)] py-2 text-sm font-semibold hover:bg-[var(--color-secondary)] transition-colors"
                    >
                      Call {h.phone}
                    </a>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-[var(--raasta-muted)]">{t('suk.help.e')}</p>
          </div>
        )}
      </section>
    </main>
  )
}
