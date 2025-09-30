'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useAudioStore } from '@/store/audioStore'
import { useAudioFileStore } from '@/store/audioFileStore'
import { ChevronLeft, CirclePlay, Music, Flame, Plus, Settings } from 'lucide-react'
import type { Scene } from '@/types'
import { SceneListItem } from '@/components/scenes/SceneListItem'
import { AmbienceCard } from '@/components/scenes/AmbienceCard'
import { NoteCard } from '@/components/scenes/NoteCard'
import { SceneModal } from '@/components/scenes/SceneModal'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { HueSetup } from '@/components/hue/HueSetup'
import { PageHeader } from '@/components/ui/PageHeader'
import { AudioPlayerFooter } from '@/components/dashboard/AudioPlayerFooter'

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

  const { audioFiles } = useAudioFileStore()
  const audioFileMap = useMemo(
    () => (audioFiles instanceof Map ? audioFiles : new Map()),
    [audioFiles]
  )

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

  return (
    <div className="h-screen w-full bg-[#111111] flex flex-col">
      <div className="flex-1 min-h-0 flex overflow-hidden gap-2 px-2 pt-2 pb-2">
        {/* Navigation Sidebar */}
        <nav className="w-14 flex-shrink-0" aria-label="Main navigation">
          <div className="bg-[#191919] rounded-lg p-2 h-full flex flex-col gap-2">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Navigate back"
            >
              <ChevronLeft className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              className="w-10 h-10 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Play scene"
            >
              <CirclePlay className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              onClick={() => router.push(`/campaigns/${campaignId}`)}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Campaign settings"
            >
              <Settings className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              onClick={() => setIsAudioLibraryOpen(true)}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Music library"
            >
              <Music className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              onClick={() => setIsHueSetupOpen(true)}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Lighting effects"
            >
              <Flame className="w-[18px] h-[18px] text-white/70" />
            </button>
          </div>
        </nav>

        {/* Scenes List Sidebar */}
        <aside className="w-80 flex-shrink-0" aria-label="Scenes list">
          <div className="bg-[#191919] rounded-lg p-3 h-full flex flex-col overflow-y-auto">
            <header className="flex items-center justify-between p-2 mb-2">
              <h2 className="text-[#b4b4b4] font-semibold text-base">Scenes</h2>
              <button
                onClick={() => {
                  setEditingScene(undefined)
                  setIsSceneModalOpen(true)
                }}
                className="hover:opacity-80 transition-opacity"
                aria-label="Add new scene"
              >
                <Plus className="w-[18px] h-[18px] text-white/70" />
              </button>
            </header>

            {sortedScenes.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-neutral-400">No scenes yet</p>
                <p className="text-xs text-neutral-500 mt-1">Click + to create your first scene</p>
              </div>
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

        {/* Main Content */}
        <main className="flex-1 bg-[#191919] rounded-lg flex flex-col overflow-hidden">
          {selectedScene ? (
            <>
              <PageHeader title={selectedScene.name} description={selectedScene.description || undefined} />

              {/* Scene Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="w-[640px] mx-auto pt-[40px] pb-[40px]">
                  {/* Ambience Section */}
                  <section aria-labelledby="ambience-heading">
                    <header className="h-[48px] pt-[24px]">
                      <h2 id="ambience-heading" className="text-base font-semibold text-white">Ambience</h2>
                    </header>
                    <div className="grid grid-cols-2 gap-4 pt-[24px]">
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
                      <header className="h-[48px] pt-[24px]">
                        <h2 id="notes-heading" className="text-base font-semibold text-white">Notes</h2>
                      </header>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-center">
                <span className="block text-lg font-medium text-white mb-2">No scene selected</span>
                <span className="block text-neutral-400">
                  Select a scene from the sidebar to view details
                </span>
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Audio Player Footer - Only show when track is loaded */}
      <AudioPlayerFooter />

      <SceneModal
        isOpen={isSceneModalOpen}
        onClose={() => {
          setIsSceneModalOpen(false)
          setEditingScene(undefined)
        }}
        campaignId={campaignId}
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
    </div>
  )
}