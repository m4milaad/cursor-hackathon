'use client'

import { I18nProvider } from '@/lib/i18n/context'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { convexClient } from '@/lib/convexClient'
import { ConvexProvider } from 'convex/react'
import type { ReactNode } from 'react'

export function AppProviders({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return <I18nProvider>{children}</I18nProvider>
  }

  return (
    <ConvexProvider client={convexClient}>
      <AuthProvider>
        <I18nProvider>{children}</I18nProvider>
      </AuthProvider>
    </ConvexProvider>
  )
}
