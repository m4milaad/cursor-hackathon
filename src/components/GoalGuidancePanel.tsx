'use client'

import { useCallback, useState } from 'react'
import { useI18n } from '@/lib/i18n/context'

type Phase = 'input' | 'loading' | 'result'
type GuidanceResult = { text: string; type: string }

const QUICK_GOALS = [
  { label: 'Start a small business', icon: 'storefront' },
  { label: 'Prepare for JKSSB exam', icon: 'school' },
  { label: 'Learn web development', icon: 'code' },
  { label: 'Become a teacher', icon: 'person' },
  { label: 'Start freelancing', icon: 'laptop_mac' },
  { label: 'Open a shop', icon: 'store' },
]

const GUIDANCE_TYPES = [
  { key: 'roadmap', label: 'Skill Roadmap', icon: 'route', prompt: 'Create a detailed skill roadmap with weekly milestones for someone who wants to:' },
  { key: 'business', label: 'Business Plan', icon: 'business_center', prompt: 'Create a practical business plan outline with costs, steps, and timeline for someone who wants to:' },
  { key: 'scholarships', label: 'Scholarships & Aid', icon: 'school', prompt: 'List relevant scholarships, government schemes, and financial aid available in India/J&K for someone who wants to:' },
  { key: 'resources', label: 'Free Resources', icon: 'menu_book', prompt: 'List the best free online resources, courses, and tools for someone who wants to:' },
]

export function GoalGuidancePanel() {
  const { locale } = useI18n()
  const [phase, setPhase] = useState<Phase>('input')
  const [goal, setGoal] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [results, setResults] = useState<GuidanceResult[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const generateGuidance = useCallback(async (goalText: string, type: typeof GUIDANCE_TYPES[number]) => {
    setPhase('loading')
    setSelectedType(type.key)

    try {
      const r = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'raah',
          question: `${type.prompt} "${goalText}"\n\nContext: The user is likely from Kashmir/India. Be practical, specific, and encouraging. Include real resources, real schemes, real timelines. No vague advice.`,
          systemPrompt: `You are Taleem's Goal Guidance AI. The user tells you their career/life goal and you create an extremely detailed, actionable guide.

RULES:
- Give LONG, DETAILED, STRUCTURED responses (at least 400 words)
- Use numbered steps, bullet points, and clear sections with headers
- Include SPECIFIC names: real websites, real courses (Coursera, Udemy, NPTEL), real government schemes (PMKVY, Mudra Loan, J&K Startup Policy)
- Include realistic costs, timelines, and requirements  
- Mention both online and offline options
- Be encouraging but honest about challenges
- Tailor everything to Kashmir/India context
- Include a "Quick Wins This Week" section with 3 things they can do immediately
- End with motivational but grounded advice`,
          locale,
        }),
      })
      const d = await r.json()
      const text = d.text || 'Could not generate guidance. Please try again.'

      setResults(prev => {
        const existing = prev.findIndex(r => r.type === type.key)
        if (existing >= 0) {
          const copy = [...prev]
          copy[existing] = { text, type: type.key }
          return copy
        }
        return [...prev, { text, type: type.key }]
      })
      setActiveTab(results.length)
      setPhase('result')
    } catch {
      setPhase('result')
    }
  }, [results.length])

  const handleGoalSubmit = useCallback(async () => {
    if (!goal.trim()) return
    await generateGuidance(goal, GUIDANCE_TYPES[0]) // Default: roadmap
  }, [goal, generateGuidance])

  return (
    <div className="space-y-6">
      {/* Goal input */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-[var(--color-on-primary)] font-label text-xs uppercase shrink-0">
          AI
        </div>
        <div className="flex-1">
          <p className="font-headline text-lg text-[var(--color-primary)]">
            What do you want to build or become?
          </p>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Tell me your goal, and I'll create a personalized roadmap, business plan, or resource list.
          </p>
        </div>
      </div>

      {/* Input area */}
      <textarea
        className="raasta-input w-full text-sm min-h-[80px]"
        placeholder="e.g. I want to start a clothing business in Srinagar / I want to become a software developer / I want to prepare for NEET…"
        value={goal}
        onChange={e => setGoal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleGoalSubmit() } }}
      />

      {/* Quick goal chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_GOALS.map(g => (
          <button
            key={g.label}
            type="button"
            onClick={() => { setGoal(g.label); void generateGuidance(g.label, GUIDANCE_TYPES[0]) }}
            className="flex items-center gap-1.5 border border-[var(--color-outline-variant)] px-3 py-1.5 text-xs hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>

      {/* Guidance type buttons */}
      {goal.trim() && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {GUIDANCE_TYPES.map(type => (
            <button
              key={type.key}
              type="button"
              onClick={() => void generateGuidance(goal, type)}
              disabled={phase === 'loading'}
              className={`p-3 border text-left text-xs transition-all ${
                selectedType === type.key
                  ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] border-[var(--color-secondary)]'
                  : 'border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)]'
              } disabled:opacity-50`}
            >
              <span className="material-symbols-outlined text-base block mb-1">{type.icon}</span>
              <span className="font-label uppercase tracking-widest">{type.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {phase === 'loading' && (
        <div className="flex items-center gap-3 p-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]">
          <span className="w-5 h-5 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--color-on-surface-variant)]">
            AI is creating your personalized {GUIDANCE_TYPES.find(t => t.key === selectedType)?.label.toLowerCase() ?? 'guidance'}…
          </span>
        </div>
      )}

      {/* Results tabs */}
      {results.length > 0 && (
        <div>
          {results.length > 1 && (
            <div className="flex gap-1 mb-3 border-b border-[var(--color-outline-variant)]">
              {results.map((r, i) => {
                const type = GUIDANCE_TYPES.find(t => t.key === r.type)
                return (
                  <button
                    key={r.type}
                    onClick={() => setActiveTab(i)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-label transition-colors ${
                      activeTab === i
                        ? 'border-b-2 border-[var(--color-secondary)] text-[var(--color-secondary)]'
                        : 'text-[var(--color-on-surface-variant)]'
                    }`}
                  >
                    {type?.label ?? r.type}
                  </button>
                )
              })}
            </div>
          )}

          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-6 text-sm leading-relaxed text-[var(--color-on-surface)] whitespace-pre-wrap">
            {results[activeTab]?.text}
          </div>
        </div>
      )}

      {/* Get Guidance button (if no results yet) */}
      {results.length === 0 && phase !== 'loading' && (
        <button
          type="button"
          onClick={() => void handleGoalSubmit()}
          disabled={!goal.trim()}
          className="w-full bg-[var(--color-secondary)] text-[var(--color-on-secondary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          Get AI Guidance
        </button>
      )}
    </div>
  )
}
