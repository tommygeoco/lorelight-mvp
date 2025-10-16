'use client'

import { useState } from 'react'
import type { SceneBlock } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { Trash2 } from 'lucide-react'

interface SceneNoteCardProps {
  block: SceneBlock
}

/**
 * SceneNoteCard - Card-based note display matching Figma design
 * Shows title and body text in a card format
 */
export function SceneNoteCard({ block }: SceneNoteCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const updateBlock = useSceneBlockStore((state) => state.actions.updateBlock)
  const deleteBlock = useSceneBlockStore((state) => state.actions.deleteBlock)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingBody, setIsEditingBody] = useState(false)
  const [title, setTitle] = useState(block.content.title || '')
  const [body, setBody] = useState(block.content.text?.text || '')

  const handleTitleSave = async () => {
    if (title.trim()) {
      await updateBlock(block.id, {
        content: { ...block.content, title: title.trim() }
      })
    }
    setIsEditingTitle(false)
  }

  const handleBodySave = async () => {
    await updateBlock(block.id, {
      content: {
        ...block.content,
        text: { text: body.trim(), formatting: [] }
      }
    })
    setIsEditingBody(false)
  }

  const handleDelete = async () => {
    try {
      await deleteBlock(block.id)
    } catch (error) {
      console.error('Failed to delete note:', error)
      // Silently fail - the optimistic delete already removed it from UI
    }
  }

  return (
    <div
      className="relative bg-white/[0.03] rounded-[12px] p-5 hover:bg-white/[0.05] transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button (shows on hover) */}
      {isHovered && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 w-8 h-8 rounded-[6px] bg-white/5 hover:bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete note"
        >
          <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
        </button>
      )}

      {/* Title */}
      {isEditingTitle ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSave()
            if (e.key === 'Escape') {
              setTitle(block.content.title || '')
              setIsEditingTitle(false)
            }
          }}
          autoFocus
          className="w-full bg-transparent border-none outline-none font-['Inter'] text-[16px] font-semibold text-white mb-3"
          placeholder="Note title..."
        />
      ) : (
        <h3
          onClick={() => setIsEditingTitle(true)}
          className="font-['Inter'] text-[16px] font-semibold text-white mb-3 cursor-text"
        >
          {title || 'Untitled Note'}
        </h3>
      )}

      {/* Body */}
      {isEditingBody ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={handleBodySave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setBody(block.content.text?.text || '')
              setIsEditingBody(false)
            }
          }}
          autoFocus
          rows={4}
          className="w-full bg-transparent border-none outline-none font-['Inter'] text-[13px] text-white/60 resize-none"
          placeholder="Add note details..."
        />
      ) : (
        <p
          onClick={() => setIsEditingBody(true)}
          className="font-['Inter'] text-[13px] text-white/60 line-clamp-4 cursor-text"
        >
          {body || 'Click to add details...'}
        </p>
      )}
    </div>
  )
}
