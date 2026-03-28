'use client'

import { ImageUploader } from '@/components/ImageUploader'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { extractMarksheetText } from '@/lib/ocr'
import { taleemLlm } from '@/lib/taleemApi'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

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
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel={t('nav.backTaleem')}
        title={t('sch.title')}
      >
        <p>{t('sch.lead')}</p>
      </PageIntro>

      <div className="mt-2">
        <ImageUploader
          label={t('sch.upload')}
          onFile={setFile}
          capture="environment"
        />
      </div>

      <button
        type="button"
        className="raasta-btn-primary mt-6 w-full"
        disabled={!file || busy}
        onClick={() => void run()}
      >
        {busy ? t('sch.loading') : t('sch.btn')}
      </button>

      <VoiceOutput text={out} label={t('sch.out')} />
    </div>
  )
}
