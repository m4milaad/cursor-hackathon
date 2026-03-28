'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { taleemLlm } from '@/lib/taleemApi'
import { useState } from 'react'

const tabs = [
  { id: 'idea', label: 'Idea check' },
  { id: 'schemes', label: 'Schemes' },
  { id: 'mentor', label: 'Mentor' },
] as const

export default function HunarmandPage() {
  const [tab, setTab] = useState<string>('idea')

  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/taleem" backLabel="← Taleem" title="Hunarmand">
        <p>
          Business launchpad — idea, schemes, ecosystem. Roman Urdu jawab.
        </p>
      </PageIntro>

      <div className="mt-2">
        <TaleemSubTabs
          tabs={[...tabs]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'idea' && (
        <TaleemVoiceForm
          label="Apna idea bol kar likhein"
          placeholder='Misaal: "Main seb ka juice bana kar online bechna chahta hoon"'
          submitLabel="Feedback lo"
          onSubmit={(message) =>
            taleemLlm({ pillar: 'hunarmand', sub: 'idea', message })
          }
        />
      )}

      {tab === 'schemes' && (
        <TaleemVoiceForm
          label="Umar, zila, aur idea — chhota sa bayan"
          placeholder="Misaal: 22 saal, Baramulla, chhota food business"
          submitLabel="Schemes dikhao"
          onSubmit={(message) =>
            taleemLlm({ pillar: 'hunarmand', sub: 'schemes', message })
          }
        />
      )}

      {tab === 'mentor' && (
        <div className="space-y-4 text-sm text-[var(--raasta-ink)]">
          <p className="text-[var(--raasta-muted)]">
            Asli mentor phone / WhatsApp par — yahan se shuruat ke official
            raste. Numbers hamesha official site se verify karein.
          </p>
          <ul className="raasta-card space-y-3 p-4">
            <li>
              <strong>JKEDI / startup cell</strong> — J&amp;K entrepreneur
              support; workshops aur incubation.
            </li>
            <li>
              <strong>District Industries Centre (DIC)</strong> — apne zile
              ka DIC / CSC: Udyam, Mudra guidance.
            </li>
            <li>
              <strong>Local ITI / polytechnic</strong> — skill programs aur
              placement help.
            </li>
          </ul>
          <p className="text-xs text-[var(--raasta-muted)]">
            Demo build — aap apne hackathon ke liye yahan real mentor desk ka
            WhatsApp ya form link daal sakte hain.
          </p>
        </div>
      )}
    </div>
  )
}
