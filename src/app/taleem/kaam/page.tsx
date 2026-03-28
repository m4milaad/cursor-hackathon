'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'
import { useMemo, useState } from 'react'

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
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel={t('nav.backTaleem')}
        title={t('kaam.title')}
      >
        <p>{t('kaam.lead')}</p>
      </PageIntro>

      <div className="mt-2">
        <TaleemSubTabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

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
    </div>
  )
}
