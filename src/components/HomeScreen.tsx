'use client'

import { ChinarLeafWatermark } from '@/components/chinar/ChinarLeafMark'
import { MicButton } from '@/components/MicButton'
import { ModeCard } from '@/components/ModeCard'
import { useI18n } from '@/lib/i18n/context'

export function HomeScreen() {
  const { t } = useI18n()

  return (
    <div className="relative pb-10 pt-6 sm:pt-8">
      <ChinarLeafWatermark className="pointer-events-none absolute -right-4 -top-6 h-44 w-44 opacity-[0.85] sm:right-0 sm:h-52 sm:w-52" />

      <header className="relative mb-8 text-center sm:mb-10">
        <span className="raasta-hero-tag mx-auto mb-4">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--chinar-amber)]"
            aria-hidden
          />
          {t('home.heroTag')}
        </span>
        <h1 className="font-display text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-[var(--chinar-deep)] sm:text-5xl">
          RAASTA
        </h1>
        <p className="mt-2 font-display text-lg text-[var(--chinar-mid)] sm:text-xl">
          {t('home.subtitleA')}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--raasta-muted)] sm:max-w-md sm:text-base">
          {t('home.subtitleB')}
        </p>
      </header>

      <section className="relative mb-10 sm:mb-12" aria-labelledby="voice-label">
        <span id="voice-label" className="raasta-section-label text-center">
          {t('home.voiceSection')}
        </span>
        <div className="raasta-mic-well flex flex-col items-center">
          <MicButton navigateToRaah />
          <p className="relative z-[1] mt-4 max-w-[18rem] text-center text-xs leading-relaxed text-[var(--raasta-muted)] sm:max-w-md">
            {t('home.voiceHint', { raah: t('modes.raah.title') })}
          </p>
        </div>
      </section>

      <section aria-labelledby="modes-label">
        <span id="modes-label" className="raasta-section-label">
          {t('home.modesSection')}
        </span>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ModeCard
            href="/samjho"
            emoji="📄"
            title={t('modes.samjho.title')}
            subtitle={t('modes.samjho.subtitle')}
            powered={t('modes.samjho.powered')}
          />
          <ModeCard
            href="/zameen"
            emoji="🌱"
            title={t('modes.zameen.title')}
            subtitle={t('modes.zameen.subtitle')}
            powered={t('modes.zameen.powered')}
          />
          <ModeCard
            href="/taleem"
            emoji="🎓"
            title={t('modes.taleem.title')}
            subtitle={t('modes.taleem.subtitle')}
          />
          <ModeCard
            href="/raah"
            emoji="🗣"
            title={t('modes.raah.title')}
            subtitle={t('modes.raah.subtitle')}
          />
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--raasta-muted)]">
          {t('home.footer')}{' '}
          <span className="text-[var(--chinar-gold)]">{t('home.footerEm')}</span>
        </p>
      </section>
    </div>
  )
}
