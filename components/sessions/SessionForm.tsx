'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Session } from '@/types'

interface SessionFormProps {
  session?: Session
  onSubmit: (data: {
    name: string
    session_date: string | null
    notes: string
  }) => Promise<void>
  onCancel: () => void
}

export function SessionForm({ session, onSubmit, onCancel }: SessionFormProps) {
  const [name, setName] = useState(session?.title || '')
  const [sessionDate, setSessionDate] = useState(
    session?.date ? new Date(session.date).toISOString().split('T')[0] : ''
  )
  const [notes, setNotes] = useState(session?.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Session name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        name: name.trim(),
        session_date: sessionDate || null,
        notes: notes.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Session Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Session 1: The Tavern"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Session Date (optional)</Label>
        <Input
          id="date"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Session notes, key events, player decisions..."
          disabled={isSubmitting}
          className="flex min-h-[100px] w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950 p-3 text-sm text-red-200">
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
          {isSubmitting ? 'Saving...' : session ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}