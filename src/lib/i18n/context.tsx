'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { interpolate, translate } from '@/lib/i18n/catalog'
import type { UiLocale } from '@/lib/localeForLlm'

const STORAGE_KEY = 'raasta-locale'

const localeListeners = new Set<() => void>()

function parseStored(raw: string | null): UiLocale {
  if (raw === 'hi' || raw === 'ks') return raw
  return 'en'
}

function readStoredLocale(): UiLocale {
  if (typeof window === 'undefined') return 'en'
  return parseStored(localStorage.getItem(STORAGE_KEY))
}

function emitLocaleChange() {
  localeListeners.forEach((l) => l())
}

function subscribeLocale(onChange: () => void) {
  localeListeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    localeListeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

function setStoredLocale(l: UiLocale) {
  localStorage.setItem(STORAGE_KEY, l)
  emitLocaleChange()
}

type I18nContextValue = {
  locale: UiLocale
  setLocale: (l: UiLocale) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    readStoredLocale,
    () => 'en' as UiLocale,
  )

  const setLocale = useCallback((l: UiLocale) => {
    setStoredLocale(l)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale === 'hi' ? 'hi' : locale === 'ks' ? 'ks' : 'en'
    html.classList.remove('locale-en', 'locale-hi', 'locale-ks')
    html.classList.add(`locale-${locale}`)
  }, [locale])

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const s = translate(locale, key)
      return vars ? interpolate(s, vars) : s
    },
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
