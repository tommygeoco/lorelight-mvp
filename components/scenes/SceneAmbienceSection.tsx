'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Play, Pause, Edit2 } from 'lucide-react'
import type { Scene, LightConfig } from '@/types'
import { AddButton } from '@/components/ui/AddButton'
import { useSceneLightConfigStore } from '@/store/sceneLightConfigStore'
import { useSceneAudioFileStore } from '@/store/sceneAudioFileStore'
import { useAudioFileStore } from '@/store/audioFileStore'
import { useLightConfigStore } from '@/store/lightConfigStore'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { LightConfigModal } from './LightConfigModal'
import { LightingRow } from './light-config/LightingRow'
import { AudioRow } from './light-config/AudioRow'
import { useToastStore } from '@/store/toastStore'
import { useAudioStore } from '@/store/audioStore'

interface SceneAmbienceSectionProps {
  scene: Scene
  campaignId: string
  sessionId?: string
}

/**
 * SceneAmbienceSection - Multi-config audio and lighting management
 * Redesigned with Lighting and Audio subsections using row-based UI
 */
export function SceneAmbienceSection({ scene }: SceneAmbienceSectionProps) {
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isLightConfigOpen, setIsLightConfigOpen] = useState(false)
  const [editingLightConfig, setEditingLightConfig] = useState<string | null>(null)
  const [lightContextMenu, setLightContextMenu] = useState<{
    x: number
    y: number
    configId: string
    isActive: boolean
  } | null>(null)
  const [audioContextMenu, setAudioContextMenu] = useState<{
    x: number
    y: number
    audioFileId: string
    isPlaying: boolean
  } | null>(null)
  
  const { isPlaying: globalIsPlaying, currentTrackId } = useAudioStore()

  // Stores
  const {
    configs: sceneLightConfigs,
    sceneConfigs: sceneLightConfigIds,
    fetchConfigsForScene: fetchLightConfigs,
    addConfig: addLightConfig,
    removeConfig: removeLightConfig,
    setSelectedConfig: setSelectedLightConfig,
    _version: lightVersion
  } = useSceneLightConfigStore()

  const {
    audioFiles: sceneAudioFiles,
    sceneAudioFiles: sceneAudioFileIds,
    fetchAudioFilesForScene,
    addAudioFile,
    removeAudioFile,
    setSelectedAudioFile,
    _version: audioVersion
  } = useSceneAudioFileStore()

  const audioFiles = useAudioFileStore((state) => state.audioFiles)
  const lightConfigs = useLightConfigStore((state) => state.lightConfigs)
  const { addToast } = useToastStore()

  // Data is preloaded by SceneEditor - no fetching here for instant display

  // Get configs for this scene
  const sceneLights = useMemo(() => {
    const ids = sceneLightConfigIds.get(scene.id) || []
    return ids.map(id => sceneLightConfigs.get(id)).filter(Boolean)
  }, [sceneLightConfigs, sceneLightConfigIds, scene.id, lightVersion])

  const sceneAudios = useMemo(() => {
    const ids = sceneAudioFileIds.get(scene.id) || []
    return ids.map(id => sceneAudioFiles.get(id)).filter(Boolean)
  }, [sceneAudioFiles, sceneAudioFileIds, scene.id, audioVersion])

  // Close context menus on click
  useEffect(() => {
    const handleClick = () => {
      setLightContextMenu(null)
      setAudioContextMenu(null)
    }
    if (lightContextMenu || audioContextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [lightContextMenu, audioContextMenu])

  const handleAddLightConfig = () => {
    setEditingLightConfig(null) // Ensure we're creating new, not editing
    setIsLightConfigOpen(true)
  }

  const handleLightConfigSave = async (config: unknown) => {
    try {
      if (editingLightConfig) {
        // Update existing light config
        await useLightConfigStore.getState().updateLightConfig(editingLightConfig, {
          rgb_color: config as any
        })
        addToast('Lights updated', 'success')
      } else {
        // Create new light config in the database
        const lightConfig = await useLightConfigStore.getState().createLightConfig({
          name: 'Scene Lighting',
          brightness: 100,
          color_temp: null,
          rgb_color: config as any,
          transition_duration: 400,
          room_ids: []
        })

        // Then add it to this scene
        await addLightConfig(scene.id, lightConfig.id)
        addToast('Lighting added', 'success')
      }
      
      setIsLightConfigOpen(false)
      setEditingLightConfig(null)
    } catch (error) {
      console.error('Failed to save lighting:', error)
      addToast('Failed to save lighting', 'error')
    }
  }

  const handleAddAudio = () => {
    setIsAudioLibraryOpen(true)
  }

  const handleAudioSelect = async (audioFile: { id: string }) => {
    try {
      await addAudioFile(scene.id, audioFile.id)
      addToast('Audio added', 'success')
      setIsAudioLibraryOpen(false)
    } catch (error) {
      console.error('Failed to add audio:', error)
      addToast('Failed to add audio', 'error')
    }
  }

  const handleActivateLight = async (sceneLightConfigId: string) => {
    try {
      // Mark as selected
      await setSelectedLightConfig(scene.id, sceneLightConfigId)
      
      // Get the light config and apply it via Hue
      const sceneLightConfig = sceneLightConfigs.get(sceneLightConfigId)
      if (sceneLightConfig) {
        const lightConfig = lightConfigs.get(sceneLightConfig.light_config_id)
        if (lightConfig && lightConfig.rgb_color) {
          const { useHueStore } = await import('@/store/hueStore')
          await useHueStore.getState().applyLightConfig(lightConfig.rgb_color as Record<string, unknown>)
        }
      }
      
      addToast('Lights activated', 'success')
    } catch (error) {
      console.error('Failed to activate lights:', error)
      addToast('Failed to activate lights', 'error')
    }
  }

  // Audio playback is handled directly in AudioRow component via useAudioPlayback hook

  const handleRemoveLight = async (sceneLightConfigId: string) => {
    try {
      await removeLightConfig(sceneLightConfigId)
      addToast('Lighting removed', 'success')
    } catch (error) {
      console.error('Failed to remove lighting:', error)
      addToast('Failed to remove lighting', 'error')
    }
  }

  const handleRemoveAudio = async (sceneAudioFileId: string) => {
    try {
      await removeAudioFile(sceneAudioFileId)
      addToast('Audio removed', 'success')
    } catch (error) {
      console.error('Failed to remove audio:', error)
      addToast('Failed to remove audio', 'error')
    }
  }

  return (
    <div className="w-full">
      {/* Lighting Section */}
      <div className="pt-[24px]">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">Lighting</h2>
          {sceneLights.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-[6px] text-[11px] text-white/70">
              {sceneLights.length}
            </span>
          )}
      </div>

        {sceneLights.length === 0 ? (
          <AddButton onClick={handleAddLightConfig}>
            Add lights
          </AddButton>
        ) : (
          <div>
            {/* Lighting rows - table style matching audio */}
            <div className="border border-white/10 rounded-[8px] overflow-hidden">
              {sceneLights.map((sceneLight) => {
                const lightConfig = lightConfigs.get(sceneLight!.light_config_id)
                // For now, we don't track active state for lights, so always false
                const isActive = false
                return (
                  <LightingRow
                    key={sceneLight!.id}
                    sceneLightConfig={sceneLight!}
                    lightConfig={lightConfig}
                    onActivate={() => handleActivateLight(sceneLight!.id)}
                    onRemove={() => handleRemoveLight(sceneLight!.id)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setLightContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        configId: sceneLight!.id,
                        isActive
                      })
                    }}
                  />
                )
              })}
            </div>
            {/* Add button below the table */}
            <div className="mt-2">
              <AddButton onClick={handleAddLightConfig}>
                Add lighting
              </AddButton>
            </div>
          </div>
        )}
      </div>

      {/* Audio Section */}
      <div className="pt-[48px]">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">Audio</h2>
          {sceneAudios.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-[6px] text-[11px] text-white/70">
              {sceneAudios.length}
            </span>
          )}
        </div>

        {sceneAudios.length === 0 ? (
          <AddButton onClick={handleAddAudio}>
            Add audio track
          </AddButton>
        ) : (
          <div>
            {/* Audio rows - table style with borders, no spacing */}
            <div className="border border-white/10 rounded-[8px] overflow-hidden">
            {sceneAudios.map((sceneAudio) => {
              const audioFile = audioFiles.get(sceneAudio!.audio_file_id)
              const isPlaying = !!(audioFile && currentTrackId === audioFile.id && globalIsPlaying)
              
              return (
                <AudioRow
                  key={sceneAudio!.id}
                  sceneAudioFile={sceneAudio!}
                  audioFile={audioFile}
                  isPlaying={isPlaying}
                  onPlay={() => {}} // Not used - AudioRow handles playback internally
                  onRemove={() => handleRemoveAudio(sceneAudio!.id)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setAudioContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      audioFileId: sceneAudio!.id,
                      isPlaying
                    })
                  }}
                />
              )
            })}
            </div>
            {/* Add button below the table */}
            <div className="mt-2">
              <AddButton onClick={handleAddAudio}>
                Add audio
              </AddButton>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AudioLibrary
        isOpen={isAudioLibraryOpen}
        onClose={() => setIsAudioLibraryOpen(false)}
        onSelect={handleAudioSelect}
      />

      <LightConfigModal
        isOpen={isLightConfigOpen}
        onClose={() => {
          setIsLightConfigOpen(false)
          setEditingLightConfig(null)
        }}
        onSave={handleLightConfigSave}
        initialConfig={editingLightConfig ? lightConfigs.get(editingLightConfig)?.rgb_color : undefined}
      />

      {/* Light Context Menu */}
      {lightContextMenu && (
        <div
          className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
          style={{
            left: `${lightContextMenu.x}px`,
            top: `${lightContextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleActivateLight(lightContextMenu.configId)
              setLightContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            {lightContextMenu.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => {
              const sceneLightConfig = sceneLightConfigs.get(lightContextMenu.configId)
              if (sceneLightConfig) {
                const lightConfig = lightConfigs.get(sceneLightConfig.light_config_id)
                if (lightConfig) {
                  setEditingLightConfig(sceneLightConfig.light_config_id)
                  setIsLightConfigOpen(true)
                }
              }
              setLightContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button
            onClick={() => {
              handleRemoveLight(lightContextMenu.configId)
              setLightContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Remove from Scene
          </button>
        </div>
      )}

      {/* Audio Context Menu */}
      {audioContextMenu && (
        <div
          className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
          style={{
            left: `${audioContextMenu.x}px`,
            top: `${audioContextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={async () => {
              if (audioContextMenu.isPlaying) {
                // Pause the audio
                useAudioStore.getState().pause()
              } else {
                // Find the audio file and play it
                const sceneAudio = sceneAudioFiles.get(audioContextMenu.audioFileId)
                if (sceneAudio) {
                  const audioFile = audioFiles.get(sceneAudio.audio_file_id)
                  if (audioFile && audioFile.file_url) {
                    const audioStore = useAudioStore.getState()
                    if (audioStore.currentTrackId === audioFile.id) {
                      audioStore.togglePlay()
                    } else {
                      await audioStore.loadTrack(audioFile.id, audioFile.file_url, {
                        type: 'scene' as const,
                        id: scene.id,
                        name: scene.name
                      })
                      setTimeout(() => audioStore.play(), 100)
                    }
                  }
                }
              }
              setAudioContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            {audioContextMenu.isPlaying ? (
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
          <div className="h-px bg-white/10 my-1" />
          <button
            onClick={() => {
              handleRemoveAudio(audioContextMenu.audioFileId)
              setAudioContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Remove from Scene
          </button>
        </div>
      )}
    </div>
  )
}
