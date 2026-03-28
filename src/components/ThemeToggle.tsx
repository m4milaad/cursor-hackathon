'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const initialTheme = stored || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container-high)] transition-colors"
        aria-label="Toggle theme"
      >
        <span className="material-symbols-outlined text-[var(--color-on-surface)] text-xl">
          light_mode
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container-high)] transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="material-symbols-outlined text-[var(--color-on-surface)] text-xl">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  )
}
