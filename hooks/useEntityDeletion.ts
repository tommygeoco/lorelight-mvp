import { useState } from 'react'

interface UseEntityDeletionOptions {
  entityName: string
  deleteFn: (id: string) => Promise<void>
  onSuccess?: () => void
}

export function useEntityDeletion({ entityName, deleteFn, onSuccess }: UseEntityDeletionOptions) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    if (!confirm(`Delete ${entityName} "${name}"?`)) return

    setIsDeleting(true)
    try {
      await deleteFn(id)
      onSuccess?.()
    } catch (error) {
      console.error(`Failed to delete ${entityName}:`, error)
      setIsDeleting(false)
    }
  }

  return { isDeleting, handleDelete }
}