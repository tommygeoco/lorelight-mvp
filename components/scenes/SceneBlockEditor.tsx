'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { SceneBlock, BlockType } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { GripVertical } from 'lucide-react'
import { RichTextToolbar } from '@/components/ui/RichTextToolbar'
import { BlockMenu } from '@/components/ui/BlockMenu'

interface SceneBlockEditorProps {
  block: SceneBlock
  sceneId: string
}

/**
 * SceneBlockEditor - Contenteditable block with grip and slash commands
 * Context7: Grip = drag + left-click menu, slash commands for text blocks
 */
export function SceneBlockEditor({ block, sceneId }: SceneBlockEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 })
  const [blockMenuTrigger, setBlockMenuTrigger] = useState<'grip' | 'slash' | null>(null)
  const [selection, setSelection] = useState<Range | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const gripRef = useRef<HTMLDivElement>(null)

  const updateBlock = useSceneBlockStore((state) => state.actions.updateBlock)
  const deleteBlock = useSceneBlockStore((state) => state.actions.deleteBlock)
  const addBlock = useSceneBlockStore((state) => state.actions.addBlock)

  // Initialize content on mount
  useEffect(() => {
    if (contentRef.current && !contentRef.current.innerHTML) {
      const text = block.content.text?.text || ''
      contentRef.current.innerHTML = text
    }
  }, [block.id, block.content])

  // Debounced auto-save (500ms) + slash command detection
  const handleInput = useCallback(() => {
    const text = contentRef.current?.textContent || ''

    // Detect slash command in text blocks only
    if (block.type === 'text' && text === '/') {
      // Position menu below cursor
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect()
        setBlockMenuPosition({ x: rect.left, y: rect.bottom + 4 })
        setBlockMenuTrigger('slash')
        setShowBlockMenu(true)
      }
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const text = contentRef.current?.textContent || ''
      await updateBlock(block.id, {
        content: { text: { text, formatting: [] } }
      })
    }, 500)
  }, [block.id, block.type, updateBlock])

  // Handle text selection - only show toolbar for text blocks
  const handleMouseUp = useCallback(() => {
    // Only show toolbar for text blocks (not headers)
    if (block.type !== 'text') {
      setShowToolbar(false)
      return
    }

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0)
      // Check if selection is within this block
      if (contentRef.current?.contains(range.commonAncestorContainer)) {
        setSelection(range)
        setShowToolbar(true)
      }
    } else {
      setShowToolbar(false)
    }
  }, [block.type])

  // Format text
  const handleFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    document.execCommand(format, false)
    handleInput()
  }, [handleInput])

  // Add link
  const handleLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url) {
      document.execCommand('createLink', false, url)
      handleInput()
    }
  }, [handleInput])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    const text = contentRef.current?.textContent || ''

    // Enter (without Shift) - if empty, delete current and move to next, otherwise create new
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      // If element is empty, delete it and move to next/previous
      if (text === '') {
        const blocksMap = useSceneBlockStore.getState().blocks
        const blocks = Array.from(blocksMap.values())
          .filter(b => b.scene_id === sceneId)
          .sort((a, b) => a.order_index - b.order_index)

        if (blocks.length === 1) return

        const currentIndex = blocks.findIndex(b => b.id === block.id)
        const nextBlock = currentIndex < blocks.length - 1 ? blocks[currentIndex + 1] : null
        const prevBlock = currentIndex > 0 ? blocks[currentIndex - 1] : null
        const targetBlock = nextBlock || prevBlock

        await deleteBlock(block.id)

        if (targetBlock) {
          requestAnimationFrame(() => {
            const elem = document.querySelector(`[data-block-id="${targetBlock.id}"]`) as HTMLDivElement
            if (elem) {
              elem.focus()
              const range = document.createRange()
              const sel = window.getSelection()
              if (nextBlock) {
                range.setStart(elem, 0)
                range.collapse(true)
              } else {
                range.selectNodeContents(elem)
                range.collapse(false)
              }
              sel?.removeAllRanges()
              sel?.addRange(range)
            }
          })
        }
        return
      }

      // Save current block (non-blocking)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      updateBlock(block.id, {
        content: { text: { text, formatting: [] } }
      })

      // Get blocks synchronously
      const blocksMap = useSceneBlockStore.getState().blocks
      const blocks = Array.from(blocksMap.values())
        .filter(b => b.scene_id === sceneId)
        .sort((a, b) => a.order_index - b.order_index)

      const currentIndex = blocks.findIndex(b => b.id === block.id)
      const newOrderIndex = block.order_index + 1

      // Create new TEXT block IMMEDIATELY (optimistic)
      const newBlockPromise = addBlock({
        scene_id: sceneId,
        type: 'text',
        content: { text: { text: '', formatting: [] } },
        order_index: newOrderIndex,
      })

      // Update order of blocks after this one IN BACKGROUND (non-blocking)
      const blocksToUpdate = blocks.slice(currentIndex + 1)
      blocksToUpdate.forEach(b => {
        updateBlock(b.id, {
          order_index: b.order_index + 1
        })
      })

      // Wait only for new block creation, then focus INSTANTLY
      const newBlock = await newBlockPromise
      if (newBlock) {
        // Use requestAnimationFrame for immediate DOM update
        requestAnimationFrame(() => {
          const newBlockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLDivElement
          if (newBlockElement) {
            newBlockElement.focus()
            // Place cursor at start
            const range = document.createRange()
            const sel = window.getSelection()
            range.setStart(newBlockElement, 0)
            range.collapse(true)
            sel?.removeAllRanges()
            sel?.addRange(range)
          }
        })
      }
    }

    // Shift+Enter - allow line break within same element (default behavior)
    // No need to handle - browser default is line break

    // Handle Backspace - if at start of empty block, delete and move to previous
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault()

      // Don&apos;t delete if it&apos;s the only block
      const blocksMap = useSceneBlockStore.getState().blocks
      const blocks = Array.from(blocksMap.values())
        .filter(b => b.scene_id === sceneId)
        .sort((a, b) => a.order_index - b.order_index)

      if (blocks.length === 1) return

      // Find previous block to focus
      const currentIndex = blocks.findIndex(b => b.id === block.id)
      const previousBlock = currentIndex > 0 ? blocks[currentIndex - 1] : null

      await deleteBlock(block.id)

      // Focus previous block INSTANTLY using requestAnimationFrame
      if (previousBlock) {
        requestAnimationFrame(() => {
          const prevBlockElement = document.querySelector(`[data-block-id="${previousBlock.id}"]`) as HTMLDivElement
          if (prevBlockElement) {
            prevBlockElement.focus()
            // Place cursor at end
            const range = document.createRange()
            const sel = window.getSelection()
            range.selectNodeContents(prevBlockElement)
            range.collapse(false)
            sel?.removeAllRanges()
            sel?.addRange(range)
          }
        })
      }
    }

    // Handle Delete key - same as Backspace on empty
    if (e.key === 'Delete' && text === '') {
      e.preventDefault()

      const blocksMap = useSceneBlockStore.getState().blocks
      const blocks = Array.from(blocksMap.values())
        .filter(b => b.scene_id === sceneId)
        .sort((a, b) => a.order_index - b.order_index)

      if (blocks.length === 1) return

      const currentIndex = blocks.findIndex(b => b.id === block.id)
      const nextBlock = currentIndex < blocks.length - 1 ? blocks[currentIndex + 1] : null
      const prevBlock = currentIndex > 0 ? blocks[currentIndex - 1] : null
      const targetBlock = nextBlock || prevBlock

      await deleteBlock(block.id)

      if (targetBlock) {
        requestAnimationFrame(() => {
          const elem = document.querySelector(`[data-block-id="${targetBlock.id}"]`) as HTMLDivElement
          if (elem) {
            elem.focus()
            const range = document.createRange()
            const sel = window.getSelection()
            if (nextBlock) {
              range.setStart(elem, 0)
              range.collapse(true)
            } else {
              range.selectNodeContents(elem)
              range.collapse(false)
            }
            sel?.removeAllRanges()
            sel?.addRange(range)
          }
        })
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

  // Handle grip left-click for block type menu (toggle)
  const handleGripClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Toggle menu open/closed
    if (showBlockMenu && blockMenuTrigger === 'grip') {
      setShowBlockMenu(false)
      setBlockMenuTrigger(null)
      return
    }

    // Position menu relative to grip icon
    if (gripRef.current) {
      const rect = gripRef.current.getBoundingClientRect()
      setBlockMenuPosition({ x: rect.left, y: rect.bottom + 4 })
      setBlockMenuTrigger('grip')
      setShowBlockMenu(true)
    }
  }

  // Handle block type change
  const handleBlockTypeChange = async (type: BlockType) => {
    // If triggered by slash command, clear the slash
    if (blockMenuTrigger === 'slash' && contentRef.current) {
      contentRef.current.textContent = ''
    }

    await updateBlock(block.id, { type })
    setShowBlockMenu(false)
    setBlockMenuTrigger(null)

    // Refocus content
    setTimeout(() => {
      contentRef.current?.focus()
    }, 0)
  }

  // Handle delete from dropdown
  const handleDeleteFromMenu = async () => {
    setShowBlockMenu(false)

    // Don&apos;t delete if it&apos;s the only block
    const blocksMap = useSceneBlockStore.getState().blocks
    const blocks = Array.from(blocksMap.values())
      .filter(b => b.scene_id === sceneId)

    if (blocks.length === 1) return

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

  // Get placeholder based on block type
  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading_1':
        return 'Heading 1'
      case 'heading_2':
        return 'Heading 2'
      case 'heading_3':
        return 'Heading 3'
      case 'text':
      default:
        return 'Type / for commands'
    }
  }

  return (
    <>
      <div className="group relative flex items-center gap-2 px-2 -mx-2 rounded-[8px]">
        {/* Grip handle with delayed tooltip */}
        <div
          ref={gripRef}
          className="relative flex-shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing group/grip"
          onClick={handleGripClick}
        >
          <GripVertical className="w-5 h-5 text-white" />

          {/* Tooltip - multi-line centered with 2s delay */}
          <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-[#191919] border border-white/10 rounded-[6px] shadow-lg opacity-0 group-hover/grip:opacity-100 transition-opacity delay-[2000ms] pointer-events-none z-50 text-center min-w-[100px] whitespace-nowrap">
            <div className="text-[11px] leading-[14px] text-white/60">
              <div><span className="text-white">Drag</span> to move</div>
              <div className="mt-1"><span className="text-white">Click</span> to open</div>
            </div>
          </div>
        </div>

        {/* Contenteditable */}
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={handleMouseUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            // Don&apos;t hide toolbar immediately to allow clicking buttons
            setTimeout(() => setShowToolbar(false), 200)
          }}
          className={`flex-1 outline-none text-white/90 font-['Inter'] ${getBlockStyle()}`}
          data-placeholder={isFocused ? getPlaceholder() : ''}
          data-block-id={block.id}
        />

        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: rgba(255, 255, 255, 0.3);
            pointer-events: none;
          }
        `}</style>
      </div>

      {/* Rich Text Toolbar (on text selection) */}
      {showToolbar && selection && (
        <RichTextToolbar
          selection={selection}
          onFormat={handleFormat}
          onLink={handleLink}
          onClose={() => setShowToolbar(false)}
        />
      )}

      {/* Block Type Menu (on grip click or slash command) */}
      {showBlockMenu && (
        <BlockMenu
          anchorPoint={blockMenuPosition}
          currentType={block.type}
          onInsert={handleBlockTypeChange}
          onDelete={handleDeleteFromMenu}
          onClose={() => {
            setShowBlockMenu(false)
            setBlockMenuTrigger(null)
          }}
        />
      )}
    </>
  )
}
