/**
 * Hook for drag-and-drop functionality
 */

import { useState, useCallback } from 'react'
import type { FileExplorerItem, DragState } from './types'

interface UseDragDropProps<T extends FileExplorerItem> {
  onDragDrop?: (draggedItem: T, targetItem: T | null) => Promise<void>
  items: T[]
}

export function useDragDrop<T extends FileExplorerItem>({
  onDragDrop,
  items,
}: UseDragDropProps<T>) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItemId: null,
    dropTargetId: null,
  })

  const handleDragStart = useCallback(
    (itemId: string, e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', itemId)
      setDragState({
        isDragging: true,
        draggedItemId: itemId,
        dropTargetId: null,
      })
    },
    []
  )

  const handleDragOver = useCallback((itemId: string | null, e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragState((prev) => ({
      ...prev,
      dropTargetId: itemId,
    }))
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragState((prev) => ({
      ...prev,
      dropTargetId: null,
    }))
  }, [])

  const handleDrop = useCallback(
    async (targetItemId: string | null, e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const draggedItemId = e.dataTransfer.getData('text/plain')
      if (!draggedItemId) {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          dropTargetId: null,
        })
        return
      }

      const draggedItem = items.find((item) => item.id === draggedItemId)
      const targetItem = targetItemId
        ? items.find((item) => item.id === targetItemId)
        : null

      if (!draggedItem) {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          dropTargetId: null,
        })
        return
      }

      // Prevent dropping onto itself
      if (draggedItemId === targetItemId) {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          dropTargetId: null,
        })
        return
      }

      // Prevent dropping folder into its own descendant
      if (targetItem && draggedItem.type === 'folder') {
        const isDescendant = (parentId: string, childId: string): boolean => {
          let current = items.find((item) => item.id === childId)
          while (current) {
            if (current.parentId === parentId) return true
            current = items.find((item) => item.id === current!.parentId)
          }
          return false
        }

        if (isDescendant(draggedItemId, targetItemId!)) {
          setDragState({
            isDragging: false,
            draggedItemId: null,
            dropTargetId: null,
          })
          return
        }
      }

      // Only allow dropping into folders or root (null)
      if (targetItem && targetItem.type !== 'folder') {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          dropTargetId: null,
        })
        return
      }

      try {
        await onDragDrop?.(draggedItem, targetItem || null)
      } catch (error) {
        console.error('Drop failed:', error)
      }

      setDragState({
        isDragging: false,
        draggedItemId: null,
        dropTargetId: null,
      })
    },
    [items, onDragDrop]
  )

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItemId: null,
      dropTargetId: null,
    })
  }, [])

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  }
}
