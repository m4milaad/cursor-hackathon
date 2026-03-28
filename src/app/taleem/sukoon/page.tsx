'use client'

import { PageIntro } from '@/components/PageIntro'
import { TaleemSubTabs } from '@/components/TaleemSubTabs'
import { TaleemVoiceForm } from '@/components/TaleemVoiceForm'
import { taleemLlm } from '@/lib/taleemApi'
import { useState } from 'react'

const tabs = [
  { id: 'checkin', label: 'Check-in' },
  { id: 'stories', label: 'Peer stories' },
  { id: 'helpline', label: 'Helpline' },
] as const

const STORIES = [
  {
    title: 'Naukri ke baad intezar',
    body: `Main ne 2 saal tak roz form bhare. Kabhi lagta tha sab bekaar hai. Phir ek chhota course aur local NGO ke through volunteering se confidence lauta. Ab main Khud ko zyada narmi se dekhta hoon — waqt lagta hai, lekin rukna nahi padta.`,
  },
  {
    title: 'Ghar walon ki umeed',
    body: `Ami ke sawal roz same: "Aaj kya hua?" Jawab nahi hota tha to dil ghut ta tha. Main ne Sukoon jaisi baat kisi dost se share ki — pata chala yeh feeling aksar youth mein hai. Chhota qadam: roz 10 minute walk, phir ek hi kaam list.`,
  },
] as const

export default function SukoonPage() {
  const [tab, setTab] = useState<string>('checkin')

  return (
    <div className="pb-16 pt-2">
      <PageIntro backHref="/taleem" backLabel="← Taleem" title="Sukoon">
        <p>
          Be-hisabi pressure ke beech saans — anonymous stories aur professional
          madad ek tap door.
        </p>
      </PageIntro>

      <div className="mt-2">
        <TaleemSubTabs tabs={[...tabs]} active={tab} onChange={setTab} />
      </div>

      {tab === 'checkin' && (
        <>
          <TaleemVoiceForm
            label="Aaj dil kya keh raha hai?"
            placeholder='Misaal: "Bahut frustrated hoon, kaam nahi mil raha"'
            submitLabel="Sukoon se jawab"
            onSubmit={(message) =>
              taleemLlm({ pillar: 'sukoon', sub: 'checkin', message })
            }
          />
          <p className="mt-4 text-xs text-[var(--raasta-muted)]">
            Yeh medical ilaj nahi hai. Agar khud nuksan ya shadeed khayal aayein
            to turant helpline tab kholein.
          </p>
        </>
      )}

      {tab === 'stories' && (
        <ul className="space-y-4">
          {STORIES.map((s) => (
            <li
              key={s.title}
              className="raasta-card p-4"
            >
              <p className="font-display text-base font-semibold text-[var(--chinar-deep)]">
                {s.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--raasta-ink)]">
                {s.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {tab === 'helpline' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--raasta-muted)]">
            Crisis mein akele mat rehna — yeh numbers India ke mashhur mental
            health lines hain. Official site se number verify karte rahein.
          </p>
          <a
            href="tel:9999666555"
            className="block rounded-[var(--radius-lg)] border-2 border-[var(--chinar-amber)] bg-[var(--chinar-glow)] px-4 py-4 text-center font-semibold text-[var(--chinar-deep)]"
          >
            Vandrevala Foundation — 9999 666 555
          </a>
          <a
            href="tel:9152987821"
            className="raasta-card block px-4 py-4 text-center font-semibold text-[var(--chinar-deep)]"
          >
            iCall (TISS) — 91529 87821
          </a>
          <p className="text-xs text-[var(--raasta-muted)]">
            Emergency 112 / local hospital agar khatra ho.
          </p>
        </div>
      )}
    </div>
  )
}
