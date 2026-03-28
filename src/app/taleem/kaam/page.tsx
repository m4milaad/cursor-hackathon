'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { useMemo, useState } from 'react'

const careerCards = [
  { title: 'Career Quiz', body: 'Map your interests and strengths in minutes.' },
  { title: 'Skill Mapping', body: 'See which skills you already have and what to learn.' },
  { title: 'Roadmap Builder', body: 'Step-by-step path with courses and timelines.' },
  { title: 'Course Picks', body: 'Free and paid options that match your goal.' },
] as const

export default function KaamPage() {
  const { locale, t } = useI18n()
  const [tab, setTab] = useState<string>('skill')

  const tabs = useMemo(
    () => [
      { id: 'skill', label: t('tab.skill') },
      { id: 'gig', label: t('tab.gig') },
      { id: 'freelance', label: t('tab.freelance') },
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
              title={t('kaam.title')}
            >
              <p>{t('kaam.lead')}</p>
            </PageIntro>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careerCards.map((card) => (
                <div key={card.title} className="raasta-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    Career
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
                alt="Career discovery visual"
                className="h-[320px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src="https://www.rightmentors.in/files/blog/Leonardo_Phoenix_09_An_Indian_high_school_student_sitting_at_a_1.jpg"
              />
            </div>
            <div className="mt-4 raasta-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                Discovery
              </p>
              <p className="mt-3 text-sm text-[var(--raasta-muted)]">
                Answer the big question: what should I do next, and how do I get there.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <TaleemSubTabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === 'skill' && (
          <TaleemVoiceForm
            label={t('kaam.skill.label')}
            placeholder={t('kaam.skill.ph')}
            submitLabel={t('kaam.skill.btn')}
            onSubmit={(message) =>
              taleemLlm({ locale, pillar: 'kaam', sub: 'skill', message })
            }
          />
        )}

        {tab === 'gig' && (
          <TaleemVoiceForm
            label={t('kaam.gig.label')}
            placeholder={t('kaam.gig.ph')}
            submitLabel={t('kaam.gig.btn')}
            onSubmit={(message) =>
              taleemLlm({ locale, pillar: 'kaam', sub: 'gig', message })
            }
          />
        )}

        {tab === 'freelance' && (
          <TaleemVoiceForm
            label={t('kaam.free.label')}
            placeholder={t('kaam.free.ph')}
            submitLabel={t('kaam.free.btn')}
            onSubmit={(message) =>
              taleemLlm({ locale, pillar: 'kaam', sub: 'freelance', message })
            }
          />
        )}
      </section>
    </main>
  )
}
