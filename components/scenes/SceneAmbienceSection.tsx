'use client'

import { Lightbulb, Music } from 'lucide-react'
import type { Scene, SceneAudioConfig, SceneLightConfig } from '@/types'
import { useAudioFileStore } from '@/store/audioFileStore'

interface SceneAmbienceSectionProps {
  scene: Scene
  campaignId: string
}

/**
 * SceneAmbienceSection - Audio and lighting configuration cards
 * Context7: 2-column grid matching Figma design
 */
export function SceneAmbienceSection({ scene }: SceneAmbienceSectionProps) {
  const audioFiles = useAudioFileStore((state) => state.audioFiles)

  // Parse audio config
  const audioConfig = scene.audio_config as SceneAudioConfig | null
  const audioFile = audioConfig ? audioFiles.get(audioConfig.audio_id) : null

  // Parse light config
  const lightConfig = scene.light_config as SceneLightConfig | null
  const hasLights = !!(lightConfig?.groups || lightConfig?.lights)

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
        <div className="basis-0 grow min-w-px bg-[#222222] rounded-[12px] p-[16px] shadow-md relative overflow-hidden">
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
                {hasLights ? 'Custom preset' : 'No lighting configured'}
              </p>
            </div>

            {/* Icon indicator */}
            <div className="absolute right-[12px] top-[16px] opacity-40">
              <Lightbulb className="w-[18px] h-[18px] text-white" />
            </div>
          </div>
        </div>

        {/* Audio card */}
        <div className="basis-0 grow min-w-px bg-[#222222] rounded-[12px] p-[16px] shadow-md relative overflow-hidden">
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
        </div>
      </div>
    </div>
  )
}
