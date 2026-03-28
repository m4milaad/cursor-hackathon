'use client'

import { ChinarLeafWatermark } from '@/components/chinar/ChinarLeafMark'
import { HeroScrollFrames } from '@/components/HeroScrollFrames'
import { MicButton } from '@/components/MicButton'
import { ModeCard } from '@/components/ModeCard'
import { useI18n } from '@/lib/i18n/context'

export function HomeScreen() {
  const { t } = useI18n()

  return (
    <div className="page-enter relative pb-14">
      {/* Scroll-scrubbed frame sequence + hero copy (sticky first viewport) */}
      <HeroScrollFrames scrollHeightVH={4} className="scroll-mt-0">
        <header className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pb-24 sm:pt-28">
          <span
            className="raasta-hero-tag mx-auto mb-5 inline-flex text-white/90"
            style={{ animationDelay: '0.1s' }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full bg-[var(--amber-mid)]"
              aria-hidden
              style={{ animation: 'breathe 2s ease-in-out infinite' }}
            />
            {t('home.heroTag')}
          </span>

          <h1
            className="font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-[#faf8f4] drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-6xl"
            style={{
              background:
                'linear-gradient(135deg, #e8f5ef 0%, #c8e6d8 35%, #f0d4a8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fadeInUp 0.6s ease-out 0.15s backwards',
            }}
          >
            RAASTA
          </h1>

          <p
            className="font-display mt-3 text-xl text-white/90 sm:text-2xl"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.25s backwards' }}
          >
            {t('home.subtitleA')}
          </p>

          <p
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:max-w-lg sm:text-base"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.35s backwards' }}
          >
            {t('home.subtitleB')}
          </p>
        </header>
      </HeroScrollFrames>

      {/* Rest of home: solid surface over page background */}
      <div className="relative bg-[var(--color-surface)] pt-6 dark:bg-[#000d08]">
        <ChinarLeafWatermark className="pointer-events-none absolute -right-6 -top-8 h-52 w-52 opacity-[0.65] sm:right-0 sm:h-64 sm:w-64" />

        <section
          className="relative mb-14 sm:mb-16"
          aria-labelledby="voice-label"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.4s backwards' }}
        >
          <span id="voice-label" className="raasta-section-label text-center">
            {t('home.voiceSection')}
          </span>
          <div className="raasta-mic-well flex flex-col items-center">
            <MicButton navigateToRaah />
            <p className="relative z-[1] mt-5 max-w-[20rem] text-center text-xs leading-relaxed text-[var(--muted)] sm:max-w-md sm:text-sm">
              {t('home.voiceHint', { raah: t('modes.raah.title') })}
            </p>
          </div>
        </section>

        <section aria-labelledby="modes-label">
          <span id="modes-label" className="raasta-section-label">
            {t('home.modesSection')}
          </span>
          <div className="stagger-enter grid grid-cols-2 gap-4 sm:gap-5">
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

          <div
            className="mt-10 text-center"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.6s backwards' }}
          >
            <p className="text-[11px] leading-relaxed text-[var(--muted-soft)]">
              {t('home.footer')}{' '}
              <span
                className="font-semibold"
                style={{
                  background:
                    'linear-gradient(90deg, var(--amber-deep), var(--amber-mid))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('home.footerEm')}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
