'use client'

import { useMemo, useState } from 'react'
import type { Scene } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { SceneNoteCard } from './SceneNoteCard'
import { AddButton } from '@/components/ui/AddButton'

interface SceneNotesSectionProps {
  scene: Scene
  onExpandNote?: (blockId: string | null) => void
  expandedBlockId?: string | null
}

/**
 * SceneNotesSection - Card-based notes with tag filtering
 */
export function SceneNotesSection({ scene, onExpandNote, expandedBlockId }: SceneNotesSectionProps) {
  const blocksMap = useSceneBlockStore((state) => state.blocks)
  const tagsMap = useSceneBlockStore((state) => state.tags)
  const version = useSceneBlockStore((state) => state._version)
  const addBlock = useSceneBlockStore((state) => state.actions.addBlock)
  const deleteBlock = useSceneBlockStore((state) => state.actions.deleteBlock)
  
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Tags are preloaded by SceneEditor - no fetching here for instant display

  // Get blocks for this scene
  const blocks = useMemo(() => {
    const map = blocksMap instanceof Map ? blocksMap : new Map()
    const filtered = Array.from(map.values())
      .filter(b => b.scene_id === scene.id)
      .sort((a, b) => a.order_index - b.order_index)

    return filtered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksMap, scene.id, version])

  // Get unique tags for this scene
  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>()
    blocks.forEach(block => {
      const blockTags = tagsMap.get(block.id) || []
      blockTags.forEach(tag => tagSet.add(tag.tag_name))
    })
    return Array.from(tagSet).sort()
  }, [blocks, tagsMap, version])

  // Filter blocks by active tag
  const filteredBlocks = useMemo(() => {
    if (!activeTag) return blocks
    
    return blocks.filter(block => {
      const blockTags = tagsMap.get(block.id) || []
      return blockTags.some(tag => tag.tag_name === activeTag)
    })
  }, [blocks, activeTag, tagsMap, version])

  const handleAddNote = async () => {
    try {
      const newBlock = await addBlock({
        scene_id: scene.id,
        type: 'text',
        content: {
          title: '',
          text: { text: '', formatting: [] }
        },
        order_index: blocks.length,
      })

      // If we have an active tag filter, add that tag to the new note
      if (activeTag) {
        const { addTag } = useSceneBlockStore.getState().actions
        await addTag(scene.id, newBlock.id, activeTag).catch(() => {
          // Silently handle tag addition failure
        })
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleClearAll = async () => {
    if (!confirm(`Delete all ${blocks.length} notes? This cannot be undone.`)) return

    await Promise.allSettled(
      blocks.map(block => deleteBlock(block.id))
    )
  }

  return (
    <div className="w-full pt-[48px]">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">
            Notes
          </h2>
          {blocks.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-[6px] text-[11px] text-white/70">
              {blocks.length}
            </span>
          )}
        </div>
        {blocks.length > 3 && (
          <button
            onClick={handleClearAll}
            className="text-[13px] text-red-400/70 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Tag filter tabs - styled like audio library */}
      {uniqueTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-custom py-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2 py-1 rounded-[6px] text-[12px] whitespace-nowrap transition-colors ${
              activeTag === null 
                ? 'bg-purple-500/30 border border-purple-500/50 text-white' 
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            All ({blocks.length})
          </button>
          {uniqueTags.map(tag => {
            const count = blocks.filter(b => {
              const blockTags = tagsMap.get(b.id) || []
              return blockTags.some(t => t.tag_name === tag)
            }).length
            
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-2 py-1 rounded-[6px] text-[12px] whitespace-nowrap transition-colors ${
                  activeTag === tag 
                    ? 'bg-purple-500/30 border border-purple-500/50 text-white' 
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tag} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Notes grid */}
      {filteredBlocks.length === 0 ? (
        <>
          {blocks.length > 0 && (
            <div className="text-center py-4">
              <p className="text-white/40 text-[0.875rem]">
                No notes with this tag
              </p>
            </div>
          )}
          <AddButton onClick={handleAddNote}>
            Add Note
          </AddButton>
        </>
      ) : (
        <>
          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredBlocks.map((block) => (
              <SceneNoteCard
                key={block.id}
                block={block}
                sceneId={scene.id}
                isExpanded={expandedBlockId === block.id}
                onExpand={onExpandNote}
              />
            ))}
          </div>

          {/* Add note button */}
          <div className="mt-2">
            <AddButton onClick={handleAddNote}>
              Add Note
            </AddButton>
          </div>
        </>
      )}
    </div>
  )
}
