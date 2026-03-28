'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { useMemo, useState } from 'react'

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
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel={t('nav.backTaleem')}
        title={t('sukoon.title')}
      >
        <p>{t('sukoon.lead')}</p>
      </PageIntro>

      <div className="mt-2">
        <TaleemSubTabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

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
        <ul className="space-y-4">
          {STORY_KEYS.map((s) => (
            <li key={s.titleKey} className="raasta-card p-4">
              <p className="font-display text-base font-semibold text-[var(--chinar-deep)]">
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
        <div className="space-y-4">
          <p className="text-sm text-[var(--raasta-muted)]">{t('suk.help.p')}</p>
          <a
            href="tel:9999666555"
            className="block rounded-[var(--radius-lg)] border-2 border-[var(--chinar-amber)] bg-[var(--chinar-glow)] px-4 py-4 text-center font-semibold text-[var(--chinar-deep)]"
          >
            {t('suk.help.v')}
          </a>
          <a
            href="tel:9152987821"
            className="raasta-card block px-4 py-4 text-center font-semibold text-[var(--chinar-deep)]"
          >
            {t('suk.help.i')}
          </a>
          <p className="text-xs text-[var(--raasta-muted)]">{t('suk.help.e')}</p>
        </div>
      )}
    </div>
  )
}
