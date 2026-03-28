'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { useMemo, useState } from 'react'

export default function HunarmandPage() {
  const { locale, t } = useI18n()
  const [tab, setTab] = useState<string>('idea')

  const tabs = useMemo(
    () => [
      { id: 'idea', label: t('tab.idea') },
      { id: 'schemes', label: t('tab.schemes') },
      { id: 'mentor', label: t('tab.mentor') },
    ],
    [t],
  )

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel={t('nav.backTaleem')}
        title={t('hunarmand.title')}
      >
        <p>{t('hunarmand.lead')}</p>
      </PageIntro>

      <div className="mt-2">
        <TaleemSubTabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {tab === 'idea' && (
        <TaleemVoiceForm
          label={t('hun.idea.label')}
          placeholder={t('hun.idea.ph')}
          submitLabel={t('hun.idea.btn')}
          onSubmit={(message) =>
            taleemLlm({ locale, pillar: 'hunarmand', sub: 'idea', message })
          }
        />
      )}

      {tab === 'schemes' && (
        <TaleemVoiceForm
          label={t('hun.sch.label')}
          placeholder={t('hun.sch.ph')}
          submitLabel={t('hun.sch.btn')}
          onSubmit={(message) =>
            taleemLlm({ locale, pillar: 'hunarmand', sub: 'schemes', message })
          }
        />
      )}

      {tab === 'mentor' && (
        <div className="space-y-4 text-sm text-[var(--raasta-ink)]">
          <p className="text-[var(--raasta-muted)]">{t('hun.mentor.p1')}</p>
          <ul className="raasta-card space-y-3 p-4">
            <li>{t('hun.mentor.li1')}</li>
            <li>{t('hun.mentor.li2')}</li>
            <li>{t('hun.mentor.li3')}</li>
          </ul>
          <p className="text-xs text-[var(--raasta-muted)]">
            {t('hun.mentor.note')}
          </p>
        </div>
      )}
    </div>
  )
}
