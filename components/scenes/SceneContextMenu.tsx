import { Plus, Edit2, Copy, Trash2 } from 'lucide-react'
import type { Scene } from '@/types'

interface SceneContextMenuProps {
  x: number
  y: number
  scene?: Scene
  onNew: () => void
  onRename: (scene: Scene) => void
  onDuplicate: (scene: Scene) => void
  onDelete: (scene: Scene) => void
}

/**
 * SceneContextMenu - Right-click context menu for scenes
 * Consistent pattern used across campaign scenes and session scenes
 * Context7: Standard context menu styling from design system
 */
export function SceneContextMenu({
  x,
  y,
  scene,
  onNew,
  onRename,
  onDuplicate,
  onDelete
}: SceneContextMenuProps) {
  return (
    <div
      className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Show "New Scene" if no scene (empty space click) */}
      {!scene ? (
        <button
          onClick={onNew}
          className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Scene
        </button>
      ) : (
        <>
          <button
            onClick={() => onRename(scene)}
            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Rename
          </button>
          <button
            onClick={() => onDuplicate(scene)}
            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button
            onClick={() => onDelete(scene)}
            className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </>
      )}
    </div>
  )
}
