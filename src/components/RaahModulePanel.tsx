'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'

type Phase = 'input' | 'loading' | 'result'

const MODULE_PROMPTS: Record<string, { system: string; placeholder: string; suggestions: string[] }> = {
  'Life Direction Engine': {
    system: `You are Raah's Life Direction Engine. The user is at a crossroads. Break their situation into:
1. Clear options they have (at least 2-3)
2. Pros and cons of each option
3. Realistic outcomes for each path
4. Your grounded recommendation
Be warm, practical, and concise. Use simple language. Focus on Kashmir/India context where relevant.`,
    placeholder: 'Describe your situation… e.g. "Should I pursue engineering or start my own business?"',
    suggestions: ['Should I take a government job or start a business?', 'I finished 12th, confused about career path', 'Should I stay in Kashmir or move for work?'],
  },
  'Overthinking Breaker': {
    system: `You are Raah's Overthinking Breaker. The user is stuck in overthinking/anxiety cycles. Your job:
1. Acknowledge their feeling without judgment
2. Separate the FACTS from the FEARS in their situation
3. Break the chaos into 3-5 concrete actionable steps
4. Give one calming truth to hold onto
Be gentle, direct, and grounding. No toxic positivity.`,
    placeholder: 'What\'s spinning in your head? Write it all out...',
    suggestions: ['I keep thinking about failing my exam', 'I can\'t stop worrying about my family\'s expectations', 'Everything feels overwhelming right now'],
  },
  'Path Builder': {
    system: `You are Raah's Path Builder. The user tells you their current position and their goal. Create:
1. A clear roadmap with numbered steps from current position to goal
2. Timeline for each step (realistic weeks/months)
3. Resources they'll need at each stage
4. Potential obstacles and how to handle them
5. Quick wins they can achieve in the first week
Be specific, realistic, and encouraging.`,
    placeholder: 'Where are you now, and where do you want to be? e.g. "I\'m a 12th pass student, I want to become a software developer"',
    suggestions: ['I\'m unemployed, want to get into IT sector', 'I want to prepare for UPSC from scratch', 'I want to start a handicraft business online'],
  },
  'Life Journal': {
    system: `You are Raah's Life Journal AI companion. The user is journaling their thoughts. Respond with:
1. A brief, empathetic reflection on what they wrote
2. One insight or pattern you notice in their feelings
3. A gentle question for deeper self-reflection
4. An optional affirmation or mindful observation
Keep it warm, private-feeling, and non-judgmental. This is their safe space.`,
    placeholder: 'How are you feeling today? What\'s on your mind?',
    suggestions: ['Today was hard, I felt like giving up', 'I\'m proud of myself for studying 4 hours', 'I miss how things used to be'],
  },
  'Decision Helper': {
    system: `You are Raah's Decision Helper. The user has a decision to make. Present:
1. OPTION A vs OPTION B comparison table (or more options)
2. Short-term impact of each
3. Long-term impact of each
4. What you'd lose with each choice
5. A balanced, grounded suggestion with reasoning
Be objective first, then give your honest recommendation.`,
    placeholder: 'What decision are you facing? e.g. "Should I take the loan or save more first?"',
    suggestions: ['Government job vs private sector?', 'Arts or Science stream?', 'Should I take a loan for business?'],
  },
  'Daily Check In': {
    system: `You are Raah's Daily Check-in companion. Based on the user's brief check-in, provide:
1. Acknowledgment of how they're feeling
2. One small, actionable thing they can do today
3. A brief motivational thought (not generic — specific to their situation)
4. A rating of their emotional state and practical tip
Keep it very short and warm. Under 150 words.`,
    placeholder: 'Quick check-in: How are you feeling right now? (1-2 sentences)',
    suggestions: ['Feeling okay, a bit tired', 'Stressed about upcoming exam', 'Today feels like a fresh start'],
  },
}

export function RaahModulePanel({ module, onClose }: { module: string; onClose: () => void }) {
  const { locale } = useI18n()
  const [phase, setPhase] = useState<Phase>('input')
  const [userInput, setUserInput] = useState('')
  const [history, setHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([])

  const config = MODULE_PROMPTS[module]
  if (!config) return null

  const handleSubmit = async (input?: string) => {
    const text = (input ?? userInput).trim()
    if (!text) return

    setPhase('loading')
    setHistory(prev => [...prev, { role: 'user', text }])
    setUserInput('')

    try {
      const contextHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Raah'}: ${h.text}`).join('\n')
      const fullQuestion = contextHistory ? `${contextHistory}\nUser: ${text}` : text

      const r = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'raah',
          question: fullQuestion,
          systemPrompt: config.system,
          locale,
        }),
      })
      const d = await r.json()
      const aiText = d.text || 'Sorry, I could not process that. Please try again.'
      setHistory(prev => [...prev, { role: 'ai', text: aiText }])
      setPhase('result')
    } catch {
      setPhase('input')
      setPhase('result')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(0,0,0,0.6)] px-4" role="dialog">
      <div className="w-full max-w-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[var(--color-outline-variant)]">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-1">Raah Module</p>
            <h3 className="font-headline text-2xl text-[var(--color-primary)]">{module}</h3>
          </div>
          <button onClick={onClose} className="raasta-btn-secondary text-sm">Close</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Conversation history */}
          {history.length > 0 && (
            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className={`flex gap-3 ${h.role === 'user' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    h.role === 'user'
                      ? 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]'
                      : 'bg-[var(--color-primary-container)] text-[var(--color-on-primary)]'
                  }`}>
                    {h.role === 'user' ? 'You' : 'R'}
                  </div>
                  <div className={`flex-1 p-4 text-sm leading-relaxed ${
                    h.role === 'user'
                      ? 'bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]'
                      : 'bg-[var(--color-primary-container)] text-[var(--color-on-primary)] border border-[var(--color-outline-variant)]'
                  }`}>
                    {h.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {phase === 'loading' && (
            <div className="flex items-center gap-3 p-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]">
              <span className="w-5 h-5 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--color-on-surface-variant)]">Raah is thinking…</span>
            </div>
          )}

          {/* Input area */}
          {(phase === 'input' || phase === 'result') && (
            <div>
              <textarea
                className="raasta-input w-full text-sm min-h-[100px]"
                placeholder={config.placeholder}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSubmit() } }}
              />

              {/* Suggestions (only show if no history) */}
              {history.length === 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {config.suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setUserInput(s); void handleSubmit(s) }}
                      className="text-xs border border-[var(--color-outline-variant)] px-3 py-1.5 hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!userInput.trim()}
                className="mt-4 w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">send</span>
                {history.length > 0 ? 'Follow Up' : 'Get Guidance'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
