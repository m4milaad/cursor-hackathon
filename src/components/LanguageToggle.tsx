'use client'

import { useI18n } from '@/lib/i18n/context'
import { UI_LOCALES, localeLabel, type UiLocale } from '@/lib/localeForLlm'

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()

  return (
    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
      {t('lang.toggle')}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as UiLocale)}
        className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] px-2 py-1 text-[10px] uppercase tracking-widest text-[var(--color-on-surface)]"
      >
        {UI_LOCALES.map((id) => (
          <option key={id} value={id}>
            {localeLabel(id as UiLocale)}
          </option>
        ))}
      </select>
    </label>
  )
}
