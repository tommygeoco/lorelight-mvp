import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Scene, SceneInsert } from '@/types'
import { sceneService } from '@/lib/services/browser/sceneService'

interface SceneState {
  scenes: Map<string, Scene>
  isLoading: boolean
  error: string | null
  currentSceneId: string | null

  // Actions
  fetchScenesForCampaign: (campaignId: string) => Promise<void>
  createScene: (scene: Omit<SceneInsert, 'user_id'>) => Promise<Scene>
  updateScene: (id: string, updates: Partial<Scene>) => Promise<void>
  deleteScene: (id: string) => Promise<void>
  setActiveScene: (id: string, campaignId: string) => Promise<void>
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

      fetchScenesForCampaign: async (campaignId) => {
        set({ isLoading: true, error: null })
        try {
          const scenes = await sceneService.listByCampaign(campaignId)
          set(state => {
            state.scenes.clear()
            scenes.forEach(scene => {
              state.scenes.set(scene.id, scene)
            })
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
            state.scenes.set(newScene.id, newScene)
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
        if (!original) return

        set(state => {
          state.scenes.set(id, { ...original, ...updates, updated_at: new Date().toISOString() })
        })

        try {
          const updated = await sceneService.update(id, updates)
          set(state => {
            state.scenes.set(id, updated)
          })
        } catch (error) {
          set(state => {
            state.scenes.set(id, original)
            state.error = error instanceof Error ? error.message : 'Failed to update scene'
          })
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
            state.scenes.set(id, original)
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
                  state.scenes.set(sceneId, updated)
                } else {
                  state.scenes.set(sceneId, { ...scene, is_active: false })
                }
              }
            })
            state.currentSceneId = id
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to set active scene'
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
                state.scenes.set(id, { ...scene, order_index: index })
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