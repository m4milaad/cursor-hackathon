import type { Metadata } from 'next'
import {
  Fraunces,
  Noto_Naskh_Arabic,
  Noto_Sans_Devanagari,
  Source_Sans_3,
} from 'next/font/google'
import type { ReactNode } from 'react'
import { AppProviders } from '@/components/AppProviders'
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

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  variable: '--font-noto-devanagari',
  display: 'swap',
})

const notoArabic = Noto_Naskh_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-noto-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RAASTA — AI Companion for Life & Livelihood',
  description:
    'Samjho documents, Zameen crops, Taleem for youth, Raah voice — English, Hindi, and Kashmiri. Built for Kashmir and rural India.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} ${notoDevanagari.variable} ${notoArabic.variable}`}
    >
      <body className="antialiased">
        <AppProviders>
          <div className="raasta-shell min-h-svh">
            <SiteHeader />
            <main className="raasta-main min-h-[calc(100svh-var(--header-h))]">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
