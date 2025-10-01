'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Music, Trash2, Play, Pause, Search, Plus, X, Edit2, ChevronRight, SlidersHorizontal, Tag, Clock, Circle } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { InputModal } from '@/components/ui/InputModal'
import { PlaylistsSidebar } from '@/components/audio/PlaylistsSidebar'
import { useAudioFileStore } from '@/store/audioFileStore'
import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'
import { useAudioStore } from '@/store/audioStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useAudioPlaylistMap } from '@/hooks/useAudioPlaylistMap'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'
import { logger } from '@/lib/utils/logger'
import { formatTime } from '@/lib/utils/time'
import { getRandomLoadingMessage } from '@/lib/constants/loadingMessages'
import type { AudioFile } from '@/types'

export default function AudioPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadQueue, setUploadQueue] = useState<Array<{file: File, name: string, id: string, progress: number, status: 'pending' | 'uploading' | 'complete' | 'error', message: string}>>([])
  const [uploadMessage, setUploadMessage] = useState('')
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<AudioFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    audioFile?: AudioFile
  } | null>(null)
  const [showAddToSubmenu, setShowAddToSubmenu] = useState(false)
  const [showTagsSubmenu, setShowTagsSubmenu] = useState(false)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [tagMenuOpen, setTagMenuOpen] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editingTagValue, setEditingTagValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  const [isAddToNewPlaylistModalOpen, setIsAddToNewPlaylistModalOpen] = useState(false)
  const [audioFileForNewPlaylist, setAudioFileForNewPlaylist] = useState<AudioFile | null>(null)
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [tagInput, setTagInput] = useState('')
  const closeMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInputFocusedRef = useRef(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const [focusedQueueItemId, setFocusedQueueItemId] = useState<string | null>(null)

  const {
    isLoading,
    isUploading,
    fetchAudioFiles,
    uploadAudioFile,
    deleteAudioFile,
    updateAudioFile,
  } = useAudioFileStore()

  const { createPlaylist, addAudioToPlaylist } = useAudioPlaylistStore()
  const { currentTrackId, isPlaying, loadTrack, togglePlay } = useAudioStore()
  const audioFileMap = useAudioFileMap()
  const playlistMap = useAudioPlaylistMap()
  const playlistAudioMap = useAudioPlaylistStore((state) => state.playlistAudio)
  const { addToast } = useToastStore()

  const playlists = useMemo(() =>
    Array.from(playlistMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  , [playlistMap])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    fetchAudioFiles()
  }, [fetchAudioFiles])

  // Reset input fields when context menu closes
  useEffect(() => {
    if (!contextMenu) {
      setTagInput('')
    }
  }, [contextMenu])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside tags submenu or tag options menu
      const target = e.target as HTMLElement
      if (target.closest('[data-tags-submenu]') || target.closest('[data-tag-options]')) {
        return
      }
      // Don't close if input is focused (user is typing)
      if (isInputFocusedRef.current) {
        return
      }
      setContextMenu(null)
      setShowTagsSubmenu(false)
      setTagMenuOpen(null)
    }
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => {
        document.removeEventListener('click', handleClick)
        if (closeMenuTimeoutRef.current) {
          clearTimeout(closeMenuTimeoutRef.current)
        }
      }
    }
  }, [contextMenu])

  // Get all audio files as array with search filter and playlist filter
  const audioFiles = useMemo(() => {
    let files: AudioFile[]

    // If viewing a specific playlist, get files from that playlist
    if (selectedPlaylistId) {
      const playlistFiles = playlistAudioMap.get(selectedPlaylistId)

      // Fetch playlist audio if not already loaded
      if (!playlistFiles) {
        const { fetchPlaylistAudio } = useAudioPlaylistStore.getState()
        fetchPlaylistAudio(selectedPlaylistId)
        return []
      }

      files = playlistFiles
    } else {
      // Show all files
      files = Array.from(audioFileMap.values())
        .filter(file => file.file_url && file.file_url.length > 0)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      files = files.filter(file =>
        file.name.toLowerCase().includes(query) ||
        file.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply tag filter
    if (selectedTags.size > 0) {
      files = files.filter(file =>
        file.tags && file.tags.some(tag => selectedTags.has(tag))
      )
    }

    return files.sort((a, b) => a.name.localeCompare(b.name))
  }, [audioFileMap, searchQuery, selectedPlaylistId, selectedTags, playlistAudioMap])

  // Get all unique tags from all audio files with counts
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    Array.from(audioFileMap.values()).forEach(file => {
      file.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [audioFileMap])

  // Get tag counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    Array.from(audioFileMap.values()).forEach(file => {
      file.tags?.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    })
    return counts
  }, [audioFileMap])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newUploads = Array.from(files).map(file => ({
        file,
        name: file.name.replace(/\.[^/.]+$/, ''),
        id: Math.random().toString(36).substring(7),
        progress: 0,
        status: 'pending' as const,
        message: ''
      }))
      setUploadQueue(prev => [...prev, ...newUploads])
    }
  }

  const getRandomMessage = () => {
    return getRandomLoadingMessage()
  }

  const handleUploadAll = async () => {
    if (uploadQueue.length === 0) return

    // Upload files sequentially so we can track progress
    for (const item of uploadQueue) {
      // Skip if already complete or errored
      if (item.status === 'complete' || item.status === 'error') continue

      // Mark as uploading and start rotating messages
      setUploadQueue(prev => prev.map(q =>
        q.id === item.id
          ? { ...q, status: 'uploading' as const, progress: 0, message: getRandomMessage() }
          : q
      ))

      // Rotate messages during upload
      const messageInterval = setInterval(() => {
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id && q.status === 'uploading'
            ? { ...q, message: getRandomMessage() }
            : q
        ))
      }, 2000)

      // Simulate progress (since we don't have real progress from uploadAudioFile)
      const progressInterval = setInterval(() => {
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id && q.status === 'uploading' && q.progress < 90
            ? { ...q, progress: Math.min(90, q.progress + Math.random() * 20) }
            : q
        ))
      }, 300)

      try {
        await uploadAudioFile(item.file, item.name.trim(), [], undefined)

        clearInterval(messageInterval)
        clearInterval(progressInterval)

        // Mark as complete
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id
            ? { ...q, status: 'complete' as const, progress: 100, message: 'Complete!' }
            : q
        ))

        // Fade out and remove completed file after 400ms
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(q => q.id !== item.id))
        }, 400)
      } catch (error) {
        clearInterval(messageInterval)
        clearInterval(progressInterval)

        logger.error('Upload failed for file:', item.name, error)

        setUploadQueue(prev => prev.map(q =>
          q.id === item.id
            ? { ...q, status: 'error' as const, message: 'Upload failed - network error' }
            : q
        ))

        // Continue with next file instead of stopping all uploads
        addToast(`Failed to upload ${item.name}`, 'error')
      }
    }

    // Clear file input after all uploads complete
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id))
  }

  const handleUpdateQueueName = (id: string, newName: string) => {
    setUploadQueue(prev => prev.map(item =>
      item.id === id ? { ...item, name: newName } : item
    ))
  }

  const handleClearQueue = () => {
    setUploadQueue([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteClick = (audioFile: AudioFile) => {
    setDeleteConfirmFile(audioFile)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmFile) return

    setIsDeleting(true)
    try {
      await deleteAudioFile(deleteConfirmFile.id)
      setDeleteConfirmFile(null)
    } catch (error) {
      logger.error('Delete failed', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, audioFile?: AudioFile) => {
    e.preventDefault()

    // Calculate if menu would extend beyond viewport
    const menuHeight = 300 // Approximate height of context menu
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - e.clientY

    // If not enough space below, shift up just enough to fit
    let y = e.clientY
    if (spaceBelow < menuHeight) {
      y = Math.max(20, viewportHeight - menuHeight - 20)
    }

    setContextMenu({
      x: e.clientX,
      y: y,
      audioFile,
    })
  }

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    // Only show context menu if not clicking on a row
    if ((e.target as HTMLElement).closest('[data-audio-row]')) {
      return
    }
    handleContextMenu(e)
  }

  const handleRename = (audioFile: AudioFile) => {
    setEditingFileId(audioFile.id)
    setContextMenu(null)
    // Set value after a tick to ensure ref is available
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.value = audioFile.name
        editInputRef.current.focus()
        editInputRef.current.select()
      }
    }, 0)
  }

  const handleRenameSubmit = async () => {
    if (!editingFileId || !editInputRef.current) {
      setEditingFileId(null)
      return
    }

    const newName = editInputRef.current.value.trim()
    if (!newName) {
      setEditingFileId(null)
      return
    }

    const originalFile = audioFileMap.get(editingFileId)
    if (!originalFile || originalFile.name === newName) {
      setEditingFileId(null)
      return
    }

    try {
      console.log('Attempting to rename file:', { editingFileId, newName, originalName: originalFile.name })
      await updateAudioFile(editingFileId, { name: newName })
      addToast('Renamed successfully', 'success')
      setEditingFileId(null)
    } catch (error: unknown) {
      console.error('Rename error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Rename failed', error instanceof Error ? error : new Error(String(error)), {
        fileId: editingFileId,
        newName,
        errorType: typeof error,
        errorString: String(error)
      })
      addToast(`Failed to rename: ${errorMessage}`, 'error')
      setEditingFileId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingFileId(null)
  }

  const handleAddToNewPlaylistClick = (audioFile: AudioFile) => {
    setAudioFileForNewPlaylist(audioFile)
    setIsAddToNewPlaylistModalOpen(true)
    setContextMenu(null)
    setShowAddToSubmenu(false)
  }

  const handleAddToNewPlaylist = async (name: string) => {
    if (!audioFileForNewPlaylist) return

    setIsCreatingPlaylist(true)
    try {
      const newPlaylist = await createPlaylist({ name })
      await addAudioToPlaylist(newPlaylist.id, audioFileForNewPlaylist.id)
      addToast(`Added to "${name}"`, 'success')
      setIsAddToNewPlaylistModalOpen(false)
      setAudioFileForNewPlaylist(null)
    } catch (error) {
      console.error('Failed to create playlist and add audio:', error)
      addToast('Failed to add to playlist', 'error')
    } finally {
      setIsCreatingPlaylist(false)
    }
  }

  const handleAddToPlaylist = async (playlistId: string, audioFile: AudioFile) => {
    try {
      await addAudioToPlaylist(playlistId, audioFile.id)
      const playlist = playlistMap.get(playlistId)
      addToast(`Added to "${playlist?.name || 'playlist'}"`, 'success')
      setContextMenu(null)
      setShowAddToSubmenu(false)
    } catch (error) {
      console.error('Failed to add to playlist:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      // Check if it's a duplicate error
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
        addToast('Song already in playlist', 'error')
      } else {
        addToast('Failed to add to playlist', 'error')
      }
    }
  }

  const handleRemoveFromPlaylist = async (audioFile: AudioFile) => {
    if (!selectedPlaylistId) return

    try {
      const { removeAudioFromPlaylist } = useAudioPlaylistStore.getState()
      const playlist = playlistMap.get(selectedPlaylistId)

      // Remove the audio from playlist
      await removeAudioFromPlaylist(selectedPlaylistId, audioFile.id)
      addToast(`Removed from "${playlist?.name || 'playlist'}"`, 'success')
      setContextMenu(null)
    } catch (error) {
      console.error('Failed to remove from playlist:', error)
      addToast('Failed to remove from playlist', 'error')
    }
  }

  const handlePlay = async (audioFile: AudioFile) => {
    const currentTrackUrl = useAudioStore.getState().currentTrackUrl
    const isSameTrack = currentTrackId === audioFile.id && currentTrackUrl === audioFile.file_url

    if (isSameTrack) {
      togglePlay()
    } else {
      if (!audioFile.file_url) {
        addToast('This audio file is missing its URL. Please re-upload.', 'error')
        return
      }
      // Load and immediately play the new track
      loadTrack(audioFile.id, audioFile.file_url)
      // Ensure it starts playing even if another track was playing
      if (!isPlaying) {
        setTimeout(() => {
          togglePlay()
        }, 200)
      }
    }
  }

  const handleRowClick = (audioFile: AudioFile, e: React.MouseEvent) => {
    // Don't play if clicking on checkbox, buttons, or tags
    if ((e.target as HTMLElement).closest('input[type="checkbox"]') ||
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('[data-tag]')) {
      return
    }
    handlePlay(audioFile)
  }

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTags(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
    setShowFilters(true)
  }

  const handleCheckboxChange = (audioFileId: string) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(audioFileId)) {
        newSet.delete(audioFileId)
      } else {
        newSet.add(audioFileId)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedFileIds.size === 0) return

    const confirmed = window.confirm(`Delete ${selectedFileIds.size} file(s)? This action cannot be undone.`)
    if (!confirmed) return

    try {
      for (const fileId of selectedFileIds) {
        await deleteAudioFile(fileId)
      }
      addToast(`Deleted ${selectedFileIds.size} file(s)`, 'success')
      setSelectedFileIds(new Set())
      setShowBulkActions(false)
    } catch (error) {
      console.error('Bulk delete failed:', error)
      addToast('Failed to delete files', 'error')
    }
  }

  const handleSelectAll = () => {
    if (selectedFileIds.size === audioFiles.length) {
      setSelectedFileIds(new Set())
    } else {
      setSelectedFileIds(new Set(audioFiles.map(f => f.id)))
    }
  }

  useEffect(() => {
    setShowBulkActions(selectedFileIds.size > 0)
  }, [selectedFileIds])

  const handleToggleTagFilter = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  const handleClearTagFilters = () => {
    setSelectedTags(new Set())
  }

  const handleAddTagToFile = async (audioFile: AudioFile, newTag: string) => {
    const trimmedTag = newTag.trim().toLowerCase()
    if (!trimmedTag) return

    const currentTags = audioFile.tags || []
    if (currentTags.includes(trimmedTag)) {
      addToast('Tag already exists', 'error')
      return
    }

    const updatedTags = [...currentTags, trimmedTag]

    try {
      await updateAudioFile(audioFile.id, {
        tags: updatedTags
      })

      // Update context menu with fresh data
      if (contextMenu?.audioFile?.id === audioFile.id) {
        setContextMenu({
          ...contextMenu,
          audioFile: {
            ...audioFile,
            tags: updatedTags
          }
        })
      }

      addToast('Tag added', 'success')
    } catch (error) {
      logger.error('Failed to add tag', error)
      addToast('Failed to add tag', 'error')
    }
  }

  const handleRemoveTagFromFile = async (audioFile: AudioFile, tagToRemove: string) => {
    const currentTags = audioFile.tags || []
    const updatedTags = currentTags.filter(t => t !== tagToRemove)

    // Immediately update context menu with the new tags
    if (contextMenu?.audioFile?.id === audioFile.id) {
      setContextMenu({
        ...contextMenu,
        audioFile: {
          ...audioFile,
          tags: updatedTags
        }
      })
    }

    try {
      await updateAudioFile(audioFile.id, {
        tags: updatedTags
      })

      addToast('Tag removed', 'success')
    } catch (error) {
      logger.error('Failed to remove tag', error)
      addToast('Failed to remove tag', 'error')

      // Revert context menu on error
      if (contextMenu?.audioFile?.id === audioFile.id) {
        setContextMenu({
          ...contextMenu,
          audioFile: {
            ...audioFile,
            tags: currentTags
          }
        })
      }
    }
  }

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    const trimmedNewTag = newTag.trim().toLowerCase()
    if (!trimmedNewTag || trimmedNewTag === oldTag) {
      setEditingTag(null)
      return
    }

    // Check if new tag already exists
    if (allTags.includes(trimmedNewTag)) {
      addToast('Tag already exists', 'error')
      setEditingTag(null)
      return
    }

    try {
      // Find all files with the old tag and update them
      const filesWithTag = Array.from(audioFileMap.values()).filter(file =>
        file.tags?.includes(oldTag)
      )

      await Promise.all(
        filesWithTag.map(file => {
          const updatedTags = file.tags!.map(tag => tag === oldTag ? trimmedNewTag : tag)
          return updateAudioFile(file.id, { tags: updatedTags })
        })
      )

      // Update context menu if current file has this tag
      if (contextMenu?.audioFile?.tags?.includes(oldTag)) {
        const updatedTags = contextMenu.audioFile.tags.map(tag =>
          tag === oldTag ? trimmedNewTag : tag
        )
        setContextMenu({
          ...contextMenu,
          audioFile: {
            ...contextMenu.audioFile,
            tags: updatedTags
          }
        })
      }

      addToast('Tag renamed', 'success')
      setEditingTag(null)
    } catch (error) {
      logger.error('Failed to rename tag', error)
      addToast('Failed to rename tag', 'error')
      setEditingTag(null)
    }
  }

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '--:--'
    return formatTime(seconds)
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '--'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const sidebarButtons = getSidebarButtons({
    view: 'audio',
    router,
  })

  if (!user) return null

  return (
    <DashboardLayoutWithSidebar
      navSidebar={<DashboardSidebar buttons={sidebarButtons} />}
      contentSidebar={
        <PlaylistsSidebar
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={setSelectedPlaylistId}
        />
      }
    >
      <div className="h-full flex flex-col">
        {/* Header with gradient blur - full width */}
        <div className="relative h-[88px] flex items-center justify-between px-6 border-b border-white/10">
          {/* Radial Gradient Background */}
          <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '-100px', height: '200px' }}>
            {/* Pink gradient - left side */}
            <div
              className="absolute"
              style={{
                left: '25%',
                top: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse 1200px 300px at center top, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            {/* Purple gradient - right side */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse 1200px 300px at center top, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
          </div>

          <h1 className="relative font-extrabold text-[20px] text-white">Audio Library</h1>
        </div>

        {/* Search/Controls Bar OR Bulk Actions Bar */}
        <div className={`px-6 pt-4 ${showFilters && !showBulkActions ? '' : uploadQueue.length > 0 ? 'pb-4' : 'pb-4 border-b border-white/5'}`}>
          {showBulkActions ? (
            /* Bulk Actions Mode */
            <div className="flex items-center gap-3 h-[40px]">
              <span className="text-[13px] text-white/70 pr-2">
                {selectedFileIds.size} file{selectedFileIds.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] transition-colors"
              >
                {selectedFileIds.size === audioFiles.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-[6px] transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          ) : (
            /* Search and Upload Mode */
            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search audio files..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-[8px] text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors h-[40px]"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 h-[40px] text-[14px] font-semibold rounded-[8px] transition-colors flex items-center gap-2 ${
                  showFilters || selectedTags.size > 0
                    ? 'text-white bg-white/20 hover:bg-white/25'
                    : 'text-white/70 bg-white/5 hover:bg-white/10'
                }`}
                title="Filter audio files"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {selectedTags.size > 0 && (
                  <span className="text-[12px]">({selectedTags.size})</span>
                )}
              </button>

              {/* Upload Button */}
              <button
                onClick={handleUploadButtonClick}
                className="px-3 h-[40px] text-[14px] font-semibold text-white bg-white/10 hover:bg-white/20 rounded-[8px] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload
              </button>
            </div>
          )}
        </div>

        {/* Progressive Disclosure Filters */}
        {showFilters && !showBulkActions && (
          <div className={`px-6 pt-4 pb-4 ${uploadQueue.length === 0 ? 'border-b border-white/5' : ''}`}>
            <div className="bg-white/[0.02] rounded-[8px] p-4 space-y-4">
              {/* Tags Filter - Only show if there are tags */}
              {allTags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-semibold text-white/70 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Tags
                    </h3>
                    {selectedTags.size > 0 && (
                      <button
                        onClick={handleClearTagFilters}
                        className="text-[12px] text-white/50 hover:text-white transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[...allTags].sort().map(tag => {
                      const count = tagCounts.get(tag) || 0
                      return (
                        <button
                          key={tag}
                          onClick={() => handleToggleTagFilter(tag)}
                          className={`px-3 py-1.5 rounded-[6px] text-[13px] transition-colors flex items-center gap-1.5 ${
                            selectedTags.has(tag)
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                          }`}
                        >
                          {tag}
                          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/10 text-[10px] font-medium">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty state - only show if no tags available */}
              {allTags.length === 0 && (
                <p className="text-[13px] text-white/40 italic text-center py-2">
                  No tags yet. Add tags to audio files using the context menu.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Table Header */}
        <div className="px-6 py-3 border-b border-white/5">
          <div className="flex items-center px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider w-full">
            {/* Select All Checkbox */}
            <div className="w-3.5 flex items-center justify-center flex-shrink-0">
              <input
                type="checkbox"
                checked={audioFiles.length > 0 && selectedFileIds.size === audioFiles.length}
                onChange={handleSelectAll}
                className="w-3.5 h-3.5 cursor-pointer"
                title="Select all files"
              />
            </div>
            <div className="w-4 flex-shrink-0 ml-6" /> {/* Play button space */}
            <div className="flex-1 ml-6 min-w-0">Name</div>
            <div className="flex items-center gap-16 text-[12px] flex-shrink-0 font-mono">
              <div className="w-16 text-right">Duration</div>
              <div className="w-20 text-right">Size</div>
            </div>
            <div className="w-5 flex-shrink-0" /> {/* Actions space */}
          </div>
        </div>

        {/* Audio Files List */}
        <div
          className="flex-1 overflow-y-auto"
          onContextMenu={handleEmptySpaceContextMenu}
        >
          {/* Upload Queue */}
          {uploadQueue.length > 0 && (
            <div className="px-6 pt-3 pb-3">
              <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-[8px] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70 font-semibold">
                    Upload {uploadQueue.length} file{uploadQueue.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* File list */}
                <div className="space-y-2">
                  {uploadQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`space-y-2 transition-opacity duration-300 ${
                        item.status === 'complete' ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      <div className={`flex items-center gap-3 rounded-[6px] p-3 transition-colors ${
                        focusedQueueItemId === item.id ? 'bg-white/10' : 'bg-white/5'
                      }`}>
                        <Music className="w-4 h-4 text-white/40 flex-shrink-0" />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateQueueName(item.id, e.target.value)}
                          onFocus={() => setFocusedQueueItemId(item.id)}
                          onBlur={() => setFocusedQueueItemId(null)}
                          disabled={item.status !== 'pending'}
                          className="flex-1 px-3 py-1 bg-transparent border-none text-[13px] text-white focus:outline-none rounded disabled:opacity-50"
                        />
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleRemoveFromQueue(item.id)}
                            className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.status === 'complete' && (
                          <span className="flex-shrink-0 text-green-400 text-[12px] font-medium">✓</span>
                        )}
                        {item.status === 'error' && (
                          <span className="flex-shrink-0 text-red-400 text-[12px] font-medium">✗</span>
                        )}
                      </div>

                      {/* Individual progress bar */}
                      {(item.status === 'uploading' || item.status === 'complete') && (
                        <div className="space-y-1 px-3">
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          {item.message && (
                            <p className="text-[11px] text-white/50">{item.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!uploadQueue.some(item => item.status === 'uploading') && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleClearQueue}
                      className="px-4 py-2 text-[14px] font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-[8px] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadAll}
                      disabled={uploadQueue.some(item => !item.name.trim() || item.status !== 'pending')}
                      className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Upload {uploadQueue.filter(item => item.status === 'pending').length} file{uploadQueue.filter(item => item.status === 'pending').length !== 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-white/40">Loading...</div>
          ) : audioFiles.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              {searchQuery ? 'No results found' : 'No audio files yet'}
            </div>
          ) : (
            <div>
              {audioFiles.map((audioFile) => {
                const isEditing = editingFileId === audioFile.id
                const isCurrentTrack = currentTrackId === audioFile.id
                const isCurrentlyPlaying = isCurrentTrack && isPlaying
                const isSelected = selectedFileIds.has(audioFile.id)

                return (
                  <div
                    key={audioFile.id}
                    data-audio-row
                    className={`group transition-colors cursor-pointer border-b border-white/5 ${
                      isCurrentlyPlaying
                        ? 'bg-white/10 hover:bg-white/[0.12]'
                        : isSelected
                        ? 'bg-white/5 hover:bg-white/[0.07]'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={(e) => handleRowClick(audioFile, e)}
                    onContextMenu={(e) => handleContextMenu(e, audioFile)}
                  >
                    <div className="flex items-center px-6 py-2">
                      <div className="flex items-center px-3 w-full">
                    {/* Checkbox - always visible */}
                    <div className="w-3.5 flex items-center justify-center flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(audioFile.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>

                    {/* Play/Pause Button - visible on hover or when playing, hidden when checkbox is shown */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlay(audioFile)
                      }}
                      className={`w-4 h-4 ml-6 text-white/50 hover:text-white transition-all flex-shrink-0 ${
                        isCurrentlyPlaying
                          ? 'opacity-100'
                          : isSelected || selectedFileIds.size > 0
                          ? 'opacity-0'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Play/Pause"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>

                    {/* File Info */}
                    <div className="flex-1 ml-6 min-w-0">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleRenameSubmit()
                          }}
                          className="w-full py-1"
                        >
                          <input
                            ref={editInputRef}
                            type="text"
                            defaultValue={audioFile.name}
                            onBlur={() => {
                              setTimeout(handleRenameSubmit, 100)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                e.preventDefault()
                                handleCancelEdit()
                              }
                            }}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-[13px] text-white focus:outline-none focus:border-white/40"
                          />
                        </form>
                      ) : (
                        <div className="py-1 h-[42px] flex flex-col justify-center overflow-hidden">
                          <div className="text-[13px] text-white overflow-visible whitespace-nowrap text-ellipsis leading-[18px]">
                            {audioFile.name}
                          </div>
                          {audioFile.tags && audioFile.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {[...audioFile.tags].sort().map((tag) => {
                                const isActive = selectedTags.has(tag)
                                return (
                                  <span
                                    key={tag}
                                    data-tag
                                    onClick={(e) => handleTagClick(tag, e)}
                                    className={`text-[11px] cursor-pointer transition-all leading-[16px] ${
                                      isActive
                                        ? 'text-white/50 underline'
                                        : 'text-white/30 hover:underline'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Duration and File Size */}
                    <div className="flex items-center gap-16 text-[12px] text-white/50 flex-shrink-0 font-mono">
                      <span className="w-16 text-right tabular-nums">{formatDuration(audioFile.duration)}</span>
                      <span className="w-20 text-right tabular-nums">{formatFileSize(audioFile.file_size)}</span>
                    </div>

                    {/* Spacer for alignment */}
                    <div className="w-5 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[180px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => {
            if (closeMenuTimeoutRef.current) {
              clearTimeout(closeMenuTimeoutRef.current)
              closeMenuTimeoutRef.current = null
            }
          }}
          onMouseLeave={() => {
            closeMenuTimeoutRef.current = setTimeout(() => {
              // Check if the tag input element is actually focused
              if (tagInputRef.current === document.activeElement) return
              setContextMenu(null)
              setShowTagsSubmenu(false)
            }, 200)
          }}
        >
          {/* Show "Upload New" if no audioFile (empty space click) */}
          {!contextMenu.audioFile ? (
            <button
              onClick={() => {
                handleUploadButtonClick()
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New
            </button>
          ) : (
            <>
              <button
                onClick={() => handlePlay(contextMenu.audioFile!)}
                onMouseEnter={() => {
                  if (closeMenuTimeoutRef.current) {
                    clearTimeout(closeMenuTimeoutRef.current)
                    closeMenuTimeoutRef.current = null
                  }
                  // Delay hiding submenus
                  closeMenuTimeoutRef.current = setTimeout(() => {
                    setShowTagsSubmenu(false)
                    setShowAddToSubmenu(false)
                  }, 250)
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                {currentTrackId === contextMenu.audioFile.id && isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Play
                  </>
                )}
              </button>
              <button
                onClick={() => handleRename(contextMenu.audioFile!)}
                onMouseEnter={() => {
                  if (closeMenuTimeoutRef.current) {
                    clearTimeout(closeMenuTimeoutRef.current)
                    closeMenuTimeoutRef.current = null
                  }
                  // Delay hiding submenus
                  closeMenuTimeoutRef.current = setTimeout(() => {
                    setShowTagsSubmenu(false)
                    setShowAddToSubmenu(false)
                  }, 250)
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Rename
              </button>

              {/* Tags - with submenu */}
              <div
                className="relative"
                onMouseEnter={() => {
                  // Clear any pending close timeout
                  if (closeMenuTimeoutRef.current) {
                    clearTimeout(closeMenuTimeoutRef.current)
                    closeMenuTimeoutRef.current = null
                  }
                  // Instantly hide other submenus and show this one
                  setShowAddToSubmenu(false)
                  setShowTagsSubmenu(true)
                }}
                onMouseLeave={() => {
                  closeMenuTimeoutRef.current = setTimeout(() => {
                    // Check if the tag input element is actually focused
                    if (tagInputRef.current === document.activeElement) return
                    setShowTagsSubmenu(false)
                  }, 200)
                }}
              >
                <button
                  className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center justify-between transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTagsSubmenu(true)
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    Tags
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/40" />
                </button>

                {/* Tags Submenu - Notion-style */}
                {showTagsSubmenu && contextMenu.audioFile && (() => {
                  // Calculate if we should position from bottom or top
                  const viewportHeight = window.innerHeight
                  const spaceBelow = viewportHeight - contextMenu.y
                  const shouldPositionFromBottom = spaceBelow < 400

                  return (
                    <div
                      data-tags-submenu
                      className="absolute left-full bg-[#191919] border border-white/10 rounded-[8px] py-2 shadow-lg min-w-[240px] flex flex-col"
                      style={{
                        marginLeft: '-2px',
                        ...(shouldPositionFromBottom ? {
                          bottom: '0',
                          maxHeight: 'min(400px, ' + (contextMenu.y + 20) + 'px)'
                        } : {
                          top: '0',
                          maxHeight: 'min(400px, ' + spaceBelow + 'px)'
                        })
                      }}
                      onMouseEnter={() => {
                      if (closeMenuTimeoutRef.current) {
                        clearTimeout(closeMenuTimeoutRef.current)
                        closeMenuTimeoutRef.current = null
                      }
                      setShowTagsSubmenu(true)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Current tags as chips at top */}
                    {contextMenu.audioFile.tags && contextMenu.audioFile.tags.length > 0 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                        {[...contextMenu.audioFile.tags].sort().map(tag => (
                          <div
                            key={tag}
                            className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-[6px] text-[12px] text-white flex items-center gap-1.5"
                          >
                            {tag}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveTagFromFile(contextMenu.audioFile!, tag)
                              }}
                              className="text-white/50 hover:text-white transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input field */}
                    <div className="px-3 pb-2">
                      <input
                        ref={tagInputRef}
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value)
                          // Clear any pending close timeout while typing
                          if (closeMenuTimeoutRef.current) {
                            clearTimeout(closeMenuTimeoutRef.current)
                            closeMenuTimeoutRef.current = null
                          }
                        }}
                        onFocus={(e) => {
                          // Mark input as focused and clear any pending close timeout
                          isInputFocusedRef.current = true
                          if (closeMenuTimeoutRef.current) {
                            clearTimeout(closeMenuTimeoutRef.current)
                            closeMenuTimeoutRef.current = null
                          }
                          e.stopPropagation()
                        }}
                        onBlur={() => {
                          // Delay marking as not focused to allow clicks on submenu items
                          setTimeout(() => {
                            isInputFocusedRef.current = false
                          }, 300)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            handleAddTagToFile(contextMenu.audioFile!, tagInput)
                            setTagInput('')
                            e.preventDefault()
                          }
                        }}
                        placeholder="Search or create tag..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-[6px] text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                        }}
                        onFocus={(e) => {
                          e.stopPropagation()
                        }}
                      />
                    </div>

                    {/* Create new tag option (when typing) */}
                    {tagInput.trim() && !allTags.includes(tagInput.trim().toLowerCase()) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddTagToFile(contextMenu.audioFile!, tagInput)
                            setTagInput('')
                          }}
                          className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                          <span className="text-white/60">Create</span>
                          <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[12px]">
                            {tagInput.trim().toLowerCase()}
                          </span>
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                      </>
                    )}

                    {/* Filtered tag list */}
                    <div className="overflow-y-auto flex-1">
                      {allTags
                        .filter(tag => {
                          // Filter by search input
                          if (tagInput.trim()) {
                            return tag.toLowerCase().includes(tagInput.toLowerCase())
                          }
                          // Don't show already added tags - get current tags from the actual store
                          const currentFile = audioFileMap.get(contextMenu.audioFile!.id)
                          return !currentFile?.tags?.includes(tag)
                        })
                        .sort()
                        .map(tag => (
                          <div key={tag} className="relative">
                            {editingTag === tag ? (
                              <div className="w-full px-3 py-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTagValue}
                                  onChange={(e) => setEditingTagValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameTag(tag, editingTagValue)
                                    } else if (e.key === 'Escape') {
                                      setEditingTag(null)
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      if (editingTag === tag) {
                                        handleRenameTag(tag, editingTagValue)
                                      }
                                    }, 200)
                                  }}
                                  autoFocus
                                  className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-[13px] text-white focus:outline-none focus:border-white/40"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="group w-full px-3 py-2 text-left text-[13px] hover:bg-white/5 transition-colors flex items-center justify-between gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddTagToFile(contextMenu.audioFile!, tag)
                                      setTagInput('')
                                    }}
                                    className="flex-1 text-left"
                                  >
                                    <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[12px] text-white">
                                      {tag}
                                    </span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setTagMenuOpen(tagMenuOpen === tag ? null : tag)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all flex-shrink-0"
                                  >
                                    <span className="text-[16px] leading-none">⋯</span>
                                  </button>
                                </div>

                                {/* Tag options menu */}
                                {tagMenuOpen === tag && (
                                  <div
                                    data-tag-options
                                    className="absolute right-0 top-0 bg-[#191919] border border-white/10 rounded-[8px] shadow-lg min-w-[120px] z-50"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingTag(tag)
                                        setEditingTagValue(tag)
                                        setTagMenuOpen(null)
                                      }}
                                      className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors"
                                    >
                                      Rename
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Remove this tag from all files that have it
                                        const filesWithTag = Array.from(audioFileMap.values()).filter(file =>
                                          file.tags?.includes(tag)
                                        )
                                        filesWithTag.forEach(file => {
                                          handleRemoveTagFromFile(file, tag)
                                        })
                                        setTagMenuOpen(null)
                                      }}
                                      className="w-full px-3 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  )
                })()}
              </div>

              {/* Remove from Playlist - only shown when viewing a specific playlist */}
              {selectedPlaylistId && (
                <>
                  <button
                    onClick={() => handleRemoveFromPlaylist(contextMenu.audioFile!)}
                    className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove from Playlist
                  </button>
                  <div className="h-px bg-white/10 my-1" />
                </>
              )}

              {/* Add to Playlist - with submenu */}
              <div
                className="relative"
                onMouseEnter={() => {
                  // Clear any pending close timeout
                  if (closeMenuTimeoutRef.current) {
                    clearTimeout(closeMenuTimeoutRef.current)
                    closeMenuTimeoutRef.current = null
                  }
                  // Instantly hide other submenus and show this one
                  setShowTagsSubmenu(false)
                  setShowAddToSubmenu(true)
                }}
                onMouseLeave={() => {
                  // Delay closing the submenu
                  closeMenuTimeoutRef.current = setTimeout(() => {
                    setShowAddToSubmenu(false)
                  }, 200)
                }}
              >
                <button
                  className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    Add to
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/40" />
                </button>

                {/* Submenu - increased hitbox area */}
                {showAddToSubmenu && (
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg min-w-[160px]"
                    style={{ marginLeft: '-2px' }} // Overlap slightly to prevent gap
                    onMouseEnter={() => {
                      if (closeMenuTimeoutRef.current) {
                        clearTimeout(closeMenuTimeoutRef.current)
                        closeMenuTimeoutRef.current = null
                      }
                      setShowAddToSubmenu(true)
                    }}
                    onMouseLeave={() => {
                      closeMenuTimeoutRef.current = setTimeout(() => {
                        setShowAddToSubmenu(false)
                      }, 200)
                    }}
                  >
                    <button
                      onClick={() => handleAddToNewPlaylistClick(contextMenu.audioFile!)}
                      className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors"
                    >
                      New Playlist
                    </button>
                    {playlists.length > 0 && (
                      <>
                        <div className="h-px bg-white/10 my-1" />
                        {playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => handleAddToPlaylist(playlist.id, contextMenu.audioFile!)}
                            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors truncate"
                          >
                            {playlist.name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  handleDeleteClick(contextMenu.audioFile!)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmFile}
        onClose={() => setDeleteConfirmFile(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Audio File"
        description={`Are you sure you want to delete "${deleteConfirmFile?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Add to New Playlist Modal */}
      <InputModal
        isOpen={isAddToNewPlaylistModalOpen}
        onClose={() => {
          setIsAddToNewPlaylistModalOpen(false)
          setAudioFileForNewPlaylist(null)
        }}
        onSubmit={handleAddToNewPlaylist}
        title="Create Playlist"
        label="Playlist Name"
        placeholder="Enter playlist name..."
        submitText="Create & Add"
        isLoading={isCreatingPlaylist}
      />
    </DashboardLayoutWithSidebar>
  )
}
