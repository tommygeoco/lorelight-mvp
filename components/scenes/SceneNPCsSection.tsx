'use client'

import { useMemo, useState } from 'react'
import type { Scene, SceneNPC } from '@/types'
import { useSceneNPCStore } from '@/store/sceneNPCStore'
import { SceneNPCCard } from './SceneNPCCard'
import { SceneSectionHeader } from '@/components/ui/SceneSectionHeader'
import { NPCModal } from './NPCModal'
import { Plus } from 'lucide-react'

interface SceneNPCsSectionProps {
  scene: Scene
}

/**
 * SceneNPCsSection - NPC management with 3-column grid
 * Context7: Minimal state, Figma design pattern
 */
export function SceneNPCsSection({ scene }: SceneNPCsSectionProps) {
  const npcsMap = useSceneNPCStore((state) => state.npcs)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNPC, setEditingNPC] = useState<SceneNPC | null>(null)

  // Get NPCs for this scene
  const npcs = useMemo(() => {
    const map = npcsMap instanceof Map ? npcsMap : new Map()
    return Array.from(map.values())
      .filter(n => n.scene_id === scene.id)
      .sort((a, b) => a.order_index - b.order_index)
  }, [npcsMap, scene.id])

  const handleCreate = () => {
    setEditingNPC(null)
    setIsModalOpen(true)
  }

  const handleEdit = (npc: SceneNPC) => {
    setEditingNPC(npc)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingNPC(null)
  }

  return (
    <div className="w-full">
      {/* Section header */}
      <SceneSectionHeader title="Enemies" />

      {/* NPCs grid */}
      <div className="px-0 py-[24px]">
        {npcs.length === 0 ? (
          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 px-[16px] py-[12px] rounded-[12px] bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-colors font-['Inter'] text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add Enemy
          </button>
        ) : (
          <div className="space-y-4">
            {/* 3-column grid */}
            <div className="grid grid-cols-3 gap-4">
              {npcs.map((npc) => (
                <SceneNPCCard
                  key={npc.id}
                  npc={npc}
                  onEdit={handleEdit}
                />
              ))}
            </div>

            {/* Add NPC button */}
            <button
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 px-[16px] py-[12px] rounded-[12px] bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-colors font-['Inter'] text-[14px]"
            >
              <Plus className="w-4 h-4" />
              Add Enemy
            </button>
          </div>
        )}
      </div>

      {/* NPC Modal */}
      <NPCModal
        isOpen={isModalOpen}
        onClose={handleClose}
        sceneId={scene.id}
        npc={editingNPC}
      />
    </div>
  )
}
