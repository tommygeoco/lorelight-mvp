'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSceneStore } from '@/store/sceneStore'
import { ChevronLeft, CirclePlay, Music, Flame, Plus, Settings } from 'lucide-react'
import type { Scene } from '@/types'
import { SceneListItem } from '@/components/scenes/SceneListItem'
import { AmbienceCard } from '@/components/scenes/AmbienceCard'
import { NoteCard } from '@/components/scenes/NoteCard'
import { SceneModal } from '@/components/scenes/SceneModal'
import { PageHeader } from '@/components/ui/PageHeader'

interface SessionSceneViewProps {
  campaignId: string
}

export function SessionSceneView({ campaignId }: SessionSceneViewProps) {
  const router = useRouter()
  const {
    scenes,
    isLoading,
    fetchScenesForCampaign,
    setActiveScene,
    currentSceneId,
    fetchedCampaigns
  } = useSceneStore()

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(currentSceneId)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)

  const sceneArray = useMemo(
    () => Array.from(scenes.values()).filter(s => s.campaign_id === campaignId),
    [scenes, campaignId]
  )

  useEffect(() => {
    if (!fetchedCampaigns.has(campaignId) && !isLoading) {
      fetchScenesForCampaign(campaignId)
    }
  }, [campaignId, fetchedCampaigns, isLoading, fetchScenesForCampaign])

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
    ? scenes.get(selectedSceneId)
    : sortedScenes.find(s => s.is_active) || sortedScenes[0]

  const handleSceneClick = async (scene: Scene) => {
    setSelectedSceneId(scene.id)
  }

  const handlePlayScene = async (scene: Scene) => {
    await setActiveScene(scene.id, campaignId)
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
      <div className="flex-1 min-h-0 flex overflow-hidden gap-2 p-2">
        {/* Navigation Sidebar */}
        <nav className="w-14 flex-shrink-0" aria-label="Main navigation">
          <div className="bg-[#191919] rounded-lg p-2 h-full flex flex-col gap-2">
            <button
              onClick={() => router.push('/campaigns')}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Navigate back to campaigns"
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
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Music library"
            >
              <Music className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
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
                onClick={() => setIsSceneModalOpen(true)}
                className="hover:opacity-80 transition-opacity"
                aria-label="Add new scene"
              >
                <Plus className="w-[18px] h-[18px] text-white/70" />
              </button>
            </header>

            {sortedScenes.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-neutral-400">No scenes yet</p>
                <p className="text-xs text-neutral-500 mt-1">Click + to create your first scene</p>
              </div>
            ) : (
              <ul role="list">
                {sortedScenes.map((scene) => (
                  <li key={scene.id}>
                    <SceneListItem
                      scene={scene}
                      isActive={scene.is_active}
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
        <main className="flex-1 bg-[#191919] rounded-tl-lg rounded-tr-2xl flex flex-col overflow-hidden">
          {selectedScene ? (
            <>
              <PageHeader title={selectedScene.name} description={selectedScene.description || undefined} />

              {/* Scene Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="w-[640px] mx-auto pt-[40px] pb-[40px]">
                  {/* Ambience Section */}
                  <section aria-labelledby="ambience-heading">
                    <header className="h-[48px] pt-[24px]">
                      <h2 id="ambience-heading" className="text-base font-semibold text-white leading-6">Ambience</h2>
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
                        <h2 id="notes-heading" className="text-base font-semibold text-white leading-6">Notes</h2>
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
                <span className="block text-sm text-neutral-400">
                  Select a scene from the sidebar to view details
                </span>
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Audio Player Footer */}
      {selectedScene && (
        <footer className="h-20 flex-shrink-0 bg-[#111111] border-t border-white/10 flex items-center px-6 gap-6" role="region" aria-label="Audio player">
          <div className="flex-1 flex items-center gap-2">
              <div className="w-12 h-12 bg-white/[0.07] rounded-md overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-pink-500/50 to-purple-500/50" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm text-[#eeeeee] font-medium leading-5 truncate">{selectedScene.name}</p>
                <p className="text-xs text-[#7b7b7b] font-medium leading-[18px] truncate">
                  {selectedScene.scene_type || 'Scene'}
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-4 justify-center">
              <span className="text-sm text-[#7b7b7b] font-medium leading-5 whitespace-nowrap">1:24</span>
              <div className="flex-1 h-[5px] bg-white/20 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-white opacity-20" />
              </div>
              <span className="text-sm text-[#7b7b7b] font-medium leading-5 whitespace-nowrap">3:48</span>
            </div>

            <div className="flex-1 flex items-center gap-6 justify-end">
              <Music className="w-6 h-6 text-white/70" />
              <Music className="w-6 h-6 text-white/70" />
              <div className="w-8 h-8 bg-[#eeeeee] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 flex gap-0.5">
                  <div className="w-1 bg-black" />
                  <div className="w-1 bg-black" />
                </div>
              </div>
            </div>
        </footer>
      )}

      <SceneModal
        isOpen={isSceneModalOpen}
        onClose={() => setIsSceneModalOpen(false)}
        campaignId={campaignId}
      />
    </div>
  )
}