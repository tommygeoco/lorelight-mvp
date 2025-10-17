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
          // INSTANT: Generate client-side UUID
          const clientId = crypto.randomUUID()
          const now = new Date().toISOString()
          
          // INSTANT: Create optimistic block
          const optimisticBlock: SceneBlock = {
            id: clientId,
            scene_id: blockData.scene_id,
            type: blockData.type,
            content: blockData.content,
            order_index: blockData.order_index, // Keep fractional for UI sorting
            created_at: now,
            updated_at: now,
            user_id: '', // Will be set by server
          }
          
          // INSTANT: Update UI immediately
          set(state => {
            state.blocks.set(clientId, optimisticBlock)
            state._version++
          })
          
          // BACKGROUND: Save to database (fire and forget)
          sceneBlockService.create({
            ...blockData,
            order_index: Math.floor(blockData.order_index)
          } as SceneBlockInsert)
            .then(serverBlock => {
              // Swap client ID with server ID
              set(state => {
                state.blocks.delete(clientId)
                state.blocks.set(serverBlock.id, serverBlock)
                state._version++
              })
            })
            .catch(error => {
              console.error('Failed to save block to database:', error)
              // TODO: Add to offline queue for retry
              // For now, block stays in UI with client ID
            })
          
          return optimisticBlock
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
          // Optimistic delete - remove from UI immediately
          set(state => {
            state.blocks.delete(id)
            state._version++ // Force re-render
          })

          // Skip database delete if this is a client-only ID (from broken optimistic updates)
          if (id.startsWith('client-')) {
            return
          }

          // Skip if not a valid UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          if (!uuidRegex.test(id)) {
            return
          }

          try {
            await sceneBlockService.delete(id)
          } catch {
            // Don't throw - block already removed from UI
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
