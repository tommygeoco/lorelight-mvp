'use client'

import { useState } from 'react'
import { X, Trash2, Music, Lightbulb } from 'lucide-react'
import { useSceneStore } from '@/store/sceneStore'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useModalBackdrop } from '@/hooks/useModalBackdrop'
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { LightConfigModal } from '@/components/scenes/LightConfigModal'
import { STRINGS } from '@/lib/constants/strings'

interface SceneModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  sessionId?: string // If provided, add scene to session after creation
  sceneId?: string // If provided, edit mode
}

export function SceneModal({ isOpen, onClose, campaignId, sessionId, sceneId }: SceneModalProps) {
  const { scenes, createScene, updateScene, deleteScene } = useSceneStore()
  const scene = sceneId ? scenes.get(sceneId) : undefined
  const { addSceneToSession } = useSessionSceneStore()
  const audioFileMap = useAudioFileMap()
  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose })
  const [name, setName] = useState('')
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null)
  const [audioVolume, setAudioVolume] = useState(70) // 0-100
  const [audioLoop, setAudioLoop] = useState(true)
  const [lightConfig, setLightConfig] = useState<unknown>(null)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isLightPickerOpen, setIsLightPickerOpen] = useState(false)

  const {
    isEditMode,
    isSubmitting,
    isDeleting,
    isDeleteDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    handleSubmit,
    handleDelete,
  } = useFormSubmission({
    entity: scene,
    onCreate: async (data) => {
      const newScene = await createScene(data)
      // If sessionId provided, add scene to session
      if (sessionId) {
        await addSceneToSession(sessionId, newScene.id)
      }
      return newScene
    },
    onUpdate: updateScene,
    onDelete: deleteScene,
    onSuccess: onClose,
    getId: (s) => s.id,
    initializeFields: (s) => {
      setName(s.name)
      const audioConfig = s.audio_config as { audio_id?: string; volume?: number; loop?: boolean } | null
      setSelectedAudioId(audioConfig?.audio_id || null)
      setAudioVolume(audioConfig?.volume ? Math.round(audioConfig.volume * 100) : 70)
      setAudioLoop(audioConfig?.loop !== undefined ? audioConfig.loop : true)
      setLightConfig(s.light_config)
    },
    resetFields: () => {
      setName('')
      setSelectedAudioId(null)
      setAudioVolume(70)
      setAudioLoop(true)
      setLightConfig(null)
    },
    buildCreateData: () => ({
      campaign_id: campaignId,
      name: name.trim(),
      scene_type: 'default' as const,
      audio_config: selectedAudioId ? {
        audio_id: selectedAudioId,
        volume: audioVolume / 100, // Convert to 0-1
        loop: audioLoop
      } : null,
      light_config: lightConfig as never,
      is_active: false,
      order_index: 0,
    }),
    buildUpdateData: () => ({
      name: name.trim(),
      audio_config: selectedAudioId ? {
        audio_id: selectedAudioId,
        volume: audioVolume / 100,
        loop: audioLoop
      } : null,
      light_config: lightConfig as never,
    }),
    validate: () => name.trim().length > 0,
    entityType: 'scene',
    logContext: { campaignId, sessionId, sceneName: name },
  })

  if (!isOpen) return null

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
                    onClick={openDeleteDialog}
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

                {/* Audio Controls (only if audio selected) */}
                {selectedAudioId && (
                  <div className="space-y-3 pt-3">
                    {/* Volume */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] text-white/70">Volume</label>
                        <span className="text-[13px] text-white/50">{audioVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none slider cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${audioVolume}%, rgba(255, 255, 255, 0.1) ${audioVolume}%)`
                        }}
                      />
                    </div>

                    {/* Loop */}
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] text-white/70">Loop Audio</label>
                      <button
                        type="button"
                        onClick={() => setAudioLoop(!audioLoop)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          audioLoop ? 'bg-purple-500' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            audioLoop ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Light Configuration */}
              <div className="space-y-2">
                <label className="block text-[14px] font-semibold text-[#eeeeee]">
                  Scene Lighting
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLightPickerOpen(true)}
                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4 text-white/70" />
                    <span className="text-white/70">
                      {lightConfig ? 'Light configuration saved' : 'Configure lights...'}
                    </span>
                  </button>
                  {!!lightConfig && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setLightConfig(null)
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
          onClose={closeDeleteDialog}
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

      {/* Light Configuration Modal */}
      <LightConfigModal
        isOpen={isLightPickerOpen}
        onClose={() => setIsLightPickerOpen(false)}
        onSave={(config) => setLightConfig(config)}
        initialConfig={lightConfig}
      />
    </>
  )
}
