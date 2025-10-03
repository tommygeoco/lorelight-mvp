/**
 * Playlists Sidebar for Audio Library
 * Shows all audio playlists with ability to create, select, and manage
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Music, Trash2, Edit2 } from 'lucide-react'
import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'
import { useToastStore } from '@/store/toastStore'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { AudioPlaylist } from '@/types'

interface PlaylistsSidebarProps {
  selectedPlaylistId: string | null
  onSelectPlaylist: (id: string | null) => void
  audioFileForNewPlaylist?: { id: string; name: string } | null
  onClearAudioFileForNewPlaylist?: () => void
}

export function PlaylistsSidebar({
  selectedPlaylistId,
  onSelectPlaylist,
  audioFileForNewPlaylist,
  onClearAudioFileForNewPlaylist,
}: PlaylistsSidebarProps) {
  const { createPlaylist, deletePlaylist, updatePlaylist, playlists: playlistMap, playlistAudio, addAudioToPlaylist } = useAudioPlaylistStore()
  const { addToast } = useToastStore()

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    playlist?: AudioPlaylist
  } | null>(null)
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [playlistToDelete, setPlaylistToDelete] = useState<AudioPlaylist | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const playlists = Array.from(playlistMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  // Auto-focus input when creating new playlist
  useEffect(() => {
    if (isCreatingNew && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isCreatingNew])

  // Trigger inline creation when audioFileForNewPlaylist is set
  useEffect(() => {
    if (audioFileForNewPlaylist && !isCreatingNew) {
      setIsCreatingNew(true)
    }
  }, [audioFileForNewPlaylist, isCreatingNew])

  const handleCreateSubmit = async () => {
    if (!newPlaylistName.trim()) {
      setIsCreatingNew(false)
      setNewPlaylistName('')
      return
    }

    setIsSubmitting(true)
    try {
      const newPlaylist = await createPlaylist({ name: newPlaylistName.trim() })

      // If there's a file waiting to be added, add it to the new playlist
      if (audioFileForNewPlaylist) {
        await addAudioToPlaylist(newPlaylist.id, audioFileForNewPlaylist.id)
        addToast(`Added "${audioFileForNewPlaylist.name}" to "${newPlaylistName.trim()}"`, 'success')
        onClearAudioFileForNewPlaylist?.()
      } else {
        addToast(`Created "${newPlaylistName.trim()}"`, 'success')
      }

      onSelectPlaylist(newPlaylist.id)
      setIsCreatingNew(false)
      setNewPlaylistName('')
    } catch (error) {
      console.error('Failed to create playlist:', error)
      addToast('Failed to create playlist', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelCreate = () => {
    setIsCreatingNew(false)
    setNewPlaylistName('')
  }

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return

    setIsSubmitting(true)
    try {
      await deletePlaylist(playlistToDelete.id)
      if (selectedPlaylistId === playlistToDelete.id) {
        onSelectPlaylist(null)
      }
      addToast(`Deleted "${playlistToDelete.name}"`, 'success')
      setIsDeleteDialogOpen(false)
      setPlaylistToDelete(null)
      setContextMenu(null)
    } catch (error) {
      console.error('Failed to delete playlist:', error)
      addToast('Failed to delete playlist', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (playlist: AudioPlaylist) => {
    setPlaylistToDelete(playlist)
    setIsDeleteDialogOpen(true)
  }

  const handleContextMenu = (e: React.MouseEvent, playlist?: AudioPlaylist) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      playlist,
    })
  }

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    // Only show context menu if not clicking on a playlist item
    if ((e.target as HTMLElement).closest('[data-playlist-item]')) {
      return
    }
    handleContextMenu(e)
  }

  const handleRename = (playlist: AudioPlaylist) => {
    setEditingPlaylistId(playlist.id)
    setEditingName(playlist.name)
    setContextMenu(null)
  }

  const handleRenameSubmit = async (playlistId: string) => {
    if (!editingName.trim()) {
      setEditingPlaylistId(null)
      return
    }

    const originalPlaylist = playlistMap.get(playlistId)
    if (!originalPlaylist || originalPlaylist.name === editingName) {
      setEditingPlaylistId(null)
      return
    }

    try {
      await updatePlaylist(playlistId, { name: editingName })
      setEditingPlaylistId(null)
    } catch (error) {
      console.error('Failed to rename playlist:', error)
      addToast('Failed to rename playlist', 'error')
      setEditingPlaylistId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingPlaylistId(null)
    setEditingName('')
  }

  return (
    <div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Playlists</h2>
        <button
          onClick={() => setIsCreatingNew(true)}
          className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
          aria-label="New Playlist"
          title="Create playlist"
        >
          <Plus className="w-[18px] h-[18px] text-white/70" />
        </button>
      </div>

      {/* Scrollable List */}
      <div
        className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4"
        onContextMenu={handleEmptySpaceContextMenu}
      >

      {/* Playlists List */}
      <ul role="list" className="space-y-2">
        {/* All Files */}
        <li>
          <button
            onClick={() => onSelectPlaylist(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-[8px] transition-colors text-left ${
              selectedPlaylistId === null
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-[13px] font-medium">All Files</span>
          </button>
        </li>

        {/* New Playlist Input */}
        {isCreatingNew && (
          <li>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCreateSubmit()
              }}
              className="px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 flex-shrink-0 text-white/70" />
                <input
                  ref={inputRef}
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onBlur={() => {
                    if (!newPlaylistName.trim()) {
                      handleCancelCreate()
                    } else {
                      handleCreateSubmit()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      handleCancelCreate()
                    }
                  }}
                  placeholder="Playlist name..."
                  className="flex-1 px-3 py-1.5 bg-white/[0.07] border border-white/10 rounded-[8px] text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                />
              </div>
            </form>
          </li>
        )}

        {/* User Playlists */}
        {playlists.length === 0 && !isCreatingNew ? (
          <li>
            <div className="text-center py-8">
              <p className="text-white/40 text-[0.875rem]">No playlists discovered...<br />Create a playlist to begin</p>
            </div>
          </li>
        ) : (
          <>
          {playlists.map((playlist) => {
            const isEditing = editingPlaylistId === playlist.id
            const trackCount = playlistAudio.get(playlist.id)?.length || 0

            return (
              <li key={playlist.id}>
                <div
                  data-playlist-item
                  className={`group flex flex-col px-3 py-2 rounded-[8px] transition-colors cursor-pointer ${
                    selectedPlaylistId === playlist.id
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => !isEditing && onSelectPlaylist(playlist.id)}
                  onContextMenu={(e) => handleContextMenu(e, playlist)}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleRenameSubmit(playlist.id)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <Music className="w-4 h-4 flex-shrink-0 text-white/70" />
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRenameSubmit(playlist.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault()
                            handleCancelEdit()
                          }
                        }}
                        autoFocus
                        className="flex-1 px-3 py-1.5 bg-white/[0.07] border border-white/10 rounded-[8px] text-[13px] text-white focus:outline-none focus:border-white/20"
                      />
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 flex-shrink-0 text-white/70" />
                        <span className="flex-1 truncate text-[13px] text-white font-medium">{playlist.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(playlist)
                          }}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
                          title="Delete playlist"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {/* Track count */}
                      <div className="ml-6 text-[11px] text-white/30 mt-0.5">
                        {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                      </div>
                    </>
                  )}
                </div>
              </li>
            )
          })}
          </>
        )}
      </ul>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Show "New Playlist" if no playlist (empty space click) */}
          {!contextMenu.playlist ? (
            <button
              onClick={() => {
                setIsCreatingNew(true)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Playlist
            </button>
          ) : (
            <>
              <button
                onClick={() => handleRename(contextMenu.playlist!)}
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Rename
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  handleDeleteClick(contextMenu.playlist!)
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
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setPlaylistToDelete(null)
        }}
        onConfirm={handleDeletePlaylist}
        title="Delete Playlist"
        description={`Are you sure you want to delete "${playlistToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  )
}
