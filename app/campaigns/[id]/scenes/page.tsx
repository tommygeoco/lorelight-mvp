'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { useSceneStore } from '@/store/sceneStore'
import { useHueStore } from '@/store/hueStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { useToastStore } from '@/store/toastStore'
import { Plus, Edit2, Copy, Trash2, Music, Lightbulb, Play, Star, Clock } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { EmptyState } from '@/components/ui/EmptyState'
import { SceneModal } from '@/components/scenes/SceneModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'
import type { Scene } from '@/types'

export default function ScenesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { campaigns, fetchCampaigns } = useCampaignStore()
  const { scenes, fetchScenesForCampaign, activateScene, createScene, deleteScene, toggleFavorite, fetchedCampaigns, isLoading } = useSceneStore()
  const { rooms, lights, applyLightConfig } = useHueStore()
  const audioFileMap = useAudioFileMap()
  const { addToast } = useToastStore()

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false)
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; scene?: Scene } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sceneToDelete, setSceneToDelete] = useState<Scene | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sceneFilter, setSceneFilter] = useState<'all' | 'favorites' | 'recent'>('all')

  const campaign = campaigns.get(resolvedParams.id)
  const campaignScenes = Array.from(scenes.values())
    .filter((s) => s.campaign_id === resolvedParams.id)
    .sort((a, b) => {
      // Active scenes first, then by order_index
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1
      return a.order_index - b.order_index
    })

  const filteredScenes = useMemo(() => {
    if (sceneFilter === 'favorites') {
      return campaignScenes.filter(s => s.is_favorite)
    } else if (sceneFilter === 'recent') {
      return campaignScenes
        .filter(s => s.last_viewed_at)
        .sort((a, b) => {
          const dateA = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0
          const dateB = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 10)
    }
    return campaignScenes
  }, [campaignScenes, sceneFilter])

  const selectedScene = selectedSceneId
    ? campaignScenes.find(s => s.id === selectedSceneId)
    : campaignScenes.find(s => s.is_active) || campaignScenes[0]

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  // Auto-select active scene or first scene
  useEffect(() => {
    if (selectedSceneId === null && campaignScenes.length > 0) {
      const activeScene = campaignScenes.find(s => s.is_active)
      if (activeScene) {
        setSelectedSceneId(activeScene.id)
      } else if (campaignScenes[0]) {
        setSelectedSceneId(campaignScenes[0].id)
      }
    }
  }, [selectedSceneId, campaignScenes])

  useEffect(() => {
    if (campaigns.size === 0) {
      fetchCampaigns()
    }
  }, [campaigns.size, fetchCampaigns])

  useEffect(() => {
    if (!fetchedCampaigns.has(resolvedParams.id) && !isLoading) {
      fetchScenesForCampaign(resolvedParams.id)
    }
  }, [resolvedParams.id, fetchedCampaigns, isLoading, fetchScenesForCampaign])

  // Redirect if campaign not found
  useEffect(() => {
    if (!campaign && campaigns.size > 0) {
      router.push('/campaigns')
    }
  }, [campaign, campaigns.size, router])

  if (!campaign && campaigns.size === 0) {
    return null
  }

  if (!campaign) {
    return null
  }

  const handlePlayScene = async (scene: Scene) => {
    try {
      await activateScene(scene.id)
      addToast(`Activated "${scene.name}"`, 'success')
    } catch (error) {
      console.error('Failed to activate scene:', error)
      addToast('Failed to activate scene', 'error')
    }
  }

  const handleTestLights = async (lightConfig: unknown) => {
    try {
      await applyLightConfig(lightConfig as Parameters<typeof applyLightConfig>[0])
      addToast('Lighting preview activated', 'success')
    } catch (error) {
      console.error('Failed to test lights:', error)
      addToast('Failed to test lights', 'error')
    }
  }

  const handleSceneClick = async (scene: Scene) => {
    // Always select the scene for detail view
    setSelectedSceneId(scene.id)

    // Track that this scene was viewed
    useSceneStore.getState().updateLastViewed(scene.id)

    // If scene is configured and not already active, activate it
    if ((scene.audio_config || scene.light_config) && !scene.is_active) {
      try {
        await activateScene(scene.id)
        addToast(`Activated: ${scene.name}`, 'success')
      } catch (error) {
        console.error('Failed to activate scene:', error)
        addToast('Failed to activate scene', 'error')
      }
    }
  }

  const handleEditScene = (sceneId: string) => {
    setEditingSceneId(sceneId)
    setIsSceneModalOpen(true)
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
    if ((e.target as HTMLElement).closest('[data-scene-item]')) {
      return
    }
    handleContextMenu(e)
  }

  const handleRename = (scene: Scene) => {
    setEditingSceneId(scene.id)
    setIsSceneModalOpen(true)
    setContextMenu(null)
  }


  const handleDuplicate = async (scene: Scene) => {
    try {
      const duplicated = await createScene({
        campaign_id: resolvedParams.id,
        name: `${scene.name} (Copy)`,
        description: scene.description,
        scene_type: scene.scene_type,
        audio_config: scene.audio_config,
        light_config: scene.light_config,
        notes: scene.notes,
        order_index: campaignScenes.length,
        is_active: false
      })
      addToast(`Duplicated "${scene.name}"`, 'success')
      setContextMenu(null)
      setEditingSceneId(duplicated.id)
    } catch (error) {
      console.error('Failed to duplicate scene:', error)
      addToast('Failed to duplicate scene', 'error')
    }
  }

  const handleDeleteClick = (scene: Scene, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSceneToDelete(scene)
    setIsDeleteDialogOpen(true)
    setContextMenu(null)
  }

  const handleDelete = async () => {
    if (!sceneToDelete) return

    setIsDeleting(true)
    try {
      await deleteScene(sceneToDelete.id)
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

  const handleToggleFavorite = async (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleFavorite(scene.id)
      const action = scene.is_favorite ? 'Removed from' : 'Added to'
      addToast(`${action} favorites`, 'success')
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      addToast('Failed to update favorite', 'error')
    }
  }

  const handleCloseModal = () => {
    setIsSceneModalOpen(false)
    setEditingSceneId(null)
    fetchScenesForCampaign(resolvedParams.id)
  }

  const sidebarButtons = getSidebarButtons({
    view: 'scenes',
    campaignId: resolvedParams.id,
    router,
  })

  const scenesSidebar = (
    <div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-base font-semibold text-white">Scenes</h2>
        <button
          onClick={() => {
            setEditingSceneId(null)
            setIsSceneModalOpen(true)
          }}
          className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
          aria-label="New Scene"
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
        {/* Scenes List */}
        {filteredScenes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-[0.875rem]">
              {sceneFilter === 'favorites' ? 'No favorite scenes...' : 
               sceneFilter === 'recent' ? 'No recently viewed scenes...' : 
               'No scenes discovered...'}<br />
              {sceneFilter === 'all' && 'Create a scene to begin'}
            </p>
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {filteredScenes.map((scene) => {
              const isSelected = selectedSceneId === scene.id
              const hasAudio = !!scene.audio_config
              const hasLights = !!scene.light_config

              return (
                <li key={scene.id} data-scene-item>
                  <div
                    className={`group flex flex-col px-3 py-2 rounded-[8px] transition-colors cursor-pointer ${
                      isSelected ? 'bg-white/10' : scene.is_active ? 'bg-white/[0.05]' : 'hover:bg-white/5'
                    }`}
                    onClick={() => handleSceneClick(scene)}
                    onContextMenu={(e) => handleContextMenu(e, scene)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate text-[13px] text-white font-medium">{scene.name}</span>
                      <button
                        onClick={(e) => handleToggleFavorite(scene, e)}
                        className={`w-5 h-5 flex items-center justify-center rounded hover:bg-yellow-500/10 transition-all flex-shrink-0 ${
                          scene.is_favorite ? 'opacity-100 text-yellow-400' : 'opacity-0 group-hover:opacity-100 text-white/30 hover:text-yellow-400'
                        }`}
                        title={scene.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className="w-3 h-3" fill={scene.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(scene, e)}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
                        title="Delete scene"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Config indicators */}
                    <div className="ml-0 text-[11px] text-white/30 mt-0.5 flex items-center gap-2">
                      {hasAudio && (
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          Audio
                        </span>
                      )}
                      {hasLights && (
                        <span className="flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Lights
                        </span>
                      )}
                      {!hasAudio && !hasLights && <span>No config</span>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )

  return (
    <>
      <DashboardLayoutWithSidebar
        navSidebar={<DashboardSidebar buttons={sidebarButtons} />}
        contentSidebar={scenesSidebar}
      >
        {selectedScene ? (
          <div className="max-w-[800px] mx-auto">
            {/* Cinematic Hero Section */}
            <div className="relative rounded-[16px] overflow-hidden bg-[#191919] border border-white/10 shadow-2xl">
              {/* Dynamic gradient background based on scene config */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-orange-600/30" />
              <div className="absolute inset-0 backdrop-blur-[100px]" />

              {/* Massive gradient blobs */}
              <div className="absolute w-[400px] h-[400px] -left-32 -top-32 opacity-40 mix-blend-screen blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)' }} />
              <div className="absolute w-[400px] h-[400px] -right-32 -bottom-32 opacity-40 mix-blend-screen blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, transparent 70%)' }} />

              {/* Content */}
              <div className="relative p-12">
                {/* Scene Title */}
                <div className="text-center mb-8">
                  {selectedScene.is_active && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-[11px] font-semibold text-purple-300 mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      ACTIVE SCENE
                    </div>
                  )}
                  <h1 className="text-4xl font-bold text-white mb-2">{selectedScene.name}</h1>
                  {selectedScene.description && (
                    <p className="text-white/60 text-lg">{selectedScene.description}</p>
                  )}
                </div>

                {/* Scene Components Preview */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Audio Preview */}
                  {selectedScene.audio_config ? (
                    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-[12px] p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-white/40 uppercase font-semibold tracking-wide">Audio</div>
                          <div className="text-white font-semibold truncate">
                            {(() => {
                              const config = selectedScene.audio_config as { audio_id?: string; volume?: number; loop?: boolean }
                              const audioFile = config.audio_id ? audioFileMap.get(config.audio_id) : null
                              return audioFile?.name || 'Unknown track'
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[13px] text-white/50">
                        <span>Volume: {(() => {
                          const config = selectedScene.audio_config as { volume?: number }
                          return Math.round((config.volume ?? 0.7) * 100)
                        })()}%</span>
                        {(() => {
                          const config = selectedScene.audio_config as { loop?: boolean }
                          return config.loop && <span>• Loop enabled</span>
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/20 backdrop-blur-sm border border-white/10 border-dashed rounded-[12px] p-6 flex items-center justify-center">
                      <div className="text-center text-white/30">
                        <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <div className="text-[13px]">No audio</div>
                      </div>
                    </div>
                  )}

                  {/* Lighting Preview */}
                  {selectedScene.light_config ? (
                    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-[12px] p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-white/40 uppercase font-semibold tracking-wide">Lighting</div>
                          <div className="text-white font-semibold truncate">
                            {(() => {
                              const config = selectedScene.light_config as { lights?: Record<string, unknown>; groups?: Record<string, unknown> }
                              const lightIds = config.lights ? Object.keys(config.lights) : []
                              const groupIds = config.groups ? Object.keys(config.groups) : []
                              const count = lightIds.length || groupIds.length
                              const type = lightIds.length > 0 ? 'light' : 'room'
                              return `${count} ${count === 1 ? type : type + 's'}`
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="text-[13px] text-white/50">
                        {(() => {
                          const config = selectedScene.light_config as { lights?: Record<string, unknown>; groups?: Record<string, unknown> }
                          if (config.lights) {
                            const lightIds = Object.keys(config.lights)
                            const lightNames = lightIds.map(id => lights.get(id)?.name || `Light ${id}`).slice(0, 3)
                            return lightNames.join(', ') + (lightIds.length > 3 ? ` +${lightIds.length - 3} more` : '')
                          } else if (config.groups) {
                            const groupIds = Object.keys(config.groups)
                            const roomNames = groupIds.map(id => rooms.get(id)?.name || `Room ${id}`).slice(0, 3)
                            return roomNames.join(', ') + (groupIds.length > 3 ? ` +${groupIds.length - 3} more` : '')
                          }
                          return 'Configured'
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/20 backdrop-blur-sm border border-white/10 border-dashed rounded-[12px] p-6 flex items-center justify-center">
                      <div className="text-center text-white/30">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <div className="text-[13px]">No lighting</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action */}
                <div className="flex items-center justify-center gap-3">
                  {(selectedScene.audio_config || selectedScene.light_config) ? (
                    <>
                      <button
                        onClick={() => handlePlayScene(selectedScene)}
                        disabled={selectedScene.is_active}
                        className="group relative px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[12px] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none inline-flex items-center gap-3"
                      >
                        <Play className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" />
                        {selectedScene.is_active ? 'Scene Active' : 'Activate Scene'}
                      </button>
                      <button
                        onClick={() => handleEditScene(selectedScene.id)}
                        className="px-4 py-4 text-white/70 hover:text-white hover:bg-white/5 rounded-[12px] transition-colors"
                        aria-label="Edit scene"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditScene(selectedScene.id)}
                      className="px-8 py-4 text-lg font-semibold bg-white/10 hover:bg-white/15 text-white rounded-[12px] transition-colors inline-flex items-center gap-3"
                    >
                      <Edit2 className="w-5 h-5" />
                      Configure Scene
                    </button>
                  )}
                </div>

                {/* Quick Actions */}
                {selectedScene.light_config && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => handleTestLights(selectedScene.light_config)}
                      className="text-[13px] text-white/50 hover:text-white/70 transition-colors inline-flex items-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Test lights
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No scene selected"
              description="Choose a scene from the sidebar"
              variant="centered"
            />
          </div>
        )}
      </DashboardLayoutWithSidebar>

      <SceneModal
        isOpen={isSceneModalOpen}
        onClose={handleCloseModal}
        campaignId={resolvedParams.id}
        sceneId={editingSceneId || undefined}
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
                setEditingSceneId(null)
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
                Edit
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
                onClick={() => {
                  handleDeleteClick(contextMenu.scene!)
                  setContextMenu(null)
                }}
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
    </>
  )
}
