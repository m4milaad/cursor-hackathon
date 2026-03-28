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
          <div className="absolute right-0 top-[56px] w-[360px] md:w-[420px] bg-[#fbf9f4] border border-[var(--color-outline-variant)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[80vh] overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] [scrollbar-width:thin]">
            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-2">
                Your Next Step
              </p>
              <p className="text-sm text-[#00271d] font-semibold">
                Complete your CV to unlock job applications.
              </p>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#00271d] text-[#fbf9f4] flex items-center justify-center text-[10px] uppercase tracking-[0.2em]">
                  RA
                </div>
                <div>
                  <p className="font-headline text-base text-[#00271d]">Ayesha Khan</p>
                  <p className="text-xs text-[#885207]">Preparing for Govt Exams</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/raah" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">mic</span>
                  Talk
                </Link>
                <Link href="/taleem/naukri" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">work</span>
                  Jobs
                </Link>
                <Link href="/taleem/cv" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">description</span>
                  CV
                </Link>
                <Link href="/taleem/exam" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">school</span>
                  Study
                </Link>
              </div>
            </div>

            <details className="border-b border-[var(--color-outline-variant)]">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between text-[#00271d]">
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207]">Your Journey</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-xs text-[#414845] space-y-2">
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
              </div>
            </details>

            <details className="border-b border-[var(--color-outline-variant)]">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between text-[#00271d]">
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207]">Personal Insights</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-xs text-[#414845] space-y-2">
                <div>You are improving consistency.</div>
                <div>You explore careers often. Try focusing on one.</div>
                <div>High potential in design and business.</div>
              </div>
            </details>

            <div className="p-5 border-b border-[var(--color-outline-variant)]">
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
