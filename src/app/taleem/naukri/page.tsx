'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { taleemLlm } from '@/lib/taleemApi'

export default function NaukriPage() {
  return (
    <div className="pb-16 pt-2">
      <PageIntro
        backHref="/taleem"
        backLabel="← Taleem"
        title="Naukri orientation"
      >
        <p>
          Qualification bol kar likhein — sarkari / public jobs kis taraf dekhni
          hain, deadlines ka culture, Roman Urdu mein seedha jawab.
        </p>
      </PageIntro>
      <div className="mt-2">
        <TaleemVoiceForm
          label="Aapki qualification aur maqsad"
          placeholder="Misaal: 12th Science, JKSSB Class IV ki taiyaari"
          submitLabel="Match batao"
          onSubmit={(message) => taleemLlm({ pillar: 'naukri', message })}
        />
      </div>
    </div>
  )
}
