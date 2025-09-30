'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Scene } from '@/types'

interface SceneFormProps {
  scene?: Scene
  onSubmit: (data: {
    name: string
    description: string
    scene_type: string
    notes: string
  }) => Promise<void>
  onCancel: () => void
}

const SCENE_TYPES = [
  'combat',
  'exploration',
  'roleplay',
  'puzzle',
  'cutscene',
  'travel',
  'other',
]

export function SceneForm({ scene, onSubmit, onCancel }: SceneFormProps) {
  const [name, setName] = useState(scene?.name || '')
  const [description, setDescription] = useState(scene?.description || '')
  const [sceneType, setSceneType] = useState(scene?.scene_type || 'exploration')
  const [notes, setNotes] = useState(scene?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Scene name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        scene_type: sceneType,
        notes: notes.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scene')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Scene Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The Tavern Brawl"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scene_type">Scene Type</Label>
        <select
          id="scene_type"
          value={sceneType}
          onChange={(e) => setSceneType(e.target.value)}
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-[8px] border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {SCENE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A rowdy tavern filled with adventurers"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Scene setup notes, key NPCs, important details..."
          disabled={isSubmitting}
          className="flex min-h-[100px] w-full rounded-[8px] border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
        />
      </div>

      {error && (
        <div className="rounded-[24px] border border-red-900 bg-red-950 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : scene ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}