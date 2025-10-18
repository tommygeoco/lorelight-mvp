import { useState, useRef, useEffect } from 'react'
import { useAudioFileStore } from '@/store/audioFileStore'
import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useToastStore } from '@/store/toastStore'
import type { AudioFile } from '@/types'

/**
 * Custom hook for audio context menu handlers
 * Context7: Extracts business logic from AudioContextMenu component
 */
export function useAudioContextHandlers() {
  const tagInputRef = useRef<HTMLInputElement>(null)
  const tagEditInputRef = useRef<HTMLInputElement>(null)
  const [tagInput, setTagInput] = useState('')
  const [editingTagName, setEditingTagName] = useState<string | null>(null)
  const [editingTagValue, setEditingTagValue] = useState('')
  const [tagMenuOpen, setTagMenuOpen] = useState<string | null>(null)

  const { updateAudioFile } = useAudioFileStore()
  const { addAudioToPlaylist, removeAudioFromPlaylist } = useAudioPlaylistStore()
  const audioFileMap = useAudioFileMap()
  const { addToast } = useToastStore()

  // Auto-focus tag edit input when editing starts
  useEffect(() => {
    if (editingTagName && tagEditInputRef.current) {
      tagEditInputRef.current.focus()
      tagEditInputRef.current.select()
    }
  }, [editingTagName])

  const handleAddTagToFile = async (audioFile: AudioFile, newTag: string) => {
    if (!newTag.trim()) return

    const currentFile = audioFileMap.get(audioFile.id)
    const tags = currentFile?.tags || []
    const tagToAdd = newTag.trim().toLowerCase()
    
    if (tags.includes(tagToAdd)) {
      addToast('Tag already exists', 'error')
      return
    }

    await updateAudioFile(audioFile.id, { tags: [...tags, tagToAdd] })
  }

  const handleRemoveTagFromFile = async (audioFile: AudioFile, tagToRemove: string) => {
    const currentFile = audioFileMap.get(audioFile.id)
    const tags = currentFile?.tags || []
    await updateAudioFile(audioFile.id, { tags: tags.filter(t => t !== tagToRemove) })
  }

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!newTag.trim() || oldTag === newTag.trim()) {
      setEditingTagName(null)
      setEditingTagValue('')
      return
    }

    const trimmedNewTag = newTag.trim().toLowerCase()

    try {
      const allAudioFiles = Array.from(audioFileMap.values())
      const filesToUpdate = allAudioFiles.filter(file => file.tags?.includes(oldTag))

      await Promise.all(
        filesToUpdate.map(async (file) => {
          const updatedTags = file.tags!.map(tag => tag === oldTag ? trimmedNewTag : tag)
          await updateAudioFile(file.id, { tags: updatedTags })
        })
      )

      setEditingTagName(null)
      setEditingTagValue('')
      addToast(`Renamed tag to "${trimmedNewTag}"`, 'success')
    } catch (error) {
      console.error('Rename tag failed:', error)
      addToast('Failed to rename tag', 'error')
    }
  }

  const handleDeleteTag = async (tag: string) => {
    try {
      const allAudioFiles = Array.from(audioFileMap.values())
      const filesToUpdate = allAudioFiles.filter(file => file.tags?.includes(tag))

      await Promise.all(
        filesToUpdate.map(async (file) => {
          const updatedTags = file.tags!.filter(t => t !== tag)
          await updateAudioFile(file.id, { tags: updatedTags })
        })
      )

      addToast(`Deleted tag "${tag}"`, 'success')
    } catch (error) {
      console.error('Delete tag failed:', error)
      addToast('Failed to delete tag', 'error')
    }
  }

  const handleAddToPlaylist = async (audioFile: AudioFile, playlistId: string, playlists: unknown[]) => {
    try {
      await addAudioToPlaylist(playlistId, audioFile.id)
      const playlist = playlists.find((p: { id: string }) => p.id === playlistId)
      if (playlist && 'name' in playlist) {
        addToast(`Added to "${playlist.name}"`, 'success')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
        addToast('File already in playlist', 'error')
      } else {
        addToast('Failed to add to playlist', 'error')
      }
    }
  }

  const handleRemoveFromPlaylistAction = async (audioFile: AudioFile, playlistId: string) => {
    if (!playlistId) return
    await removeAudioFromPlaylist(playlistId, audioFile.id)
  }

  return {
    tagInputRef,
    tagEditInputRef,
    tagInput,
    setTagInput,
    editingTagName,
    setEditingTagName,
    editingTagValue,
    setEditingTagValue,
    tagMenuOpen,
    setTagMenuOpen,
    audioFileMap,
    handleAddTagToFile,
    handleRemoveTagFromFile,
    handleRenameTag,
    handleDeleteTag,
    handleAddToPlaylist,
    handleRemoveFromPlaylistAction,
  }
}

