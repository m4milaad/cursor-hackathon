'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function SiteHeader() {
  const path = usePathname() ?? ''
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false)
      }
    }
    if (panelOpen) {
      document.addEventListener('mousedown', onClick)
    }
    return () => document.removeEventListener('mousedown', onClick)
  }, [panelOpen])

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = path.startsWith(href) && href !== '/' || (href === '/' && path === '/')
    
    if (isActive) {
      return (
        <Link 
          href={href} 
          className="font-label text-xs uppercase tracking-widest text-[#885207] border-b-2 border-[#885207] pb-1 transition-colors duration-300"
        >
          {label}
        </Link>
      )
    }

    return (
      <Link 
        href={href} 
        className="font-label text-xs uppercase tracking-widest text-[#00271d] dark:text-[#eae8e3] opacity-70 hover:text-[#885207] transition-colors duration-300"
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-[#fbf9f4] dark:bg-[#000d08] flex justify-between items-center w-full px-8 h-[64px] max-w-none fixed top-0 z-50 transition-colors duration-300">
      <Link href="/" className="font-headline text-2xl font-bold tracking-tighter text-[#00271d] dark:text-[#fbf9f4] hover:opacity-80 transition-opacity">
        RAASTA AI
      </Link>
      
      <div className="hidden md:flex items-center space-x-12">
        <NavLink href="/samjho" label="Samjho" />
        <NavLink href="/zameen" label="Zameen" />
        <NavLink href="/taleem" label="Taleem" />
        <NavLink href="/raah" label="Raah" />
      </div>

      <div className="relative flex items-center space-x-4" key="header-actions" ref={panelRef}>
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className="material-symbols-outlined text-[#00271d] dark:text-[#fbf9f4] cursor-pointer text-2xl hover:text-[#885207] transition-colors"
          aria-expanded={panelOpen}
          aria-label="Open account panel"
          suppressHydrationWarning
        >
          account_circle
        </button>

        {panelOpen ? (
          <div className="absolute right-0 top-[56px] w-[360px] md:w-[440px] bg-[#fbf9f4] border border-[var(--color-outline-variant)] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-2">
                Your Next Step
              </p>
              <p className="text-sm text-[#414845]">
                Complete your CV to unlock job applications.
              </p>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#00271d] text-[#fbf9f4] flex items-center justify-center text-xs uppercase tracking-[0.2em]">
                  RA
                </div>
                <div>
                  <p className="font-headline text-lg text-[#00271d]">Ayesha Khan</p>
                  <p className="text-xs text-[#414845]">Srinagar, Kashmir</p>
                  <p className="text-xs text-[#885207] mt-1">Goal: Preparing for Govt Exams</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#414845] italic">
                You are on a path to becoming a designer.
              </p>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/raah" className="raasta-btn-secondary text-xs text-center">Talk to Raah</Link>
                <Link href="/taleem/naukri" className="raasta-btn-secondary text-xs text-center">View Jobs</Link>
                <Link href="/taleem/cv" className="raasta-btn-secondary text-xs text-center">Open CV</Link>
                <Link href="/taleem/exam" className="raasta-btn-secondary text-xs text-center">Continue Study</Link>
              </div>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Your Journey</p>
              <div className="space-y-3 text-xs text-[#414845]">
                <div className="flex items-center justify-between">
                  <span>Taleem: Skills learned</span>
                  <span>3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Raah: Decisions made</span>
                  <span>2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Jobs: Applications</span>
                  <span>1</span>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-[#885207]">
                  You are here: Skill Learning to Portfolio to Job Ready
                </div>
              </div>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Personal Insights</p>
              <ul className="text-xs text-[#414845] space-y-2">
                <li>You are improving consistency.</li>
                <li>You explore careers often. Try focusing on one.</li>
                <li>High potential in design and business.</li>
              </ul>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">My Content</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <span className="text-[#414845]">CV / Voice CV</span>
                <span className="text-[#414845]">Journal</span>
                <span className="text-[#414845]">Ideas</span>
                <span className="text-[#414845]">Goals</span>
              </div>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Notifications</p>
              <ul className="text-xs text-[#414845] space-y-2">
                <li>Job alert: 2 new matches near Srinagar.</li>
                <li>Scholarship deadline in 4 days.</li>
                <li>Study reminder at 7:00 PM.</li>
              </ul>
            </div>

            <div className="p-5">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Settings</p>
              <div className="grid grid-cols-2 gap-3 text-xs text-[#414845]">
                <span>Language</span>
                <span>Privacy</span>
                <span>Notifications</span>
                <span>Theme</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
