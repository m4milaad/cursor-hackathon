'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getGuideAssistance, getFallbackRoute, type GuideResponse } from '@/lib/guideAssistant'
import { useI18n } from '@/lib/i18n/context'

export function GlobalGuidePanel() {
  const router = useRouter()
  const { locale } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [guidance, setGuidance] = useState<GuideResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close panel on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleGetGuidance = async () => {
    if (!userInput.trim()) return

    setLoading(true)
    setGuidance(null)

    try {
      // Try API first, fallback to keyword matching
      let result: GuideResponse
      try {
        result = await getGuideAssistance(userInput)
      } catch {
        result = getFallbackRoute(userInput)
      }

      setGuidance(result)
    } catch (error) {
      console.error('Guide error:', error)
      const fallback = getFallbackRoute(userInput)
      setGuidance(fallback)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = () => {
    if (guidance?.route) {
      router.push(guidance.route)
      setIsOpen(false)
      setUserInput('')
      setGuidance(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleGetGuidance()
    }
  }

  const quickActions = [
    { label: 'Document samjho', query: 'Ye notice kya kehta hai', icon: '📄' },
    { label: 'Fasal check', query: 'Meri fasal kharab hai', icon: '🌾' },
    { label: 'Job chahiye', query: 'Mujhe naukri chahiye', icon: '💼' },
    { label: 'Madad chahiye', query: 'Main pareshan hoon', icon: '🧭' },
  ]

  return (
    <>
      {/* Guide Button in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
        aria-label="Open AI Guide"
        title="AI Guide - Madad chahiye?"
      >
        <span className="material-symbols-outlined text-[#00271d] dark:text-[#fbf9f4] text-2xl hover:text-[#885207] transition-colors">
          assistant
        </span>
        
        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#885207] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#885207]"></span>
        </span>
      </button>

      {/* Floating Guide Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/20 backdrop-blur-sm">
          <div
            ref={panelRef}
            className="w-full max-w-2xl bg-[#fbf9f4] dark:bg-[#000d08] border-2 border-[#885207] shadow-2xl rounded-lg overflow-hidden animate-in slide-in-from-top-4 duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#885207] to-[#b8751e] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl">assistant</span>
                <div>
                  <h2 className="font-headline text-2xl font-bold">AI Guide</h2>
                  <p className="text-sm opacity-90">Kya madad chahiye? Main batata hoon</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Close guide"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Quick Actions */}
              {!guidance && !loading && (
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-[#885207] mb-3">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.query}
                        onClick={() => {
                          setUserInput(action.query)
                          setTimeout(() => {
                            void handleGetGuidance()
                          }, 100)
                        }}
                        className="flex items-center gap-2 p-3 bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded text-left transition-colors text-sm"
                      >
                        <span className="text-xl">{action.icon}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div>
                <label
                  htmlFor="guide-input"
                  className="font-label text-[10px] uppercase tracking-widest text-[#885207] mb-2 block"
                >
                  Apna sawal yahan likhein
                </label>
                <textarea
                  id="guide-input"
                  rows={3}
                  className="w-full bg-white dark:bg-[#001410] border-2 border-[var(--color-outline-variant)] focus:border-[#885207] p-4 rounded text-[var(--color-on-surface)] resize-none transition-colors"
                  placeholder="Example: Meri fasal kharab hai, kya karun?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  onClick={handleGetGuidance}
                  disabled={loading || !userInput.trim()}
                  className="mt-3 w-full bg-[#885207] hover:bg-[#b8751e] text-white font-label text-xs uppercase tracking-widest py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Samajh raha hoon...
                    </span>
                  ) : (
                    '🧭 Guide Karein'
                  )}
                </button>
              </div>

              {/* Guidance Result */}
              {guidance && (
                <div className="bg-gradient-to-br from-[#885207]/10 to-[#b8751e]/10 border-2 border-[#885207] rounded-lg p-6 space-y-4 animate-in fade-in duration-300">
                  {/* Module Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#885207] text-white text-sm font-bold rounded-full">
                      {guidance.module === 'SAMJHO' && '📄'}
                      {guidance.module === 'ZAMEEN' && '🌾'}
                      {guidance.module === 'TALEEM' && '🎓'}
                      {guidance.module === 'RAAH' && '🧭'}
                      {guidance.module}
                    </span>
                    <span className="text-xs text-[var(--color-on-surface-variant)] italic">
                      {guidance.action.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded border-l-4 border-[#885207]">
                    <p className="text-base text-[var(--color-on-surface)] font-medium">
                      {guidance.message}
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    <p className="font-label text-[10px] uppercase tracking-widest text-[#885207]">
                      Steps to Follow
                    </p>
                    {guidance.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-white/70 dark:bg-black/30 p-3 rounded"
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#885207] text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="pt-1 text-sm text-[var(--color-on-surface)]">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Button */}
                  {guidance.route && (
                    <button
                      onClick={handleNavigate}
                      className="w-full bg-gradient-to-r from-[#885207] to-[#b8751e] hover:from-[#b8751e] hover:to-[#885207] text-white font-headline text-lg py-4 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <span>{guidance.module} mein jayen</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  )}

                  {/* Try Another */}
                  <button
                    onClick={() => {
                      setGuidance(null)
                      setUserInput('')
                    }}
                    className="w-full text-sm text-[#885207] hover:underline"
                  >
                    ← Doosra sawal puchein
                  </button>
                </div>
              )}

              {/* Help Text */}
              {!guidance && !loading && (
                <div className="text-xs text-[var(--color-on-surface-variant)] space-y-2 border-t border-[var(--color-outline-variant)] pt-4">
                  <p className="font-semibold">💡 Examples:</p>
                  <ul className="space-y-1 pl-4">
                    <li>• "Ye notice kya kehta hai" → Samjho</li>
                    <li>• "Meri fasal kharab hai" → Zameen</li>
                    <li>• "Mujhe job chahiye" → Taleem</li>
                    <li>• "Main pareshan hoon" → Raah</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
