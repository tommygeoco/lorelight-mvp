'use client'

import { Play, Pause } from 'lucide-react'
import type { Scene } from '@/types'
import { getSceneGradientColors } from '@/lib/utils/gradients'

interface SceneListItemProps {
  scene: Scene
  isActive?: boolean
  isSelected?: boolean
  isEditing?: boolean
  editingName?: string
  onEditingNameChange?: (name: string) => void
  onRenameSubmit?: () => void
  onCancelEdit?: () => void
  onClick?: () => void
  onPlay?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function SceneListItem({
  scene,
  isActive = false,
  isSelected = false,
  isEditing = false,
  editingName = '',
  onEditingNameChange,
  onRenameSubmit,
  onCancelEdit,
  onClick,
  onPlay,
  onContextMenu
}: SceneListItemProps) {
  const gradientColors = getSceneGradientColors(scene.scene_type)

  return (
    <div
      onClick={() => !isEditing && onClick?.()}
      onContextMenu={onContextMenu}
      className={`group w-full flex items-center gap-3 px-3 py-2 rounded-[8px] transition-colors text-left cursor-pointer ${
        isSelected
          ? 'bg-white/10'
          : isActive
          ? 'bg-white/[0.05]'
          : 'hover:bg-white/5'
      }`}
    >
      {/* Scene Thumbnail with Gradient Blobs */}
      <div className="w-9 h-9 rounded-[6px] bg-white/[0.07] flex-shrink-0 relative overflow-hidden">
        {/* Gradient blobs with mix-blend-screen */}
        <div
          className="absolute w-12 h-12 -left-6 -top-8 opacity-100 mix-blend-screen rounded-[6px] blur-md"
          style={{
            background: `radial-gradient(circle, ${gradientColors.primary}80 0%, transparent 70%)`
          }}
        />
        <div
          className="absolute w-12 h-12 -left-6 top-2 opacity-100 mix-blend-screen rounded-[6px] blur-md"
          style={{
            background: `radial-gradient(circle, ${gradientColors.secondary}80 0%, transparent 70%)`
          }}
        />
        {gradientColors.tertiary && (
          <div
            className="absolute w-12 h-12 left-1 -top-4 opacity-100 mix-blend-screen rounded-[6px] blur-md"
            style={{
              background: `radial-gradient(circle, ${gradientColors.tertiary}80 0%, transparent 70%)`
            }}
          />
        )}
      </div>

      {/* Scene Info / Edit Form */}
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onRenameSubmit?.()
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0"
        >
          <input
            type="text"
            value={editingName}
            onChange={(e) => onEditingNameChange?.(e.target.value)}
            onBlur={() => onRenameSubmit?.()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                onCancelEdit?.()
              }
            }}
            autoFocus
            className="w-full px-3 py-1.5 bg-white/[0.07] border border-white/10 rounded-[8px] text-[13px] text-white focus:outline-none focus:border-white/20"
          />
        </form>
      ) : (
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-medium truncate ${
            isSelected || isActive ? 'text-white' : 'text-white/60'
          }`}>
            {scene.name}
          </div>
        </div>
      )}

      {/* Play/Pause Button */}
      {!isEditing && (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onPlay?.()
          }}
          className={`hover:scale-110 transition-transform ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label={isActive ? `Pause ${scene.name}` : `Play ${scene.name}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onPlay?.()
            }
          }}
        >
          {isActive ? (
            <Pause className="w-4 h-4 text-white/70 flex-shrink-0" />
          ) : (
            <Play className="w-4 h-4 text-white/70 flex-shrink-0" fill="currentColor" />
          )}
        </div>
      )}
    </div>
  )
}