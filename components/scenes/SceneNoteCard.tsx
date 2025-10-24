'use client'

import { useState, useRef, memo } from 'react'
import type { SceneBlock } from '@/types'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { Trash2, Maximize2, Minimize2, X } from 'lucide-react'

interface SceneNoteCardProps {
  block: SceneBlock
  sceneId: string
  isExpanded?: boolean
  onExpand?: (blockId: string | null) => void
}

/**
 * SceneNoteCard - Card-based note with tags and expand button
 */
const SceneNoteCardComponent = ({ block, sceneId, isExpanded, onExpand }: SceneNoteCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const updateBlock = useSceneBlockStore((state) => state.actions.updateBlock)
  const deleteBlock = useSceneBlockStore((state) => state.actions.deleteBlock)
  const tagsMap = useSceneBlockStore((state) => state.tags)
  const addTag = useSceneBlockStore((state) => state.actions.addTag)
  const removeTag = useSceneBlockStore((state) => state.actions.removeTag)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingBody, setIsEditingBody] = useState(false)
  const [title, setTitle] = useState(block.content.title || '')
  const [body, setBody] = useState(block.content.text?.text || '')
  const [tagInput, setTagInput] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)

  const blockTags = tagsMap.get(block.id) || []

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
    }
  }

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      
      // Check if tag already exists
      if (blockTags.some(t => t.tag_name === newTag)) {
        setTagInput('')
        return
      }

      try {
        await addTag(sceneId, block.id, newTag)
        setTagInput('')
      } catch (error) {
        console.error('Failed to add tag:', error)
      }
    }
  }

  const handleRemoveTag = async (tagName: string) => {
    try {
      await removeTag(block.id, tagName)
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  return (
    <div
      className={`relative rounded-[12px] p-5 transition-colors group ${
        isExpanded 
          ? 'bg-purple-500/10 border border-purple-500/20' 
          : 'bg-white/[0.03] hover:bg-white/[0.05]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Action icons - persistent when expanded, show on hover otherwise */}
      <div className={`absolute top-3 right-3 flex items-center gap-1 transition-opacity ${
        isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        {onExpand && (
          <button
            onClick={() => onExpand(isExpanded ? null : block.id)}
            className="w-8 h-8 rounded-[6px] bg-white/5 hover:bg-white/10 flex items-center justify-center"
            title={isExpanded ? "Collapse note" : "Expand note"}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 text-white/60" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-white/60" />
            )}
          </button>
        )}
        <button
          onClick={handleDelete}
          className="w-8 h-8 rounded-[6px] bg-white/5 hover:bg-red-500/10 flex items-center justify-center"
          title="Delete note"
        >
          <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
        </button>
      </div>

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
          className="font-['Inter'] text-[16px] font-semibold text-white mb-3 cursor-text pr-20"
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
          className="w-full bg-transparent border-none outline-none font-['Inter'] text-[13px] text-white/60 resize-none mb-3"
          placeholder="Add note details..."
        />
      ) : (
        <p
          onClick={() => setIsEditingBody(true)}
          className="font-['Inter'] text-[13px] text-white/60 line-clamp-4 cursor-text mb-3"
        >
          {body || 'Click to add details...'}
        </p>
      )}

      {/* Tags - styled like audio library */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {blockTags.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded-[6px] text-[12px] text-white flex items-center gap-1.5"
          >
            {tag.tag_name}
            <button
              onClick={() => handleRemoveTag(tag.tag_name)}
              className="hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={tagInputRef}
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tag..."
          className="px-2 py-1 bg-transparent text-[12px] text-white placeholder:text-white/40 outline-none min-w-[80px] flex-1"
        />
      </div>
    </div>
  )
}

export const SceneNoteCard = memo(SceneNoteCardComponent)
