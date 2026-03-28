import type { Metadata } from 'next'
import {
  Manrope,
  Noto_Serif,
} from 'next/font/google'
import type { ReactNode } from 'react'
import { AppProviders } from '@/components/AppProviders'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import './globals.css'

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'RAASTA — AI Companion for Life & Livelihood',
  description:
    'Your AI companion that speaks your language. Understand documents (Samjho), get crop advice (Zameen), build your future (Taleem), or just talk (Raah) — in English, Hindi & Kashmiri. Voice-first, no login required.',
  keywords: ['AI assistant', 'Kashmir', 'rural India', 'voice AI', 'document understanding', 'crop advice', 'career guidance'],
  openGraph: {
    title: 'RAASTA — AI Companion for Life & Livelihood',
    description: 'Voice-first AI for rural India. Documents, agriculture, education & career — in your language.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#143d32" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="bg-surface font-body text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed overflow-x-hidden min-h-screen flex flex-col antialiased">
        <AppProviders>
          <SiteHeader />
          <div className="bg-[#eae8e3] dark:bg-[#1b1c19] h-[1px] w-full fixed top-[64px] z-50"></div>
          {children}
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  )
}
