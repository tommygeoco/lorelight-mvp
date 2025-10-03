'use client'

import { useEffect, useMemo } from 'react'
import type { Scene } from '@/types'
import { SceneHero } from './SceneHero'
import { SceneAmbienceSection } from './SceneAmbienceSection'
import { SceneNotesSection } from './SceneNotesSection'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { useSceneNPCStore } from '@/store/sceneNPCStore'
import { useAudioFileStore } from '@/store/audioFileStore'

interface SceneEditorProps {
  scene: Scene
  campaignId: string
  sessionId?: string
}

/**
 * SceneEditor - Main scene editing container
 * Context7: Notion-like editing experience with Figma design
 */
export function SceneEditor({ scene, campaignId, sessionId }: SceneEditorProps) {
  const fetchBlocks = useSceneBlockStore((state) => state.actions.fetchBlocksForScene)
  const fetchNPCs = useSceneNPCStore((state) => state.actions.fetchNPCsForScene)
  const fetchAudioFiles = useAudioFileStore((state) => state.fetchAudioFiles)

  const npcsMap = useSceneNPCStore((state) => state.npcs)
  const npcs = useMemo(() => {
    // Defensive check: ensure npcsMap is a Map
    const map = npcsMap instanceof Map ? npcsMap : new Map()
    return Array.from(map.values())
      .filter(n => n.scene_id === scene.id)
      .sort((a, b) => a.order_index - b.order_index)
  }, [npcsMap, scene.id])

  // Fetch data on mount
  useEffect(() => {
    // Silently handle errors for blocks/NPCs (tables may not exist yet)
    fetchBlocks(scene.id).catch(() => {
      // Migration 015 not applied yet - tables don't exist
    })
    fetchNPCs(scene.id).catch(() => {
      // Migration 015 not applied yet - tables don't exist
    })
    fetchAudioFiles()
  }, [scene.id, fetchBlocks, fetchNPCs, fetchAudioFiles])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom bg-[#191919] rounded-[8px]">
      {/* Hero section with gradient */}
      <SceneHero scene={scene} sessionId={sessionId} />

      {/* Main content area */}
      <div className="max-w-[760px] mx-auto px-[32px] py-[40px] space-y-[16px]">
        {/* Ambience section (audio + lights) */}
        <SceneAmbienceSection scene={scene} campaignId={campaignId} sessionId={sessionId} />

        {/* Notes section */}
        <SceneNotesSection scene={scene} />

        {/* NPCs section - Coming in Phase 6 */}
        <div className="w-full">
          <div className="pb-0 pt-[24px]">
            <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">
              Enemies
            </h2>
          </div>
          <div className="px-0 py-[24px]">
            <div className="text-center py-8">
              <p className="text-white/40 text-[14px]">
                NPC management coming soon...<br />
                {npcs.length} NPC{npcs.length !== 1 ? 's' : ''} loaded
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
