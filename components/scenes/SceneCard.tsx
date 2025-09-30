'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import type { Scene } from '@/types'
import { useSceneStore } from '@/store/sceneStore'
import { Trash2, Edit, Play, Pause, Music, Lightbulb } from 'lucide-react'

interface SceneCardProps {
  scene: Scene
  onEdit: (scene: Scene) => void
}

export function SceneCard({ scene, onEdit }: SceneCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const { deleteScene, setActiveScene } = useSceneStore()
  const { confirm, dialogProps } = useConfirmDialog()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const confirmed = await confirm({
      title: 'Delete Scene',
      description: `Are you sure you want to delete "${scene.name}"? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete',
    })

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteScene(scene.id)
    } catch (error) {
      console.error('Failed to delete scene:', error)
      setIsDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(scene)
  }

  const handleSetActive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsActivating(true)
    try {
      await setActiveScene(scene.id, scene.campaign_id)
    } catch (error) {
      console.error('Failed to set active scene:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const handleSetInactive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsActivating(true)
    try {
      await useSceneStore.getState().updateScene(scene.id, { is_active: false })
    } catch (error) {
      console.error('Failed to set inactive scene:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const isActive = scene.is_active

  return (
    <>
      <Card
      className={`transition-colors ${
        isActive ? 'border-green-500 bg-neutral-900' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{scene.name}</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-neutral-500">{scene.scene_type}</span>
              {scene.audio_config && (
                <Music className="h-3 w-3 text-neutral-500" />
              )}
              {scene.light_config && (
                <Lightbulb className="h-3 w-3 text-neutral-500" />
              )}
            </div>
          </div>
          {isActive && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Active
            </span>
          )}
        </div>
        {scene.description && (
          <CardDescription className="line-clamp-2 mt-2">
            {scene.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardFooter className="justify-end gap-2">
        {isActive ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSetInactive}
            disabled={isActivating || isDeleting}
          >
            <Pause className="h-4 w-4 mr-1" />
            Deactivate
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSetActive}
            disabled={isActivating || isDeleting}
          >
            <Play className="h-4 w-4 mr-1" />
            Activate
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          disabled={isDeleting}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
    <ConfirmDialog {...dialogProps} />
    </>
  )
}