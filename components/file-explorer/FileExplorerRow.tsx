/**
 * Single row in the file explorer (file or folder)
 * Fixed height, consistent styling, drag-and-drop support
 */

'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'
import type { FileExplorerItem } from './types'

interface FileExplorerRowProps<T extends FileExplorerItem> {
  item: T
  depth: number
  isExpanded: boolean
  hasChildren: boolean
  onToggleExpand: () => void
  onClick?: () => void
  onDoubleClick?: () => void
  isDragging: boolean
  isDropTarget: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
  renderContent?: (item: T, isExpanded: boolean) => React.ReactNode
  renderActions?: (item: T) => React.ReactNode
  rowHeight?: number
  indentSize?: number
}

export function FileExplorerRow<T extends FileExplorerItem>({
  item,
  depth,
  isExpanded,
  hasChildren,
  onToggleExpand,
  onClick,
  onDoubleClick,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  renderContent,
  renderActions,
  rowHeight = 48,
  indentSize = 24,
}: FileExplorerRowProps<T>) {
  const paddingLeft = depth * indentSize + 16

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        group flex items-center rounded-[8px] transition-all cursor-pointer relative
        ${isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab'}
        ${isDropTarget ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'hover:bg-white/5'}
      `}
      style={{
        height: rowHeight,
        paddingLeft,
      }}
    >
      {/* Hierarchy indicator lines */}
      {depth > 0 && (
        <>
          {/* Vertical line connecting to parent */}
          <div
            className="absolute left-0 top-0 bottom-0 border-l border-white/[0.08]"
            style={{
              left: `${(depth - 1) * indentSize + 16 + 10}px`,
            }}
          />
          {/* Horizontal line to item */}
          <div
            className="absolute top-1/2 border-t border-white/[0.08]"
            style={{
              left: `${(depth - 1) * indentSize + 16 + 10}px`,
              width: `${indentSize - 10}px`,
            }}
          />
        </>
      )}

      {/* Expand/Collapse Icon */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 -ml-1 relative z-10">
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            className="w-5 h-5 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-white/40" />
            ) : (
              <ChevronRight className="w-3 h-3 text-white/40" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center gap-2 min-w-0 px-2">
        {renderContent ? renderContent(item, isExpanded) : (
          <span className="text-[14px] text-white truncate">{item.name}</span>
        )}
      </div>

      {/* Actions */}
      {renderActions && (
        <div className="flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {renderActions(item)}
        </div>
      )}
    </div>
  )
}
