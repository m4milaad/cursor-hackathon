'use client'

import { PageIntro } from '@/components/PageIntro'
import { VoiceOutput } from '@/components/VoiceOutput'
import { taleemLlm } from '@/lib/taleemApi'
import { speakText } from '@/lib/tts'
import { useState } from 'react'

export default function CvPage() {
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [s3, setS3] = useState('')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    if (!s1.trim() && !s2.trim() && !s3.trim()) return
    setBusy(true)
    setOut('')
    const message = `Sentence 1: ${s1.trim()}\nSentence 2: ${s2.trim()}\nSentence 3: ${s3.trim()}`
    try {
      const text = await taleemLlm({ pillar: 'cv', message })
      setOut(text)
      await speakText(
        'CV English mein tayyar ho gaya. Neeche download bhi kar sakte hain.',
      )
    } finally {
      setBusy(false)
    }
  }

  function download() {
    if (!out) return
    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'raasta-cv-en.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/taleem" backLabel="← Taleem" title="CV — awaaz se">
        <p>
          Teen jumley Urdu / Roman Urdu mein — clean English CV (text file).
        </p>
      </PageIntro>

      <div className="mt-2 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--raasta-muted)]">
            Pehla jumlaa — kaun hain aap?
          </label>
          <textarea
            className="raasta-input min-h-[72px] w-full resize-y"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--raasta-muted)]">
            Doosra — kya seekha / kya kiya?
          </label>
          <textarea
            className="raasta-input min-h-[72px] w-full resize-y"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--raasta-muted)]">
            Teesra — kya karna chahte hain?
          </label>
          <textarea
            className="raasta-input min-h-[72px] w-full resize-y"
            value={s3}
            onChange={(e) => setS3(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        className="raasta-btn-primary mt-4 w-full"
        disabled={busy || (!s1.trim() && !s2.trim() && !s3.trim())}
        onClick={() => void run()}
      >
        {busy ? 'English CV bana rahe hain…' : 'CV banao'}
      </button>

      {out ? (
        <button
          type="button"
          className="raasta-btn-secondary mt-3 text-sm"
          onClick={download}
        >
          ⬇ Download .txt
        </button>
      ) : null}

      <VoiceOutput text={out} label="English CV" />
    </div>
  )
}
