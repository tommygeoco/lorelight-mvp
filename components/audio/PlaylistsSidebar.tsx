/**
 * Playlists Sidebar for Audio Library
 * Shows all audio playlists with ability to create, select, and manage
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus, Music, Trash2, Edit2 } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'
import { useToastStore } from '@/store/toastStore'
import { InputModal } from '@/components/ui/InputModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { AudioPlaylist } from '@/types'

interface PlaylistsSidebarProps {
  selectedPlaylistId: string | null
  onSelectPlaylist: (id: string | null) => void
}

export function PlaylistsSidebar({
  selectedPlaylistId,
  onSelectPlaylist,
}: PlaylistsSidebarProps) {
  const { createPlaylist, deletePlaylist, updatePlaylist, playlists: playlistMap } = useAudioPlaylistStore()
  const { addToast } = useToastStore()

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    playlist?: AudioPlaylist
  } | null>(null)
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [playlistToDelete, setPlaylistToDelete] = useState<AudioPlaylist | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleCreatePlaylist = async (name: string) => {
    setIsSubmitting(true)
    try {
      const newPlaylist = await createPlaylist({ name })
      onSelectPlaylist(newPlaylist.id)
      addToast(`Created "${name}"`, 'success')
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Failed to create playlist:', error)
      addToast('Failed to create playlist', 'error')
    } finally {
      setIsSubmitting(false)
    }
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
      addToast('Renamed successfully', 'success')
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
    <div
      className="bg-[#191919] rounded-[8px] p-3 h-full flex flex-col overflow-y-auto scrollbar-custom"
      onContextMenu={handleEmptySpaceContextMenu}
    >
      <SectionHeader
        title="Playlists"
        variant="sidebar"
        action={{
          icon: <Plus className="w-[18px] h-[18px] text-white/70" />,
          onClick: () => setIsCreateModalOpen(true),
          variant: 'icon-only',
          ariaLabel: 'New Playlist'
        }}
      />

      {/* Playlists List */}
      <ul role="list" className="space-y-2 mt-4">
        {/* All Files */}
        <li>
          <div
            onClick={() => onSelectPlaylist(null)}
            className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm transition-colors cursor-pointer ${
              selectedPlaylistId === null
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">All Files</span>
          </div>
        </li>

        {/* User Playlists */}
        {playlists.length === 0 ? (
          <li>
            <div className="text-center py-8">
              <p className="text-neutral-400">No playlists yet</p>
              <p className="text-xs text-neutral-500 mt-1">Create a playlist to get started</p>
            </div>
          </li>
        ) : (
          <>
          {playlists.map((playlist) => {
            const isEditing = editingPlaylistId === playlist.id
            const trackCount = playlist.audio_file_ids?.length || 0

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
                        className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-[13px] text-white focus:outline-none focus:border-white/40"
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
                setIsCreateModalOpen(true)
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

      {/* Create Playlist Modal */}
      <InputModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePlaylist}
        title="Create Playlist"
        label="Playlist Name"
        placeholder="Enter playlist name..."
        submitText="Create"
        isLoading={isSubmitting}
      />

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
