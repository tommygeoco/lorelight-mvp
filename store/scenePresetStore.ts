import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet, castDraft } from 'immer'
import type { ScenePreset, ScenePresetInsert, ScenePresetUpdate } from '@/types'
import { scenePresetService } from '@/lib/services/browser/scenePresetService'
import { logger } from '@/lib/utils/logger'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface ScenePresetState {
  systemPresets: ScenePreset[] // 8 built-in templates (Tavern, Combat, etc.)
  userPresets: ScenePreset[] // User-created custom presets
  isLoading: boolean
  error: string | null
  hasFetchedPresets: boolean // Only fetch once on app load

  // Actions
  fetchAllPresets: () => Promise<void>
  createUserPreset: (preset: Omit<ScenePresetInsert, 'user_id' | 'is_system'>) => Promise<ScenePreset>
  updateUserPreset: (id: string, updates: ScenePresetUpdate) => Promise<void>
  deleteUserPreset: (id: string) => Promise<void>
  getAllPresets: () => ScenePreset[] // Returns system + user presets sorted
  clearError: () => void
}

/**
 * Scene Preset Store
 * Context7: Caches 8 system presets + user custom presets (fetch once on app load)
 */
export const useScenePresetStore = create<ScenePresetState>()(
  persist(
    immer((set, get) => ({
      systemPresets: [],
      userPresets: [],
      isLoading: false,
      error: null,
      hasFetchedPresets: false,

      fetchAllPresets: async () => {
        // Only fetch once
        if (get().hasFetchedPresets) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const [systemPresets, userPresets] = await Promise.all([
            scenePresetService.getSystemPresets(),
            scenePresetService.getUserPresets(),
          ])

          set(state => {
            state.systemPresets = castDraft(systemPresets)
            state.userPresets = castDraft(userPresets)
            state.hasFetchedPresets = true
            state.isLoading = false
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch presets'
          logger.error('Failed to fetch scene presets', error)
          set({ error: message, isLoading: false })
        }
      },

      createUserPreset: async (preset) => {
        set({ error: null })
        try {
          const newPreset = await scenePresetService.create(preset as ScenePresetInsert)
          set(state => {
            state.userPresets.push(castDraft(newPreset))
            // Keep sorted alphabetically
            state.userPresets.sort((a, b) => a.name.localeCompare(b.name))
          })
          return newPreset
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create preset'
          logger.error('Failed to create user preset', error, { preset })
          set({ error: message })
          throw error
        }
      },

      updateUserPreset: async (id, updates) => {
        set({ error: null })
        const originalPreset = get().userPresets.find(p => p.id === id)
        if (!originalPreset) {
          throw new Error('Preset not found')
        }

        // Optimistic update
        const optimisticPreset = { ...originalPreset, ...updates, updated_at: new Date().toISOString() }
        set(state => {
          const index = state.userPresets.findIndex(p => p.id === id)
          if (index !== -1) {
            state.userPresets[index] = castDraft(optimisticPreset)
          }
        })

        try {
          const updated = await scenePresetService.update(id, updates)
          set(state => {
            const index = state.userPresets.findIndex(p => p.id === id)
            if (index !== -1) {
              state.userPresets[index] = castDraft(updated)
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update preset'
          logger.error('Failed to update user preset', error, { id, updates })
          // Rollback
          set(state => {
            const index = state.userPresets.findIndex(p => p.id === id)
            if (index !== -1) {
              state.userPresets[index] = castDraft(originalPreset)
            }
            state.error = message
          })
          throw error
        }
      },

      deleteUserPreset: async (id) => {
        set({ error: null })
        const originalPreset = get().userPresets.find(p => p.id === id)
        if (!originalPreset) {
          throw new Error('Preset not found')
        }

        // Optimistic delete
        set(state => {
          state.userPresets = state.userPresets.filter(p => p.id !== id)
        })

        try {
          await scenePresetService.delete(id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete preset'
          logger.error('Failed to delete user preset', error, { id })
          // Rollback
          set(state => {
            state.userPresets.push(castDraft(originalPreset))
            state.userPresets.sort((a, b) => a.name.localeCompare(b.name))
            state.error = message
          })
          throw error
        }
      },

      getAllPresets: () => {
        const { systemPresets, userPresets } = get()
        return [...systemPresets, ...userPresets]
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    {
      name: 'scene-preset-store',
      partialize: (state) => ({
        systemPresets: state.systemPresets,
        userPresets: state.userPresets,
        hasFetchedPresets: state.hasFetchedPresets,
      }),
    }
  )
)
