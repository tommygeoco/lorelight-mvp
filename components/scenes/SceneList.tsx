'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSceneStore } from '@/store/sceneStore'
import { SceneRow } from './SceneRow'
import { SceneForm } from './SceneForm'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import type { Scene } from '@/types'

interface SceneListProps {
  campaignId: string
}

export function SceneList({ campaignId }: SceneListProps) {
  const {
    scenes,
    isLoading,
    error,
    fetchScenesForCampaign,
    createScene,
    updateScene,
  } = useSceneStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)

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

  const handleCreate = async (data: {
    name: string
    description: string
    scene_type: string
    notes: string
  }) => {
    await createScene({
      campaign_id: campaignId,
      name: data.name,
      description: data.description,
      scene_type: data.scene_type,
      notes: data.notes,
      is_global: false,
      is_active: false,
      tags: [],
      light_config: {},
    })
    setIsCreateOpen(false)
  }

  const handleUpdate = async (data: {
    name: string
    description: string
    scene_type: string
    notes: string
  }) => {
    if (!editingScene) return
    await updateScene(editingScene.id, {
      name: data.name,
      description: data.description,
      scene_type: data.scene_type,
      notes: data.notes,
    })
    setEditingScene(null)
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-400">Loading scenes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Scenes</h2>
          <p className="text-sm text-neutral-400">
            Pre-configured audio and lighting combinations
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Scene
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {sortedScenes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-800 p-12 text-center">
          <h3 className="text-lg font-medium text-white">No scenes yet</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Create your first scene to set the mood for your game
          </p>
          <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Scene
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-neutral-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Config</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedScenes.map((scene) => (
                <SceneRow
                  key={scene.id}
                  scene={scene}
                  onEdit={setEditingScene}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Scene</DialogTitle>
            <DialogDescription>
              Create a new scene for this campaign
            </DialogDescription>
          </DialogHeader>
          <SceneForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingScene} onOpenChange={(open) => !open && setEditingScene(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scene</DialogTitle>
            <DialogDescription>
              Update your scene details
            </DialogDescription>
          </DialogHeader>
          {editingScene && (
            <SceneForm
              scene={editingScene}
              onSubmit={handleUpdate}
              onCancel={() => setEditingScene(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}