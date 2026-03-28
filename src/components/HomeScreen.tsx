'use client'

import { ChinarLeafWatermark } from '@/components/chinar/ChinarLeafMark'
import { MicButton } from '@/components/MicButton'
import { ModeCard } from '@/components/ModeCard'

export function HomeScreen() {
  return (
    <div className="relative pb-10 pt-6 sm:pt-8">
      <ChinarLeafWatermark className="pointer-events-none absolute -right-4 -top-6 h-44 w-44 opacity-[0.85] sm:right-0 sm:h-52 sm:w-52" />

      <header className="relative mb-8 text-center sm:mb-10">
        <span className="raasta-hero-tag mx-auto mb-4">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--chinar-amber)]"
            aria-hidden
          />
          Chinar · Kashmir
        </span>
        <h1 className="font-display text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-[var(--chinar-deep)] sm:text-5xl">
          RAASTA
        </h1>
        <p className="mt-2 font-display text-lg text-[var(--chinar-mid)] sm:text-xl">
          AI Companion for Life
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--raasta-muted)] sm:max-w-md sm:text-base">
          &amp; Livelihood — Urdu · Kashmiri · Hindi
        </p>
      </header>

      <section className="relative mb-10 sm:mb-12" aria-labelledby="voice-label">
        <span id="voice-label" className="raasta-section-label text-center">
          Awaaz
        </span>
        <div className="raasta-mic-well flex flex-col items-center">
          <MicButton navigateToRaah />
          <p className="relative z-[1] mt-4 max-w-[16rem] text-center text-xs leading-relaxed text-[var(--raasta-muted)]">
            Mic dabayein — <strong className="font-medium text-[var(--chinar-deep)]">Raah</strong>{' '}
            sunega aur seedha jawab degi
          </p>
        </div>
      </section>

      <section aria-labelledby="modes-label">
        <span id="modes-label" className="raasta-section-label">
          Chaar mode — ek app
        </span>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ModeCard
            href="/samjho"
            emoji="📄"
            title="Samjho"
            subtitle="Koi bhi kagaz — seedha samajh"
            powered="HAQQ"
          />
          <ModeCard
            href="/zameen"
            emoji="🌱"
            title="Zameen"
            subtitle="Fasal, beemaari, mandi bhav"
            powered="WADI"
          />
          <ModeCard
            href="/taleem"
            emoji="🎓"
            title="Taleem"
            subtitle="Naukri, CV, sukoon, karobar"
          />
          <ModeCard
            href="/raah"
            emoji="🗣"
            title="Raah"
            subtitle="Awaaz se sawaal"
          />
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--raasta-muted)]">
          Kisaan, fasal, youth, awaaz —{' '}
          <span className="text-[var(--chinar-gold)]">ek hi RAASTA</span>
        </p>
      </section>
    </div>
  )
}
