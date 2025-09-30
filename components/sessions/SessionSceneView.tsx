'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSceneStore } from '@/store/sceneStore'
import { ChevronLeft, CirclePlay, Music, Flame, Plus, Lightbulb, Settings } from 'lucide-react'
import type { Scene } from '@/types'
import { SceneListItem } from '@/components/scenes/SceneListItem'
import { AmbienceCard } from '@/components/scenes/AmbienceCard'
import { NoteCard } from '@/components/scenes/NoteCard'

interface SessionSceneViewProps {
  campaignId: string
}

// Temporary placeholder for scene thumbnail generation
function getSceneThumbnail(scene: Scene): string {
  // This would generate gradient based on scene_type or use actual thumbnail
  const colors = {
    Story: ['#8B5CF6', '#EC4899'],
    Encounter: ['#EF4444', '#F59E0B'],
    Event: ['#F59E0B', '#10B981'],
    Location: ['#6366F1', '#8B5CF6'],
    Rest: ['#F59E0B', '#EF4444'],
    default: ['#6B7280', '#9CA3AF']
  }
  return `linear-gradient(135deg, ${colors[scene.scene_type as keyof typeof colors]?.[0] || colors.default[0]}, ${colors[scene.scene_type as keyof typeof colors]?.[1] || colors.default[1]})`
}

export function SessionSceneView({ campaignId }: SessionSceneViewProps) {
  const router = useRouter()
  const {
    scenes,
    isLoading,
    fetchScenesForCampaign,
    setActiveScene,
    currentSceneId
  } = useSceneStore()

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(currentSceneId)

  const sceneArray = useMemo(
    () => Array.from(scenes.values()).filter(s => s.campaign_id === campaignId),
    [scenes, campaignId]
  )

  useEffect(() => {
    // Only fetch if we don't have scenes for this campaign
    if (sceneArray.length === 0 && !isLoading) {
      fetchScenesForCampaign(campaignId)
    }
  }, [campaignId, sceneArray.length, isLoading, fetchScenesForCampaign])

  // Sort: active first, then by order_index
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

  // Parse notes into individual note cards
  const parseNotes = (notes: string): Array<{ title: string; content: string }> => {
    if (!notes) return []

    // Split by double newlines or headers
    const sections = notes.split(/\n\n+/)
    const parsedNotes: Array<{ title: string; content: string }> = []

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim()
      if (!section) continue

      // Check if starts with a title-like pattern (bold, all caps, etc)
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

    return parsedNotes.slice(0, 3) // Limit to 3 as in design
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111]">
        <div className="text-neutral-400">Loading scenes...</div>
      </div>
    )
  }

  const notes = selectedScene ? parseNotes(selectedScene.notes) : []

  return (
    <div className="bg-[#111111] rounded-2xl h-screen flex flex-col relative overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar + Scenes List */}
        <div className="flex gap-2 p-2">
          {/* Icon Sidebar */}
          <div className="bg-[#191919] rounded-lg p-2 flex flex-col gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button className="w-10 h-10 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center transition-colors">
              <CirclePlay className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              onClick={() => router.push(`/campaigns/${campaignId}`)}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              title="Manage Campaign"
            >
              <Settings className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
              <Music className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
              <Flame className="w-[18px] h-[18px] text-white/70" />
            </button>
          </div>

          {/* Scenes List */}
          <div className="bg-[#191919] rounded-lg p-3 w-80 flex flex-col overflow-y-auto">
            {/* Scenes Header */}
            <div className="flex items-center justify-between p-2 mb-2">
              <h2 className="text-[#b4b4b4] font-semibold text-base">Scenes</h2>
              <button className="hover:opacity-80 transition-opacity">
                <Plus className="w-[18px] h-[18px] text-white/70" />
              </button>
            </div>

            {/* Scene Items */}
            <div className="space-y-2">
              {sortedScenes.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-neutral-400">No scenes yet</p>
                  <p className="text-xs text-neutral-500 mt-1">Click + to create your first scene</p>
                </div>
              ) : (
                sortedScenes.slice(0, 6).map((scene) => (
                  <SceneListItem
                    key={scene.id}
                    scene={scene}
                    isActive={scene.is_active}
                    onClick={() => handleSceneClick(scene)}
                    onPlay={() => handlePlayScene(scene)}
                  />
                ))
              )}
            </div>

            {/* Pinned Section Divider */}
            {sortedScenes.length > 6 && (
              <>
                <div className="h-6 my-4" />
                <div className="flex items-center p-2 mb-2">
                  <h3 className="text-[#b4b4b4] font-semibold text-sm">Pinned</h3>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#191919] rounded-lg m-2 ml-0 flex flex-col overflow-hidden">
          {selectedScene ? (
            <>
              {/* Hero Section with Gradient */}
              <div className="relative pt-20 pb-6 px-24">
                {/* Gradient Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute w-[668px] h-40 -top-[137px] left-[92px] opacity-50 blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)' }}
                  />
                  <div
                    className="absolute w-[668px] h-40 -top-[137px] right-[30px] opacity-50 blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)' }}
                  />
                </div>

                {/* Scene Title */}
                <div className="relative max-w-[640px] mx-auto">
                  <h1
                    className="text-6xl font-bold text-white mb-4 leading-[72px] tracking-tight"
                    style={{ fontFamily: '"PP Mondwest", sans-serif' }}
                  >
                    {selectedScene.name}
                  </h1>

                  {selectedScene.description && (
                    <p className="text-sm text-[#eeeeee] leading-5 font-normal">
                      {selectedScene.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Content Sections */}
              <div className="flex-1 overflow-y-auto px-24 py-10">
                <div className="max-w-[640px] mx-auto space-y-16">
                  {/* Ambience Section */}
                  <div>
                    <h2 className="text-base font-semibold text-white mb-6">Ambience</h2>
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  {/* Notes Section */}
                  {notes.length > 0 && (
                    <div>
                      <h2 className="text-base font-semibold text-white mb-6">Notes</h2>
                      <div className="grid grid-cols-3 gap-4">
                        {notes.map((note, index) => (
                          <NoteCard
                            key={index}
                            title={note.title}
                            content={note.content}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">No scene selected</h3>
                <p className="text-sm text-neutral-400">
                  Select a scene from the sidebar to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-[#111111] border-t border-white/10 px-6 py-4 flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Scene thumbnail preview */}
          {selectedScene && (
            <>
              <div
                className="w-12 h-12 rounded-md flex-shrink-0 relative overflow-hidden"
                style={{ background: getSceneThumbnail(selectedScene) }}
              />
              <div
                className="w-12 h-12 rounded-md bg-white/[0.07] flex items-center justify-center flex-shrink-0"
                style={{ background: getSceneThumbnail(selectedScene) }}
              >
                <Lightbulb className="w-[18px] h-[18px] text-white opacity-70" />
              </div>
            </>
          )}
        </div>

        {/* Scene Info */}
        {selectedScene && (
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-[#eeeeee] truncate">
              {selectedScene.name}
            </div>
            <div className="text-xs text-[#7b7b7b]">
              {selectedScene.scene_type}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}