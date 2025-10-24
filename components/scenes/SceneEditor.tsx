'use client'

import { useEffect, useState } from 'react'
import type { Scene } from '@/types'
import { SceneHero } from './SceneHero'
import { SceneAmbienceSection } from './SceneAmbienceSection'
import { SceneNotesSection } from './SceneNotesSection'
import { useSceneBlockStore } from '@/store/sceneBlockStore'
import { useAudioFileStore } from '@/store/audioFileStore'

interface SceneEditorProps {
  scene: Scene
  campaignId: string
  sessionId?: string
  expandedBlockId?: string | null
  onExpandNote?: (blockId: string | null) => void
}

/**
 * SceneEditor - Main scene editing container
 * Context7: Notion-like editing experience with Figma design
 */
export function SceneEditor({ scene, campaignId, sessionId, expandedBlockId, onExpandNote }: SceneEditorProps) {
  const fetchBlocks = useSceneBlockStore((state) => state.actions.fetchBlocksForScene)
  const fetchTags = useSceneBlockStore((state) => state.actions.fetchTagsForScene)
  const fetchAudioFiles = useAudioFileStore((state) => state.fetchAudioFiles)

  // Fetch data on mount - all in parallel for instant load
  useEffect(() => {
    Promise.all([
      // Fetch blocks
      fetchBlocks(scene.id).catch(() => {}),
      // Fetch tags
      fetchTags(scene.id).catch(() => {}),
      // Fetch audio files for selection
      fetchAudioFiles().catch(() => {}),
      // Fetch scene's audio configs
      (async () => {
        const { useSceneAudioFileStore } = await import('@/store/sceneAudioFileStore')
        await useSceneAudioFileStore.getState().fetchAudioFilesForScene(scene.id).catch(() => {})
      })(),
      // Fetch scene's light configs
      (async () => {
        const { useSceneLightConfigStore } = await import('@/store/sceneLightConfigStore')
        await useSceneLightConfigStore.getState().fetchConfigsForScene(scene.id).catch(() => {})
      })(),
      // Fetch all light configs
      (async () => {
        const { useLightConfigStore } = await import('@/store/lightConfigStore')
        await useLightConfigStore.getState().fetchLightConfigs().catch(() => {})
      })(),
    ])
  }, [scene.id, fetchBlocks, fetchTags, fetchAudioFiles])

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-custom bg-[#191919] rounded-[8px]">
      {/* Hero section with gradient */}
      <SceneHero scene={scene} sessionId={sessionId} />

      {/* Main content area - always max-w-[760px], continuous from Hero */}
      <div className="max-w-[760px] mx-auto px-[32px] pb-[40px]">
        {/* Ambience section (audio + lights) */}
        <SceneAmbienceSection scene={scene} campaignId={campaignId} sessionId={sessionId} />

        {/* Notes section */}
        <SceneNotesSection scene={scene} onExpandNote={onExpandNote} expandedBlockId={expandedBlockId} />
      </div>
    </div>
  )
}
