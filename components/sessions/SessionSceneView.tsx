'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionSceneStore } from '@/store/sessionSceneStore'
import { useSceneStore } from '@/store/sceneStore'
import { useToastStore } from '@/store/toastStore'
import { useAudioStore } from '@/store/audioStore'
import { Plus, Edit2, Copy, Trash2, Star, Clock } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Scene } from '@/types'
import { SceneListItem } from '@/components/scenes/SceneListItem'
import { SceneModal } from '@/components/scenes/SceneModal'
import { SceneEditor } from '@/components/scenes/SceneEditor'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { HueSetup } from '@/components/hue/HueSetup'
import { EmptyState } from '@/components/ui/EmptyState'
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
    _version, // Subscribe to version changes to trigger re-renders
  } = useSessionSceneStore()

  const {
    createScene,
    deleteScene,
    toggleFavorite
  } = useSceneStore()

  const { addToast } = useToastStore()

  // Get audio state to determine if scene is actually playing
  const { isPlaying, sourceContext } = useAudioStore()

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isHueSetupOpen, setIsHueSetupOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | undefined>(undefined)
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    scene?: Scene
  } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sceneToDelete, setSceneToDelete] = useState<Scene | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreatingScene, setIsCreatingScene] = useState(false)
  const [newSceneName, setNewSceneName] = useState('')
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null)

  // Get session-specific scenes from sessionSceneStore
  const sceneArray = useMemo(
    () => sessionScenes.get(sessionId) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionScenes, sessionId, _version] // _version forces re-render when scenes update
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

  // Note: Audio loading removed - scenes now require explicit activation via play button

  const handleSceneClick = async (scene: Scene) => {
    setSelectedSceneId(scene.id)
    // Track that this scene was viewed
    useSceneStore.getState().updateLastViewed(scene.id)
  }

  const handleToggleFavorite = async (scene: Scene) => {
    const currentFavorite = scene.is_favorite ?? false
    const newFavorite = !currentFavorite

    // INSTANT: Update local sessionSceneStore first
    const currentScenes = sessionScenes.get(sessionId) || []
    const updatedScenes = currentScenes.map(s =>
      s.id === scene.id ? { ...s, is_favorite: newFavorite } : s
    )
    useSessionSceneStore.setState((state) => ({
      ...state,
      sessionScenes: new Map(state.sessionScenes).set(sessionId, updatedScenes),
      _version: state._version + 1
    }))

    // BACKGROUND: Update database and sceneStore
    try {
      await toggleFavorite(scene.id)
      const action = newFavorite ? 'Added to' : 'Removed from'
      addToast(`${action} favorites`, 'success')
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      addToast('Failed to update favorite', 'error')
      // Rollback
      const rollbackScenes = currentScenes.map(s =>
        s.id === scene.id ? { ...s, is_favorite: currentFavorite } : s
      )
      useSessionSceneStore.setState((state) => ({
        ...state,
        sessionScenes: new Map(state.sessionScenes).set(sessionId, rollbackScenes),
        _version: state._version + 1
      }))
    }
  }

  const handlePlayScene = (scene: Scene) => {
    if (scene.is_active) {
      // Optimistic UI update - deactivate
      const currentScenes = sessionScenes.get(sessionId) || []
      const updatedScenes = currentScenes.map(s => ({
        ...s,
        is_active: s.id === scene.id ? false : s.is_active,
        updated_at: new Date().toISOString()
      }))

      useSessionSceneStore.setState((state) => ({
        ...state,
        sessionScenes: new Map(state.sessionScenes).set(sessionId, updatedScenes)
      }))

      // Fire and forget
      useSceneStore.getState().deactivateScene(scene.id).catch(console.error)
    } else {
      // Optimistic UI update - activate this, deactivate all others
      const currentScenes = sessionScenes.get(sessionId) || []
      const updatedScenes = currentScenes.map(s => ({
        ...s,
        is_active: s.id === scene.id,
        updated_at: new Date().toISOString()
      }))

      useSessionSceneStore.setState((state) => ({
        ...state,
        sessionScenes: new Map(state.sessionScenes).set(sessionId, updatedScenes)
      }))

      setSelectedSceneId(scene.id)

      // Fire and forget
      useSceneStore.getState().activateScene(scene.id).catch(console.error)
    }
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
    setEditingSceneId(scene.id)
    setEditingName(scene.name)
    setContextMenu(null)
  }

  const handleRenameSubmit = async (sceneId: string) => {
    if (!editingName.trim()) {
      setEditingSceneId(null)
      return
    }

    const originalScene = sceneArray.find(s => s.id === sceneId)
    if (!originalScene || originalScene.name === editingName) {
      setEditingSceneId(null)
      return
    }

    try {
      await useSceneStore.getState().updateScene(sceneId, { name: editingName })

      // Update the scene in sessionSceneStore without refetching
      const currentScenes = sessionScenes.get(sessionId) || []
      const updatedScenes = currentScenes.map(scene =>
        scene.id === sceneId ? { ...scene, name: editingName, updated_at: new Date().toISOString() } : scene
      )

      // Use the store's setState with proper Immer handling
      useSessionSceneStore.setState((state) => ({
        ...state,
        sessionScenes: new Map(state.sessionScenes).set(sessionId, updatedScenes)
      }))

      addToast(`Renamed to "${editingName}"`, 'success')
      setEditingSceneId(null)
    } catch (error) {
      console.error('Failed to rename scene:', error)
      addToast('Failed to rename scene', 'error')
      setEditingSceneId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingSceneId(null)
    setEditingName('')
  }

  const handleStartSceneCreation = () => {
    setIsCreatingScene(true)
    setNewSceneName('')
  }

  const handleCreateSceneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSceneName.trim()) {
      setIsCreatingScene(false)
      return
    }

    try {
      // Create minimal scene
      const newScene = await createScene({
        campaign_id: campaignId,
        name: newSceneName.trim(),
        description: null,
        scene_type: 'default',
        audio_config: null,
        light_config: null,
        notes: null,
        order_index: sceneArray.length,
        is_active: false
      })

      // Add to session
      await addSceneToSession(sessionId, newScene.id)

      // Auto-select and navigate
      setSelectedSceneId(newScene.id)
      setIsCreatingScene(false)
      setNewSceneName('')
      addToast(`Created "${newScene.name}"`, 'success')
    } catch (error) {
      console.error('Failed to create scene:', error)
      addToast('Failed to create scene', 'error')
      setIsCreatingScene(false)
    }
  }

  const handleCancelSceneCreation = () => {
    setIsCreatingScene(false)
    setNewSceneName('')
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
      // Optimistically remove from UI immediately
      useSessionSceneStore.getState().removeSceneFromSession(sessionId, sceneToDelete.id)
      
      // Delete from database
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
      
      // Refetch to restore on error
      fetchScenesForSession(sessionId)
    } finally {
      setIsDeleting(false)
    }
  }

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

  const [sceneFilter, setSceneFilter] = useState<'all' | 'favorites' | 'recent'>('all')

  const filteredScenes = useMemo(() => {
    if (sceneFilter === 'favorites') {
      return sortedScenes.filter(s => s.is_favorite)
    } else if (sceneFilter === 'recent') {
      return sortedScenes
        .filter(s => s.last_viewed_at)
        .sort((a, b) => {
          const dateA = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0
          const dateB = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 10) // Top 10 recent
    }
    return sortedScenes
  }, [sortedScenes, sceneFilter])

  const scenesSidebar = (
    <div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col" aria-label="Scenes list">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-sm font-semibold text-white">Scenes</h2>
        <button
          onClick={handleStartSceneCreation}
          className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
          aria-label="Add new scene"
          title="Create scene"
        >
          <Plus className="w-[18px] h-[18px] text-white/70" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-6 pt-4 pb-3">
        <button
          onClick={() => setSceneFilter('all')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors ${
            sceneFilter === 'all'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSceneFilter('favorites')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors flex items-center justify-center gap-1.5 ${
            sceneFilter === 'favorites'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Star className="w-3 h-3" fill={sceneFilter === 'favorites' ? 'currentColor' : 'none'} />
          Favorites
        </button>
        <button
          onClick={() => setSceneFilter('recent')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors flex items-center justify-center gap-1.5 ${
            sceneFilter === 'recent'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3 h-3" />
          Recent
        </button>
      </div>

      {/* Scrollable List */}
      <div
        className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4"
        onContextMenu={handleEmptySpaceContextMenu}
      >
        {/* Inline scene creation form */}
        {isCreatingScene && (
          <form onSubmit={handleCreateSceneSubmit} className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] rounded-[8px] border border-white/10">
              <div className="w-9 h-9 rounded-[6px] bg-white/[0.07] flex-shrink-0" />
              <input
                type="text"
                value={newSceneName}
                onChange={(e) => setNewSceneName(e.target.value)}
                onBlur={() => {
                  if (!newSceneName.trim()) {
                    handleCancelSceneCreation()
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    handleCancelSceneCreation()
                  }
                }}
                placeholder="Scene name..."
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/40"
              />
            </div>
          </form>
        )}

        {filteredScenes.length === 0 && !isCreatingScene ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-[0.875rem]">
              {sceneFilter === 'favorites' ? 'No favorite scenes...' : 
               sceneFilter === 'recent' ? 'No recently viewed scenes...' : 
               'No scenes discovered...'}<br />
              {sceneFilter === 'all' && 'Create a scene to begin'}
            </p>
          </div>
        ) : filteredScenes.length > 0 ? (
          <ul role="list" className="space-y-2">
            {filteredScenes.map((scene) => {
              // Scene is truly active only if it's marked active AND audio is playing it
              const isScenePlaying = scene.is_active &&
                                    isPlaying &&
                                    sourceContext?.type === 'scene' &&
                                    sourceContext.id === scene.id

              return (
                <li key={scene.id} data-scene-item>
                  <SceneListItem
                    scene={scene}
                    isActive={isScenePlaying}
                    isSelected={selectedSceneId === scene.id}
                    isEditing={editingSceneId === scene.id}
                    editingName={editingName}
                    onEditingNameChange={setEditingName}
                    onRenameSubmit={() => handleRenameSubmit(scene.id)}
                    onCancelEdit={handleCancelEdit}
                    onClick={() => handleSceneClick(scene)}
                    onPlay={() => handlePlayScene(scene)}
                    onToggleFavorite={() => handleToggleFavorite(scene)}
                    onContextMenu={(e) => handleContextMenu(e, scene)}
                  />
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )

  return (
    <DashboardLayoutWithSidebar
      navSidebar={<DashboardSidebar buttons={sidebarButtons} />}
      contentSidebar={scenesSidebar}
    >
      <div className="flex h-full gap-2 bg-[#111111] -m-px p-px">
        {/* Main scene content */}
        {selectedScene ? (
          <SceneEditor
            scene={selectedScene}
            campaignId={campaignId}
            sessionId={sessionId}
            expandedBlockId={expandedBlockId}
            onExpandNote={setExpandedBlockId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title="No scene chosen"
              description="The stage awaits your selection"
              variant="centered"
            />
          </div>
        )}

        {/* Expanded notes panel - 4th column with smooth transition */}
        <div className={`h-full flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          expandedBlockId && selectedScene ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
        }`}>
          <div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
              <h2 className="text-sm font-semibold text-white">Note Details</h2>
              <button
                onClick={() => setExpandedBlockId(null)}
                className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <span className="text-white/60 hover:text-white text-xl">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4">
              <p className="text-[13px] text-white/60">Expanded note view coming soon...</p>
            </div>
          </div>
        </div>
      </div>

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
        sceneId={editingScene?.id}
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