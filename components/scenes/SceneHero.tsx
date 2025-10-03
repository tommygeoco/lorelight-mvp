'use client'

import { useState } from 'react'
import type { Scene } from '@/types'
import { InlineEditor } from '@/components/ui/InlineEditor'
import { useSceneStore } from '@/store/sceneStore'
import { useSessionSceneStore } from '@/store/sessionSceneStore'

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
  const updateScene = useSceneStore((state) => state.updateScene)

  const updateSessionScene = (updates: Partial<Scene>) => {
    if (!sessionId) return

    const state = useSessionSceneStore.getState()
    const currentScenes = state.sessionScenes.get(sessionId) || []
    const updatedScenes = currentScenes.map(s =>
      s.id === scene.id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    )

    // Use setState with proper Map update to trigger re-render
    useSessionSceneStore.setState((state) => ({
      ...state,
      sessionScenes: new Map(state.sessionScenes).set(sessionId, updatedScenes)
    }))
  }

  const handleTitleSave = async (newTitle: string) => {
    if (newTitle.trim() === '') {
      return
    }
    try {
      const trimmedTitle = newTitle.trim()
      await updateScene(scene.id, { name: trimmedTitle })
      updateSessionScene({ name: trimmedTitle })
    } catch (error) {
      console.error('Failed to save title:', error)
    }
  }

  const handleDescSave = async (newDesc: string) => {
    try {
      const trimmedDesc = newDesc.trim() || null
      await updateScene(scene.id, { description: trimmedDesc })
      updateSessionScene({ description: trimmedDesc })
    } catch (error) {
      console.error('Failed to save description:', error)
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
          <InlineEditor
            initialValue={scene.name}
            onSave={handleTitleSave}
            onCancel={() => setIsEditingTitle(false)}
            className="font-['PP_Mondwest'] text-[60px] leading-[72px] tracking-[-1.2px] text-white"
            placeholder="Scene name..."
            autoFocus
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
        <div className="min-h-[40px]">
          {isEditingDesc ? (
            <InlineEditor
              initialValue={scene.description || ''}
              onSave={handleDescSave}
              onCancel={() => setIsEditingDesc(false)}
              className="font-['Inter'] text-[14px] leading-[20px] text-[#eeeeee]"
              placeholder="Add a description..."
              multiline
              autoFocus
            />
          ) : (
            <p
              onClick={() => setIsEditingDesc(true)}
              className="font-['Inter'] text-[14px] leading-[20px] text-[#eeeeee] cursor-text"
            >
              {scene.description || (
                <span className="text-white/40">Add a description...</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
