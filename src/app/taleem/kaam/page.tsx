'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { taleemLlm } from '@/lib/taleemApi'
import { useState } from 'react'

const tabs = [
  { id: 'skill', label: 'Skill map' },
  { id: 'gig', label: 'Gig board' },
  { id: 'freelance', label: 'Freelance' },
] as const

export default function KaamPage() {
  const [tab, setTab] = useState<string>('skill')

  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/taleem" backLabel="← Taleem" title="Kaam Dhundo">
        <p>
          Informal hunar → kaam ke naam, gigs, aur online shuruat — Roman Urdu.
        </p>
      </PageIntro>

      <div className="mt-2">
        <TaleemSubTabs tabs={[...tabs]} active={tab} onChange={setTab} />
      </div>

      {tab === 'skill' && (
        <TaleemVoiceForm
          label="Aap kya achha karte hain?"
          placeholder='Misaal: "Main phone theek karna jaanta hoon"'
          submitLabel="Skill map banao"
          onSubmit={(message) =>
            taleemLlm({ pillar: 'kaam', sub: 'skill', message })
          }
        />
      )}

      {tab === 'gig' && (
        <TaleemVoiceForm
          label="Kis tarah ka kaam dhoondh rahe hain?"
          placeholder="Delivery, tourism, remote data entry…"
          submitLabel="Gigs samjhao"
          onSubmit={(message) =>
            taleemLlm({ pillar: 'kaam', sub: 'gig', message })
          }
        />
      )}

      {tab === 'freelance' && (
        <TaleemVoiceForm
          label="Fiverr / Upwork ke baare mein sawal"
          placeholder='Misaal: "Pehla order kaise mile?"'
          submitLabel="Guide chalao"
          onSubmit={(message) =>
            taleemLlm({ pillar: 'kaam', sub: 'freelance', message })
          }
        />
      )}
    </div>
  )
}
