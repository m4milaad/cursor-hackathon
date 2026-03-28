'use client'

import { ImageUploader } from '@/components/ImageUploader'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { explainDocumentSimpleUrdu } from '@/lib/llm'
import { extractTextFromImage } from '@/lib/ocr'
import { speakText } from '@/lib/tts'
import { useState } from 'react'

export default function SamjhoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState('')

  async function run() {
    if (!file) return
    setLoading(true)
    setExplanation('')
    try {
      const text = await extractTextFromImage(file)
      const out = await explainDocumentSimpleUrdu(text)
      setExplanation(out)
      await speakText(out)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/" backLabel="← Ghar" title="Samjho">
        <p>
          Notice, form ya khat ki tasveer — hum Roman Urdu / Kashmiri (Latin)
          mein samjhaenge. OCR + AI.
        </p>
      </PageIntro>

      <div className="mt-2">
        <ImageUploader
          label="Document ki photo"
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
        {loading ? 'Padh rahe hain…' : 'Samjho — explain karein'}
      </button>

      <VoiceOutput text={explanation} label="Samjho ka jawab" />
    </div>
  )
}
