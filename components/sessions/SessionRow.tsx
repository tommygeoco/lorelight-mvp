'use client'

import { useState } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Session } from '@/types'
import { useSessionStore } from '@/store/sessionStore'
import { Trash2, Edit, Play, Pause } from 'lucide-react'

interface SessionRowProps {
  session: Session
  onEdit: (session: Session) => void
}

export function SessionRow({ session, onEdit }: SessionRowProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const { deleteSession, setActiveSession } = useSessionStore()

  const handleDelete = async () => {
    if (!confirm(`Delete session "${session.title}"?`)) return

    setIsDeleting(true)
    try {
      await deleteSession(session.id)
    } catch (error) {
      console.error('Failed to delete session:', error)
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    onEdit(session)
  }

  const handleSetActive = async () => {
    setIsActivating(true)
    try {
      await setActiveSession(session.id, session.campaign_id)
    } catch (error) {
      console.error('Failed to set active session:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const handleSetInactive = async () => {
    setIsActivating(true)
    try {
      await useSessionStore.getState().updateSession(session.id, { status: null })
    } catch (error) {
      console.error('Failed to set inactive session:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const isActive = session.status === 'active'

  return (
    <TableRow className={isActive ? 'bg-green-950/20' : ''}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {session.title}
          {isActive && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              Active
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-neutral-400">
        {session.date ? new Date(session.date).toLocaleDateString() : '—'}
      </TableCell>
      <TableCell className="text-neutral-400">
        {session.description ? (
          <span className="line-clamp-1">{session.description}</span>
        ) : (
          '—'
        )}
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
  )
}