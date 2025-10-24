'use client'

import { useState, useRef, useMemo } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Scene } from '@/types'
import { useSceneStore } from '@/store/sceneStore'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useAudioStore } from '@/store/audioStore'
import { useSceneLightConfigStore } from '@/store/sceneLightConfigStore'
import { useSceneAudioFileStore } from '@/store/sceneAudioFileStore'

interface SceneHeroProps {
  scene: Scene
  sessionId?: string
}

/**
 * SceneHero - Editable scene title and description with gradient background
 * Context7: Matches Figma design with purple-pink gradient
 */
export function SceneHero({ scene, sessionId }: SceneHeroProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLTextAreaElement>(null)
  const updateScene = useSceneStore((state) => state.updateScene)
  const activateScene = useSceneStore((state) => state.activateScene)
  const deactivateScene = useSceneStore((state) => state.deactivateScene)

  // Auto-select text when input mounts
  const handleTitleMount = (el: HTMLInputElement | null) => {
    if (el) {
      titleInputRef.current = el
      el.focus()
      el.select()
    }
  }

  const handleDescMount = (el: HTMLTextAreaElement | null) => {
    if (el) {
      descInputRef.current = el
      el.focus()
      el.select()
    }
  }

  // Get selection state from stores
  const { isPlaying, currentTrackId } = useAudioStore()
  const sceneLightConfigs = useSceneLightConfigStore((state) => state.configs)
  const sceneLightConfigIds = useSceneLightConfigStore((state) => state.sceneConfigs)
  const sceneAudioFiles = useSceneAudioFileStore((state) => state.audioFiles)
  const sceneAudioFileIds = useSceneAudioFileStore((state) => state.sceneAudioFiles)
  const lightVersion = useSceneLightConfigStore((state) => state._version)
  const audioVersion = useSceneAudioFileStore((state) => state._version)

  // Memoize selection state computation
  const { selectedAudio, selectedLight, hasSelection } = useMemo(() => {
    const audioIds = sceneAudioFileIds.get(scene.id) || []
    const selectedAudio = audioIds
      .map(id => sceneAudioFiles.get(id))
      .find(af => af?.is_selected)

    const lightIds = sceneLightConfigIds.get(scene.id) || []
    const selectedLight = lightIds
      .map(id => sceneLightConfigs.get(id))
      .find(lc => lc?.is_selected)

    return {
      selectedAudio,
      selectedLight,
      hasSelection: !!(selectedAudio || selectedLight)
    }
  }, [scene.id, sceneAudioFileIds, sceneAudioFiles, sceneLightConfigs, sceneLightConfigIds, lightVersion, audioVersion])

  const isSelectedAudioPlaying = !!(selectedAudio && currentTrackId === selectedAudio.audio_file_id && isPlaying)

  const handleTitleSave = () => {
    const newTitle = titleInputRef.current?.value || ''

    // Close immediately for snappy feel
    setIsEditingTitle(false)

    if (newTitle.trim() === '') return
    if (newTitle.trim() === scene.name) return

    const trimmedTitle = newTitle.trim()

    // Optimistic update to sessionSceneStore for instant UI feedback
    if (sessionId) {
      useSessionSceneStore.getState().updateSceneInSession(sessionId, scene.id, {
        name: trimmedTitle,
        updated_at: new Date().toISOString()
      })
    }

    // Fire and forget database save - don't await
    updateScene(scene.id, { name: trimmedTitle }).catch(error => {
      console.error('Failed to save title:', error)
    })
  }

  const handleDescSave = () => {
    const newDesc = descInputRef.current?.value || ''
    const trimmedDesc = newDesc.trim() || null

    // Close immediately for snappy feel
    setIsEditingDesc(false)

    // Don't save if unchanged
    if (trimmedDesc === scene.description) return

    // Optimistic update to sessionSceneStore for instant UI feedback
    if (sessionId) {
      useSessionSceneStore.getState().updateSceneInSession(sessionId, scene.id, {
        description: trimmedDesc,
        updated_at: new Date().toISOString()
      })
    }

    // Fire and forget database save - don't await
    updateScene(scene.id, { description: trimmedDesc }).catch(error => {
      console.error('Failed to save description:', error)
    })
  }

  const handlePlayPause = async () => {
    // Use already computed selection state
    if (!hasSelection) {
      return
    }

    // Check if selected audio is currently playing
    const audioStore = useAudioStore.getState()
    const isAudioPlaying = selectedAudio && 
      audioStore.currentTrackId === selectedAudio.audio_file_id && 
      audioStore.isPlaying

    if (isAudioPlaying) {
      // Pause audio
      audioStore.togglePlay()
    } else {
      // Play selected audio
      if (selectedAudio) {
        const { useAudioFileStore } = await import('@/store/audioFileStore')
        const audioFileData = useAudioFileStore.getState().audioFiles.get(selectedAudio.audio_file_id)
        if (audioFileData?.file_url) {
          audioStore.loadTrack(
            audioFileData.id, 
            audioFileData.file_url, 
            { type: 'scene', id: scene.id, name: scene.name }
          )
          // Start playback
          setTimeout(() => {
            audioStore.play()
          }, 100)
        }
      }

      // Activate selected lights
      if (selectedLight) {
        const { useLightConfigStore } = await import('@/store/lightConfigStore')
        const { useHueStore } = await import('@/store/hueStore')
        
        const lightConfigData = useLightConfigStore.getState().lightConfigs.get(selectedLight.light_config_id)
        if (lightConfigData?.rgb_color) {
          await useHueStore.getState().applyLightConfig(lightConfigData.rgb_color as Record<string, unknown>)
        }
      }
    }
  }

  return (
    <div className="relative w-full">
      {/* Radial Gradient Background - matching PageHeader pattern */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '-80px', height: '400px' }}>
        {/* Pink gradient - left side */}
        <div
          className="absolute"
          style={{
            left: '25%',
            top: '0',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse 1200px 300px at center top, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Purple gradient - right side */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '0',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse 1200px 300px at center top, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-[760px] mx-auto px-[32px] pt-[80px] pb-[24px] relative z-10">
        {/* Title and description container with play button */}
        <div className="relative pl-[72px]">
          {/* Circular Play/Pause - positioned to the left */}
          <button
            onClick={handlePlayPause}
            disabled={!hasSelection}
            className={`absolute left-0 top-[26px] w-[48px] h-[48px] rounded-full transition-all flex items-center justify-center shadow-lg ${
              hasSelection
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 hover:shadow-xl hover:scale-105'
                : 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 opacity-50 cursor-not-allowed'
            }`}
            aria-label={!hasSelection ? "Add audio or lights first" : isSelectedAudioPlaying ? "Pause scene" : "Play scene"}
          >
            {isSelectedAudioPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
            )}
          </button>

          {/* Editable title */}
          {isEditingTitle ? (
          <input
            ref={handleTitleMount}
            type="text"
            defaultValue={scene.name}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleTitleSave()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setIsEditingTitle(false)
              }
            }}
            className="w-full bg-transparent border-none outline-none font-['PP_Mondwest'] text-[60px] leading-[72px] tracking-[-1.2px] text-white placeholder:text-white/40"
            placeholder="Scene name..."
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="font-['PP_Mondwest'] text-[60px] leading-[72px] tracking-[-1.2px] text-white cursor-text"
          >
            {scene.name}
          </h1>
        )}

          {/* Editable description */}
          <div className="relative min-h-[60px] mt-[16px]">
            {isEditingDesc ? (
              <textarea
                ref={(el) => {
                  handleDescMount(el)
                  if (el) {
                    el.style.height = 'auto'
                    el.style.height = el.scrollHeight + 'px'
                  }
                }}
                defaultValue={scene.description || ''}
                onBlur={handleDescSave}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = target.scrollHeight + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsEditingDesc(false)
                  }
                }}
                className="w-full p-0 m-0 bg-transparent border-none outline-none font-['Inter'] text-[14px] leading-normal text-[#eeeeee] placeholder:text-white/40 resize-none overflow-hidden"
                placeholder="Add a description..."
                data-1p-ignore="true"
                data-lpignore="true"
              />
            ) : (
              <div
                onClick={() => setIsEditingDesc(true)}
                className="w-full p-0 m-0 font-['Inter'] text-[14px] leading-normal text-[#eeeeee] cursor-text whitespace-pre-wrap"
                data-1p-ignore="true"
                data-lpignore="true"
              >
                {scene.description || (
                  <span className="text-white/40">Add a description...</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
