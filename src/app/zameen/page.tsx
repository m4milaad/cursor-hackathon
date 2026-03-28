'use client'

import { ImageUploader } from '@/components/ImageUploader'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { explainCropAdvice } from '@/lib/llm'
import { analyzeCropImage } from '@/lib/vision'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

export default function ZameenPage() {
  const { locale, t } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState('')

  async function run() {
    if (!file) return
    setLoading(true)
    setAdvice('')
    try {
      const { summary, mandiHint } = await analyzeCropImage(file)
      const out = await explainCropAdvice(summary, mandiHint, locale)
      setAdvice(out)
      await speakForLocale(out, locale)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/"
        backLabel={t('nav.backHome')}
        title={t('zameen.title')}
      >
        <p>{t('zameen.lead')}</p>
      </PageIntro>

      <div className="mt-2">
        <ImageUploader
          label={t('zameen.upload')}
          onFile={setFile}
          capture="environment"
        />
      </div>

      <button
        type="button"
        className="raasta-btn-primary mt-6 w-full"
        disabled={!file || loading}
        onClick={() => void run()}
      >
        {loading ? t('zameen.btnLoading') : t('zameen.btn')}
      </button>

      <VoiceOutput text={advice} label={t('zameen.out')} />
    </div>
  )
}
