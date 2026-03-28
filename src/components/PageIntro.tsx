'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  backHref: string
  backLabel?: string
  title: string
  children?: ReactNode
  className?: string
}

export function PageIntro({
  backHref,
  backLabel = 'Back',
  title,
  children,
  className = '',
}: Props) {
  return (
    <header className={`mb-10 ${className}`} style={{ animation: 'fadeInUp 0.5s ease-out' }}>
      <Link href={backHref} className="raasta-back group mb-6 inline-flex items-center gap-2 font-medium">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        {backLabel}
      </Link>
      <h1 className="raasta-page-title">{title}</h1>
      {children ? (
        <div className="raasta-page-lead max-w-prose">{children}</div>
      ) : null}
    </header>
  )
}
