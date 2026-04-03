'use client'

import { I18nProvider } from '@/lib/i18n/context'
import { convexClient } from '@/lib/convexClient'
import { ConvexProvider } from 'convex/react'
import type { ReactNode } from 'react'

export function AppProviders({ children }: { children: ReactNode }) {
  // If no Convex client, just use I18n provider without backend features
  if (!convexClient) {
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Convex not configured. Running without backend features.')
    }
    return <I18nProvider>{children}</I18nProvider>
  }

  // With Convex, include full provider stack
  return (
    <ConvexProvider client={convexClient}>
      <I18nProvider>{children}</I18nProvider>
    </ConvexProvider>
  )
}
