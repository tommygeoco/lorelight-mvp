import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { SceneBlock, SceneBlockInsert, SceneBlockUpdate } from '@/types'
import { sceneBlockService } from '@/lib/services/browser/sceneBlockService'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface SceneBlockState {
  blocks: Map<string, SceneBlock>
  isLoading: boolean
  error: string | null
  fetchedScenes: Set<string> // Track which scenes we&apos;ve fetched

  actions: {
    fetchBlocksForScene: (sceneId: string) => Promise<void>
    addBlock: (block: Omit<SceneBlockInsert, 'user_id'>) => Promise<SceneBlock>
    updateBlock: (id: string, updates: SceneBlockUpdate) => Promise<void>
    deleteBlock: (id: string) => Promise<void>
    reorder: (sceneId: string, blockIds: string[]) => Promise<void>
    setBlocks: (sceneId: string, blocks: SceneBlock[]) => void
    clearError: () => void
  }
}

/**
 * Scene Block store with Zustand + Immer
 * Context7: Notion-like blocks for rich text scene notes
 */
export const useSceneBlockStore = create<SceneBlockState>()(
  persist(
    immer((set, get) => ({
      blocks: new Map(),
      isLoading: false,
      error: null,
      fetchedScenes: new Set(),

      actions: {
        fetchBlocksForScene: async (sceneId: string) => {
          // Don&apos;t refetch if already loaded
          if (get().fetchedScenes.has(sceneId)) {
            return
          }

          set({ isLoading: true, error: null })
          try {
            const blocks = await sceneBlockService.listByScene(sceneId)
            set(state => {
              blocks.forEach(block => {
                state.blocks.set(block.id, block)
              })
              state.fetchedScenes.add(sceneId)
              state.isLoading = false
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch blocks',
              isLoading: false,
            })
          }
        },

        addBlock: async (blockData: Omit<SceneBlockInsert, 'user_id'>) => {
          try {
            const newBlock = await sceneBlockService.create(blockData as SceneBlockInsert)
            set(state => {
              state.blocks.set(newBlock.id, newBlock)
            })
            return newBlock
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create block',
            })
            throw error
          }
        },

        updateBlock: async (id, updates) => {
          // Optimistic update
          const original = get().blocks.get(id)
          if (original) {
            set(state => {
              const block = state.blocks.get(id)
              if (block) {
                state.blocks.set(id, { ...block, ...updates, updated_at: new Date().toISOString() })
              }
            })
          }

          try {
            const updated = await sceneBlockService.update(id, updates)
            set(state => {
              state.blocks.set(id, updated)
            })
          } catch (error) {
            // Rollback on error
            if (original) {
              set(state => {
                state.blocks.set(id, original)
              })
            }
            set({
              error: error instanceof Error ? error.message : 'Failed to update block',
            })
            throw error
          }
        },

        deleteBlock: async (id) => {
          // Optimistic delete
          const original = get().blocks.get(id)
          set(state => {
            state.blocks.delete(id)
          })

          try {
            await sceneBlockService.delete(id)
          } catch (error) {
            // Rollback on error
            if (original) {
              set(state => {
                state.blocks.set(id, original)
              })
            }
            set({
              error: error instanceof Error ? error.message : 'Failed to delete block',
            })
            throw error
          }
        },

        reorder: async (sceneId, blockIds) => {
          try {
            await sceneBlockService.reorder(sceneId, blockIds)

            // Update order_index locally
            set(state => {
              blockIds.forEach((blockId, index) => {
                const block = state.blocks.get(blockId)
                if (block) {
                  state.blocks.set(blockId, { ...block, order_index: index })
                }
              })
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to reorder blocks',
            })
            throw error
          }
        },

        setBlocks: (sceneId, blocks) => {
          set(state => {
            blocks.forEach(block => {
              state.blocks.set(block.id, block)
            })
            state.fetchedScenes.add(sceneId)
          })
        },

        clearError: () => set({ error: null }),
      },
    })),
    {
      name: 'scene-blocks',
      partialize: (state) => ({
        blocks: state.blocks,
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
              blocks: new Map(Object.entries(state.blocks || {})),
              fetchedScenes: new Set(state.fetchedScenes || []),
            }
          }
        },
        setItem: (name, value) => {
          const serialized = {
            state: {
              blocks: Object.fromEntries(value.state.blocks || new Map()),
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
