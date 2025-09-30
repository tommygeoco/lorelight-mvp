import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet, castDraft } from 'immer'
import type { AudioPlaylist, AudioPlaylistInsert, AudioPlaylistUpdate, AudioFile } from '@/types'
import { audioPlaylistService } from '@/lib/services/browser/audioPlaylistService'
import { logger } from '@/lib/utils/logger'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface AudioPlaylistState {
  playlists: Map<string, AudioPlaylist>
  playlistAudio: Map<string, AudioFile[]> // Map of playlistId -> ordered AudioFile[]
  isLoading: boolean
  error: string | null
  hasFetchedPlaylists: boolean
  fetchedPlaylistAudio: Set<string> // Track which playlists' audio we've fetched

  // Actions
  fetchAllPlaylists: () => Promise<void>
  fetchPlaylistAudio: (playlistId: string) => Promise<void>
  createPlaylist: (playlist: Omit<AudioPlaylistInsert, 'user_id'>) => Promise<AudioPlaylist>
  updatePlaylist: (id: string, updates: AudioPlaylistUpdate) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>
  addAudioToPlaylist: (playlistId: string, audioFileId: string, orderIndex?: number) => Promise<void>
  removeAudioFromPlaylist: (playlistId: string, audioFileId: string) => Promise<void>
  reorderPlaylistAudio: (playlistId: string, audioFileIds: string[]) => Promise<void>
  clearError: () => void
}

/**
 * Audio Playlist Store
 * Context7: Manages audio playlists with many-to-many audio file relationships
 */
