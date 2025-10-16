'use client'

import { useMemo } from 'react'
import type { Scene } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { SceneNoteCard } from './SceneNoteCard'
import { Plus } from 'lucide-react'

interface SceneNotesSectionProps {
  scene: Scene
}

/**
 * SceneNotesSection - Card-based notes display matching Figma design
 * Context7: Minimal state, optimistic updates, fetch-once pattern
 */
export function SceneNotesSection({ scene }: SceneNotesSectionProps) {
  const blocksMap = useSceneBlockStore((state) => state.blocks)
  const version = useSceneBlockStore((state) => state._version) // Subscribe to changes
  const addBlock = useSceneBlockStore((state) => state.actions.addBlock)
  const deleteBlock = useSceneBlockStore((state) => state.actions.deleteBlock)

  // Get blocks for this scene
  const blocks = useMemo(() => {
    const map = blocksMap instanceof Map ? blocksMap : new Map()
    const filtered = Array.from(map.values())
      .filter(b => b.scene_id === scene.id)
      .sort((a, b) => a.order_index - b.order_index)

    console.log(`📋 SceneNotesSection render - version: ${version}, blocks for scene ${scene.id}:`, filtered.length)

    return filtered
  }, [blocksMap, scene.id, version])

  const handleAddNote = async () => {
    try {
      await addBlock({
        scene_id: scene.id,
        type: 'text',
        content: {
          title: '',
          text: { text: '', formatting: [] }
        },
        order_index: blocks.length,
      })
    } catch (error) {
      console.error('Failed to add note:', error)
      // Silently fail - migration 015 may not be applied yet
    }
  }

  const handleClearAll = async () => {
    if (!confirm(`Delete all ${blocks.length} notes? This cannot be undone.`)) return

    // Delete all blocks in parallel
    await Promise.allSettled(
      blocks.map(block => deleteBlock(block.id))
    )
  }

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="pb-0 pt-[24px] flex items-center justify-between">
        <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">
          Notes {blocks.length > 0 && <span className="text-white/40">({blocks.length})</span>}
        </h2>
        {blocks.length > 3 && (
          <button
            onClick={handleClearAll}
            className="text-[13px] text-red-400/70 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Notes grid */}
      <div className="px-0 py-[24px]">
        {blocks.length === 0 ? (
          <button
            onClick={handleAddNote}
            className="w-full flex items-center justify-center gap-2 px-[16px] py-[12px] rounded-[12px] bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-colors font-['Inter'] text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        ) : (
          <div className="space-y-4">
            {/* 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {blocks.map((block) => (
                <SceneNoteCard
                  key={block.id}
                  block={block}
                />
              ))}
            </div>

            {/* Add note button */}
            <button
              onClick={handleAddNote}
              className="w-full flex items-center justify-center gap-2 px-[16px] py-[12px] rounded-[12px] bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-colors font-['Inter'] text-[14px]"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
