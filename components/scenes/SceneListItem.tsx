'use client'

import { Play } from 'lucide-react'
import type { Scene } from '@/types'
import { getSceneGradientColors } from '@/lib/utils/gradients'

interface SceneListItemProps {
  scene: Scene
  isActive?: boolean
  isSelected?: boolean
  onClick?: () => void
  onPlay?: () => void
}

export function SceneListItem({
  scene,
  isActive = false,
  isSelected = false,
  onClick,
  onPlay
}: SceneListItemProps) {
  const gradientColors = getSceneGradientColors(scene.scene_type)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-2 rounded-[8px] transition-colors ${
        isSelected
          ? 'bg-white/[0.10]'
          : 'hover:bg-white/[0.05]'
      }`}
    >
      {/* Scene Thumbnail with Gradient Blobs */}
      <div className="w-10 h-10 rounded-[8px] bg-white/[0.07] flex-shrink-0 relative overflow-hidden">
        {/* Gradient blobs with mix-blend-screen */}
        <div
          className="absolute w-14 h-14 -left-7 -top-9 opacity-100 mix-blend-screen rounded-[8px] blur-md"
          style={{
            background: `radial-gradient(circle, ${gradientColors.primary}80 0%, transparent 70%)`
          }}
        />
        <div
          className="absolute w-14 h-14 -left-7 top-3 opacity-100 mix-blend-screen rounded-[8px] blur-md"
          style={{
            background: `radial-gradient(circle, ${gradientColors.secondary}80 0%, transparent 70%)`
          }}
        />
        {gradientColors.tertiary && (
          <div
            className="absolute w-14 h-14 left-2 -top-5 opacity-100 mix-blend-screen rounded-[8px] blur-md"
            style={{
              background: `radial-gradient(circle, ${gradientColors.tertiary}80 0%, transparent 70%)`
            }}
          />
        )}
      </div>

      {/* Scene Info */}
      <div className="flex-1 text-left min-w-0">
        <div className={`font-medium truncate ${
          isActive ? 'text-[#eeeeee]' : 'text-white'
        }`}>
          {scene.name}
        </div>
        <div className={`text-xs font-medium ${
          isActive ? 'text-[#7b7b7b]' : 'text-[#a4a4a4]'
        }`}>
          {scene.scene_type}
        </div>
      </div>

      {/* Play Button for active scene */}
      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPlay?.()
          }}
          className="hover:scale-110 transition-transform"
          aria-label={`Play ${scene.name}`}
        >
          <Play className="w-5 h-5 text-white/70 flex-shrink-0" fill="currentColor" />
        </button>
      )}
    </button>
  )
}