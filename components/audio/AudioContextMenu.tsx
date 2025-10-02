'use client'

import { useRef, useState } from 'react'
import { Upload, Play, Pause, Edit2, Tag, ChevronRight, Trash2, Plus, X } from 'lucide-react'
import { useAudioPlayback } from '@/hooks/useAudioPlayback'
import { useAudioFileStore } from '@/store/audioFileStore'
import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
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
  allTags: string[]
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
  allTags,
}: AudioContextMenuProps) {
  const tagInputRef = useRef<HTMLInputElement>(null)
  const isInputFocusedRef = useRef(false)
  const [tagInput, setTagInput] = useState('')

  const { handlePlay, currentTrackId, isPlaying } = useAudioPlayback()
  const { updateAudioFile } = useAudioFileStore()
  const { addAudioToPlaylist } = useAudioPlaylistStore()
  const audioFileMap = useAudioFileMap()
  const { addToast } = useToastStore()

  if (!contextMenu) return null

  const handleAddTagToFile = async (audioFile: AudioFile, newTag: string) => {
    if (!newTag.trim()) return

    // Get current tags from the store to ensure we have the latest data
    const currentFile = audioFileMap.get(audioFile.id)
    const tags = currentFile?.tags || []
    const tagToAdd = newTag.trim().toLowerCase()
    if (tags.includes(tagToAdd)) {
      addToast('Tag already exists', 'error')
      return
    }

    await updateAudioFile(audioFile.id, { tags: [...tags, tagToAdd] })
    addToast('Tag added', 'success')
  }

  const handleRemoveTagFromFile = async (audioFile: AudioFile, tagToRemove: string) => {
    // Get current tags from the store to ensure we have the latest data
    const currentFile = audioFileMap.get(audioFile.id)
    const tags = currentFile?.tags || []
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
    setShowTagsSubmenu(false)
    setShowAddToSubmenu(false)
  }

  return (
    <div
      data-context-menu
      className="fixed z-[60] bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[180px] py-1"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
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
              setShowAddToSubmenu(false)
              setShowTagsSubmenu(true)
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

            {showTagsSubmenu && contextMenu.audioFile && (() => {
              const viewportHeight = window.innerHeight
              const spaceBelow = viewportHeight - contextMenu.y
              const shouldPositionFromBottom = spaceBelow < 400

              // Get fresh data from the store
              const currentFile = audioFileMap.get(contextMenu.audioFile.id)
              const currentTags = currentFile?.tags || []

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
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Current tags */}
                  {currentTags.length > 0 && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                      {[...currentTags].sort().map(tag => (
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
                      onChange={(e) => setTagInput(e.target.value)}
                      onFocus={(e) => {
                        isInputFocusedRef.current = true
                        e.stopPropagation()
                      }}
                      onBlur={() => {
                        isInputFocusedRef.current = false
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault()
                          handleAddTagToFile(contextMenu.audioFile!, tagInput)
                          setTagInput('')
                          setTimeout(() => tagInputRef.current?.focus(), 0)
                        }
                      }}
                      placeholder="Search or create tag..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-[6px] text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Create new tag option */}
                  {tagInput.trim() && !allTags.includes(tagInput.trim().toLowerCase()) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddTagToFile(contextMenu.audioFile!, tagInput)
                          setTagInput('')
                          setTimeout(() => tagInputRef.current?.focus(), 0)
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
                  <div className="overflow-y-auto flex-1 scrollbar-custom">
                    {allTags
                      .filter(tag => {
                        if (tagInput.trim()) {
                          return tag.toLowerCase().includes(tagInput.toLowerCase())
                        }
                        return !currentTags.includes(tag)
                      })
                      .sort()
                      .map(tag => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddTagToFile(contextMenu.audioFile!, tag)
                            setTagInput('')
                            setTimeout(() => tagInputRef.current?.focus(), 0)
                          }}
                          className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Add To Submenu */}
          <div
            className="relative"
            onMouseEnter={() => {
              setShowTagsSubmenu(false)
              setShowAddToSubmenu(true)
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
