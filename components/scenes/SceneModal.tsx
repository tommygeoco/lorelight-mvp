'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Music } from 'lucide-react'
import { useSceneStore } from '@/store/sceneStore'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useModalBackdrop } from '@/hooks/useModalBackdrop'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { logger } from '@/lib/utils/logger'
import { STRINGS } from '@/lib/constants/strings'
import type { Scene } from '@/types'

interface SceneModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  sessionId?: string // If provided, add scene to session after creation
  scene?: Scene // If provided, edit mode
}

export function SceneModal({ isOpen, onClose, campaignId, sessionId, scene }: SceneModalProps) {
  const { createScene, updateScene, deleteScene } = useSceneStore()
  const { addSceneToSession } = useSessionSceneStore()
  const audioFileMap = useAudioFileMap()
  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose })
  const [name, setName] = useState('')
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isEditMode = !!scene

  // Initialize form with scene data in edit mode
  useEffect(() => {
    if (isEditMode && scene) {
      setName(scene.name)
      // Extract audio_id from audio_config JSON
      const audioConfig = scene.audio_config as { audio_id?: string } | null
      setSelectedAudioId(audioConfig?.audio_id || null)
    } else {
      // Reset form in create mode
      setName('')
      setSelectedAudioId(null)
    }
  }, [isEditMode, scene])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const audioConfig = selectedAudioId ? { audio_id: selectedAudioId } : null

      if (isEditMode && scene) {
        // Update existing scene
        await updateScene(scene.id, {
          name: name.trim(),
          audio_config: audioConfig,
        })
      } else {
        // Create new scene
        const newScene = await createScene({
          campaign_id: campaignId,
          name: name.trim(),
          scene_type: 'default',
          audio_config: audioConfig,
          is_active: false,
          order_index: 0,
        })

        // If sessionId provided, add scene to session
        if (sessionId) {
          await addSceneToSession(sessionId, newScene.id)
        }
      }
      onClose()
    } catch (error) {
      logger.error(`Failed to ${isEditMode ? 'update' : 'create'} scene`, error, {
        campaignId,
        sessionId,
        sceneName: name,
        sceneId: scene?.id,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!scene) return

    setIsDeleting(true)
    try {
      await deleteScene(scene.id)
      setIsDeleteDialogOpen(false)
      onClose()
    } catch (error) {
      logger.error('Failed to delete scene', error, { sceneId: scene.id })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="bg-[var(--card-surface)] border border-white/10 rounded-[8px] w-[402px] max-h-[85vh] shadow-2xl flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
              <h2 className="text-[16px] font-semibold text-white">
                {isEditMode ? STRINGS.scenes.edit : STRINGS.scenes.create}
              </h2>
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-10 h-10 rounded-[8px] hover:bg-red-500/10 flex items-center justify-center transition-colors group"
                  >
                    <Trash2 className="w-[18px] h-[18px] text-white/40 group-hover:text-red-400" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
                >
                  <X className="w-[18px] h-[18px] text-white/70" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-6 space-y-5 overflow-y-auto flex-1 scrollbar-custom">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="scene-name" className="block text-[14px] font-semibold text-[#eeeeee]">
                  {STRINGS.scenes.nameLabel}
                </label>
                <input
                  id="scene-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={STRINGS.scenes.namePlaceholder}
                  required
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Audio Selection */}
              <div className="space-y-2">
                <label className="block text-[14px] font-semibold text-[#eeeeee]">
                  Scene Audio
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAudioLibraryOpen(true)}
                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Music className="w-4 h-4 text-white/70" />
                    <span className="text-white/70">
                      {selectedAudioId && audioFileMap.get(selectedAudioId)
                        ? audioFileMap.get(selectedAudioId)!.name
                        : 'Select audio track...'}
                    </span>
                  </button>
                  {selectedAudioId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedAudioId(null)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors"
              >
                {STRINGS.common.cancel}
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting
                  ? isEditMode
                    ? STRINGS.common.saving
                    : STRINGS.common.creating
                  : isEditMode
                  ? STRINGS.common.save
                  : STRINGS.scenes.create}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isEditMode && scene && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title={STRINGS.scenes.deleteConfirmTitle}
          description={STRINGS.scenes.deleteConfirmDescription}
          confirmText={STRINGS.common.delete}
          variant="destructive"
          isLoading={isDeleting}
        />
      )}

      {/* Audio Library Modal */}
      <AudioLibrary
        isOpen={isAudioLibraryOpen}
        onClose={() => setIsAudioLibraryOpen(false)}
        onSelect={(audioFile) => {
          setSelectedAudioId(audioFile.id)
          setIsAudioLibraryOpen(false)
        }}
      />
    </>
  )
}
