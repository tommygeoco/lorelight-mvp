'use client'

import { useEffect } from 'react'
import type { Scene } from '@/types'
import { SceneHero } from './SceneHero'
import { SceneAmbienceSection } from './SceneAmbienceSection'
import { SceneNotesSection } from './SceneNotesSection'
import { SceneNPCsSection } from './SceneNPCsSection'
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
        {/* Notes section - Primary content area */}
        <SceneNotesSection scene={scene} />

        {/* Ambience section (audio + lights) */}
        <SceneAmbienceSection scene={scene} campaignId={campaignId} sessionId={sessionId} />

        {/* NPCs section */}
        <SceneNPCsSection scene={scene} />
      </div>
    </div>
  )
}
