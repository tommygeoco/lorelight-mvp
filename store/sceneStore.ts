import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet, castDraft } from 'immer'
import type { Scene, SceneInsert } from '@/types'
import { sceneService } from '@/lib/services/browser/sceneService'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface SceneState {
  scenes: Map<string, Scene>
  isLoading: boolean
  error: string | null
  currentSceneId: string | null
  fetchedCampaigns: Set<string> // Track which campaigns we've fetched

  // Actions
  fetchScenesForCampaign: (campaignId: string) => Promise<void>
  createScene: (scene: Omit<SceneInsert, 'user_id'>) => Promise<Scene>
  updateScene: (id: string, updates: Partial<Scene>) => Promise<void>
  deleteScene: (id: string) => Promise<void>
  setActiveScene: (id: string, campaignId: string) => Promise<void>
  activateScene: (id: string) => Promise<void>
  deactivateScene: (id: string) => Promise<void>
  reorderScenes: (campaignId: string, sceneIds: string[]) => Promise<void>
  setCurrentScene: (id: string | null) => void
  clearError: () => void
}

/**
 * Scene store with Zustand + Immer
 * Context7: Quick scene switching with minimal state
 */
export const useSceneStore = create<SceneState>()(
  persist(
    immer((set, get) => ({
      scenes: new Map(),
      isLoading: false,
      error: null,
      currentSceneId: null,
      fetchedCampaigns: new Set(),

      fetchScenesForCampaign: async (campaignId) => {
        set({ isLoading: true, error: null })
        try {
          const scenes = await sceneService.listByCampaign(campaignId)
          set(state => {
            // Clear old scenes for this campaign
            state.scenes.forEach((scene, id) => {
              if (scene.campaign_id === campaignId) {
                state.scenes.delete(id)
              }
            })
            // Add new scenes
            scenes.forEach(scene => {
              state.scenes.set(scene.id, castDraft(scene))
            })
            state.fetchedCampaigns.add(campaignId)
            state.isLoading = false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch scenes',
            isLoading: false
          })
        }
      },

      createScene: async (scene) => {
        set({ error: null })
        try {
          const newScene = await sceneService.create(scene)
          set(state => {
            state.scenes.set(newScene.id, castDraft(newScene))
          })
          return newScene
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create scene'
          set({ error: message })
          throw error
        }
      },

      updateScene: async (id, updates) => {
        set({ error: null })
        const original = get().scenes.get(id)

        // Only do optimistic update if scene exists in sceneStore
        if (original) {
          const optimisticUpdate = { ...original, ...updates, updated_at: new Date().toISOString() }
          set(state => {
            state.scenes.set(id, castDraft(optimisticUpdate))
          })

          // Also update sessionSceneStore to keep sessions in sync
          import('@/store/sessionSceneStore').then(({ useSessionSceneStore }) => {
            const sessionStore = useSessionSceneStore.getState()
            sessionStore.sessionScenes.forEach((scenes, sessionId) => {
              const sceneIndex = scenes.findIndex(s => s.id === id)
              if (sceneIndex !== -1) {
                sessionStore.updateSceneInSession(sessionId, id, optimisticUpdate)
              }
            })
          }).catch(console.error)
        }

        try {
          // Always update database, even if scene not in local store
          const updated = await sceneService.update(id, updates)

          // Update sceneStore if scene exists there
          if (original) {
            set(state => {
              state.scenes.set(id, castDraft(updated))
            })
          }

          // Sync final update to sessionSceneStore
          import('@/store/sessionSceneStore').then(({ useSessionSceneStore }) => {
            const sessionStore = useSessionSceneStore.getState()
            sessionStore.sessionScenes.forEach((scenes, sessionId) => {
              const sceneIndex = scenes.findIndex(s => s.id === id)
              if (sceneIndex !== -1) {
                sessionStore.updateSceneInSession(sessionId, id, updated)
              }
            })
          }).catch(console.error)
        } catch (error) {
          // Only rollback if we did an optimistic update
          if (original) {
            set(state => {
              state.scenes.set(id, castDraft(original))
              state.error = error instanceof Error ? error.message : 'Failed to update scene'
            })
          } else {
            set({ error: error instanceof Error ? error.message : 'Failed to update scene' })
          }
          throw error
        }
      },

      deleteScene: async (id) => {
        set({ error: null })
        const original = get().scenes.get(id)
        if (!original) return

        set(state => {
          state.scenes.delete(id)
          if (state.currentSceneId === id) {
            state.currentSceneId = null
          }
        })

        try {
          await sceneService.delete(id)
        } catch (error) {
          set(state => {
            state.scenes.set(id, castDraft(original))
            state.error = error instanceof Error ? error.message : 'Failed to delete scene'
          })
          throw error
        }
      },

      setActiveScene: async (id, campaignId) => {
        set({ error: null })
        try {
          const updated = await sceneService.setActive(id, campaignId)
          set(state => {
            // Update all scenes - deactivate others, activate target
            state.scenes.forEach((scene, sceneId) => {
              if (scene.campaign_id === campaignId) {
                if (sceneId === id) {
                  state.scenes.set(sceneId, castDraft(updated))
                } else {
                  const deactivated = { ...scene, is_active: false }
                  state.scenes.set(sceneId, castDraft(deactivated))
                }
              }
            })
            state.currentSceneId = id
          })

          // Sync to sessionSceneStore
          import('@/store/sessionSceneStore').then(({ useSessionSceneStore }) => {
            const sessionStore = useSessionSceneStore.getState()
            sessionStore.sessionScenes.forEach((scenes, sessionId) => {
              // Check if any of these scenes belong to this campaign
              const hasCampaignScenes = scenes.some(s => s.campaign_id === campaignId)
              if (hasCampaignScenes) {
                // Update all scenes in this session for this campaign
                scenes.forEach(scene => {
                  if (scene.campaign_id === campaignId) {
                    sessionStore.updateSceneInSession(sessionId, scene.id, {
                      is_active: scene.id === id,
                      updated_at: new Date().toISOString()
                    })
                  }
                })
              }
            })
          }).catch(console.error)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to set active scene'
          set({ error: message })
          throw error
        }
      },

      activateScene: async (id) => {
        set({ error: null })
        try {
          // Import the activation service dynamically to avoid circular dependencies
          const { sceneActivationService } = await import('@/lib/services/browser/sceneActivationService')
          await sceneActivationService.activateScene(id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to activate scene'
          set({ error: message })
          throw error
        }
      },

      deactivateScene: async (id) => {
        set({ error: null })
        try {
          const { sceneActivationService } = await import('@/lib/services/browser/sceneActivationService')
          await sceneActivationService.deactivateScene(id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to deactivate scene'
          set({ error: message })
          throw error
        }
      },

      reorderScenes: async (campaignId, sceneIds) => {
        set({ error: null })
        try {
          await sceneService.reorder(campaignId, sceneIds)
          // Update local state with new order
          set(state => {
            sceneIds.forEach((id, index) => {
              const scene = state.scenes.get(id)
              if (scene) {
                const reordered = { ...scene, order_index: index }
                state.scenes.set(id, castDraft(reordered))
              }
            })
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to reorder scenes'
          set({ error: message })
          throw error
        }
      },

      setCurrentScene: (id) => {
        set({ currentSceneId: id })
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    {
      name: 'scene-store',
      partialize: (state) => ({
        currentSceneId: state.currentSceneId,
      }),
    }
  )
)