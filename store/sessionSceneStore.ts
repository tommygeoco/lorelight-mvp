import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet, castDraft } from 'immer'
import type { Scene } from '@/types'
import { sessionSceneService } from '@/lib/services/browser/sessionSceneService'
import { logger } from '@/lib/utils/logger'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface SessionSceneState {
  // Map of sessionId -> ordered Scene[]
  sessionScenes: Map<string, Scene[]>
  isLoading: boolean
  error: string | null
  fetchedSessions: Set<string> // Track which sessions we've fetched
  _version: number // Force re-renders when incremented

  // Actions
  fetchScenesForSession: (sessionId: string, force?: boolean) => Promise<void>
  addSceneToSession: (sessionId: string, sceneId: string, orderIndex?: number) => Promise<void>
  removeSceneFromSession: (sessionId: string, sceneId: string) => Promise<void>
  reorderScenes: (sessionId: string, sceneIds: string[]) => Promise<void>
  updateSceneInSession: (sessionId: string, sceneId: string, updates: Partial<Scene>) => void
  isSceneInSession: (sessionId: string, sceneId: string) => boolean
  clearError: () => void
}

/**
 * Session-Scene Junction Store
 * Context7: Manages many-to-many relationships between sessions and scenes
 */
export const useSessionSceneStore = create<SessionSceneState>()(
  persist(
    immer((set, get) => ({
      sessionScenes: new Map(),
      isLoading: false,
      error: null,
      fetchedSessions: new Set(),
      _version: 0,

      fetchScenesForSession: async (sessionId, force = false) => {
        // Don't refetch if already loaded (unless forced)
        if (!force && get().fetchedSessions.has(sessionId)) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const scenes = await sessionSceneService.getScenesForSession(sessionId)
          set(state => {
            state.sessionScenes.set(sessionId, castDraft(scenes))
            state.fetchedSessions.add(sessionId)
            state.isLoading = false
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch scenes for session'
          logger.error('Failed to fetch scenes for session', error, { sessionId })
          set({ error: message, isLoading: false })
        }
      },

      addSceneToSession: async (sessionId, sceneId, orderIndex) => {
        set({ error: null })
        try {
          await sessionSceneService.addSceneToSession(sessionId, sceneId, orderIndex)
          // Refetch to get updated list
          const scenes = await sessionSceneService.getScenesForSession(sessionId)
          set(state => {
            state.sessionScenes.set(sessionId, castDraft(scenes))
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add scene to session'
          logger.error('Failed to add scene to session', error, { sessionId, sceneId })
          set({ error: message })
          throw error
        }
      },

      removeSceneFromSession: async (sessionId, sceneId) => {
        set({ error: null })
        const originalScenes = get().sessionScenes.get(sessionId)
        if (!originalScenes) return

        // Optimistic update
        const updatedScenes = originalScenes.filter(scene => scene.id !== sceneId)
        set(state => {
          state.sessionScenes.set(sessionId, castDraft(updatedScenes))
        })

        try {
          await sessionSceneService.removeSceneFromSession(sessionId, sceneId)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove scene from session'
          logger.error('Failed to remove scene from session', error, { sessionId, sceneId })
          // Rollback
          set(state => {
            state.sessionScenes.set(sessionId, castDraft(originalScenes))
            state.error = message
          })
          throw error
        }
      },

      reorderScenes: async (sessionId, sceneIds) => {
        set({ error: null })
        const originalScenes = get().sessionScenes.get(sessionId)
        if (!originalScenes) return

        // Optimistic update - reorder based on sceneIds array
        const sceneMap = new Map(originalScenes.map(s => [s.id, s]))
        const reorderedScenes = sceneIds.map(id => sceneMap.get(id)!).filter(Boolean)

        set(state => {
          state.sessionScenes.set(sessionId, castDraft(reorderedScenes))
        })

        try {
          await sessionSceneService.reorderScenes(sessionId, sceneIds)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to reorder scenes'
          logger.error('Failed to reorder scenes', error, { sessionId, sceneIds })
          // Rollback
          set(state => {
            state.sessionScenes.set(sessionId, castDraft(originalScenes))
            state.error = message
          })
          throw error
        }
      },

      updateSceneInSession: (sessionId, sceneId, updates) => {
        set(state => {
          const scenes = state.sessionScenes.get(sessionId)
          if (!scenes) return

          const updatedScenes = scenes.map(scene =>
            scene.id === sceneId ? { ...scene, ...updates } : scene
          )

          state.sessionScenes.set(sessionId, castDraft(updatedScenes))
          state._version++ // Increment version to force re-renders
        })
      },

      isSceneInSession: (sessionId, sceneId) => {
        const scenes = get().sessionScenes.get(sessionId)
        if (!scenes) return false
        return scenes.some(scene => scene.id === sceneId)
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    {
      name: 'session-scene-store',
      partialize: (state) => {
        // Persist sessionScenes as array of [sessionId, Scene[]] tuples
        const sessionScenesMap = state.sessionScenes instanceof Map ? state.sessionScenes : new Map()
        return {
          sessionScenes: Array.from(sessionScenesMap.entries()),
          fetchedSessions: Array.from(state.fetchedSessions),
        }
      },
      merge: (persistedState, currentState) => {
        const state = { ...currentState, ...(persistedState as object) }
        const persisted = persistedState as {
          sessionScenes?: [string, Scene[]][]
          fetchedSessions?: string[]
        }

        // Restore Map from array
        if (Array.isArray(persisted?.sessionScenes)) {
          state.sessionScenes = new Map(persisted.sessionScenes)
        } else {
          state.sessionScenes = new Map()
        }

        // Restore Set from array
        if (Array.isArray(persisted?.fetchedSessions)) {
          state.fetchedSessions = new Set(persisted.fetchedSessions)
        } else {
          state.fetchedSessions = new Set()
        }

        return state
      },
    }
  )
)
