'use client'

import { useEffect, useState, useMemo } from 'react'
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Image, Trash2, Check } from 'lucide-react'
import type { BlockType } from '@/types'

interface BlockMenuProps {
  anchorPoint: { x: number; y: number }
  currentType?: BlockType
  onInsert: (type: BlockType) => void
  onDelete?: () => void
  onClose: () => void
}

/**
 * BlockMenu - Block type selector with delete option and keyboard navigation
 * Context7: Design system context menu pattern, keyboard navigable with arrow keys
 */
export function BlockMenu({ anchorPoint, currentType, onInsert, onDelete, onClose }: BlockMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const blockTypes = useMemo(() => [
    { type: 'text' as const, label: 'Text', icon: Type },
    { type: 'heading_1' as const, label: 'Heading 1', icon: Heading1 },
    { type: 'heading_2' as const, label: 'Heading 2', icon: Heading2 },
    { type: 'heading_3' as const, label: 'Heading 3', icon: Heading3 },
    { type: 'bulleted_list' as const, label: 'Bulleted List', icon: List },
    { type: 'numbered_list' as const, label: 'Numbered List', icon: ListOrdered },
    { type: 'checkbox_list' as const, label: 'Checkbox List', icon: CheckSquare },
    { type: 'image' as const, label: 'Image / Media', icon: Image },
  ], [])

  // Close on click outside or keyboard shortcuts
  useEffect(() => {
    const handleClick = () => onClose()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % blockTypes.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + blockTypes.length) % blockTypes.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onInsert(blockTypes[selectedIndex].type)
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, onInsert, selectedIndex, blockTypes])

  return (
    <div
      className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[180px]"
      style={{
        left: `${anchorPoint.x}px`,
        top: `${anchorPoint.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Block type options */}
      {blockTypes.map((item, index) => {
        const Icon = item.icon
        const isCurrentType = currentType === item.type
        const isHighlighted = index === selectedIndex
        return (
          <button
            key={item.type}
            onClick={() => {
              onInsert(item.type)
            }}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full px-4 py-2 text-left text-[13px] text-white flex items-center gap-2 transition-colors ${
              isHighlighted ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="flex-1">{item.label}</span>
            {isCurrentType && <Check className="w-3.5 h-3.5 text-white/60" />}
          </button>
        )
      })}

      {/* Divider before delete */}
      {onDelete && <div className="h-px bg-white/10 my-1" />}

      {/* Delete option */}
      {onDelete && (
        <button
          onClick={() => {
            onDelete()
            onClose()
          }}
          className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Block
        </button>
      )}
    </div>
  )
}
