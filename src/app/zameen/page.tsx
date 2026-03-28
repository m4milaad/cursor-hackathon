'use client'

import { ImageUploader } from '@/components/ImageUploader'
import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { explainCropAdvice } from '@/lib/llm'
import { analyzeCropImage } from '@/lib/vision'
import { speakText } from '@/lib/tts'
import { useState } from 'react'

export default function ZameenPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState('')

  async function run() {
    if (!file) return
    setLoading(true)
    setAdvice('')
    try {
      const { summary, mandiHint } = await analyzeCropImage(file)
      const out = await explainCropAdvice(summary, mandiHint)
      setAdvice(out)
      await speakText(out)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/" backLabel="← Ghar" title="Zameen">
        <p>
          Pattay ya fasal ki tasveer — vision model se beemaari, ilaaj, aur mandi
          bhav.
        </p>
      </PageIntro>

      <div className="mt-2">
        <ImageUploader
          label="Crop / pattay ki photo"
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
        {loading ? 'Dekh rahe hain…' : 'Jaanch karein'}
      </button>

      <VoiceOutput text={advice} label="Zameen ki salah" />
    </div>
  )
}
