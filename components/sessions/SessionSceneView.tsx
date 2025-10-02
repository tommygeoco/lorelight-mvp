'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useSceneStore } from '@/store/sceneStore'
import { useAudioStore } from '@/store/audioStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useToastStore } from '@/store/toastStore'
import { Plus, Edit2, Copy, Trash2 } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
    fetchedSessions,
    addSceneToSession,
  } = useSessionSceneStore()

  const {
    createScene,
    deleteScene
  } = useSceneStore()

  const { loadTrack } = useAudioStore()
  const audioFileMap = useAudioFileMap()
  const { addToast } = useToastStore()

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isHueSetupOpen, setIsHueSetupOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | undefined>(undefined)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    scene?: Scene
  } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sceneToDelete, setSceneToDelete] = useState<Scene | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

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
          loadTrack(audioFile.id, audioFile.file_url, {
            type: 'scene',
            id: selectedScene.id,
            name: selectedScene.name
          })
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

  const handleContextMenu = (e: React.MouseEvent, scene?: Scene) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      scene,
    })
  }

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    // Only show context menu if not clicking on a scene item
    if ((e.target as HTMLElement).closest('[data-scene-item]')) {
      return
    }
    handleContextMenu(e)
  }

  const handleRename = (scene: Scene) => {
    setEditingScene(scene)
    setIsSceneModalOpen(true)
    setContextMenu(null)
  }

  const handleDuplicate = async (scene: Scene) => {
    try {
      const duplicatedScene = await createScene({
        campaign_id: campaignId,
        name: `${scene.name} (Copy)`,
        description: scene.description,
        scene_type: scene.scene_type,
        audio_config: scene.audio_config,
        light_config: scene.light_config,
        notes: scene.notes,
        order_index: sceneArray.length,
        is_active: false
      })

      // Add the duplicated scene to this session
      await addSceneToSession(sessionId, duplicatedScene.id)

      addToast(`Duplicated "${scene.name}"`, 'success')
      setSelectedSceneId(duplicatedScene.id)
      setContextMenu(null)
    } catch (error) {
      console.error('Failed to duplicate scene:', error)
      addToast('Failed to duplicate scene', 'error')
    }
  }

  const handleDeleteClick = (scene: Scene) => {
    setSceneToDelete(scene)
    setIsDeleteDialogOpen(true)
    setContextMenu(null)
  }

  const handleDelete = async () => {
    if (!sceneToDelete) return

    setIsDeleting(true)
    try {
      await deleteScene(sceneToDelete.id)
      if (selectedSceneId === sceneToDelete.id) {
        setSelectedSceneId(null)
      }
      addToast(`Deleted "${sceneToDelete.name}"`, 'success')
      setIsDeleteDialogOpen(false)
      setSceneToDelete(null)
    } catch (error) {
      console.error('Failed to delete scene:', error)
      addToast('Failed to delete scene', 'error')
    } finally {
      setIsDeleting(false)
    }
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
    <div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col" aria-label="Scenes list">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Scenes</h2>
        <button
          onClick={() => {
            setEditingScene(undefined)
            setIsSceneModalOpen(true)
          }}
          className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
          aria-label="Add new scene"
        >
          <Plus className="w-[18px] h-[18px] text-white/70" />
        </button>
      </div>

      {/* Scrollable List */}
      <div
        className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4"
        onContextMenu={handleEmptySpaceContextMenu}
      >
        {sortedScenes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-[0.875rem]">The stage is dark and empty...<br />Create a scene to begin</p>
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {sortedScenes.map((scene) => (
              <li key={scene.id} data-scene-item>
                <SceneListItem
                  scene={scene}
                  isActive={scene.is_active}
                  isSelected={selectedSceneId === scene.id}
                  onClick={() => handleSceneClick(scene)}
                  onPlay={() => handlePlayScene(scene)}
                  onContextMenu={(e) => handleContextMenu(e, scene)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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
            title="No scene chosen"
            description="The stage awaits your selection"
            variant="centered"
          />
        </div>
      )}

      <SceneModal
        isOpen={isSceneModalOpen}
        onClose={() => {
          setIsSceneModalOpen(false)
          setEditingScene(undefined)
          // Refetch to get updated scene data
          if (editingScene) {
            fetchScenesForSession(sessionId, true)
          }
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Show "New Scene" if no scene (empty space click) */}
          {!contextMenu.scene ? (
            <button
              onClick={() => {
                setEditingScene(undefined)
                setIsSceneModalOpen(true)
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Scene
            </button>
          ) : (
            <>
              <button
                onClick={() => handleRename(contextMenu.scene!)}
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={() => handleDuplicate(contextMenu.scene!)}
                className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => handleDeleteClick(contextMenu.scene!)}
                className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSceneToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Scene"
        description={`Are you sure you want to delete "${sceneToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </DashboardLayoutWithSidebar>
  )
}