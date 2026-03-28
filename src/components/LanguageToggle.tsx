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
      className="flex items-center gap-0.5 rounded-full border border-[var(--raasta-border)] bg-[var(--raasta-surface)]/90 p-0.5 shadow-sm"
      role="group"
      aria-label={t('lang.toggle')}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLocale(o.id)}
          title={t(o.labelKey)}
          className={`min-w-[2.25rem] rounded-full px-2 py-1 text-[11px] font-semibold transition sm:text-xs ${
            locale === o.id
              ? 'bg-gradient-to-br from-[var(--chinar-deep)] to-[var(--chinar-mid)] text-[#faf8f4] shadow-sm'
              : 'text-[var(--raasta-muted)] hover:bg-[var(--chinar-mist)] hover:text-[var(--chinar-deep)]'
          }`}
        >
          <span className="sm:hidden">{o.short}</span>
          <span className="hidden sm:inline">{t(o.labelKey)}</span>
        </button>
      ))}
    </div>
  )
}
