import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
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
  _version: number // Force re-renders on Map mutations

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
  // persist(
    immer((set, get) => ({
      blocks: new Map(),
      isLoading: false,
      error: null,
      fetchedScenes: new Set(),
      _version: 0,

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
              state._version++ // Force re-render
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
              state._version++ // Force re-render
            })
            return newBlock
          } catch (error) {
            const errorMessage = error instanceof Error
              ? error.message
              : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to create block'

            console.error('Failed to create block:', errorMessage, error)
            set({ error: errorMessage })
            throw new Error(errorMessage)
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
                state._version++ // Force re-render
              }
            })
          }

          try {
            const updated = await sceneBlockService.update(id, updates)
            set(state => {
              state.blocks.set(id, updated)
              state._version++ // Force re-render
            })
          } catch (error) {
            // Rollback on error
            if (original) {
              set(state => {
                state.blocks.set(id, original)
                state._version++ // Force re-render
              })
            }
            set({
              error: error instanceof Error ? error.message : 'Failed to update block',
            })
            throw error
          }
        },

        deleteBlock: async (id) => {
          console.log('🗑️ deleteBlock called with id:', id)
          console.log('Before delete - blocks size:', get().blocks.size)

          // Optimistic delete - remove from UI immediately
          set(state => {
            const hadBlock = state.blocks.has(id)
            state.blocks.delete(id)
            state._version++ // Force re-render
            console.log(`After delete - had block: ${hadBlock}, new size: ${state.blocks.size}, version: ${state._version}`)
          })

          // Skip database delete if this is a client-only ID (from broken optimistic updates)
          if (id.startsWith('client-')) {
            console.warn(`Skipping DB delete for client-only block: ${id}`)
            return
          }

          // Skip if not a valid UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          if (!uuidRegex.test(id)) {
            console.warn(`Skipping DB delete for invalid UUID: ${id}`)
            return
          }

          try {
            await sceneBlockService.delete(id)
            console.log('✅ Database delete succeeded for:', id)
          } catch (error) {
            // Log error but don't throw - block already removed from UI
            console.warn('Failed to delete block from database (may not exist):', {
              id,
              error,
              message: error instanceof Error ? error.message : String(error),
            })

            // Don't rollback - the block is gone from UI and that's what matters
            // Most errors here are "block not found" which is fine
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
              state._version++ // Force re-render
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
            state._version++ // Force re-render
          })
        },

        clearError: () => set({ error: null }),
      },
    }))
    // {
    //   name: 'scene-blocks',
    //   partialize: (state) => ({
    //     blocks: state.blocks,
    //     fetchedScenes: state.fetchedScenes,
    //   }),
    //   storage: {
    //     getItem: (name) => {
    //       const str = localStorage.getItem(name)
    //       if (!str) return null

    //       const { state } = JSON.parse(str)

    //       // Convert plain objects back to Maps/Sets
    //       return {
    //         state: {
    //           ...state,
    //           blocks: new Map(Object.entries(state.blocks || {})),
    //           fetchedScenes: new Set(state.fetchedScenes || []),
    //         }
    //       }
    //     },
    //     setItem: (name, value) => {
    //       const serialized = {
    //         state: {
    //           blocks: Object.fromEntries(value.state.blocks || new Map()),
    //           fetchedScenes: Array.from(value.state.fetchedScenes || new Set()),
    //         }
    //       }
    //       localStorage.setItem(name, JSON.stringify(serialized))
    //     },
    //     removeItem: (name) => localStorage.removeItem(name),
    //   },
    // }
  // )
)
