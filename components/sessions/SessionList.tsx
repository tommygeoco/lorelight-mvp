'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { SessionRow } from './SessionRow'
import { SessionForm } from './SessionForm'
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
import type { Session } from '@/types'

interface SessionListProps {
  campaignId: string
}

export function SessionList({ campaignId }: SessionListProps) {
  const {
    sessions,
    isLoading,
    error,
    fetchSessionsForCampaign,
    createSession,
    updateSession,
  } = useSessionStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const sessionArray = useMemo(
    () => Array.from(sessions.values()).filter(s => s.campaign_id === campaignId),
    [sessions, campaignId]
  )

  useEffect(() => {
    // Only fetch if we don't have sessions for this campaign
    if (sessionArray.length === 0 && !isLoading) {
      fetchSessionsForCampaign(campaignId)
    }
  }, [campaignId, sessionArray.length, isLoading, fetchSessionsForCampaign])

  const handleCreate = async (data: {
    name: string
    session_date: string | null
    notes: string
  }) => {
    await createSession({
      campaign_id: campaignId,
      title: data.name, // Your DB uses 'title' not 'name'
      date: data.session_date, // Your DB uses 'date' not 'session_date'
      description: data.notes, // Your DB uses 'description' not 'notes'
    })
    setIsCreateOpen(false)
  }

  const handleUpdate = async (data: {
    name: string
    session_date: string | null
    notes: string
  }) => {
    if (!editingSession) return
    await updateSession(editingSession.id, {
      title: data.name,
      date: data.session_date,
      description: data.notes,
    })
    setEditingSession(null)
  }

  // Sort: active first, then by created date
  const sortedSessions = useMemo(() => {
    const sorted = [...sessionArray]
    sorted.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      // Sort by created_at (most recent first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return sorted
  }, [sessionArray])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-400">Loading sessions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sessions</h2>
          <p className="text-sm text-neutral-400">
            Manage your game sessions and scenes
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      {error && (
        <div className="rounded-[24px] border border-red-900 bg-red-950 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {sortedSessions.length === 0 ? (
        <div className="rounded-[24px] border-2 border-dashed border-neutral-800 p-12 text-center">
          <h3 className="text-lg font-medium text-white">No sessions yet</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Create your first session to start building scenes
          </p>
          <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Session
          </Button>
        </div>
      ) : (
        <div className="rounded-[24px] border border-neutral-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onEdit={setEditingSession}
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
            <DialogTitle>Create Session</DialogTitle>
            <DialogDescription>
              Create a new session for this campaign
            </DialogDescription>
          </DialogHeader>
          <SessionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update your session details
            </DialogDescription>
          </DialogHeader>
          {editingSession && (
            <SessionForm
              session={editingSession}
              onSubmit={handleUpdate}
              onCancel={() => setEditingSession(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}