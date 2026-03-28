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
  backLabel = '← Wapas',
  title,
  children,
  className = '',
}: Props) {
  return (
    <header className={`mb-8 ${className}`}>
      <Link href={backHref} className="raasta-back mb-5 font-medium">
        {backLabel}
      </Link>
      <h1 className="raasta-page-title">{title}</h1>
      {children ? (
        <div className="raasta-page-lead max-w-prose">{children}</div>
      ) : null}
    </header>
  )
}
