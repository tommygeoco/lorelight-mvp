'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Campaign } from '@/types'

interface CampaignFormProps {
  campaign?: Campaign
  onSubmit: (data: { name: string; description: string }) => Promise<void>
  onCancel: () => void
}

export function CampaignForm({ campaign, onSubmit, onCancel }: CampaignFormProps) {
  const [name, setName] = useState(campaign?.name || '')
  const [description, setDescription] = useState(campaign?.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Campaign name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({ name: name.trim(), description: description.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The Lost Mines of Phandelver"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A classic D&D adventure for first-time players..."
          disabled={isSubmitting}
          className="flex min-h-[80px] w-full rounded-[24px] border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
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
          {isSubmitting ? 'Saving...' : campaign ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}