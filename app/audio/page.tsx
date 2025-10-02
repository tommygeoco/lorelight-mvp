'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Play, Pause, Search, Plus, SlidersHorizontal, Tag, Minus, Edit2, MoreVertical } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { InputModal } from '@/components/ui/InputModal'
import { PlaylistsSidebar } from '@/components/audio/PlaylistsSidebar'
import { AudioContextMenu } from '@/components/audio/AudioContextMenu'
import { UploadQueue } from '@/components/audio/UploadQueue'
import { useAudioFileStore } from '@/store/audioFileStore'
import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useAudioPlaylistMap } from '@/hooks/useAudioPlaylistMap'
import { useAudioPlayback } from '@/hooks/useAudioPlayback'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'
import { logger } from '@/lib/utils/logger'
import { getRandomLoadingMessage } from '@/lib/constants/loadingMessages'
import { formatDuration, formatFileSize } from '@/lib/utils/audio'
import type { AudioFile } from '@/types'

export default function AudioPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadQueue, setUploadQueue] = useState<Array<{file: File, name: string, id: string, progress: number, status: 'pending' | 'uploading' | 'complete' | 'error', message: string}>>([])
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
  const editInputRef = useRef<HTMLInputElement>(null)
  const [isAddToNewPlaylistModalOpen, setIsAddToNewPlaylistModalOpen] = useState(false)
  const [audioFileForNewPlaylist, setAudioFileForNewPlaylist] = useState<AudioFile | null>(null)
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false)
  const [isBulkPlaylistModalOpen, setIsBulkPlaylistModalOpen] = useState(false)
  const [tagFilterInput, setTagFilterInput] = useState('')
  const [editingTagName, setEditingTagName] = useState<string | null>(null)
  const [editingTagValue, setEditingTagValue] = useState('')
  const [tagMenuOpen, setTagMenuOpen] = useState<string | null>(null)
  const tagEditInputRef = useRef<HTMLInputElement>(null)
  // Context menu state - managed locally in AudioContextMenu component
  const [focusedQueueItemId, setFocusedQueueItemId] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const dragCounterRef = useRef(0)

  const {
    isLoading,
    fetchAudioFiles,
    uploadAudioFile,
    deleteAudioFile,
    updateAudioFile,
  } = useAudioFileStore()

  const { createPlaylist, addAudioToPlaylist, removeAudioFromPlaylist } = useAudioPlaylistStore()
  const { handlePlay, currentTrackId, isPlaying } = useAudioPlayback()
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

  // Close context menu and bulk action dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Don't close if clicking inside context menu or its submenus
      const isInsideContextMenu = target.closest('[data-context-menu]') || target.closest('[data-tags-submenu]')

      // Don't close if clicking inside bulk dropdowns
      const isInsideBulkDropdown = target.closest('[data-bulk-dropdown]')

      // Only close if clicking outside all menus/dropdowns
      if (!isInsideContextMenu && !isInsideBulkDropdown) {
        setContextMenu(null)
        setShowTagsSubmenu(false)
        setShowAddToSubmenu(false)
        setIsBulkTagModalOpen(false)
        setIsBulkPlaylistModalOpen(false)
        setTagFilterInput('')
      }
    }
    if (contextMenu || isBulkTagModalOpen || isBulkPlaylistModalOpen) {
      // Use mousedown instead of click to catch events before React state updates
      document.addEventListener('mousedown', handleClick)
      return () => {
        document.removeEventListener('mousedown', handleClick)
      }
    }
  }, [contextMenu, isBulkTagModalOpen, isBulkPlaylistModalOpen])

  // Auto-focus tag edit input when editing starts
  useEffect(() => {
    if (editingTagName && tagEditInputRef.current) {
      tagEditInputRef.current.focus()
      tagEditInputRef.current.select()
    }
  }, [editingTagName])

  // Get all audio files from the map
  const allAudioFiles = useMemo(() =>
    Array.from(audioFileMap.values())
      .filter(file => file.file_url && file.file_url.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
  , [audioFileMap])

  // Fetch playlist audio if viewing a specific playlist
  useEffect(() => {
    if (selectedPlaylistId) {
      const playlistFiles = playlistAudioMap.get(selectedPlaylistId)
      if (!playlistFiles) {
        const { fetchPlaylistAudio } = useAudioPlaylistStore.getState()
        fetchPlaylistAudio(selectedPlaylistId)
      }
    }
  }, [selectedPlaylistId, playlistAudioMap])


  // Apply filters using the hook - but we need to filter by playlist first
  const audioFilesToFilter = useMemo(() => {
    if (selectedPlaylistId) {
      const playlistFiles = playlistAudioMap.get(selectedPlaylistId)
      return playlistFiles || []
    }
    return allAudioFiles
  }, [selectedPlaylistId, playlistAudioMap, allAudioFiles])

  // Simple filtering without the hook - inline for now
  const audioFiles = useMemo(() => {
    let files = audioFilesToFilter

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      files = files.filter(file => {
        const nameMatch = file.name.toLowerCase().includes(query)
        const tagMatch = file.tags?.some(tag => tag.toLowerCase().includes(query))
        return nameMatch || tagMatch
      })
    }

    // Apply tag filter (AND logic - must have ALL selected tags)
    if (selectedTags.size > 0) {
      files = files.filter(file => {
        if (!file.tags || file.tags.length === 0) return false
        return Array.from(selectedTags).every(tag => file.tags?.includes(tag))
      })
    }

    return files
  }, [audioFilesToFilter, searchQuery, selectedTags])

  // Get all unique tags from all audio files with counts
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allAudioFiles.forEach(file => {
      file.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [allAudioFiles])

  // Get filtered tags for bulk add dropdown
  const filteredTags = useMemo(() => {
    if (!tagFilterInput.trim()) return allTags
    const query = tagFilterInput.toLowerCase()
    return allTags.filter(tag => tag.toLowerCase().includes(query))
  }, [allTags, tagFilterInput])

  // Get tag counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    allAudioFiles.forEach(file => {
      file.tags?.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    })
    return counts
  }, [allAudioFiles])

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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    setIsDraggingOver(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDraggingOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDraggingOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Filter for audio files
      const audioFiles = Array.from(files).filter(file =>
        file.type.startsWith('audio/')
      )

      if (audioFiles.length > 0) {
        const newUploads = audioFiles.map(file => ({
          file,
          name: file.name.replace(/\.[^/.]+$/, ''),
          id: Math.random().toString(36).substring(7),
          progress: 0,
          status: 'pending' as const,
          message: ''
        }))

        setUploadQueue(prev => [...prev, ...newUploads])
        addToast(`Added ${audioFiles.length} file(s) to upload queue`, 'success')
      } else {
        addToast('No audio files found. Please drop audio files only.', 'error')
      }
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
            ? { ...q, status: 'complete' as const, progress: 100, message: getRandomLoadingMessage() }
            : q
        ))

        // Fade out and remove completed file after 400ms
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(q => q.id !== item.id))
        }, 400)
      } catch (error) {
        clearInterval(messageInterval)
        clearInterval(progressInterval)

        logger.error('Upload failed for file', error, { fileName: item.name })

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
      await updateAudioFile(editingFileId, { name: newName })
      setEditingFileId(null)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Rename failed', error instanceof Error ? error : new Error(String(error)), {
        fileId: editingFileId,
        newName,
        originalName: originalFile.name
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
      logger.error('Failed to create playlist and add audio', error)
      addToast('Failed to add to playlist', 'error')
    } finally {
      setIsCreatingPlaylist(false)
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

    const confirmed = window.confirm(`Remove these ${selectedFileIds.size} tracks from your collection? This action cannot be undone.`)
    if (!confirmed) return

    try {
      for (const fileId of selectedFileIds) {
        await deleteAudioFile(fileId)
      }
      addToast(`Deleted ${selectedFileIds.size} file(s)`, 'success')
      setSelectedFileIds(new Set())
      setShowBulkActions(false)
    } catch (error) {
      logger.error('Bulk delete failed', error)
      addToast('Failed to delete files', 'error')
    }
  }

  const handleBulkAddTag = async (tag: string) => {
    if (selectedFileIds.size === 0 || !tag.trim()) return

    const trimmedTag = tag.trim().toLowerCase()

    try {
      // Run all updates in parallel for performance
      await Promise.all(
        Array.from(selectedFileIds).map(async (fileId) => {
          const file = audioFileMap.get(fileId)
          if (!file) return

          const currentTags = file.tags || []
          // Only add if tag doesn't already exist
          if (!currentTags.includes(trimmedTag)) {
            await updateAudioFile(fileId, {
              tags: [...currentTags, trimmedTag]
            })
          }
        })
      )

      // Don't close dropdown - let user add multiple tags
      // Don't deselect - let user continue working
    } catch (error) {
      logger.error('Bulk tag failed', error)
      addToast('Failed to add tags', 'error')
    }
  }

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!newTag.trim() || oldTag === newTag.trim()) {
      setEditingTagName(null)
      setEditingTagValue('')
      return
    }

    const trimmedNewTag = newTag.trim().toLowerCase()

    try {
      // Update all files that have this tag
      const filesToUpdate = allAudioFiles.filter(file =>
        file.tags?.includes(oldTag)
      )

      await Promise.all(
        filesToUpdate.map(async (file) => {
          const updatedTags = file.tags!.map(tag =>
            tag === oldTag ? trimmedNewTag : tag
          )
          await updateAudioFile(file.id, { tags: updatedTags })
        })
      )

      setEditingTagName(null)
      setEditingTagValue('')
      addToast(`Renamed tag to "${trimmedNewTag}"`, 'success')
    } catch (error) {
      logger.error('Rename tag failed', error)
      addToast('Failed to rename tag', 'error')
    }
  }

  const handleDeleteTag = async (tag: string) => {
    try {
      // Remove tag from all files that have it
      const filesToUpdate = allAudioFiles.filter(file =>
        file.tags?.includes(tag)
      )

      await Promise.all(
        filesToUpdate.map(async (file) => {
          const updatedTags = file.tags!.filter(t => t !== tag)
          await updateAudioFile(file.id, { tags: updatedTags })
        })
      )

      addToast(`Deleted tag "${tag}"`, 'success')
    } catch (error) {
      logger.error('Delete tag failed', error)
      addToast('Failed to delete tag', 'error')
    }
  }

  const handleBulkAddToPlaylist = async (playlistId: string) => {
    if (selectedFileIds.size === 0) return

    try {
      // Run all additions in parallel for performance
      await Promise.all(
        Array.from(selectedFileIds).map(fileId =>
          addAudioToPlaylist(playlistId, fileId)
        )
      )

      // Don't close dropdown - let user add to multiple playlists
      // Don't deselect - let user continue working
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      // Check if it's a duplicate error
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
        addToast('Some files already in playlist', 'error')
      } else {
        logger.error('Bulk add to playlist failed', error)
        addToast('Failed to add files to playlist', 'error')
      }
    }
  }

  const handleBulkRemoveFromPlaylist = async () => {
    if (selectedFileIds.size === 0 || !selectedPlaylistId) return

    try {
      // Run all removals in parallel for performance
      await Promise.all(
        Array.from(selectedFileIds).map(fileId =>
          removeAudioFromPlaylist(selectedPlaylistId, fileId)
        )
      )
      // Don't deselect - let user continue working
    } catch (error) {
      logger.error('Bulk remove from playlist failed', error)
      addToast('Failed to remove files from playlist', 'error')
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

  // Clear selections when switching playlists
  useEffect(() => {
    setSelectedFileIds(new Set())
  }, [selectedPlaylistId])

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
              {/* Add Tag Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    const newState = !isBulkTagModalOpen
                    setIsBulkTagModalOpen(newState)
                    setIsBulkPlaylistModalOpen(false)
                    if (!newState) {
                      setTagFilterInput('')
                    }
                  }}
                  className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] transition-colors flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Add Tag
                </button>

                {isBulkTagModalOpen && (
                  <div data-bulk-dropdown className="absolute top-full left-0 mt-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[240px] z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="p-3">
                      <input
                        type="text"
                        placeholder="Search or create tag..."
                        value={tagFilterInput}
                        onChange={(e) => setTagFilterInput(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement
                            if (target.value.trim()) {
                              handleBulkAddTag(target.value.trim())
                              setTagFilterInput('')
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-[6px] text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                      />
                    </div>

                    {/* Show "Create tag" option when typing a new tag */}
                    {tagFilterInput.trim() && !filteredTags.includes(tagFilterInput.trim()) && (
                      <>
                        <div className="h-px bg-white/10" />
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBulkAddTag(tagFilterInput.trim())
                              setTagFilterInput('')
                            }}
                            className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5 text-purple-400" />
                            <span>Create <span className="text-purple-400">&quot;{tagFilterInput.trim()}&quot;</span></span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Show existing tags (filtered) */}
                    {filteredTags.length > 0 && (
                      <>
                        <div className="h-px bg-white/10" />
                        <div className="py-1 max-h-[200px] overflow-y-auto scrollbar-custom">
                          {filteredTags.map(tag => (
                            <div
                              key={tag}
                              className="group flex items-center hover:bg-white/5 transition-colors relative"
                            >
                              {editingTagName === tag ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault()
                                    handleRenameTag(tag, editingTagValue)
                                  }}
                                  className="flex-1 px-3 py-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    ref={tagEditInputRef}
                                    type="text"
                                    value={editingTagValue}
                                    onChange={(e) => setEditingTagValue(e.target.value)}
                                    onBlur={() => handleRenameTag(tag, editingTagValue)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        e.preventDefault()
                                        setEditingTagName(null)
                                        setEditingTagValue('')
                                      }
                                    }}
                                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-[13px] text-white focus:outline-none focus:border-white/40"
                                  />
                                </form>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleBulkAddTag(tag)
                                      setTagFilterInput('')
                                    }}
                                    className="flex-1 px-3 py-2 text-left text-[13px] text-white"
                                  >
                                    {tag}
                                  </button>
                                  <div className="relative mr-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setTagMenuOpen(tagMenuOpen === tag ? null : tag)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 px-3 py-2.5 text-white/40 hover:text-white transition-all"
                                      title="Tag options"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>
                                    {tagMenuOpen === tag && (
                                      <div className="absolute right-0 top-full mt-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-lg min-w-[120px] py-1 z-50">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingTagName(tag)
                                            setEditingTagValue(tag)
                                            setTagMenuOpen(null)
                                          }}
                                          className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                          Rename
                                        </button>
                                        <div className="h-px bg-white/10 my-1" />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (confirm(`Delete tag "${tag}"? This will remove it from all files.`)) {
                                              handleDeleteTag(tag)
                                            }
                                            setTagMenuOpen(null)
                                          }}
                                          className="w-full px-3 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Show "No tags found" when filter has no matches */}
                    {tagFilterInput.trim() && filteredTags.length === 0 && !tagFilterInput.trim() && (
                      <>
                        <div className="h-px bg-white/10" />
                        <div className="py-8 text-center text-[13px] text-white/40">
                          No tags found
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Add to Playlist Dropdown / Remove from Playlist */}
              {selectedPlaylistId ? (
                <button
                  onClick={handleBulkRemoveFromPlaylist}
                  className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] transition-colors flex items-center gap-1.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Remove from Playlist
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsBulkPlaylistModalOpen(!isBulkPlaylistModalOpen)
                      setIsBulkTagModalOpen(false)
                    }}
                    className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Playlist
                  </button>

                  {isBulkPlaylistModalOpen && playlists.length > 0 && (
                    <div data-bulk-dropdown className="absolute top-full left-0 mt-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[200px] max-h-[300px] overflow-y-auto scrollbar-custom z-50 py-1" onClick={(e) => e.stopPropagation()}>
                      {playlists.map(playlist => (
                        <button
                          key={playlist.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBulkAddToPlaylist(playlist.id)
                          }}
                          className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors"
                        >
                          {playlist.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                  <div className="flex items-center gap-2 mb-3">
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
            <div className="w-[24px] flex-shrink-0 ml-6" /> {/* Play button space - matches row w-[24px] */}
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
          className={`flex-1 overflow-y-auto scrollbar-custom relative ${isDraggingOver ? 'bg-white/5' : ''}`}
          onContextMenu={handleEmptySpaceContextMenu}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag-and-drop overlay */}
          {isDraggingOver && (
            <div className="absolute inset-4 z-50 flex items-center justify-center border-2 border-dashed rounded-lg pointer-events-none arcane-drop-zone">
              <div className="text-center">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                <p className="text-lg text-white font-semibold">Release to add to your collection</p>
                <p className="text-sm text-white/60">Files will be added to the upload queue</p>
              </div>
            </div>
          )}
          {/* Upload Queue */}
          <UploadQueue
            uploadQueue={uploadQueue}
            focusedQueueItemId={focusedQueueItemId}
            onUpdateName={handleUpdateQueueName}
            onRemoveFromQueue={handleRemoveFromQueue}
            onFocus={setFocusedQueueItemId}
            onBlur={() => setFocusedQueueItemId(null)}
            onClearQueue={handleClearQueue}
            onUploadAll={handleUploadAll}
          />

          {isLoading ? (
            <div className="text-center py-12 text-white/40">Loading...</div>
          ) : audioFiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40">
                {searchQuery
                  ? 'The archives yield no matching scrolls'
                  : selectedPlaylistId
                  ? <>This tome is empty.<br />Add tracks to fill its pages</>
                  : <>Your arcane library awaits...<br />Upload audio to begin</>}
              </p>
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
                        ? 'playing-track-gradient active'
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
                        onChange={(e) => {
                          e.stopPropagation()
                          handleCheckboxChange(audioFile.id)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>

                    {/* Play/Pause Button with Visualizer - show bars when playing, pause on hover */}
                    <div className="flex items-center ml-6 w-[24px] justify-center">
                      {/* Visualizer Bars - visible when playing and NOT hovering */}
                      {isCurrentlyPlaying && (
                        <div className="flex items-center gap-0.5 h-4 group-hover:opacity-0 transition-opacity duration-200">
                          <div className="visualizer-bar active" />
                          <div className="visualizer-bar active" />
                          <div className="visualizer-bar active" />
                        </div>
                      )}

                      {/* Play/Pause Button - visible on hover or when not playing */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlay(audioFile)
                        }}
                        className={`absolute w-4 h-4 text-white/50 hover:text-white transition-all flex-shrink-0 opacity-0 group-hover:opacity-100`}
                        title="Play/Pause"
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="w-4 h-4 fill-current icon-playing-glow" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                    </div>

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
                            onClick={(e) => e.stopPropagation()}
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
      <AudioContextMenu
        contextMenu={contextMenu}
        showTagsSubmenu={showTagsSubmenu}
        showAddToSubmenu={showAddToSubmenu}
        setShowTagsSubmenu={setShowTagsSubmenu}
        setShowAddToSubmenu={setShowAddToSubmenu}
        setContextMenu={setContextMenu}
        onUploadNew={handleUploadButtonClick}
        onRename={handleRename}
        onDelete={handleDeleteClick}
        onAddToNewPlaylist={handleAddToNewPlaylistClick}
        onRemoveFromPlaylist={(fileId) => {
          setSelectedFileIds(prev => {
            const next = new Set(prev)
            next.delete(fileId)
            return next
          })
        }}
        playlists={playlists}
        allTags={allTags}
        selectedPlaylistId={selectedPlaylistId}
      />

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
