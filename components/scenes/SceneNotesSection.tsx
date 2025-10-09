'use client'

import { useMemo } from 'react'
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

  // Get blocks for this scene
  const blocks = useMemo(() => {
    const map = blocksMap instanceof Map ? blocksMap : new Map()
    return Array.from(map.values())
      .filter(b => b.scene_id === scene.id)
      .sort((a, b) => a.order_index - b.order_index)
  }, [blocksMap, scene.id])

  const handleClick = (e: React.MouseEvent) => {
    // Only create block if clicking empty space (not on existing blocks)
    const target = e.target as HTMLElement
    if (target.closest('[data-block-id]')) return

    // If no blocks exist, create the first one
    if (blocks.length === 0) {
      addBlock({
        scene_id: scene.id,
        type: 'text',
        content: {
          text: { text: '', formatting: [] }
        },
        order_index: 0,
      })
    }
  }

  return (
    <div
      className="w-full min-h-[200px] select-text"
      onClick={handleClick}
    >
      {blocks.length === 0 ? (
        <div className="text-white/30 font-['Inter'] text-[14px] leading-[20px]">
          Click to start writing...
        </div>
      ) : (
        <div className="space-y-1">
          {blocks.map((block) => {
            // Use stable clientId as key if available, fallback to id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const key = (block as any).clientId || block.id
            return (
              <SceneBlockEditor
                key={key}
                block={block}
                sceneId={scene.id}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

