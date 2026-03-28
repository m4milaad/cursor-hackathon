'use client'

export type TaleemTab = { id: string; label: string }

type Props = {
  tabs: TaleemTab[]
  active: string
  onChange: (id: string) => void
}

export function TaleemSubTabs({ tabs, active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Taleem sections"
      className="mb-6 flex flex-wrap gap-2 border-b border-[var(--raasta-border)] pb-3.5"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            active === t.id
              ? 'bg-gradient-to-br from-[var(--chinar-deep)] to-[var(--chinar-mid)] text-[#faf8f4] shadow-sm ring-1 ring-[rgba(196,131,58,0.25)]'
              : 'bg-[var(--raasta-surface)] text-[var(--raasta-muted)] ring-1 ring-[var(--raasta-border)] hover:bg-[var(--chinar-mist)] hover:text-[var(--chinar-deep)]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
