'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Music, Trash2, Play, Pause, Search, Plus, X, Edit2, Copy, ChevronRight } from 'lucide-react'
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
import type { AudioFile } from '@/types'

export default function AudioPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadName, setUploadName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const [isAddToNewPlaylistModalOpen, setIsAddToNewPlaylistModalOpen] = useState(false)
  const [audioFileForNewPlaylist, setAudioFileForNewPlaylist] = useState<AudioFile | null>(null)
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)

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

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  // Get all audio files as array with search filter and playlist filter
  const audioFiles = useMemo(() => {
    let files: AudioFile[]

    // If viewing a specific playlist, get files from that playlist
    if (selectedPlaylistId) {
      const { playlistAudio, fetchPlaylistAudio } = useAudioPlaylistStore.getState()
      const playlistFiles = playlistAudio.get(selectedPlaylistId)

      // Fetch playlist audio if not already loaded
      if (!playlistFiles) {
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

    return files.sort((a, b) => a.name.localeCompare(b.name))
  }, [audioFileMap, searchQuery, selectedPlaylistId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadName(file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadName.trim()) return

    try {
      await uploadAudioFile(selectedFile, uploadName.trim(), [], undefined)
      setSelectedFile(null)
      setUploadName('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      logger.error('Upload failed', error)
    }
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancelUpload = () => {
    setSelectedFile(null)
    setUploadName('')
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
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
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

  const handleDuplicate = async () => {
    // For now, just show a toast - actual duplication would require copying the file in R2
    alert('Duplicate functionality coming soon')
    setContextMenu(null)
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
      loadTrack(audioFile.id, audioFile.file_url)
      setTimeout(() => {
        togglePlay()
      }, 200)
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
    view: 'dashboard',
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
        {/* Header with gradient - full width */}
        <div className="h-[88px] flex items-center justify-between px-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border-b border-white/10">
          <h1 className="font-extrabold text-[20px] text-white">Audio Library</h1>
        </div>

        {/* Search and Controls Bar */}
        <div className="px-6 pt-4 pb-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audio files..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-[8px] text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUploadButtonClick}
              className="px-3 py-2 text-[14px] font-semibold text-white bg-white/10 hover:bg-white/20 rounded-[8px] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Modal */}
        {selectedFile && (
          <div className="px-6 pb-3">
            <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-[8px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Music className="w-5 h-5 text-white/40 flex-shrink-0" />
                  <span className="text-sm text-white/70 truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={handleCancelUpload}
                  className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Enter audio name..."
                className="w-full px-4 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20"
              />

              <button
                onClick={handleUpload}
                disabled={!uploadName.trim() || isUploading}
                className="w-full px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload Audio'}
              </button>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
            <div className="w-4" /> {/* Play button space */}
            <div className="flex-1 ml-1">Name</div>
            <div className="w-12 text-right">Duration</div>
            <div className="w-16 text-right mr-1">Size</div>
            <div className="w-5" /> {/* Delete button space */}
          </div>
        </div>

        {/* Audio Files List */}
        <div
          className="flex-1 overflow-y-auto px-6"
          onContextMenu={handleEmptySpaceContextMenu}
        >
          {isLoading ? (
            <div className="text-center py-12 text-white/40">Loading...</div>
          ) : audioFiles.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              {searchQuery ? 'No results found' : 'No audio files yet'}
            </div>
          ) : (
            <div className="space-y-0.5">
              {audioFiles.map((audioFile) => {
                const isEditing = editingFileId === audioFile.id
                const isCurrentTrack = currentTrackId === audioFile.id
                const isCurrentlyPlaying = isCurrentTrack && isPlaying

                return (
                  <div
                    key={audioFile.id}
                    data-audio-row
                    className="group flex items-center gap-2 px-3 py-2 rounded-[8px] hover:bg-white/5 transition-colors cursor-pointer"
                    onContextMenu={(e) => handleContextMenu(e, audioFile)}
                  >
                    {/* Play/Pause Button - only visible on hover or when playing */}
                    <button
                      onClick={() => handlePlay(audioFile)}
                      className={`w-4 h-4 text-white/50 hover:text-white transition-all flex-shrink-0 ${
                        isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Play/Pause"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 ml-1">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleRenameSubmit()
                          }}
                          className="w-full"
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
                        <>
                          <div className="text-[13px] text-white truncate">
                            {audioFile.name}
                          </div>
                          {audioFile.tags && audioFile.tags.length > 0 && (
                            <div className="text-[11px] text-white/30 truncate mt-0.5">
                              {audioFile.tags.join(', ')}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Duration and File Size */}
                    <div className="flex items-center gap-4 text-[12px] text-white/50 flex-shrink-0 font-mono">
                      <span className="w-12 text-right tabular-nums">{formatDuration(audioFile.duration)}</span>
                      <span className="w-16 text-right tabular-nums">{formatFileSize(audioFile.file_size)}</span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteClick(audioFile)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Play
              </button>
              <button
                onClick={() => handleRename(contextMenu.audioFile!)}
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>

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
                onMouseEnter={() => setShowAddToSubmenu(true)}
                onMouseLeave={() => setShowAddToSubmenu(false)}
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
                    className="absolute left-full top-0 bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg min-w-[160px]"
                    style={{ marginLeft: '-2px' }} // Overlap slightly to prevent gap
                    onMouseEnter={() => setShowAddToSubmenu(true)}
                    onMouseLeave={() => setShowAddToSubmenu(false)}
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
