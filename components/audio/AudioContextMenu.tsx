'use client'

import { useRef } from 'react'
import { Upload, Play, Pause, Edit2, Tag, ChevronRight, Trash2, Plus, X } from 'lucide-react'
import { useAudioPlayback } from '@/hooks/useAudioPlayback'
import { useAudioFileStore } from '@/store/audioFileStore'
import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'
import { useToastStore } from '@/store/toastStore'
import type { AudioFile, AudioPlaylist } from '@/types'

interface AudioContextMenuProps {
  contextMenu: {
    x: number
    y: number
    audioFile?: AudioFile
  } | null
  showTagsSubmenu: boolean
  showAddToSubmenu: boolean
  setShowTagsSubmenu: (show: boolean) => void
  setShowAddToSubmenu: (show: boolean) => void
  setContextMenu: (menu: { x: number; y: number; audioFile?: AudioFile } | null) => void
  onUploadNew: () => void
  onRename: (file: AudioFile) => void
  onDelete: (file: AudioFile) => void
  onAddToNewPlaylist: (file: AudioFile) => void
  playlists: AudioPlaylist[]
  closeMenuTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
}

export function AudioContextMenu({
  contextMenu,
  showTagsSubmenu,
  showAddToSubmenu,
  setShowTagsSubmenu,
  setShowAddToSubmenu,
  setContextMenu,
  onUploadNew,
  onRename,
  onDelete,
  onAddToNewPlaylist,
  playlists,
  closeMenuTimeoutRef,
}: AudioContextMenuProps) {
  const tagInputRef = useRef<HTMLInputElement>(null)
  const { handlePlay, currentTrackId, isPlaying } = useAudioPlayback()
  const { updateAudioFile } = useAudioFileStore()
  const { addAudioToPlaylist } = useAudioPlaylistStore()
  const { addToast } = useToastStore()

  if (!contextMenu) return null

  const handleAddTag = async (audioFile: AudioFile, newTag: string) => {
    if (!newTag.trim()) return

    const tags = audioFile.tags || []
    if (tags.includes(newTag)) {
      addToast('Tag already exists', 'error')
      return
    }

    await updateAudioFile(audioFile.id, { tags: [...tags, newTag] })
    addToast('Tag added', 'success')
  }

  const handleRemoveTag = async (audioFile: AudioFile, tagToRemove: string) => {
    const tags = audioFile.tags || []
    await updateAudioFile(audioFile.id, { tags: tags.filter(t => t !== tagToRemove) })
    addToast('Tag removed', 'success')
  }

  const handleAddToPlaylist = async (audioFile: AudioFile, playlistId: string) => {
    await addAudioToPlaylist(playlistId, audioFile.id)
    const playlist = playlists.find(p => p.id === playlistId)
    addToast(`Added to "${playlist?.name}"`, 'success')
    setContextMenu(null)
    setShowAddToSubmenu(false)
  }

  const handleMenuItemHover = () => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current)
      closeMenuTimeoutRef.current = null
    }
    setShowTagsSubmenu(false)
    setShowAddToSubmenu(false)
  }

  return (
    <div
      className="fixed z-[60] bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[180px] py-1"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }}
      onMouseLeave={() => {
        closeMenuTimeoutRef.current = setTimeout(() => {
          if (tagInputRef.current === document.activeElement) return
          setContextMenu(null)
          setShowTagsSubmenu(false)
        }, 200)
      }}
    >
      {!contextMenu.audioFile ? (
        <button
          onClick={() => {
            onUploadNew()
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
            onMouseEnter={handleMenuItemHover}
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
            onClick={() => onRename(contextMenu.audioFile!)}
            onMouseEnter={handleMenuItemHover}
            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Rename
          </button>

          {/* Tags Submenu */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (closeMenuTimeoutRef.current) {
                clearTimeout(closeMenuTimeoutRef.current)
                closeMenuTimeoutRef.current = null
              }
              setShowAddToSubmenu(false)
              setShowTagsSubmenu(true)
            }}
            onMouseLeave={() => {
              closeMenuTimeoutRef.current = setTimeout(() => {
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

            {showTagsSubmenu && contextMenu.audioFile && (
              <div className="absolute left-full top-0 ml-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[220px] max-w-[280px] p-3">
                <div className="space-y-2">
                  {contextMenu.audioFile.tags && contextMenu.audioFile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
                      {contextMenu.audioFile.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleRemoveTag(contextMenu.audioFile!, tag)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[11px] rounded-md transition-colors group"
                        >
                          {tag}
                          <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}

                  <input
                    ref={tagInputRef}
                    type="text"
                    placeholder="Search or create tag..."
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.currentTarget
                        handleAddTag(contextMenu.audioFile!, input.value)
                        input.value = ''
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Add To Submenu */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (closeMenuTimeoutRef.current) {
                clearTimeout(closeMenuTimeoutRef.current)
                closeMenuTimeoutRef.current = null
              }
              setShowTagsSubmenu(false)
              setShowAddToSubmenu(true)
            }}
            onMouseLeave={() => {
              closeMenuTimeoutRef.current = setTimeout(() => {
                setShowAddToSubmenu(false)
              }, 200)
            }}
          >
            <button
              className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center justify-between transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowAddToSubmenu(true)
              }}
            >
              <span className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                Add to
              </span>
              <ChevronRight className="w-3 h-3 text-white/40" />
            </button>

            {showAddToSubmenu && contextMenu.audioFile && (
              <div className="absolute left-full top-0 ml-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[180px] max-h-[300px] overflow-y-auto scrollbar-custom">
                <button
                  onClick={() => {
                    onAddToNewPlaylist(contextMenu.audioFile!)
                    setContextMenu(null)
                    setShowAddToSubmenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Playlist
                </button>

                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(contextMenu.audioFile!, playlist.id)}
                      className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors truncate"
                    >
                      {playlist.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-[13px] text-white/40">
                    No playlists yet
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 my-1" />

          <button
            onClick={() => {
              onDelete(contextMenu.audioFile!)
              setContextMenu(null)
            }}
            onMouseEnter={handleMenuItemHover}
            className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </>
      )}
    </div>
  )
}
