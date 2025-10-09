import { create } from 'zustand'
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
    addBlock: (block: Omit<SceneBlockInsert, 'user_id'>) => SceneBlock
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

        addBlock: (blockData: Omit<SceneBlockInsert, 'user_id'>) => {
          // Generate stable client ID that never changes (used as React key)
          const clientId = `client-${crypto.randomUUID()}`

          // Create optimistic block with client ID
          const optimisticBlock: SceneBlock & { clientId: string } = {
            id: clientId, // Use client ID temporarily
            clientId, // Store stable client ID
            scene_id: blockData.scene_id,
            type: blockData.type,
            content: blockData.content,
            order_index: blockData.order_index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: '',
          }

          // Add to store IMMEDIATELY for instant UI
          set(state => {
            state.blocks.set(clientId, optimisticBlock as SceneBlock)
          })

          // Create in DB in background
          sceneBlockService.create(blockData as SceneBlockInsert)
            .then(serverBlock => {
              // Update with server data but KEEP client ID as key
              set(state => {
                const blockWithClientId = { ...serverBlock, clientId } as SceneBlock & { clientId: string }
                state.blocks.set(clientId, blockWithClientId as SceneBlock)
              })
            })
            .catch(error => {
              // Remove on error
              set(state => {
                state.blocks.delete(clientId)
              })

              // Log detailed error information
              console.error('❌ Failed to create block in database:', {
                error,
                errorMessage: error?.message,
                errorCode: error?.code,
                errorDetails: error?.details,
                errorHint: error?.hint,
                blockData,
              })

              const errorMessage = error instanceof Error ? error.message : 'Failed to create block'
              set({ error: errorMessage })
            })

          return optimisticBlock as SceneBlock
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
    }))
)
