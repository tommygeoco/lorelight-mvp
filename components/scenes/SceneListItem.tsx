'use client'

import { Play } from 'lucide-react'
import type { Scene } from '@/types'

interface SceneListItemProps {
  scene: Scene
  isActive?: boolean
  onClick?: () => void
  onPlay?: () => void
}

// Generate gradient thumbnail based on scene type
function getSceneThumbnail(scene: Scene): string {
  const colors = {
    Story: ['#8B5CF6', '#EC4899'],
    Encounter: ['#EF4444', '#F59E0B'],
    Event: ['#F59E0B', '#10B981'],
    Location: ['#6366F1', '#8B5CF6'],
    Rest: ['#F59E0B', '#EF4444'],
    default: ['#6B7280', '#9CA3AF']
  }
  const sceneColors = colors[scene.scene_type as keyof typeof colors] || colors.default
  return `linear-gradient(135deg, ${sceneColors[0]}, ${sceneColors[1]})`
}

export function SceneListItem({
  scene,
  isActive = false,
  onClick,
  onPlay
}: SceneListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-2 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-white/[0.07] border border-[#3a3a3a]'
          : 'hover:bg-white/5'
      }`}
    >
      {/* Scene Thumbnail */}
      <div
        className="w-10 h-10 rounded-md bg-white/[0.07] flex-shrink-0 relative overflow-hidden"
        style={{ background: getSceneThumbnail(scene) }}
      />

      {/* Scene Info */}
      <div className="flex-1 text-left min-w-0">
        <div className={`font-medium text-sm truncate ${
          isActive ? 'text-[#eeeeee]' : 'text-white'
        }`}>
          {scene.name}
        </div>
        <div className={`text-xs ${
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