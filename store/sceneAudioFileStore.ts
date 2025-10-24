import { create } from 'zustand'
import type { SceneAudioFile } from '@/types'
import { sceneAudioFileService } from '@/lib/services/browser/sceneAudioFileService'

interface SceneAudioFileState {
  audioFiles: Map<string, SceneAudioFile> // keyed by scene_audio_file id
  sceneAudioFiles: Map<string, string[]> // scene_id -> array of scene_audio_file ids
  isLoading: boolean
  error: string | null
  _version: number // for triggering re-renders

  // Actions
  fetchAudioFilesForScene: (sceneId: string) => Promise<void>
  addAudioFile: (sceneId: string, audioFileId: string, isSelected?: boolean) => Promise<SceneAudioFile>
  updateAudioFile: (id: string, updates: { is_selected?: boolean; volume?: number; loop?: boolean; order_index?: number }) => Promise<void>
  removeAudioFile: (id: string) => Promise<void>
  setSelectedAudioFile: (sceneId: string, sceneAudioFileId: string) => Promise<void>
  ensureDefaultSelection: (sceneId: string) => Promise<void>
  clearAudioFiles: () => void
}

export const useSceneAudioFileStore = create<SceneAudioFileState>((set, get) => ({
  audioFiles: new Map(),
  sceneAudioFiles: new Map(),
  isLoading: false,
  error: null,
  _version: 0,

  fetchAudioFilesForScene: async (sceneId: string) => {
    // Skip if already fetched
    const state = get()
    if (state.sceneAudioFiles.has(sceneId)) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const audioFiles = await sceneAudioFileService.getAudioFilesForScene(sceneId)
      
      set((state) => {
        const newAudioFiles = new Map(state.audioFiles)
        const audioFileIds: string[] = []
        
        audioFiles.forEach((file) => {
          newAudioFiles.set(file.id, file)
          audioFileIds.push(file.id)
        })

        const newSceneAudioFiles = new Map(state.sceneAudioFiles)
        newSceneAudioFiles.set(sceneId, audioFileIds)

        return {
          audioFiles: newAudioFiles,
          sceneAudioFiles: newSceneAudioFiles,
          isLoading: false,
          _version: state._version + 1
        }
      })
    } catch (error) {
      console.error('Failed to fetch scene audio files:', error)
      set({ error: 'Failed to load audio files', isLoading: false })
    }
  },

  addAudioFile: async (sceneId: string, audioFileId: string, isSelected?: boolean) => {
    const state = get()
    const existingFileIds = state.sceneAudioFiles.get(sceneId) || []
    const orderIndex = existingFileIds.length
    
    // Auto-select if it's the first audio file
    const shouldSelect = isSelected !== undefined ? isSelected : existingFileIds.length === 0

    const newFile = await sceneAudioFileService.addAudioFile({
      scene_id: sceneId,
      audio_file_id: audioFileId,
      is_selected: shouldSelect,
      volume: 0.7,
      loop: true,
      order_index: orderIndex
    })

    set((state) => {
      const newAudioFiles = new Map(state.audioFiles)
      newAudioFiles.set(newFile.id, newFile)

      const newSceneAudioFiles = new Map(state.sceneAudioFiles)
      const fileIds = newSceneAudioFiles.get(sceneId) || []
      newSceneAudioFiles.set(sceneId, [...fileIds, newFile.id])

      return {
        audioFiles: newAudioFiles,
        sceneAudioFiles: newSceneAudioFiles,
        _version: state._version + 1
      }
    })

    return newFile
  },

  updateAudioFile: async (id: string, updates: { is_selected?: boolean; volume?: number; loop?: boolean; order_index?: number }) => {
    await sceneAudioFileService.updateAudioFile(id, updates)

    set((state) => {
      const newAudioFiles = new Map(state.audioFiles)
      const existing = newAudioFiles.get(id)
      if (existing) {
        newAudioFiles.set(id, { ...existing, ...updates, updated_at: new Date().toISOString() })
      }

      return {
        audioFiles: newAudioFiles,
        _version: state._version + 1
      }
    })
  },

  removeAudioFile: async (id: string) => {
    const audioFile = get().audioFiles.get(id)
    if (!audioFile) return

    const sceneId = audioFile.scene_id

    await sceneAudioFileService.removeAudioFile(id)

    set((state) => {
      const newAudioFiles = new Map(state.audioFiles)
      newAudioFiles.delete(id)

      const newSceneAudioFiles = new Map(state.sceneAudioFiles)
      const fileIds = newSceneAudioFiles.get(sceneId) || []
      newSceneAudioFiles.set(
        sceneId,
        fileIds.filter((fid) => fid !== id)
      )

      return {
        audioFiles: newAudioFiles,
        sceneAudioFiles: newSceneAudioFiles,
        _version: state._version + 1
      }
    })

    // After removal, ensure we still have a selected default
    await get().ensureDefaultSelection(sceneId)
  },

  setSelectedAudioFile: async (sceneId: string, sceneAudioFileId: string) => {
    const state = get()
    const fileIds = state.sceneAudioFiles.get(sceneId) || []
    
    // Deselect all others, select this one
    const updates = fileIds.map((id) => ({
      id,
      is_selected: id === sceneAudioFileId
    }))

    await Promise.all(
      updates.map((update) => sceneAudioFileService.updateAudioFile(update.id, { is_selected: update.is_selected }))
    )

    set((state) => {
      const newAudioFiles = new Map(state.audioFiles)
      updates.forEach(({ id, is_selected }) => {
        const existing = newAudioFiles.get(id)
        if (existing) {
          newAudioFiles.set(id, { ...existing, is_selected, updated_at: new Date().toISOString() })
        }
      })

      return {
        audioFiles: newAudioFiles,
        _version: state._version + 1
      }
    })
  },

  // Ensure after removal, a new default is selected
  ensureDefaultSelection: async (sceneId: string) => {
    const state = get()
    const fileIds = state.sceneAudioFiles.get(sceneId) || []
    
    // Check if any file is selected
    const hasSelected = fileIds.some(id => {
      const file = state.audioFiles.get(id)
      return file?.is_selected
    })

    // If no selection and we have files, select the first one
    if (!hasSelected && fileIds.length > 0) {
      const firstFileId = fileIds[0]
      await sceneAudioFileService.updateAudioFile(firstFileId, { is_selected: true })
      
      set((state) => {
        const newAudioFiles = new Map(state.audioFiles)
        const existing = newAudioFiles.get(firstFileId)
        if (existing) {
          newAudioFiles.set(firstFileId, { ...existing, is_selected: true, updated_at: new Date().toISOString() })
        }
        return {
          audioFiles: newAudioFiles,
          _version: state._version + 1
        }
      })
    }
  },

  clearAudioFiles: () => {
    set({ audioFiles: new Map(), sceneAudioFiles: new Map(), _version: 0 })
  }
}))

