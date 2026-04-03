'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { interpolate, translate } from '@/lib/i18n/catalog'
import { parseUiLocale, type UiLocale } from '@/lib/localeForLlm'

const STORAGE_KEY = 'raasta-locale'

const localeListeners = new Set<() => void>()
const translationCache = new Map<string, Map<string, string>>()
const translationPending = new Set<string>()
let translationNotify: (() => void) | null = null

function readStoredLocale(): UiLocale {
  if (typeof window === 'undefined') return 'en'
  return parseUiLocale(localStorage.getItem(STORAGE_KEY))
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

function getCachedTranslation(locale: UiLocale, key: string): string | null {
  return translationCache.get(locale)?.get(key) ?? null
}

async function queueTranslation(locale: UiLocale, key: string, source: string) {
  const id = `${locale}:${key}`
  if (translationPending.has(id)) return
  translationPending.add(id)
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: source, locale }),
    })
    const data = (await res.json()) as { text?: string }
    const translated = typeof data.text === 'string' ? data.text : source
    const bucket = translationCache.get(locale) ?? new Map<string, string>()
    bucket.set(key, translated)
    translationCache.set(locale, bucket)
    translationNotify?.()
  } catch (error) {
    console.error('Translation error', error)
  } finally {
    translationPending.delete(id)
  }
}

type I18nContextValue = {
  locale: UiLocale
  setLocale: (l: UiLocale) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0)
  const locale = useSyncExternalStore(
    subscribeLocale,
    readStoredLocale,
    () => 'en' as UiLocale,
  )

  const setLocale = useCallback((l: UiLocale) => {
    console.log(`🌐 Language changed to: ${l}`)
    setStoredLocale(l)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.classList.remove(...Array.from(html.classList).filter((c) => c.startsWith('locale-')))
    html.classList.add(`locale-${locale}`)
  }, [locale])

  useEffect(() => {
    translationNotify = () => setTick((n) => n + 1)
    return () => {
      if (translationNotify) translationNotify = null
    }
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const hasCatalog =
        locale === 'en' || locale === 'hi' || locale === 'ks'
      const base = translate('en' as UiLocale, key)
      let s = hasCatalog ? translate(locale, key) : base
      if (!hasCatalog && s) {
        const cached = getCachedTranslation(locale, key)
        if (cached) {
          s = cached
        } else {
          void queueTranslation(locale, key, base)
        }
      }
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
