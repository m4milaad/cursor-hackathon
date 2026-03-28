'use client'

import { ImageUploader } from '@/components/ImageUploader'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { useI18n } from '@/lib/i18n/context'
import { explainDocumentSimpleUrdu } from '@/lib/llm'
import { extractTextFromImage } from '@/lib/ocr'
import { speakForLocale } from '@/lib/tts'
import { useState } from 'react'

export default function SamjhoPage() {
  const { locale, t } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState('')

  async function run() {
    if (!file) return
    setLoading(true)
    setExplanation('')
    try {
      const text = await extractTextFromImage(file)
      const out = await explainDocumentSimpleUrdu(text, locale)
      setExplanation(out)
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
        title={t('samjho.title')}
      >
        <p>{t('samjho.lead')}</p>
      </PageIntro>

      <div className="mt-2">
        <ImageUploader
          label={t('samjho.upload')}
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
        {loading ? t('samjho.btnLoading') : t('samjho.btn')}
      </button>

      <VoiceOutput text={explanation} label={t('samjho.out')} />
    </div>
  )
}
