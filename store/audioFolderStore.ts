import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet, castDraft } from 'immer'
import type { AudioFolder, AudioFolderInsert, AudioFolderUpdate } from '@/types'
import { audioFolderService } from '@/lib/services/browser/audioFolderService'
import { logger } from '@/lib/utils/logger'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface AudioFolderState {
  folders: Map<string, AudioFolder>
  rootFolderIds: string[] // Top-level folders (no parent)
  isLoading: boolean
  error: string | null
  hasFetchedFolders: boolean

  // Actions
  fetchAllFolders: () => Promise<void>
  createFolder: (folder: Omit<AudioFolderInsert, 'user_id'>) => Promise<AudioFolder>
  updateFolder: (id: string, updates: AudioFolderUpdate) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  moveFolder: (folderId: string, newParentId: string | null) => Promise<void>
  getFolderPath: (folderId: string) => AudioFolder[] // Breadcrumb trail
  getSubfolders: (parentId: string | null) => AudioFolder[] // Children of folder
  clearError: () => void
}

/**
 * Audio Folder Store
 * Context7: Hierarchical folder organization for audio library
 */
export const useAudioFolderStore = create<AudioFolderState>()(
  persist(
    immer((set, get) => ({
      folders: new Map(),
      rootFolderIds: [],
      isLoading: false,
      error: null,
      hasFetchedFolders: false,

      fetchAllFolders: async () => {
        // Only fetch once
        if (get().hasFetchedFolders) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          // Fetch all folders (they'll be organized client-side)
          const allFolders = await audioFolderService.list()
          const rootFolders = allFolders.filter(f => !f.parent_id)

          set(state => {
            state.folders = new Map(allFolders.map(f => [f.id, castDraft(f)]))
            state.rootFolderIds = rootFolders.map(f => f.id).sort()
            state.hasFetchedFolders = true
            state.isLoading = false
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch folders'
          logger.error('Failed to fetch audio folders', error)
          set({ error: message, isLoading: false })
        }
      },

      createFolder: async (folder) => {
        set({ error: null })
        try {
          const newFolder = await audioFolderService.create(folder as AudioFolderInsert)
          set(state => {
            state.folders.set(newFolder.id, castDraft(newFolder))
            // If root folder, add to rootFolderIds
            if (!newFolder.parent_id) {
              state.rootFolderIds.push(newFolder.id)
              state.rootFolderIds.sort()
            }
          })
          return newFolder
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create folder'
          logger.error('Failed to create audio folder', error, { folder })
          set({ error: message })
          throw error
        }
      },

      updateFolder: async (id, updates) => {
        set({ error: null })
        const original = get().folders.get(id)
        if (!original) {
          throw new Error('Folder not found')
        }

        // Optimistic update
        const optimisticFolder = { ...original, ...updates, updated_at: new Date().toISOString() }
        set(state => {
          state.folders.set(id, castDraft(optimisticFolder))
        })

        try {
          const updated = await audioFolderService.update(id, updates)
          set(state => {
            state.folders.set(id, castDraft(updated))
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update folder'
          logger.error('Failed to update audio folder', error, { id, updates })
          // Rollback
          set(state => {
            state.folders.set(id, castDraft(original))
            state.error = message
          })
          throw error
        }
      },

      deleteFolder: async (id) => {
        set({ error: null })
        const original = get().folders.get(id)
        if (!original) {
          throw new Error('Folder not found')
        }

        // Optimistic delete
        set(state => {
          state.folders.delete(id)
          // Remove from rootFolderIds if applicable
          if (!original.parent_id) {
            state.rootFolderIds = state.rootFolderIds.filter(fId => fId !== id)
          }
        })

        try {
          await audioFolderService.delete(id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete folder'
          logger.error('Failed to delete audio folder', error, { id })
          // Rollback
          set(state => {
            state.folders.set(id, castDraft(original))
            if (!original.parent_id) {
              state.rootFolderIds.push(id)
              state.rootFolderIds.sort()
            }
            state.error = message
          })
          throw error
        }
      },

      moveFolder: async (folderId, newParentId) => {
        set({ error: null })
        const original = get().folders.get(folderId)
        if (!original) {
          throw new Error('Folder not found')
        }

        const oldParentId = original.parent_id

        // Optimistic update
        set(state => {
          const folder = state.folders.get(folderId)
          if (folder) {
            folder.parent_id = newParentId
            // Update rootFolderIds
            if (!oldParentId && newParentId) {
              // Moving from root to subfolder
              state.rootFolderIds = state.rootFolderIds.filter(id => id !== folderId)
            } else if (oldParentId && !newParentId) {
              // Moving from subfolder to root
              state.rootFolderIds.push(folderId)
              state.rootFolderIds.sort()
            }
          }
        })

        try {
          await audioFolderService.moveFolder(folderId, newParentId)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to move folder'
          logger.error('Failed to move audio folder', error, { folderId, newParentId })
          // Rollback
          set(state => {
            state.folders.set(folderId, castDraft(original))
            // Restore rootFolderIds
            if (!oldParentId && newParentId) {
              state.rootFolderIds.push(folderId)
              state.rootFolderIds.sort()
            } else if (oldParentId && !newParentId) {
              state.rootFolderIds = state.rootFolderIds.filter(id => id !== folderId)
            }
            state.error = message
          })
          throw error
        }
      },

      getFolderPath: (folderId) => {
        const path: AudioFolder[] = []
        let currentId: string | null = folderId

        // Walk up the tree
        while (currentId) {
          const folder = get().folders.get(currentId)
          if (!folder) break

          path.unshift(folder)
          currentId = folder.parent_id
        }

        return path
      },

      getSubfolders: (parentId) => {
        const allFolders = Array.from(get().folders.values())

        if (parentId === null) {
          // Return root folders
          return allFolders
            .filter(f => !f.parent_id)
            .sort((a, b) => a.name.localeCompare(b.name))
        }

        // Return children of specific folder
        return allFolders
          .filter(f => f.parent_id === parentId)
          .sort((a, b) => a.name.localeCompare(b.name))
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    {
      name: 'audio-folder-store',
      partialize: (state) => {
        const foldersMap = state.folders instanceof Map ? state.folders : new Map()
        return {
          folders: Array.from(foldersMap.entries()),
          rootFolderIds: state.rootFolderIds,
          hasFetchedFolders: state.hasFetchedFolders,
        }
      },
      merge: (persistedState, currentState) => {
        const state = { ...currentState, ...(persistedState as object) }
        const persisted = persistedState as {
          folders?: [string, AudioFolder][]
          rootFolderIds?: string[]
          hasFetchedFolders?: boolean
        }

        // Restore Map from array
        if (Array.isArray(persisted?.folders)) {
          state.folders = new Map(persisted.folders)
        } else {
          state.folders = new Map()
        }

        if (Array.isArray(persisted?.rootFolderIds)) {
          state.rootFolderIds = persisted.rootFolderIds
        } else {
          state.rootFolderIds = []
        }

        if (typeof persisted?.hasFetchedFolders === 'boolean') {
          state.hasFetchedFolders = persisted.hasFetchedFolders
        }

        return state
      },
    }
  )
)
