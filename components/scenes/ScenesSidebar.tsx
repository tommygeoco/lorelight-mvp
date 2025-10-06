'use client'

import { Plus, Trash2, Music, Lightbulb } from 'lucide-react'
import type { Scene } from '@/types'

interface ScenesSidebarProps {
  scenes: Scene[]
  selectedSceneId: string | null
  onSceneClick: (scene: Scene) => void
  onSceneContextMenu: (e: React.MouseEvent, scene: Scene) => void
  onEmptySpaceContextMenu: (e: React.MouseEvent) => void
  onCreate: () => void
  onDelete?: (scene: Scene, e: React.MouseEvent) => void
  // Optional: For custom rendering of scene list items
  renderSceneItem?: (scene: Scene, isSelected: boolean) => React.ReactNode
}

/**
 * ScenesSidebar - Reusable scenes list sidebar
 * Used in both campaign-level scenes page and session-level scene editor
 * Context7: Consistent sidebar pattern across the app
 */
export function ScenesSidebar({
  scenes,
  selectedSceneId,
  onSceneClick,
  onSceneContextMenu,
  onEmptySpaceContextMenu,
  onCreate,
  onDelete,
  renderSceneItem
}: ScenesSidebarProps) {
  return (
    <div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Scenes</h2>
        <button
          onClick={onCreate}
          className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
          aria-label="New Scene"
          title="Create scene..."
        >
          <Plus className="w-[18px] h-[18px] text-white/70" />
        </button>
      </div>

      {/* Scrollable List */}
      <div
        className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4"
        onContextMenu={onEmptySpaceContextMenu}
      >
        {scenes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-[0.875rem]">
              No scenes discovered...<br />Create a scene to begin
            </p>
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {scenes.map((scene) => {
              const isSelected = selectedSceneId === scene.id

              // Use custom rendering if provided
              if (renderSceneItem) {
                return (
                  <li key={scene.id} data-scene-item>
                    {renderSceneItem(scene, isSelected)}
                  </li>
                )
              }

              // Default rendering
              const hasAudio = !!scene.audio_config
              const hasLights = !!scene.light_config

              return (
                <li key={scene.id} data-scene-item>
                  <div
                    className={`group flex flex-col px-3 py-2 rounded-[8px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white/10'
                        : scene.is_active
                        ? 'bg-white/[0.05]'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => onSceneClick(scene)}
                    onContextMenu={(e) => onSceneContextMenu(e, scene)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate text-[13px] text-white font-medium">
                        {scene.name}
                      </span>
                      {onDelete && (
                        <button
                          onClick={(e) => onDelete(scene, e)}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
                          title="Delete scene"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {/* Config indicators */}
                    <div className="ml-0 text-[11px] text-white/30 mt-0.5 flex items-center gap-2">
                      {hasAudio && (
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          Audio
                        </span>
                      )}
                      {hasLights && (
                        <span className="flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Lights
                        </span>
                      )}
                      {!hasAudio && !hasLights && <span>No config</span>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
