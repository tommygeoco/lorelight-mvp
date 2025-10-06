'use client'

import { useMemo, useState } from 'react'
import type { Scene } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { SceneBlockEditor } from './SceneBlockEditor'

interface SceneNotesSectionProps {
  scene: Scene
}

/**
 * SceneNotesSection - Inline text editor with hover highlight
 * Context7: Clickable text area, grip right-click for block type menu, hover on container only
 */
export function SceneNotesSection({ scene }: SceneNotesSectionProps) {
  const blocksMap = useSceneBlockStore((state) => state.blocks)
  const addBlock = useSceneBlockStore((state) => state.actions.addBlock)
  const [isHovered, setIsHovered] = useState(false)

  // Get blocks for this scene
  const blocks = useMemo(() => {
    const map = blocksMap instanceof Map ? blocksMap : new Map()
    return Array.from(map.values())
      .filter(b => b.scene_id === scene.id)
      .sort((a, b) => a.order_index - b.order_index)
  }, [blocksMap, scene.id])

  const handleClick = () => {
    // If no blocks exist, create the first one
    if (blocks.length === 0) {
      addBlock({
        scene_id: scene.id,
        type: 'text',
        content: {
          text: { text: '', formatting: [] }
        },
        order_index: 0,
      }).catch(error => {
        console.error('Failed to add block:', error)
        // Silently fail - migration 015 may not be applied yet
      })
    }
  }

  return (
    <div
      className={`w-full min-h-[200px] px-[16px] py-[24px] rounded-[12px] transition-colors cursor-text ${
        isHovered ? 'bg-white/[0.02]' : 'bg-transparent'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {blocks.length === 0 ? (
        <div className="text-white/30 font-['Inter'] text-[14px] leading-[20px]">
          Click to start writing...
        </div>
      ) : (
        <div className="space-y-1">
          {blocks.map((block) => (
            <SceneBlockEditor
              key={block.id}
              block={block}
              sceneId={scene.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

