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
  uploadAudioFile: (file: File, name: string, tags?: string[]) => Promise<AudioFile>
  deleteAudioFile: (id: string) => Promise<void>
  updateAudioFile: (id: string, updates: { name?: string; tags?: string[] }) => Promise<void>
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

      uploadAudioFile: async (file, name, tags = []) => {
        set({ isUploading: true, uploadProgress: 0 })
        try {
          console.log('Starting upload for:', file.name)

          // Upload file to R2
          const { fileUrl, fileSize } = await audioService.upload(file)
          console.log('File uploaded to R2:', fileUrl)

          // Get audio duration
          const duration = await getAudioDuration(file)
          console.log('Audio duration:', duration)

          // Create audio file record
          const audioFile = await audioService.create({
            name,
            file_url: fileUrl,
            file_size: fileSize,
            duration,
            format: file.type,
            tags,
          })
          console.log('Audio file record created:', audioFile.id)
          console.log('Full audioFile object:', JSON.stringify(audioFile, null, 2))

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
        if (!audioFile) return

        const originalAudioFile = { ...audioFile }

        // Optimistic update
        set(state => {
          const file = state.audioFiles.get(id)
          if (file) {
            if (updates.name !== undefined) file.name = updates.name
            if (updates.tags !== undefined) file.tags = updates.tags
          }
        })

        try {
          await audioService.update(id, updates)
        } catch (error) {
          logger.error('Failed to update audio file', error, { audioFileId: id })
          // Rollback
          set(state => {
            state.audioFiles.set(id, originalAudioFile)
          })
          throw error
        }
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
