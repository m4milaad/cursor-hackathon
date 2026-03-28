'use client'

import { useI18n } from '@/lib/i18n/context'

export type TaleemTab = { id: string; label: string }

type Props = {
  tabs: TaleemTab[]
  active: string
  onChange: (id: string) => void
}

export function TaleemSubTabs({ tabs, active, onChange }: Props) {
  const { t } = useI18n()

  return (
    <div
      role="tablist"
      aria-label={t('taleem.tabsAria')}
      className="mb-8 flex flex-wrap gap-2 rounded-full border border-[var(--raasta-border)] bg-[var(--raasta-surface)] p-2"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
            active === tab.id
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[0_12px_24px_rgba(0,0,0,0.15)]'
              : 'text-[var(--raasta-muted)] hover:text-[var(--color-secondary)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
