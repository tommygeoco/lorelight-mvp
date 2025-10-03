import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { SceneNPC, SceneNPCInsert, SceneNPCUpdate } from '@/types'
import { sceneNPCService } from '@/lib/services/browser/sceneNPCService'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface SceneNPCState {
  npcs: Map<string, SceneNPC>
  isLoading: boolean
  error: string | null
  fetchedScenes: Set<string> // Track which scenes we&apos;ve fetched

  actions: {
    fetchNPCsForScene: (sceneId: string) => Promise<void>
    create: (npc: Omit<SceneNPCInsert, 'user_id'>) => Promise<SceneNPC>
    update: (id: string, updates: SceneNPCUpdate) => Promise<void>
    delete: (id: string) => Promise<void>
    reorder: (sceneId: string, npcIds: string[]) => Promise<void>
    setNPCs: (sceneId: string, npcs: SceneNPC[]) => void
    clearError: () => void
  }
}

/**
 * Scene NPC store with Zustand + Immer
 * Context7: Enemy and NPC management for scenes
 */
export const useSceneNPCStore = create<SceneNPCState>()(
  persist(
    immer((set, get) => ({
      npcs: new Map(),
      isLoading: false,
      error: null,
      fetchedScenes: new Set(),

      actions: {
        fetchNPCsForScene: async (sceneId: string) => {
          // Don&apos;t refetch if already loaded
          if (get().fetchedScenes.has(sceneId)) {
            return
          }

          set({ isLoading: true, error: null })
          try {
            const npcs = await sceneNPCService.listByScene(sceneId)
            set(state => {
              npcs.forEach(npc => {
                state.npcs.set(npc.id, npc)
              })
              state.fetchedScenes.add(sceneId)
              state.isLoading = false
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch NPCs',
              isLoading: false,
            })
          }
        },

        create: async (npcData: Omit<SceneNPCInsert, 'user_id'>) => {
          try {
            const newNPC = await sceneNPCService.create(npcData as SceneNPCInsert)
            set(state => {
              state.npcs.set(newNPC.id, newNPC)
            })
            return newNPC
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create NPC',
            })
            throw error
          }
        },

        update: async (id, updates) => {
          // Optimistic update
          const original = get().npcs.get(id)
          if (original) {
            set(state => {
              const npc = state.npcs.get(id)
              if (npc) {
                state.npcs.set(id, { ...npc, ...updates, updated_at: new Date().toISOString() })
              }
            })
          }

          try {
            const updated = await sceneNPCService.update(id, updates)
            set(state => {
              state.npcs.set(id, updated)
            })
          } catch (error) {
            // Rollback on error
            if (original) {
              set(state => {
                state.npcs.set(id, original)
              })
            }
            set({
              error: error instanceof Error ? error.message : 'Failed to update NPC',
            })
            throw error
          }
        },

        delete: async (id) => {
          // Optimistic delete
          const original = get().npcs.get(id)
          set(state => {
            state.npcs.delete(id)
          })

          try {
            await sceneNPCService.delete(id)
          } catch (error) {
            // Rollback on error
            if (original) {
              set(state => {
                state.npcs.set(id, original)
              })
            }
            set({
              error: error instanceof Error ? error.message : 'Failed to delete NPC',
            })
            throw error
          }
        },

        reorder: async (sceneId, npcIds) => {
          try {
            await sceneNPCService.reorder(sceneId, npcIds)

            // Update order_index locally
            set(state => {
              npcIds.forEach((npcId, index) => {
                const npc = state.npcs.get(npcId)
                if (npc) {
                  state.npcs.set(npcId, { ...npc, order_index: index })
                }
              })
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to reorder NPCs',
            })
            throw error
          }
        },

        setNPCs: (sceneId, npcs) => {
          set(state => {
            npcs.forEach(npc => {
              state.npcs.set(npc.id, npc)
            })
            state.fetchedScenes.add(sceneId)
          })
        },

        clearError: () => set({ error: null }),
      },
    })),
    {
      name: 'scene-npcs',
      partialize: (state) => ({
        npcs: state.npcs,
        fetchedScenes: state.fetchedScenes,
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null

          const { state } = JSON.parse(str)

          // Convert plain objects back to Maps/Sets
          return {
            state: {
              ...state,
              npcs: new Map(Object.entries(state.npcs || {})),
              fetchedScenes: new Set(state.fetchedScenes || []),
            }
          }
        },
        setItem: (name, value) => {
          const serialized = {
            state: {
              npcs: Object.fromEntries(value.state.npcs || new Map()),
              fetchedScenes: Array.from(value.state.fetchedScenes || new Set()),
            }
          }
          localStorage.setItem(name, JSON.stringify(serialized))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
