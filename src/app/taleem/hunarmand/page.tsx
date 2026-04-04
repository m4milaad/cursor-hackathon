'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { useEffect, useMemo, useState } from 'react'
import type { Mentor } from '@/app/api/taleem/mentors/route'

const featureCards = [
  { title: 'Idea to Business AI', body: 'Describe your idea and get a practical plan, costs, and skills needed.' },
  { title: 'Feasibility Checker', body: 'Demand level, risk score, and early profit estimate for your idea.' },
  { title: 'Skill Path', body: 'A short learning roadmap tailored to your business idea.' },
  { title: 'Mentor & Schemes', body: 'Connect with mentors and discover matching government schemes.' },
] as const

export default function HunarmandPage() {
  const { locale, t } = useI18n()
  const [tab, setTab] = useState<string>('idea')
  const [lastIdea, setLastIdea] = useState('')
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [mentorsLoading, setMentorsLoading] = useState(false)

  const tabs = useMemo(
    () => [
      { id: 'idea', label: t('tab.idea') },
      { id: 'schemes', label: t('tab.schemes') },
      { id: 'mentor', label: t('tab.mentor') },
    ],
    [t],
  )

  // Fetch mentors when mentor tab opens, using last idea as context
  useEffect(() => {
    if (tab === 'mentor' && mentors.length === 0) {
      setMentorsLoading(true)
      const idea = lastIdea || 'business startup Kashmir'
      fetch(`/api/taleem/mentors?idea=${encodeURIComponent(idea)}`)
        .then(r => r.json())
        .then(d => { if (d.mentors) setMentors(d.mentors) })
        .catch(() => {})
        .finally(() => setMentorsLoading(false))
    }
  }, [tab, mentors.length, lastIdea])

  const handleIdeaSubmit = async (message: string) => {
    setLastIdea(message)
    setMentors([]) // reset so mentors refresh with new idea context
    return taleemLlm({ locale, pillar: 'hunarmand', sub: 'idea', message })
  }

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      <section className="px-8 md:px-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <PageIntro backHref="/taleem" backLabel={t('nav.backTaleem')} title={t('hunarmand.title')}>
              <p>{t('hunarmand.lead')}</p>
            </PageIntro>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureCards.map((card) => (
                <div key={card.title} className="raasta-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">Module</p>
                  <h3 className="mt-2 font-headline text-xl text-[var(--color-primary)]">{card.title}</h3>
                  <p className="mt-3 text-sm text-[var(--raasta-muted)]">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="overflow-hidden border border-[var(--raasta-border)]">
              <img alt="Hunarmand visual" className="h-[320px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="https://upload.wikimedia.org/wikipedia/commons/7/74/Kmrwalnut.jpg" />
            </div>
            <div className="mt-4 raasta-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">Launchpad</p>
              <p className="mt-3 text-sm text-[var(--raasta-muted)]">Turn ideas into income with clear steps, local support, and real-world advice.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <TaleemSubTabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === 'idea' && (
          <TaleemVoiceForm
            label={t('hun.idea.label')}
            placeholder={t('hun.idea.ph')}
            submitLabel={t('hun.idea.btn')}
            onSubmit={handleIdeaSubmit}
          />
        )}

        {tab === 'schemes' && (
          <TaleemVoiceForm
            label={t('hun.sch.label')}
            placeholder={t('hun.sch.ph')}
            submitLabel={t('hun.sch.btn')}
            onSubmit={(message) => taleemLlm({ locale, pillar: 'hunarmand', sub: 'schemes', message })}
          />
        )}

        {tab === 'mentor' && (
          <div>
            {mentorsLoading ? (
              <div className="flex items-center gap-3 py-10 opacity-60">
                <span className="w-4 h-4 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Finding relevant mentors...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map((m, i) => (
                  <div key={i} className="raasta-card p-5">
                    <p className="font-headline text-lg text-[var(--color-primary)]">{m.name}</p>
                    <p className="text-xs uppercase tracking-widest text-[var(--color-secondary)] mt-1">{m.domain}</p>
                    <p className="text-sm text-[var(--raasta-muted)] mt-2">{m.org}</p>
                    {m.contact && (
                      <p className="text-sm text-[var(--raasta-ink)] mt-1">{m.contact}</p>
                    )}
                    {m.profileUrl && (
                      <a
                        href={m.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs uppercase tracking-widest text-[var(--color-secondary)] hover:underline"
                      >
                        Visit Profile →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-[var(--raasta-muted)]">
              {t('hun.mentor.note')}
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
