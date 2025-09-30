'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import type { Session } from '@/types'
import { useSessionStore } from '@/store/sessionStore'
import { Trash2, Edit, Play, Pause } from 'lucide-react'

interface SessionCardProps {
  session: Session
  onEdit: (session: Session) => void
}

export function SessionCard({ session, onEdit }: SessionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const { deleteSession, setActiveSession } = useSessionStore()
  const { confirm, dialogProps } = useConfirmDialog()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const confirmed = await confirm({
      title: 'Delete Session',
      description: `Are you sure you want to delete "${session.title}"? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete',
    })

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteSession(session.id)
    } catch (error) {
      console.error('Failed to delete session:', error)
      setIsDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(session)
  }

  const handleSetActive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsActivating(true)
    try {
      await setActiveSession(session.id, session.campaign_id)
    } catch (error) {
      console.error('Failed to set active session:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const handleSetInactive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsActivating(true)
    try {
      // Set status back to null (inactive)
      await useSessionStore.getState().updateSession(session.id, { status: null })
    } catch (error) {
      console.error('Failed to set inactive session:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const isActive = session.status === 'active'

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
            <CardTitle className="text-xl">{session.title}</CardTitle>
            {session.date && (
              <CardDescription>
                {new Date(session.date).toLocaleDateString()}
              </CardDescription>
            )}
          </div>
          {isActive && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Active
            </span>
          )}
        </div>
        {session.description && (
          <CardDescription className="line-clamp-2 mt-2">
            {session.description}
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
            Set Inactive
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSetActive}
            disabled={isActivating || isDeleting}
          >
            <Play className="h-4 w-4 mr-1" />
            Set Active
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