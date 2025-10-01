'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Music, Trash2, Play, Pause, X, Folder, ChevronRight } from 'lucide-react'
import { useAudioFileStore } from '@/store/audioFileStore'
import { useAudioFolderStore } from '@/store/audioFolderStore'
import { useAudioStore } from '@/store/audioStore'
import { useToastStore } from '@/store/toastStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useModalBackdrop } from '@/hooks/useModalBackdrop'
import { logger } from '@/lib/utils/logger'
import { formatTime } from '@/lib/utils/time'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import type { AudioFile } from '@/types'

interface AudioLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (audioFile: AudioFile) => void
}

export function AudioLibrary({ isOpen, onClose, onSelect }: AudioLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadName, setUploadName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<AudioFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    isLoading,
    isUploading,
    fetchAudioFiles,
    uploadAudioFile,
    deleteAudioFile,
  } = useAudioFileStore()

  const {
    fetchAllFolders,
    getFolderPath,
    getSubfolders,
  } = useAudioFolderStore()

  const { currentTrackId, isPlaying, loadTrack, togglePlay } = useAudioStore()
  const audioFileMap = useAudioFileMap()
  const { addToast } = useToastStore()
  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose })

  // Filter audio files by current folder
  const audioFileArray = Array.from(audioFileMap.values()).filter(f => {
    if (!f.file_url || f.file_url.length === 0) return false
    // Show files that match current folder (null = root folder)
    return f.folder_id === currentFolderId
  })

  // Get breadcrumb path and subfolders
  const breadcrumbPath = currentFolderId ? getFolderPath(currentFolderId) : []
  const subfolders = getSubfolders(currentFolderId)

  useEffect(() => {
    if (isOpen) {
      fetchAudioFiles()
      fetchAllFolders()
    }
  }, [isOpen, fetchAudioFiles, fetchAllFolders])

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadName(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadName.trim()) return

    try {
      await uploadAudioFile(selectedFile, uploadName.trim())
      setSelectedFile(null)
      setUploadName('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      logger.error('Upload failed', error)
    }
  }

  const handleDeleteClick = (audioFile: AudioFile, e: React.MouseEvent) => {
    e.stopPropagation()
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

  const handlePlay = async (audioFile: AudioFile, e: React.MouseEvent) => {
    e.stopPropagation()

    // Check if this track is already loaded (ID matches AND URL matches)
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
      // Wait for loadTrack to complete, then play
      // The audio element needs time to set src and load metadata
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--card-surface)] border border-white/10 rounded-[8px] w-[800px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-[16px] font-semibold text-white">Audio Library</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <X className="w-[18px] h-[18px] text-white/70" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2 text-sm">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`hover:text-white transition-colors ${
              currentFolderId === null ? 'text-white font-medium' : 'text-white/60'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-1" />
            Root
          </button>
          {breadcrumbPath.map((folder) => (
            <div key={folder.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-white/40" />
              <button
                onClick={() => setCurrentFolderId(folder.id)}
                className={`hover:text-white transition-colors ${
                  currentFolderId === folder.id ? 'text-white font-medium' : 'text-white/60'
                }`}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <div className="px-6 py-4 border-b border-white/10">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-white/40" />
                <span className="text-sm text-white/70">{selectedFile.name}</span>
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setUploadName('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="ml-auto text-white/40 hover:text-white/70"
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
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[8px] transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5 text-white/70" />
              <span className="text-[14px] font-medium text-white/70">Choose Audio File</span>
            </button>
          )}
        </div>

        {/* Folders and Audio List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="text-center py-8 text-white/40">Loading...</div>
          ) : (
            <div className="space-y-2">
              {/* Subfolder List */}
              {subfolders.length > 0 && (
                <div className="space-y-2 mb-4">
                  {subfolders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="w-full flex items-center gap-4 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.07] rounded-[8px] transition-colors cursor-pointer"
                    >
                      <Folder className="w-5 h-5 text-white/70" />
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-white">
                          {folder.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Files */}
              {audioFileArray.length === 0 && subfolders.length === 0 ? (
                <EmptyState
                  title={currentFolderId ? "No audio files in this folder" : "No audio files yet. Upload your first track!"}
                  variant="inline"
                />
              ) : (
                audioFileArray.map((audioFile) => (
                <div
                  key={audioFile.id}
                  onClick={() => onSelect?.(audioFile)}
                  className="w-full flex items-center gap-4 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.07] rounded-[8px] transition-colors group cursor-pointer"
                >
                  {/* Play Button */}
                  <button
                    onClick={(e) => handlePlay(audioFile, e)}
                    className="w-10 h-10 rounded-[8px] bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {currentTrackId === audioFile.id && isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>

                  {/* Audio Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[14px] font-medium text-white truncate">
                      {audioFile.name}
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      {formatDuration(audioFile.duration)} • {formatFileSize(audioFile.file_size)}
                      {audioFile.tags && audioFile.tags.length > 0 && (
                        <> • {audioFile.tags.join(', ')}</>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteClick(audioFile, e)}
                    className="w-8 h-8 rounded-[8px] hover:bg-red-500/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              ))
              )}
            </div>
          )}
        </div>
      </div>

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
    </div>
  )
}
