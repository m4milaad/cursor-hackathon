'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { useI18n } from '@/lib/i18n/context'
import { taleemLlm } from '@/lib/taleemApi'

export default function NaukriPage() {
  const { locale, t } = useI18n()

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel={t('nav.backTaleem')}
        title={t('naukri.title')}
      >
        <p>{t('naukri.lead')}</p>
      </PageIntro>
      <div className="mt-2">
        <TaleemVoiceForm
          label={t('naukri.label')}
          placeholder={t('naukri.ph')}
          submitLabel={t('naukri.btn')}
          onSubmit={(message) => taleemLlm({ locale, pillar: 'naukri', message })}
        />
      </div>
    </div>
  )
}
