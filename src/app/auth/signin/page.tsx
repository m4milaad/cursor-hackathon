'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { useI18n } from '@/lib/i18n/context'

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { t } = useI18n()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f4] dark:bg-[#000d08] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl font-bold text-[#00271d] dark:text-[#fbf9f4] mb-2">
            {t('signin.title', 'Welcome Back')}
          </h1>
          <p className="text-[#414845] dark:text-[#c4c2bd]">
            {t('signin.subtitle', 'Sign in to continue your journey')}
          </p>
        </div>

        <div className="bg-white dark:bg-[#001410] rounded-lg shadow-lg p-8 border border-[#e0ddd7] dark:border-[#00271d]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                {t('signin.email', 'Email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                {t('signin.password', 'Password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full raasta-btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('signin.loading', 'Signing in...') : t('signin.button', 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#414845] dark:text-[#c4c2bd]">
              {t('signin.noAccount', "Don't have an account?")}{' '}
              <Link href="/auth/signup" className="text-[#885207] hover:underline font-medium">
                {t('signin.signupLink', 'Sign up')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#885207] hover:underline">
            ← {t('signin.backHome', 'Back to home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
