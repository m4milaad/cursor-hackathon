'use client'

import { ChinarLeafMark } from '@/components/chinar/ChinarLeafMark'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const path = usePathname() ?? ''
  const isHome = path === '/'
  const { t } = useI18n()

  return (
    <header className="raasta-header sticky top-0 z-50">
      <div className="mx-auto flex h-[var(--header-h)] max-w-xl items-center justify-between gap-2 px-4 sm:max-w-2xl">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 rounded-lg py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chinar-amber)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--chinar-mist)] text-[var(--chinar-gold)] ring-1 ring-[var(--raasta-border)] transition group-hover:bg-[var(--chinar-glow)] group-hover:ring-[rgba(196,131,58,0.35)]">
            <ChinarLeafMark
              className="h-6 w-6 text-[var(--chinar-gold)]"
              decorative
            />
          </span>
          <span className="min-w-0 text-left">
            <span className="font-display block text-[1.05rem] font-semibold leading-tight tracking-tight text-[var(--chinar-deep)] sm:text-lg">
              RAASTA
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--raasta-muted)] sm:block">
              {t('nav.brandTag')}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <nav
            className="flex shrink-0 items-center gap-1"
            aria-label={t('nav.ariaMain')}
          >
            {!isHome ? (
              <Link
                href="/"
                className="rounded-full px-2.5 py-1.5 text-sm font-medium text-[var(--raasta-muted)] transition hover:bg-[var(--chinar-mist)] hover:text-[var(--chinar-deep)] sm:px-3"
              >
                {t('nav.home')}
              </Link>
            ) : null}
            <Link
              href="/taleem"
              className={`rounded-full px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
                path.startsWith('/taleem')
                  ? 'bg-[var(--chinar-mist)] text-[var(--chinar-deep)]'
                  : 'text-[var(--raasta-muted)] hover:bg-[var(--chinar-mist)] hover:text-[var(--chinar-deep)]'
              }`}
            >
              {t('nav.taleem')}
            </Link>
            <Link
              href="/raah"
              className={`rounded-full px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
                path === '/raah'
                  ? 'bg-[var(--chinar-mist)] text-[var(--chinar-deep)]'
                  : 'text-[var(--raasta-muted)] hover:bg-[var(--chinar-mist)] hover:text-[var(--chinar-deep)]'
              }`}
            >
              {t('nav.raah')}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
