'use client'

import { useState } from 'react'
import type { SceneNPC } from '@/types'
import { useSceneNPCStore } from '@/store/sceneNPCStore'
import { Trash2, Edit } from 'lucide-react'

interface SceneNPCCardProps {
  npc: SceneNPC
  onEdit: (npc: SceneNPC) => void
}

/**
 * SceneNPCCard - NPC display card with stats
 * Context7: Design system card pattern, hover states
 */
export function SceneNPCCard({ npc, onEdit }: SceneNPCCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const deleteNPC = useSceneNPCStore((state) => state.actions.delete)

  // Extract stats with proper typing
  const speed = npc.stats?.speed
  const hasSpeed = speed && typeof speed === 'string'
  const hp = npc.stats?.hp
  const ac = npc.stats?.ac
  const hasHpOrAc = (hp !== undefined && typeof hp === 'number') || (ac !== undefined && typeof ac === 'number')

  const handleDelete = async () => {
    if (confirm(`Delete ${npc.name}?`)) {
      await deleteNPC(npc.id)
    }
  }

  return (
    <div
      className="relative bg-white/[0.03] rounded-[12px] p-5 hover:bg-white/[0.05] transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Action buttons (shows on hover) */}
      {isHovered && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={() => onEdit(npc)}
            className="w-8 h-8 rounded-[6px] bg-white/5 hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit NPC"
          >
            <Edit className="w-3.5 h-3.5 text-white/70" />
          </button>
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-[6px] bg-white/5 hover:bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete NPC"
          >
            <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
          </button>
        </div>
      )}

      {/* NPC image placeholder */}
      {npc.image_url && (
        <div className="mb-3">
          <img
            src={npc.image_url}
            alt={npc.name}
            className="w-full h-32 object-cover rounded-[8px]"
          />
        </div>
      )}

      {/* NPC name */}
      <h3 className="font-['Inter'] text-[16px] font-semibold text-white mb-2">
        {npc.name}
      </h3>

      {/* Description */}
      {npc.description && (
        <p className="font-['Inter'] text-[13px] text-white/60 mb-3 line-clamp-3">
          {npc.description}
        </p>
      )}

      {/* Stats */}
      {npc.stats && (
        <div className="space-y-2">
          {/* HP & AC */}
          {hasHpOrAc ? (
            <div className="flex items-center gap-3 text-[12px]">
              {hp !== undefined && typeof hp === 'number' && (
                <div>
                  <span className="text-white/40">HP: </span>
                  <span className="text-white font-medium">{hp}</span>
                </div>
              )}
              {ac !== undefined && typeof ac === 'number' && (
                <div>
                  <span className="text-white/40">AC: </span>
                  <span className="text-white font-medium">{ac}</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Speed */}
          {hasSpeed ? (
            <div className="text-[12px]">
              <span className="text-white/40">Speed: </span>
              <span className="text-white/70">{speed as string}</span>
            </div>
          ) : null}

          {/* Abilities */}
          {npc.stats.abilities && Object.keys(npc.stats.abilities).length > 0 ? (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
              {Object.entries(npc.stats.abilities).map(([ability, score]) => (
                <div key={ability} className="text-center">
                  <div className="text-[10px] text-white/40 uppercase">{String(ability)}</div>
                  <div className="text-[14px] text-white font-medium">{String(score)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
