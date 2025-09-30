'use client'

import { useState } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import type { Scene } from '@/types'
import { useSceneStore } from '@/store/sceneStore'
import { Trash2, Edit, Play, Pause, Music, Lightbulb } from 'lucide-react'

interface SceneRowProps {
  scene: Scene
  onEdit: (scene: Scene) => void
}

export function SceneRow({ scene, onEdit }: SceneRowProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const { deleteScene, setActiveScene } = useSceneStore()
  const { confirm, dialogProps } = useConfirmDialog()

  const handleDelete = async () => {
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

  const handleEdit = () => {
    onEdit(scene)
  }

  const handleSetActive = async () => {
    setIsActivating(true)
    try {
      await setActiveScene(scene.id, scene.campaign_id)
    } catch (error) {
      console.error('Failed to set active scene:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const handleSetInactive = async () => {
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
      <TableRow className={isActive ? 'bg-green-950/20' : ''}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {scene.name}
          {isActive && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              Active
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-neutral-400">
        <span className="capitalize">{scene.scene_type}</span>
      </TableCell>
      <TableCell className="text-neutral-400">
        {scene.description ? (
          <span className="line-clamp-1">{scene.description}</span>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center gap-2">
          {scene.audio_config && (
            <Music className="h-4 w-4 text-neutral-500" />
          )}
          {scene.light_config && Object.keys(scene.light_config).length > 0 && (
            <Lightbulb className="h-4 w-4 text-neutral-500" />
          )}
          {!scene.audio_config && (!scene.light_config || Object.keys(scene.light_config).length === 0) && (
            <span className="text-neutral-600">—</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {isActive ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSetInactive}
              disabled={isActivating || isDeleting}
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSetActive}
              disabled={isActivating || isDeleting}
            >
              <Play className="h-4 w-4" />
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
        </div>
      </TableCell>
    </TableRow>
    <ConfirmDialog {...dialogProps} />
    </>
  )
}