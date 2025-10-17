import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createClient } from '@/lib/auth/supabase'
import { useToastStore } from './toastStore'
import type { Database } from '@/types/database'

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

interface PreferencesState {
  preferences: UserPreferences | null
  isLoading: boolean
  
  // Actions
  fetchPreferences: (userId: string) => Promise<void>
  updatePreferences: (updates: UserPreferencesUpdate) => Promise<void>
  createPreferences: (userId: string) => Promise<void>
}

/**
 * User preferences store
 * Manages app-wide user preferences synced with Supabase
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    immer((set, get) => ({
      preferences: null,
      isLoading: false,

      fetchPreferences: async (userId: string) => {
        set({ isLoading: true })
        const supabase = createClient()

        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (error) {
            // If no preferences exist, create default ones
            if (error.code === 'PGRST116') {
              await get().createPreferences(userId)
              return
            }
            // If table doesn't exist yet (migration not run), silently fail
            if (error.code === '42P01') {
              console.warn('user_preferences table does not exist yet. Please run migrations.')
              set({ isLoading: false })
              return
            }
            throw error
          }

          set({ preferences: data, isLoading: false })
        } catch (error) {
          console.error('Failed to fetch preferences:', error)
          set({ isLoading: false })
          // Only show error toast for unexpected errors, not table missing
          if (error && typeof error === 'object' && 'code' in error && error.code !== '42P01') {
            useToastStore.getState().addToast('Failed to load preferences', 'error')
          }
        }
      },

      createPreferences: async (userId: string) => {
        const supabase = createClient()

        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .insert({
              user_id: userId,
              default_volume: 0.7,
              loop_enabled: false,
              theme_preference: 'dark',
              notifications_enabled: true,
            })
            .select()
            .single()

          if (error) {
            // If preferences already exist, fetch them instead
            if (error.code === '23505') {
              console.log('Preferences already exist, fetching...')
              const { data: existingData } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single()
              
              if (existingData) {
                set({ preferences: existingData, isLoading: false })
                return
              }
            }
            throw error
          }

          set({ preferences: data, isLoading: false })
        } catch (error) {
          console.error('Failed to create preferences:', error)
          set({ isLoading: false })
        }
      },

      updatePreferences: async (updates: UserPreferencesUpdate) => {
        const { preferences } = get()
        if (!preferences) return

        const supabase = createClient()

        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .update(updates)
            .eq('user_id', preferences.user_id)
            .select()
            .single()

          if (error) throw error

          set({ preferences: data })
          useToastStore.getState().addToast('Preferences updated', 'success')
        } catch (error) {
          console.error('Failed to update preferences:', error)
          useToastStore.getState().addToast('Failed to update preferences', 'error')
        }
      },
    })),
    {
      name: 'preferences-store',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
)

