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
      className="raasta-mode-card raasta-card group relative flex flex-col items-center gap-3 p-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amber-mid)] sm:p-6"
    >
      {/* Gradient side accent — hidden until hover */}
      <span className="mode-accent" aria-hidden />

      {/* Icon container with glow */}
      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-3xl"
        style={{
          background: 'linear-gradient(145deg, var(--paper-dim), var(--surface-hi))',
          boxShadow: 'var(--shadow-ambient)',
        }}
        aria-hidden
      >
        {emoji}
        {/* Glow ring on hover */}
        <span
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: '0 0 20px rgba(196, 131, 58, 0.12), 0 0 40px rgba(30, 92, 74, 0.06)',
          }}
          aria-hidden
        />
      </span>

      {/* Title */}
      <span className="relative font-display text-base font-semibold text-[var(--ink)] sm:text-lg">
        {title}
      </span>

      {/* Subtitle */}
      <span className="relative text-[11px] leading-relaxed text-[var(--muted)] sm:text-xs">
        {subtitle}
      </span>

      {/* Powered badge */}
      {powered ? (
        <span
          className="relative mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px]"
          style={{
            background: 'linear-gradient(90deg, var(--amber-deep), var(--amber-mid))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {powered}
        </span>
      ) : null}
    </Link>
  )
}
