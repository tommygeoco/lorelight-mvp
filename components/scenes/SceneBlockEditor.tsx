'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { SceneBlock } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { Grip, Trash2 } from 'lucide-react'

interface SceneBlockEditorProps {
  block: SceneBlock
  sceneId: string
}

/**
 * SceneBlockEditor - Contenteditable block with auto-save
 * Context7: Debounced saves, optimistic updates, keyboard shortcuts
 */
export function SceneBlockEditor({ block, sceneId }: SceneBlockEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const updateBlock = useSceneBlockStore((state) => state.actions.updateBlock)
  const deleteBlock = useSceneBlockStore((state) => state.actions.deleteBlock)
  const addBlock = useSceneBlockStore((state) => state.actions.addBlock)

  // Initialize content on mount
  useEffect(() => {
    if (contentRef.current && !contentRef.current.textContent) {
      const text = block.content.text?.text || ''
      contentRef.current.textContent = text
    }
  }, [block.id, block.content]) // Run when block or content changes

  // Debounced auto-save (500ms)
  const handleInput = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const text = contentRef.current?.textContent || ''
      await updateBlock(block.id, {
        content: { text: { text, formatting: [] } }
      })
    }, 500)
  }, [block.id, updateBlock])

  // Handle Enter key - create new block below
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      // Save current block first
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      const text = contentRef.current?.textContent || ''
      await updateBlock(block.id, {
        content: { text: { text, formatting: [] } }
      })

      // Create new block below
      const blocksMap = useSceneBlockStore.getState().blocks
      const blocks = Array.from(blocksMap.values())
        .filter(b => b.scene_id === sceneId)
        .sort((a, b) => a.order_index - b.order_index)

      const currentIndex = blocks.findIndex(b => b.id === block.id)
      const newOrderIndex = block.order_index + 1

      // Update order of blocks after this one
      const blocksToUpdate = blocks.slice(currentIndex + 1)
      for (const b of blocksToUpdate) {
        await updateBlock(b.id, {
          order_index: b.order_index + 1
        })
      }

      // Add new block
      await addBlock({
        scene_id: sceneId,
        type: 'text',
        content: { text: { text: '', formatting: [] } },
        order_index: newOrderIndex,
      })
    }

    // Handle Backspace on empty block - delete it
    if (e.key === 'Backspace') {
      const text = contentRef.current?.textContent || ''
      if (text === '') {
        e.preventDefault()

        // Don't delete if it's the only block
        const blocksMap = useSceneBlockStore.getState().blocks
        const blocks = Array.from(blocksMap.values())
          .filter(b => b.scene_id === sceneId)

        if (blocks.length === 1) return

        await deleteBlock(block.id)
      }
    }
  }, [block.id, block.order_index, sceneId, updateBlock, addBlock, deleteBlock])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleDelete = async () => {
    await deleteBlock(block.id)
  }

  // Get styling based on block type
  const getBlockStyle = () => {
    switch (block.type) {
      case 'heading_1':
        return 'text-[24px] font-bold leading-[32px] mt-6 mb-2'
      case 'heading_2':
        return 'text-[20px] font-bold leading-[28px] mt-4 mb-2'
      case 'heading_3':
        return 'text-[16px] font-bold leading-[24px] mt-3 mb-1'
      case 'text':
      default:
        return 'text-[14px] leading-[20px] mb-2'
    }
  }

  return (
    <div
      className={`group relative flex items-start gap-2 px-2 -mx-2 rounded-[8px] transition-colors ${
        isFocused ? 'bg-white/5' : 'hover:bg-white/[0.02]'
      }`}
    >
      {/* Drag handle */}
      <div className={`flex-shrink-0 pt-1 opacity-0 group-hover:opacity-40 transition-opacity ${
        isFocused ? 'opacity-40' : ''
      }`}>
        <Grip className="w-4 h-4 text-white cursor-grab" />
      </div>

      {/* Contenteditable */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`flex-1 outline-none text-white/90 font-['Inter'] ${getBlockStyle()}`}
        data-placeholder={block.type === 'text' ? 'Type something...' : `Heading ${block.type.replace('heading_', '')}`}
      />

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className={`flex-shrink-0 pt-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ${
          isFocused ? 'opacity-60' : ''
        }`}
        aria-label="Delete block"
      >
        <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
      </button>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
