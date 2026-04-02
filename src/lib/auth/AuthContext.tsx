'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

interface User {
  userId: Id<"users">
  name: string
  email: string
  locale: string
  profile?: {
    age?: number
    district?: string
    occupation?: string
    education?: string
    interests?: string[]
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, phone?: string, locale?: string) => Promise<void>
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const USER_STORAGE_KEY = 'raasta_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signInMutation = useMutation(api.auth.signIn)
  const signUpMutation = useMutation(api.auth.signUp)
  const updateProfileMutation = useMutation(api.auth.updateProfile)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation({ email, password })
      setUser(result)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    locale: string = 'en'
  ) => {
    try {
      const result = await signUpMutation({ name, email, password, phone, locale })
      setUser(result)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      await updateProfileMutation({
        userId: user.userId,
        ...updates,
      })
      setUser({ ...user, ...updates })
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  // Return null context if not within provider instead of throwing
  if (!context) {
    return {
      user: null,
      loading: false,
      signIn: async () => {},
      signUp: async () => {},
      signOut: () => {},
      updateProfile: async () => {},
    }
  }
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/signin'
    }
  }, [user, loading])

  return { user, loading }
}
