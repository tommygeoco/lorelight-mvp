'use client'

import { Play } from 'lucide-react'
import type { Scene } from '@/types'

interface SceneListItemProps {
  scene: Scene
  isActive?: boolean
  isSelected?: boolean
  onClick?: () => void
  onPlay?: () => void
}

// Generate gradient thumbnail based on scene type with multiple gradient blobs
function getSceneThumbnail(scene: Scene): { primary: string; secondary: string; tertiary?: string } {
  const colors = {
    Story: { primary: '#8B5CF6', secondary: '#EC4899' },
    Encounter: { primary: '#EF4444', secondary: '#F59E0B', tertiary: '#10B981' },
    Event: { primary: '#F59E0B', secondary: '#8B5CF6' },
    Location: { primary: '#6366F1', secondary: '#EC4899' },
    Rest: { primary: '#F59E0B', secondary: '#EF4444' },
    default: { primary: '#6B7280', secondary: '#9CA3AF' }
  }
  return colors[scene.scene_type as keyof typeof colors] || colors.default
}

export function SceneListItem({
  scene,
  isActive = false,
  onClick,
  onPlay
}: SceneListItemProps) {
  const gradientColors = getSceneThumbnail(scene)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-2 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-white/[0.07] border border-[#3a3a3a]'
          : 'hover:bg-white/5'
      }`}
    >
      {/* Scene Thumbnail with Gradient Blobs */}
      <div className="w-10 h-10 rounded-md bg-white/[0.07] flex-shrink-0 relative overflow-hidden">
        {/* Gradient blobs with mix-blend-screen */}
        <div
          className="absolute w-14 h-14 -left-7 -top-9 opacity-100 mix-blend-screen rounded-full blur-md"
          style={{
            background: `radial-gradient(circle, ${gradientColors.primary}80 0%, transparent 70%)`
          }}
        />
        <div
          className="absolute w-14 h-14 -left-7 top-3 opacity-100 mix-blend-screen rounded-full blur-md"
          style={{
            background: `radial-gradient(circle, ${gradientColors.secondary}80 0%, transparent 70%)`
          }}
        />
        {gradientColors.tertiary && (
          <div
            className="absolute w-14 h-14 left-2 -top-5 opacity-100 mix-blend-screen rounded-full blur-md"
            style={{
              background: `radial-gradient(circle, ${gradientColors.tertiary}80 0%, transparent 70%)`
            }}
          />
        )}
      </div>

      {/* Scene Info */}
      <div className="flex-1 text-left min-w-0">
        <div className={`font-medium text-sm truncate ${
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
        >
          <Play className="w-5 h-5 text-white/70 flex-shrink-0" fill="currentColor" />
        </button>
      )}
    </button>
  )
}