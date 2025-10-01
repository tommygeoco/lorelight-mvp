'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useAudioStore } from '@/store/audioStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { Plus } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import type { Scene } from '@/types'
import { SceneListItem } from '@/components/scenes/SceneListItem'
import { AmbienceCard } from '@/components/scenes/AmbienceCard'
import { NoteCard } from '@/components/scenes/NoteCard'
import { SceneModal } from '@/components/scenes/SceneModal'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { HueSetup } from '@/components/hue/HueSetup'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'

interface SessionSceneViewProps {
  campaignId: string
  sessionId: string
}

export function SessionSceneView({ campaignId, sessionId }: SessionSceneViewProps) {
  const router = useRouter()
  const {
    sessionScenes,
    isLoading,
    fetchScenesForSession,
    fetchedSessions
  } = useSessionSceneStore()

  const { loadTrack } = useAudioStore()
  const audioFileMap = useAudioFileMap()

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isHueSetupOpen, setIsHueSetupOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | undefined>(undefined)

  // Get session-specific scenes from sessionSceneStore
  const sceneArray = useMemo(
    () => sessionScenes.get(sessionId) || [],
    [sessionScenes, sessionId]
  )

  const sortedScenes = useMemo(() => {
    const sorted = [...sceneArray]
    sorted.sort((a, b) => {
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1
      return a.order_index - b.order_index
    })
    return sorted
  }, [sceneArray])

  const selectedScene = selectedSceneId
    ? sceneArray.find(s => s.id === selectedSceneId)
    : sortedScenes.find(s => s.is_active) || sortedScenes[0]

  useEffect(() => {
    if (!fetchedSessions.has(sessionId) && !isLoading) {
      fetchScenesForSession(sessionId)
    }
  }, [sessionId, fetchedSessions, isLoading, fetchScenesForSession])

  // Set active scene as default selection on mount
  useEffect(() => {
    if (selectedSceneId === null && sceneArray.length > 0) {
      const activeScene = sceneArray.find(s => s.is_active)
      if (activeScene) {
        setSelectedSceneId(activeScene.id)
      } else if (sceneArray[0]) {
        setSelectedSceneId(sceneArray[0].id)
      }
    }
  }, [selectedSceneId, sceneArray])

  // Load audio when selected scene changes
  useEffect(() => {
    if (selectedScene && selectedScene.audio_config) {
      const audioConfig = selectedScene.audio_config as { audio_id?: string } | null
      const audioId = audioConfig?.audio_id

      if (audioId) {
        const audioFile = audioFileMap.get(audioId)
        if (audioFile) {
          loadTrack(audioFile.id, audioFile.file_url)
        }
      }
    }
  }, [selectedScene, audioFileMap, loadTrack])

  const handleSceneClick = async (scene: Scene) => {
    setSelectedSceneId(scene.id)
  }

  const handlePlayScene = async (scene: Scene) => {
    // TODO: Implement setActiveScene for session-specific scenes
    setSelectedSceneId(scene.id)
  }

  const parseNotes = (notes: string): Array<{ title: string; content: string }> => {
    if (!notes) return []
    const sections = notes.split(/\n\n+/)
    const parsedNotes: Array<{ title: string; content: string }> = []

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim()
      if (!section) continue

      const lines = section.split('\n')
      if (lines.length > 1) {
        parsedNotes.push({
          title: lines[0].trim(),
          content: lines.slice(1).join('\n').trim()
        })
      } else {
        parsedNotes.push({
          title: `Note ${parsedNotes.length + 1}`,
          content: section
        })
      }
    }

    return parsedNotes.slice(0, 3)
  }

  const notes = selectedScene ? parseNotes(selectedScene.notes) : []

  // Get session object from the store to pass sessionId
  const session = { id: sessionId } // We have sessionId from props

  const sidebarButtons = getSidebarButtons({
    view: 'sessionScene',
    campaignId,
    sessionId: session?.id,
    router,
    onOpenAudioLibrary: () => setIsAudioLibraryOpen(true),
    onOpenHueSetup: () => setIsHueSetupOpen(true),
  })

  const scenesSidebar = (
    <aside className="h-full" aria-label="Scenes list">
      <div className="bg-[#191919] rounded-[8px] p-3 h-full flex flex-col overflow-y-auto">
        <SectionHeader
          title="Scenes"
          variant="sidebar"
          action={{
            icon: <Plus className="w-[18px] h-[18px] text-white/70" />,
            onClick: () => {
              setEditingScene(undefined)
              setIsSceneModalOpen(true)
            },
            variant: 'icon-only',
            ariaLabel: 'Add new scene'
          }}
        />

        {sortedScenes.length === 0 ? (
          <EmptyState
            title="No scenes yet"
            description="Click + to create your first scene"
            variant="simple"
          />
        ) : (
          <ul role="list" className="space-y-2">
            {sortedScenes.map((scene) => (
              <li key={scene.id}>
                <SceneListItem
                  scene={scene}
                  isActive={scene.is_active}
                  isSelected={selectedSceneId === scene.id}
                  onClick={() => handleSceneClick(scene)}
                  onPlay={() => handlePlayScene(scene)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )

  return (
    <DashboardLayoutWithSidebar
      navSidebar={<DashboardSidebar buttons={sidebarButtons} />}
      contentSidebar={scenesSidebar}
    >
      {selectedScene ? (
        <div className="w-[640px] mx-auto">
          <PageHeader title={selectedScene.name} description={selectedScene.description || undefined} />

          {/* Scene Content */}
          <div className="pt-[40px] pb-[40px]">
            {/* Ambience Section */}
            <section aria-labelledby="ambience-heading">
              <SectionHeader title="Ambience" id="ambience-heading" />
              <div className="grid grid-cols-2 gap-2 pt-[24px]">
                <AmbienceCard
                  type="lighting"
                  title="Lighting"
                  subtitle="Winter Twilight"
                />
                <AmbienceCard
                  type="audio"
                  title="Scene Audio"
                  subtitle="Ambient Track"
                />
              </div>
            </section>

            {/* Notes Section */}
            {notes.length > 0 && (
              <section aria-labelledby="notes-heading" className="mt-4">
                <SectionHeader title="Notes" id="notes-heading" />
                <ul className="grid grid-cols-3 gap-4 pt-[24px] pb-[40px]" role="list">
                  {notes.map((note, index) => (
                    <li key={index}>
                      <NoteCard
                        title={note.title}
                        content={note.content}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <EmptyState
            title="No scene selected"
            description="Select a scene from the sidebar to view details"
            variant="centered"
          />
        </div>
      )}

      <SceneModal
        isOpen={isSceneModalOpen}
        onClose={() => {
          setIsSceneModalOpen(false)
          setEditingScene(undefined)
        }}
        campaignId={campaignId}
        sessionId={sessionId}
        scene={editingScene}
      />

      <AudioLibrary
        isOpen={isAudioLibraryOpen}
        onClose={() => setIsAudioLibraryOpen(false)}
      />

      <HueSetup
        isOpen={isHueSetupOpen}
        onClose={() => setIsHueSetupOpen(false)}
      />
    </DashboardLayoutWithSidebar>
  )
}