'use client'

import { useMemo } from 'react'
import type { Scene } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { SceneBlockEditor } from './SceneBlockEditor'
import { Plus } from 'lucide-react'

interface SceneNotesSectionProps {
  scene: Scene
}

/**
 * SceneNotesSection - Notion-like block-based notes editor
 * Context7: Minimal state, optimistic updates, fetch-once pattern
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

  const handleAddBlock = async () => {
    await addBlock({
      scene_id: scene.id,
      type: 'text',
      content: { text: { text: '', formatting: [] } },
      order_index: blocks.length,
    })
  }

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="pb-0 pt-[24px]">
        <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">
          Notes
        </h2>
      </div>

      {/* Blocks container */}
      <div className="px-0 py-[24px] space-y-[8px]">
        {blocks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-[14px] mb-4">
              No notes yet. Add your first block to begin.
            </p>
            <button
              onClick={handleAddBlock}
              className="inline-flex items-center gap-2 px-[16px] py-[8px] rounded-[8px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors font-['Inter'] text-[14px]"
            >
              <Plus className="w-4 h-4" />
              Add Note Block
            </button>
          </div>
        ) : (
          <>
            {blocks.map((block) => (
              <SceneBlockEditor
                key={block.id}
                block={block}
                sceneId={scene.id}
              />
            ))}

            {/* Add block button at bottom */}
            <button
              onClick={handleAddBlock}
              className="w-full flex items-center gap-2 px-[12px] py-[8px] rounded-[8px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors font-['Inter'] text-[14px]"
            >
              <Plus className="w-4 h-4" />
              Add Block
            </button>
          </>
        )}
      </div>
    </div>
  )
}
