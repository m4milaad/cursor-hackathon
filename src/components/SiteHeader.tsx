'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const path = usePathname() ?? ''

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

      <div className="flex items-center space-x-4">
        <span className="material-symbols-outlined text-[#00271d] dark:text-[#fbf9f4] cursor-pointer text-2xl hover:text-[#885207] transition-colors">
          account_circle
        </span>
      </div>
    </nav>
  )
}
