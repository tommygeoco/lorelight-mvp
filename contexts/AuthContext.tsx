'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/auth/supabase'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth provider with automatic session sync
 * Context7: Minimal re-renders, efficient state updates
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          // Auth session missing is expected for logged out users
          if (error.message !== 'Auth session missing!') {
            console.error('Error fetching user:', error)
          }
          clearUser()
        } else {
          setUser(user)
        }
      } catch {
        // Silently handle auth session errors for logged out state
        clearUser()
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, setUser, clearUser])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    clearUser()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}