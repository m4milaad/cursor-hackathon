/** Chinar (Oriental plane) — stylised canopy leaf, a Kashmir Valley symbol. */

type Props = {
  className?: string
  decorative?: boolean
}

export function ChinarLeafMark({
  className = 'h-7 w-7 shrink-0 text-[var(--chinar-gold)]',
  decorative = true,
}: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative}
      focusable="false"
    >
      <path
        d="M20 3c-1.5 6-5 11-9.5 14.5-4 3.2-6.5 8-6.5 13.2 0 5.5 3.2 10.2 8 11.8-.8-3.5 0-7.2 2.2-9.8 1.2 4.2 4.5 7.5 8.8 8.5-1.8-4.5-1-9.5 1.8-13.2 1.2 5.5 4.8 10.2 9.8 12-2.5-4.2-3-9.5-1-14 2.2 3.2 6 5 10 4.5-4-1.2-7.5-4.5-8.8-8.8 3.5 2 8 2.2 11.8.2-5-1-9.2-4.8-11.5-9.5 3.2-1.5 5.8-4.5 7.2-8-2.2 2.8-5.8 5-9.5 5.5 1-3.8.5-8-1.5-11.2-1.2 4-3.8 7.5-7.5 9.5.5-4.2-.8-8.5-3.5-11.5Z"
        fill="currentColor"
      />
      <path
        d="M20 44V34"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeOpacity={0.45}
      />
    </svg>
  )
}

export function ChinarLeafWatermark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M100 12c-8 32-28 58-52 76-22 17-36 44-36 72 0 28 18 52 46 60-4-18 2-38 14-52 6 22 24 40 48 46-10-24-6-52 8-74 6 28 26 54 54 66-16-22-20-52-8-78 12 16 32 24 54 22-24-6-42-26-50-50 18 8 40 10 60-2-36-4-64-30-76-62 16-8 30-22 38-40-12 14-30 26-50 30 4-20-4-42-18-58-6 22-20 42-40 54 2-20-10-40-26-54Z"
        fill="var(--chinar-deep)"
        fillOpacity={0.055}
      />
    </svg>
  )
}
