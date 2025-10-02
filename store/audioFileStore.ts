import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { AudioFile } from '@/types'
import { audioService } from '@/lib/services/browser/audioService'
import { logger } from '@/lib/utils/logger'

enableMapSet()

interface AudioFileState {
  audioFiles: Map<string, AudioFile>
  isLoading: boolean
  isUploading: boolean
  uploadProgress: number

  // Actions
  fetchAudioFiles: () => Promise<void>
  uploadAudioFile: (file: File, name: string, tags?: string[], folderId?: string) => Promise<AudioFile>
  deleteAudioFile: (id: string) => Promise<void>
  updateAudioFile: (id: string, updates: { name?: string; tags?: string[]; folder_id?: string | null }) => Promise<void>
  getAudioFilesInFolder: (folderId: string | null) => AudioFile[] // Get files in folder (null = root)
}

/**
 * Audio File Store
 * Context7: Manages audio file library with upload/download
 */
export const useAudioFileStore = create<AudioFileState>()(
  persist(
    immer((set, get) => ({
      audioFiles: new Map<string, AudioFile>(),
      isLoading: false,
      isUploading: false,
      uploadProgress: 0,

      fetchAudioFiles: async () => {
        set({ isLoading: true })
        try {
          const files = await audioService.list()
          set(state => {
            state.audioFiles.clear()
            files.forEach(file => {
              state.audioFiles.set(file.id, file)
            })
            state.isLoading = false
          })
        } catch (error) {
          console.error('Failed to fetch audio files:', error)
          logger.error('Failed to fetch audio files', error)
          set({ isLoading: false })
          throw error
        }
      },

      uploadAudioFile: async (file, name, tags = [], folderId) => {
        set({ isUploading: true, uploadProgress: 0 })
        try {
          // Upload file to R2
          const { fileUrl, fileSize } = await audioService.upload(file)

          // Get audio duration
          const duration = await getAudioDuration(file)

          // Create audio file record
          const audioFile = await audioService.create({
            name,
            file_url: fileUrl,
            file_size: fileSize,
            duration,
            format: file.type,
            tags,
            folder_id: folderId || null,
          })

          // Add to store
          set(state => {
            state.audioFiles.set(audioFile.id, audioFile)
            state.isUploading = false
            state.uploadProgress = 0
          })

          return audioFile
        } catch (error) {
          console.error('Upload error:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          if (error && typeof error === 'object' && 'message' in error) {
            console.error('Error message:', (error as Error).message)
          }
          logger.error('Failed to upload audio file', error, { fileName: file.name })
          set({ isUploading: false, uploadProgress: 0 })
          throw error
        }
      },

      deleteAudioFile: async (id) => {
        const audioFile = get().audioFiles.get(id)
        if (!audioFile) return

        // Optimistic update
        set(state => {
          state.audioFiles.delete(id)
        })

        try {
          await audioService.delete(id)
          // TODO: Delete from R2 as well
        } catch (error) {
          logger.error('Failed to delete audio file', error, { audioFileId: id })
          // Rollback
          set(state => {
            state.audioFiles.set(id, audioFile)
          })
          throw error
        }
      },

      updateAudioFile: async (id, updates) => {
        const audioFile = get().audioFiles.get(id)
        if (!audioFile) {
          logger.error('Audio file not found in store', new Error('Not found'), { audioFileId: id })
          throw new Error('Audio file not found')
        }

        const originalAudioFile = { ...audioFile }

        // Optimistic update
        set(state => {
          const file = state.audioFiles.get(id)
          if (file) {
            if (updates.name !== undefined) file.name = updates.name
            if (updates.tags !== undefined) file.tags = updates.tags
            if (updates.folder_id !== undefined) file.folder_id = updates.folder_id
          }
        })

        try {
          const updatedFile = await audioService.update(id, updates)
          // Update with server response
          set(state => {
            state.audioFiles.set(id, updatedFile)
          })
        } catch (error) {
          console.error('audioService.update failed:', error)
          logger.error('Failed to update audio file', error as Error, { audioFileId: id, updates })
          // Rollback
          set(state => {
            state.audioFiles.set(id, originalAudioFile)
          })
          throw error
        }
      },

      getAudioFilesInFolder: (folderId) => {
        const allFiles = Array.from(get().audioFiles.values())

        if (folderId === null) {
          // Return files with no folder (root level)
          return allFiles.filter(f => !f.folder_id).sort((a, b) => a.name.localeCompare(b.name))
        }

        // Return files in specific folder
        return allFiles.filter(f => f.folder_id === folderId).sort((a, b) => a.name.localeCompare(b.name))
      },
    })),
    {
      name: 'audio-file-store',
      partialize: (state) => {
        // Safely convert Map to array
        const audioFilesMap = state.audioFiles instanceof Map ? state.audioFiles : new Map()
        return {
          audioFiles: Array.from(audioFilesMap.entries()),
        }
      },
      merge: (persistedState, currentState) => {
        const state = { ...currentState, ...(persistedState as object) }
        // Convert array back to Map
        const persisted = persistedState as { audioFiles?: [string, AudioFile][] }
        if (Array.isArray(persisted?.audioFiles)) {
          state.audioFiles = new Map(persisted.audioFiles)
        } else {
          // Ensure audioFiles is always a Map
          state.audioFiles = new Map()
        }
        return state
      },
    }
  )
)

/**
 * Get audio duration from File using HTML5 Audio API
 */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'metadata'

    audio.onloadedmetadata = () => {
      resolve(audio.duration)
      audio.src = '' // Clean up
    }

    audio.onerror = () => {
      reject(new Error('Failed to load audio metadata'))
      audio.src = '' // Clean up
    }

    audio.src = URL.createObjectURL(file)
  })
}
