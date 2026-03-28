'use client'

import { useI18n } from '@/lib/i18n/context'
import type { UiLocale } from '@/lib/localeForLlm'

const options: { id: UiLocale; short: string; labelKey: string }[] = [
  { id: 'en', short: 'EN', labelKey: 'lang.en' },
  { id: 'hi', short: 'हि', labelKey: 'lang.hi' },
  { id: 'ks', short: 'کٲش', labelKey: 'lang.ks' },
]

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl p-1"
      style={{
        background: 'var(--surface-hi)',
        boxShadow: 'inset 0 1px 3px rgba(27, 28, 25, 0.04)',
      }}
      role="group"
      aria-label={t('lang.toggle')}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLocale(o.id)}
          title={t(o.labelKey)}
          className={`relative min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-250 sm:text-xs ${
            locale === o.id
              ? 'text-[#faf8f4] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          style={locale === o.id ? {
            background: 'linear-gradient(145deg, var(--chinar-forest), var(--chinar-mid))',
            boxShadow: '0 2px 8px rgba(20, 61, 50, 0.2)',
          } : undefined}
        >
          <span className="sm:hidden">{o.short}</span>
          <span className="hidden sm:inline">{t(o.labelKey)}</span>
        </button>
      ))}
    </div>
  )
}
