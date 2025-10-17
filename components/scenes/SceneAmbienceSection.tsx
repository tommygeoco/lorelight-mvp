'use client'

import { useState } from 'react'
import { Lightbulb, Music } from 'lucide-react'
import type { Scene, SceneAudioConfig, SceneLightConfig, AudioFile } from '@/types'
import type { Json } from '@/types/database'
import { useAudioFileStore } from '@/store/audioFileStore'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { LightConfigModal } from './LightConfigModal'

interface SceneAmbienceSectionProps {
  scene: Scene
  campaignId: string
  sessionId?: string
}

/**
 * SceneAmbienceSection - Audio and lighting configuration cards
 * Context7: 2-column grid matching Figma design, now interactive
 */
export function SceneAmbienceSection({ scene, sessionId }: SceneAmbienceSectionProps) {
  const audioFiles = useAudioFileStore((state) => state.audioFiles)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isLightConfigOpen, setIsLightConfigOpen] = useState(false)
  
  // Parse audio config
  const audioConfig = scene.audio_config as SceneAudioConfig | null
  const audioFile = audioConfig ? audioFiles.get(audioConfig.audio_id) : null

  // Parse light config
  const lightConfig = scene.light_config as SceneLightConfig | null
  const configWithFlag = lightConfig as { lights?: Record<string, unknown>, lightsOff?: boolean } | null
  const hasLights = !!(lightConfig?.groups || lightConfig?.lights || configWithFlag?.lightsOff)

  const handleAudioSelect = async (audioFile: AudioFile) => {
    const { useSceneStore } = await import('@/store/sceneStore')
    const { useSessionSceneStore } = await import('@/store/sessionSceneStore')

    const newConfig: SceneAudioConfig = {
      audio_id: audioFile.id,
      volume: 0.7,
      loop: true,
      start_time: 0
    }

    // Update sceneStore (DB)
    await useSceneStore.getState().updateScene(scene.id, { audio_config: newConfig as unknown as Json })

    // Update sessionSceneStore (UI) - use the action to increment _version
    if (sessionId) {
      useSessionSceneStore.getState().updateSceneInSession(sessionId, scene.id, {
        audio_config: newConfig as unknown as Scene['audio_config'],
        updated_at: new Date().toISOString()
      })
    }

    setIsAudioLibraryOpen(false)
  }

  const handleLightSave = async (config: unknown) => {
    const { useSceneStore } = await import('@/store/sceneStore')
    const { useSessionSceneStore } = await import('@/store/sessionSceneStore')
    const { useToastStore } = await import('@/store/toastStore')

    try {
      // Update database
      await useSceneStore.getState().updateScene(scene.id, { light_config: config as Json })

      // Ensure sessionSceneStore is updated
      if (sessionId) {
        useSessionSceneStore.getState().updateSceneInSession(sessionId, scene.id, {
          light_config: config as unknown as Scene['light_config'],
          updated_at: new Date().toISOString()
        })
      }

      useToastStore.getState().addToast('Lighting configuration saved', 'success')
    } catch (error) {
      console.error('Failed to save light config:', error)
      useToastStore.getState().addToast('Failed to save lighting configuration', 'error')
      throw error
    }
  }

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="pb-0 pt-[24px]">
        <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">
          Ambience
        </h2>
      </div>

      {/* 2-column grid */}
      <div className="flex gap-[16px] px-0 py-[24px]">
        {/* Lighting card */}
        <button
          onClick={() => setIsLightConfigOpen(true)}
          className="basis-0 grow min-w-px bg-[#222222] rounded-[12px] p-[16px] shadow-md relative overflow-hidden cursor-pointer hover:bg-[#252525] transition-colors text-left"
        >
          {/* Gradient background for lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[146px] top-[-45px] w-[250px] h-[200px]">
              <div className="w-full h-full rounded-full bg-purple-400/20 blur-[80px]" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-[24px]">
            {/* Icon placeholder */}
            <div className="w-[64px] h-[64px] bg-white/5 rounded-[6px] shadow-lg" />

            {/* Text */}
            <div className="flex flex-col gap-[6px]">
              <h3 className="font-['Inter'] text-[16px] font-bold leading-[24px] text-white">
                Lighting
              </h3>
              <p className="font-['Inter'] text-[14px] font-medium leading-[20px] text-white/60">
                {configWithFlag?.lightsOff ? 'Lights off' : hasLights ? 'Custom preset' : 'No lighting configured'}
              </p>
            </div>

            {/* Icon indicator */}
            <div className="absolute right-[12px] top-[16px] opacity-40">
              <Lightbulb className="w-[18px] h-[18px] text-white" />
            </div>
          </div>
        </button>

        {/* Audio card */}
        <button
          onClick={() => setIsAudioLibraryOpen(true)}
          className="basis-0 grow min-w-px bg-[#222222] rounded-[12px] p-[16px] shadow-md relative overflow-hidden cursor-pointer hover:bg-[#252525] transition-colors text-left"
        >
          {/* Gradient background with image tint if audio exists */}
          {audioFile && (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-800/20 backdrop-blur-[50px]" />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-[24px]">
            {/* Album art placeholder */}
            <div className="w-[64px] h-[64px] bg-white/5 rounded-[6px] shadow-lg overflow-hidden" />

            {/* Text */}
            <div className="flex flex-col gap-[6px]">
              <h3 className="font-['Inter'] text-[16px] font-bold leading-[24px] text-white truncate">
                {audioFile?.name || 'No audio'}
              </h3>
              <p className="font-['Inter'] text-[14px] font-medium leading-[20px] text-white/60 truncate">
                {audioFile ? `${(audioFile.duration || 0 / 60).toFixed(0)} min` : 'No audio configured'}
              </p>
            </div>

            {/* Icon indicator */}
            <div className="absolute right-[16px] top-[16px] opacity-40">
              <Music className="w-[18px] h-[18px] text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Modals */}
      <AudioLibrary
        isOpen={isAudioLibraryOpen}
        onClose={() => setIsAudioLibraryOpen(false)}
        onSelect={handleAudioSelect}
      />

      <LightConfigModal
        key={`light-config-${scene.id}`}
        isOpen={isLightConfigOpen}
        onClose={() => setIsLightConfigOpen(false)}
        onSave={handleLightSave}
        initialConfig={lightConfig}
      />
    </div>
  )
}
