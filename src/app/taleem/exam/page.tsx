'use client'

import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { taleemLlm } from '@/lib/taleemApi'
import { speakText } from '@/lib/tts'
import { useState } from 'react'

const DEMO_Q = `JKSSB General Knowledge (demo): Bharat ki pehli all-India census kis saal hui thi — (a) 1861 (b) 1872 (c) 1881 (d) 1891?`

export default function ExamPage() {
  const [ans, setAns] = useState('')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    const t = ans.trim()
    if (!t) return
    setBusy(true)
    setOut('')
    const message = `Sawal:\n${DEMO_Q}\n\nStudent ka jawab:\n${t}`
    try {
      const text = await taleemLlm({ pillar: 'exam', message })
      setOut(text)
      await speakText(text)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/taleem" backLabel="← Taleem" title="Exam prep">
        <p>
          Rozana practice — ek sawal, awaaz ya type se jawab, chhota feedback
          Roman Urdu mein.
        </p>
      </PageIntro>

      <div className="raasta-card mt-2 p-4 text-sm leading-relaxed text-[var(--raasta-ink)]">
        {DEMO_Q}
      </div>

      <label className="mt-4 mb-1 block text-sm font-medium text-[var(--raasta-ink)]">
        Apna jawab
      </label>
      <textarea
        className="raasta-input min-h-[88px] w-full resize-y"
        placeholder="Option ya explanation Urdu / English mix mein"
        value={ans}
        onChange={(e) => setAns(e.target.value)}
      />
      <button
        type="button"
        className="raasta-btn-primary mt-3 w-full"
        disabled={busy || !ans.trim()}
        onClick={() => void run()}
      >
        {busy ? 'Feedback…' : 'Check karein'}
      </button>

      <VoiceOutput text={out} label="Coach ka feedback" />
    </div>
  )
}
