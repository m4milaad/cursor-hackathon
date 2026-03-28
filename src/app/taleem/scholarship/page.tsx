'use client'

import { ImageUploader } from '@/components/ImageUploader'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { extractMarksheetText } from '@/lib/ocr'
import { taleemLlm } from '@/lib/taleemApi'
import { speakText } from '@/lib/tts'
import { useState } from 'react'

export default function ScholarshipPage() {
  const [file, setFile] = useState<File | null>(null)
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    if (!file) return
    setBusy(true)
    setOut('')
    try {
      const ocrText = await extractMarksheetText(file)
      const text = await taleemLlm({ pillar: 'scholarship', ocrText })
      setOut(text)
      await speakText(text)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel="← Taleem"
        title="Scholarship finder"
      >
        <p>
          Marksheet ki photo — OCR + AI batayega kis qism ki scholarships dekhi
          jaayein (official portal hamesha verify karein).
        </p>
      </PageIntro>

      <div className="mt-2">
        <ImageUploader
          label="Marksheet / marks card"
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
        {busy ? 'Padh rahe hain…' : 'Scholarships match karo'}
      </button>

      <VoiceOutput text={out} label="Scholarship mashwara" />
    </div>
  )
}
