'use client'

import { useState, useMemo, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Scene } from '@/types'
import { useSceneStore } from '@/store/sceneStore'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useAudioStore } from '@/store/audioStore'

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

  // Check if audio is actually playing this scene
  const { isPlaying, sourceContext } = useAudioStore()
  const isScenePlaying = useMemo(() => {
    return scene.is_active &&
           isPlaying &&
           sourceContext?.type === 'scene' &&
           sourceContext.id === scene.id
  }, [scene.is_active, scene.id, isPlaying, sourceContext])

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

  const handlePlayPause = () => {
    if (scene.is_active) {
      // Optimistic UI update - deactivate
      if (sessionId) {
        useSessionSceneStore.getState().updateSceneInSession(sessionId, scene.id, {
          is_active: false,
          updated_at: new Date().toISOString()
        })
      }

      // Fire and forget - don't await
      deactivateScene(scene.id).catch(console.error)
    } else {
      // Optimistic UI update - activate this, deactivate all others
      if (sessionId) {
        const state = useSessionSceneStore.getState()
        const currentScenes = state.sessionScenes.get(sessionId) || []

        // Deactivate all other scenes
        currentScenes.forEach(s => {
          if (s.id !== scene.id && s.is_active) {
            useSessionSceneStore.getState().updateSceneInSession(sessionId, s.id, {
              is_active: false,
              updated_at: new Date().toISOString()
            })
          }
        })

        // Activate this scene
        useSessionSceneStore.getState().updateSceneInSession(sessionId, scene.id, {
          is_active: true,
          updated_at: new Date().toISOString()
        })
      }

      // Fire and forget - don't await
      activateScene(scene.id).catch(console.error)
    }
  }

  return (
    <div className="relative w-full overflow-clip pb-0 pt-[80px]">
      {/* Radial Gradient Background - matching PageHeader pattern */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '-100px', height: '300px' }}>
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
      <div className="max-w-[760px] mx-auto px-[32px] pb-[24px] space-y-[16px] relative z-10">
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
        <div className="relative min-h-[60px]">
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

        {/* Play/Pause Button */}
        <div className="mt-[24px]">
          <button
            onClick={handlePlayPause}
            className={`flex items-center gap-2 px-[16px] py-[10px] rounded-[8px] font-['Inter'] text-[14px] font-medium transition-colors ${
              isScenePlaying
                ? 'bg-white/10 text-white hover:bg-white/15'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isScenePlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Deactivate Scene</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                <span>Activate Scene</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
