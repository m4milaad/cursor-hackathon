import type { Metadata } from 'next'
import { Fraunces, Source_Sans_3 } from 'next/font/google'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RAASTA — AI Companion for Life & Livelihood',
  description:
    'Samjho documents, Zameen crops, Taleem for youth, Raah voice — Urdu, Kashmiri, Hindi. AI for Kashmir and rural India.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans.variable}`}>
      <body className="antialiased">
        <div className="raasta-shell min-h-svh">
          <SiteHeader />
          <main className="raasta-main min-h-[calc(100svh-var(--header-h))]">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
