'use client'

import { useState } from 'react'
import type { Scene, SceneAudioConfig, SceneLightConfig, AudioFile } from '@/types'
import type { Json } from '@/types/database'
import { useAudioFileStore } from '@/store/audioFileStore'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { LightConfigModal } from './LightConfigModal'
import { AmbienceCard } from './AmbienceCard'
import { SceneSectionHeader } from '@/components/ui/SceneSectionHeader'

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
  const hasLights = !!(lightConfig?.groups || lightConfig?.lights)

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

    // Update sceneStore (DB)
    await useSceneStore.getState().updateScene(scene.id, { light_config: config as Json })

    // Update sessionSceneStore (UI) - use the action to increment _version
    if (sessionId) {
      useSessionSceneStore.getState().updateSceneInSession(sessionId, scene.id, {
        light_config: config as unknown as Scene['light_config'],
        updated_at: new Date().toISOString()
      })
    }
  }

  return (
    <div className="w-full">
      {/* Section header */}
      <SceneSectionHeader title="Ambience" />

      {/* 2-column grid */}
      <div className="flex gap-[16px] px-0 py-[24px]">
        {/* Lighting card */}
        <AmbienceCard
          variant="lighting"
          title="Lighting"
          subtitle={hasLights ? 'Custom preset' : 'No lighting configured'}
          hasConfig={hasLights}
          onClick={() => setIsLightConfigOpen(true)}
        />

        {/* Audio card */}
        <AmbienceCard
          variant="audio"
          title={audioFile?.name || 'No audio'}
          subtitle={audioFile ? `${(audioFile.duration || 0 / 60).toFixed(0)} min` : 'No audio configured'}
          hasConfig={!!audioFile}
          onClick={() => setIsAudioLibraryOpen(true)}
        />
      </div>

      {/* Modals */}
      <AudioLibrary
        isOpen={isAudioLibraryOpen}
        onClose={() => setIsAudioLibraryOpen(false)}
        onSelect={handleAudioSelect}
      />

      <LightConfigModal
        key={`light-config-${scene.id}-${scene.updated_at}`}
        isOpen={isLightConfigOpen}
        onClose={() => setIsLightConfigOpen(false)}
        onSave={handleLightSave}
        initialConfig={lightConfig}
      />
    </div>
  )
}