export const useAudioPlaylistStore = create<AudioPlaylistState>()(
  persist(
    immer((set, get) => ({
      playlists: new Map(),
      playlistAudio: new Map(),
      isLoading: false,
      error: null,
      hasFetchedPlaylists: false,
      fetchedPlaylistAudio: new Set(),

      fetchAllPlaylists: async () => {
        // Only fetch once
        if (get().hasFetchedPlaylists) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const playlists = await audioPlaylistService.list()
          set(state => {
            state.playlists = new Map(playlists.map(p => [p.id, castDraft(p)]))
            state.hasFetchedPlaylists = true
            state.isLoading = false
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch playlists'
          logger.error('Failed to fetch audio playlists', error)
          set({ error: message, isLoading: false })
        }
      },

      fetchPlaylistAudio: async (playlistId) => {
        // Don't refetch if already loaded
        if (get().fetchedPlaylistAudio.has(playlistId)) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const audioFiles = await audioPlaylistService.getPlaylistAudio(playlistId)
          set(state => {
            state.playlistAudio.set(playlistId, castDraft(audioFiles))
            state.fetchedPlaylistAudio.add(playlistId)
            state.isLoading = false
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch playlist audio'
          logger.error('Failed to fetch playlist audio', error, { playlistId })
          set({ error: message, isLoading: false })
        }
      },

      createPlaylist: async (playlist) => {
        set({ error: null })
        try {
          const newPlaylist = await audioPlaylistService.create(playlist as AudioPlaylistInsert)
          set(state => {
            state.playlists.set(newPlaylist.id, castDraft(newPlaylist))
            state.playlistAudio.set(newPlaylist.id, []) // Empty audio list
          })
          return newPlaylist
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create playlist'
          logger.error('Failed to create audio playlist', error, { playlist })
          set({ error: message })
          throw error
        }
      },

      updatePlaylist: async (id, updates) => {
        set({ error: null })
        const original = get().playlists.get(id)
        if (!original) {
          throw new Error('Playlist not found')
        }

        // Optimistic update
        const optimisticPlaylist = { ...original, ...updates, updated_at: new Date().toISOString() }
        set(state => {
          state.playlists.set(id, castDraft(optimisticPlaylist))
        })

        try {
          const updated = await audioPlaylistService.update(id, updates)
          set(state => {
            state.playlists.set(id, castDraft(updated))
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update playlist'
          logger.error('Failed to update audio playlist', error, { id, updates })
          // Rollback
          set(state => {
            state.playlists.set(id, castDraft(original))
            state.error = message
          })
          throw error
        }
      },

      deletePlaylist: async (id) => {
        set({ error: null })
        const original = get().playlists.get(id)
        if (!original) {
          throw new Error('Playlist not found')
        }

        // Optimistic delete
        set(state => {
          state.playlists.delete(id)
          state.playlistAudio.delete(id)
          state.fetchedPlaylistAudio.delete(id)
        })

        try {
          await audioPlaylistService.delete(id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete playlist'
          logger.error('Failed to delete audio playlist', error, { id })
          // Rollback
          set(state => {
            state.playlists.set(id, castDraft(original))
            state.error = message
          })
          throw error
        }
      },

      addAudioToPlaylist: async (playlistId, audioFileId, orderIndex) => {
        set({ error: null })
        try {
          await audioPlaylistService.addAudioToPlaylist(playlistId, audioFileId, orderIndex)
          // Refetch playlist audio to get updated list
          const audioFiles = await audioPlaylistService.getPlaylistAudio(playlistId)
          set(state => {
            state.playlistAudio.set(playlistId, castDraft(audioFiles))
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add audio to playlist'
          logger.error('Failed to add audio to playlist', error, { playlistId, audioFileId })
          set({ error: message })
          throw error
        }
      },

      removeAudioFromPlaylist: async (playlistId, audioFileId) => {
        set({ error: null })
        const originalAudioFiles = get().playlistAudio.get(playlistId)
        if (!originalAudioFiles) return

        // Optimistic update
        const updatedAudioFiles = originalAudioFiles.filter(af => af.id !== audioFileId)
        set(state => {
          state.playlistAudio.set(playlistId, castDraft(updatedAudioFiles))
        })

        try {
          await audioPlaylistService.removeAudioFromPlaylist(playlistId, audioFileId)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove audio from playlist'
          logger.error('Failed to remove audio from playlist', error, { playlistId, audioFileId })
          // Rollback
          set(state => {
            state.playlistAudio.set(playlistId, castDraft(originalAudioFiles))
            state.error = message
          })
          throw error
        }
      },

      reorderPlaylistAudio: async (playlistId, audioFileIds) => {
        set({ error: null })
        const originalAudioFiles = get().playlistAudio.get(playlistId)
        if (!originalAudioFiles) return

        // Optimistic update - reorder based on audioFileIds array
        const audioMap = new Map(originalAudioFiles.map(af => [af.id, af]))
        const reorderedAudioFiles = audioFileIds.map(id => audioMap.get(id)!).filter(Boolean)

        set(state => {
          state.playlistAudio.set(playlistId, castDraft(reorderedAudioFiles))
        })

        try {
          await audioPlaylistService.reorderPlaylistAudio(playlistId, audioFileIds)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to reorder playlist audio'
          logger.error('Failed to reorder playlist audio', error, { playlistId, audioFileIds })
          // Rollback
          set(state => {
            state.playlistAudio.set(playlistId, castDraft(originalAudioFiles))
            state.error = message
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    {
      name: 'audio-playlist-store',
      partialize: (state) => {
        const playlistsMap = state.playlists instanceof Map ? state.playlists : new Map()
        const playlistAudioMap = state.playlistAudio instanceof Map ? state.playlistAudio : new Map()
        return {
          playlists: Array.from(playlistsMap.entries()),
          playlistAudio: Array.from(playlistAudioMap.entries()),
          hasFetchedPlaylists: state.hasFetchedPlaylists,
          fetchedPlaylistAudio: Array.from(state.fetchedPlaylistAudio),
        }
      },
      merge: (persistedState, currentState) => {
        const state = { ...currentState, ...(persistedState as object) }
        const persisted = persistedState as {
          playlists?: [string, AudioPlaylist][]
          playlistAudio?: [string, AudioFile[]][]
          hasFetchedPlaylists?: boolean
          fetchedPlaylistAudio?: string[]
        }

        // Restore Maps from arrays
        if (Array.isArray(persisted?.playlists)) {
          state.playlists = new Map(persisted.playlists)
        } else {
          state.playlists = new Map()
        }

        if (Array.isArray(persisted?.playlistAudio)) {
          state.playlistAudio = new Map(persisted.playlistAudio)
        } else {
          state.playlistAudio = new Map()
        }

        if (typeof persisted?.hasFetchedPlaylists === 'boolean') {
          state.hasFetchedPlaylists = persisted.hasFetchedPlaylists
        }

        // Restore Set from array
        if (Array.isArray(persisted?.fetchedPlaylistAudio)) {
          state.fetchedPlaylistAudio = new Set(persisted.fetchedPlaylistAudio)
        } else {
          state.fetchedPlaylistAudio = new Set()
        }

        return state
      },
    }
  )
)
