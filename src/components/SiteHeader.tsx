'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'
import { LanguageToggle } from '@/components/LanguageToggle'
import { GlobalGuidePanel } from '@/components/GlobalGuidePanel'
import { useAuth } from '@/lib/auth/AuthContext'
import dynamic from 'next/dynamic'

// Dynamically import the UserAccountPanel to avoid SSR issues with Convex
const UserAccountPanel = dynamic(
  () => import('@/components/UserAccountPanel').then(mod => ({ default: mod.UserAccountPanel })),
  { ssr: false }
)

export function SiteHeader() {
  const path = usePathname() ?? ''
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const { user, signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
    setPanelOpen(false)
  }

  const handleClosePanel = () => {
    setPanelOpen(false)
  }

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
        <div className="hidden md:flex items-center">
          <LanguageToggle />
        </div>
        
        {/* Global Guide Assistant */}
        <GlobalGuidePanel />
        
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
          <UserAccountPanel onClose={handleClosePanel} onSignOut={handleSignOut} />
        ) : null}
      </div>
    </nav>
  )
}
