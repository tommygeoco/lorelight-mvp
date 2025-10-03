'use client'

import { Play, Music as MusicIcon, Lightbulb, Edit2 } from 'lucide-react'
import type { Scene } from '@/types'
import { getSceneGradientColors } from '@/lib/utils/gradients'

interface SceneCardProps {
  scene: Scene
  isSelected?: boolean
  onClick?: () => void
  onPlay?: () => void
  onEdit?: () => void
}

/**
 * SceneCard - Grid card for scene library
 * Follows campaign card design pattern with gradient thumbnails
 */
export function SceneCard({ scene, isSelected = false, onClick, onPlay, onEdit }: SceneCardProps) {
  const gradientColors = getSceneGradientColors(scene.scene_type)

  return (
    <article
      className={`group bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-[12px] cursor-pointer ${
        isSelected ? 'ring-2 ring-purple-500/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Gradient Thumbnail */}
        <div
          className="w-full aspect-video rounded-[8px] flex-shrink-0 shadow-lg mb-3 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${gradientColors.primary} 0%, ${gradientColors.secondary} 100%)`
          }}
        >
          {/* Gradient blobs */}
          <div
            className="absolute w-32 h-32 -left-16 -top-16 opacity-60 blur-2xl rounded-full"
            style={{ background: gradientColors.primary }}
          />
          <div
            className="absolute w-32 h-32 -right-16 -bottom-16 opacity-60 blur-2xl rounded-full"
            style={{ background: gradientColors.secondary }}
          />
          {gradientColors.tertiary && (
            <div
              className="absolute w-24 h-24 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 blur-xl rounded-full"
              style={{ background: gradientColors.tertiary }}
            />
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPlay?.()
              }}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              aria-label={`Play ${scene.name}`}
            >
              <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
            </button>
          </div>

          {/* Active Badge */}
          {scene.is_active && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500/90 backdrop-blur-sm text-white rounded text-[11px] font-semibold">
              Active
            </div>
          )}
        </div>

        {/* Scene Info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-white truncate mb-1">
              {scene.name}
            </h3>
            <div className="flex items-center gap-3 text-[12px] text-white/40">
              {scene.audio_config && (
                <div className="flex items-center gap-1">
                  <MusicIcon className="w-3 h-3" />
                  <span>Audio</span>
                </div>
              )}
              {scene.light_config && (
                <div className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  <span>Lights</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="w-7 h-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Edit scene"
            >
              <Edit2 className="w-3.5 h-3.5 text-white/70" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
