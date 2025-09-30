import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Scene, SceneInsert } from '@/types'
import { sceneService } from '@/lib/services/browser/sceneService'

interface SceneState {
  scenes: Record<string, Scene>
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
 * Scene store with Zustand
 * Context7: Quick scene switching with minimal state
 * Using Record instead of Map for better Zustand compatibility
 */
export const useSceneStore = create<SceneState>()(
  persist(
    (set) => ({
      scenes: {},
      isLoading: false,
      error: null,
      currentSceneId: null,

      fetchScenesForCampaign: async (campaignId) => {
        set({ isLoading: true, error: null })
        try {
          const scenes = await sceneService.listByCampaign(campaignId)
          const scenesRecord = scenes.reduce((acc, scene) => {
            acc[scene.id] = scene
            return acc
          }, {} as Record<string, Scene>)
          set({
            scenes: scenesRecord,
            isLoading: false
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
          set(state => ({
            ...state,
            scenes: {
              ...state.scenes,
              [newScene.id]: newScene
            }
          }))
          return newScene
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create scene'
          set({ error: message })
          throw error
        }
      },

      updateScene: async (id, updates) => {
        set({ error: null })
        try {
          const updated = await sceneService.update(id, updates)
          set(state => ({
            ...state,
            scenes: {
              ...state.scenes,
              [id]: updated
            }
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update scene'
          set({ error: message })
          throw error
        }
      },

      deleteScene: async (id) => {
        set({ error: null })
        try {
          await sceneService.delete(id)
          set(state => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _, ...restScenes } = state.scenes
            return {
              ...state,
              scenes: restScenes,
              currentSceneId: state.currentSceneId === id ? null : state.currentSceneId
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete scene'
          set({ error: message })
          throw error
        }
      },

      setActiveScene: async (id, campaignId) => {
        set({ error: null })
        try {
          const updated = await sceneService.setActive(id, campaignId)
          set(state => {
            // Update all scenes - deactivate others, activate target
            const updatedScenes = { ...state.scenes }
            Object.entries(updatedScenes).forEach(([sceneId, scene]) => {
              if (scene.campaign_id === campaignId) {
                if (sceneId === id) {
                  updatedScenes[sceneId] = updated
                } else {
                  updatedScenes[sceneId] = { ...scene, is_active: false }
                }
              }
            })
            return {
              ...state,
              scenes: updatedScenes,
              currentSceneId: id
            }
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
            const updatedScenes = { ...state.scenes }
            sceneIds.forEach((id, index) => {
              if (updatedScenes[id]) {
                updatedScenes[id] = { ...updatedScenes[id], order_index: index }
              }
            })
            return {
              ...state,
              scenes: updatedScenes
            }
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
    }),
    {
      name: 'scene-store',
      partialize: (state) => ({
        currentSceneId: state.currentSceneId,
      }),
    }
  )
)