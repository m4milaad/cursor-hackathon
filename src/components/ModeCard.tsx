import Link from 'next/link'

type Props = {
  href: string
  emoji: string
  title: string
  subtitle: string
  powered?: string
}

export function ModeCard({ href, emoji, title, subtitle, powered }: Props) {
  return (
    <Link
      href={href}
      className="raasta-mode-card raasta-card group relative flex flex-col items-center gap-2 overflow-hidden p-4 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chinar-amber)] sm:p-5"
    >
      <span
        className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-[var(--chinar-amber)] to-[var(--chinar-gold)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden
      />
      <span
        className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--chinar-mist)] text-2xl ring-1 ring-[var(--raasta-border)] transition group-hover:bg-[var(--chinar-glow)] group-hover:ring-[rgba(196,131,58,0.28)] sm:h-14 sm:w-14 sm:rounded-2xl"
        aria-hidden
      >
        {emoji}
      </span>
      <span className="relative font-display text-base font-semibold text-[var(--chinar-deep)] sm:text-lg">
        {title}
      </span>
      <span className="relative text-[11px] leading-snug text-[var(--raasta-muted)] sm:text-xs">
        {subtitle}
      </span>
      {powered ? (
        <span className="relative mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--chinar-gold)] sm:text-[10px]">
          {powered}
        </span>
      ) : null}
    </Link>
  )
}
