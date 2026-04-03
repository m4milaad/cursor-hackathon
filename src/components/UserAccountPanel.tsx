'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
// import { useQuery } from 'convex/react'
// import { api } from '../../convex/_generated/api'
import { LanguageToggle } from './LanguageToggle'

interface UserAccountPanelProps {
  onClose: () => void
  onSignOut: () => void
}

export function UserAccountPanel({ onClose, onSignOut }: UserAccountPanelProps) {
  const { user } = useAuth()
  
  // Fetch user journey and insights if user is logged in
  // TODO: Re-enable after running `npx convex dev` to regenerate API
  const userJourney: any = null // useQuery(api.auth.getUserJourney, user ? { userId: user.userId } : 'skip')
  const userInsights: any = null // useQuery(api.auth.getUserInsights, user ? { userId: user.userId } : 'skip')

  return (
    <div className="absolute right-0 top-[56px] w-[360px] md:w-[420px] bg-[#fbf9f4] border border-[var(--color-outline-variant)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[80vh] overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] [scrollbar-width:thin]">
      {user ? (
        <>
          <div className="p-5 border-b border-[var(--color-outline-variant)]">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-2">
              Your Next Step
            </p>
            <p className="text-sm text-[#00271d] font-semibold">
              {!userJourney?.cvCreated 
                ? 'Complete your CV to unlock job applications.'
                : userJourney.lastActivity || 'Keep exploring RAASTA!'}
            </p>
          </div>

          <div className="p-5 border-b border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#00271d] text-[#fbf9f4] flex items-center justify-center text-[10px] uppercase tracking-[0.2em]">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-headline text-base text-[#00271d]">{user.name}</p>
                <p className="text-xs text-[#885207]">{user.email}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-5 border-b border-[var(--color-outline-variant)]">
          <p className="text-sm text-[#00271d] mb-4">
            Sign in to track your journey and get personalized insights.
          </p>
          <div className="flex gap-2">
            <Link href="/auth/signin" className="raasta-btn-primary text-xs flex-1 text-center" onClick={onClose}>
              Sign In
            </Link>
            <Link href="/auth/signup" className="raasta-btn-secondary text-xs flex-1 text-center" onClick={onClose}>
              Sign Up
            </Link>
          </div>
        </div>
      )}

      <div className="p-5 border-b border-[var(--color-outline-variant)]">
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/raah" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1" onClick={onClose}>
            <span className="material-symbols-outlined text-sm">mic</span>
            Talk
          </Link>
          <Link href="/taleem/naukri" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1" onClick={onClose}>
            <span className="material-symbols-outlined text-sm">work</span>
            Jobs
          </Link>
          <Link href="/taleem/cv" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1" onClick={onClose}>
            <span className="material-symbols-outlined text-sm">description</span>
            CV
          </Link>
          <Link href="/profile" className="raasta-btn-secondary text-[10px] text-center flex items-center justify-center gap-1" onClick={onClose}>
            <span className="material-symbols-outlined text-sm">person</span>
            Profile
          </Link>
        </div>
      </div>

      {user && (
        <>
          <details className="border-b border-[var(--color-outline-variant)]">
            <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between text-[#00271d]">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207]">Your Journey</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </summary>
            <div className="px-5 pb-5 text-xs text-[#414845] space-y-2">
              <div className="flex items-center justify-between">
                <span>Taleem: Skills learned</span>
                <span>{userJourney?.skillsLearned || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Raah: Decisions made</span>
                <span>{userJourney?.decisionsMade || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Jobs: Applications</span>
                <span>{userJourney?.jobApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CV Created</span>
                <span>{userJourney?.cvCreated ? '✓' : '✗'}</span>
              </div>
            </div>
          </details>

          <details className="border-b border-[var(--color-outline-variant)]">
            <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between text-[#00271d]">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207]">Personal Insights</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </summary>
            <div className="px-5 pb-5 text-xs text-[#414845] space-y-2">
              {userInsights?.insights && userInsights.insights.length > 0 ? (
                userInsights.insights.map((insight: string, i: number) => (
                  <div key={i}>{insight}</div>
                ))
              ) : (
                <div>Start using RAASTA to get personalized insights!</div>
              )}
            </div>
          </details>
        </>
      )}

      <div className="p-5 border-b border-[var(--color-outline-variant)]">
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#885207] mb-3">Settings</p>
        <div className="grid grid-cols-1 gap-3 text-xs text-[#414845]">
          <LanguageToggle />
        </div>
      </div>

      {user && (
        <div className="p-5">
          <button
            onClick={onSignOut}
            className="w-full raasta-btn-secondary text-xs py-2 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
