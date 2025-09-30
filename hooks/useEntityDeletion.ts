import { useState } from 'react'
import { logger } from '@/lib/utils/logger'

interface UseEntityDeletionOptions {
  entityName: string
  deleteFn: (id: string) => Promise<void>
  onSuccess?: () => void
  /** If true, uses window.confirm (for backward compatibility). If false, requires external confirm dialog. */
  useNativeConfirm?: boolean
}

/**
 * Hook for entity deletion with optional confirmation
 *
 * Usage with native confirm (legacy):
 * ```tsx
 * const { isDeleting, handleDelete } = useEntityDeletion({
 *   entityName: 'campaign',
 *   deleteFn: deleteCampaign,
 *   useNativeConfirm: true,
 * })
 * ```
 *
 * Usage with ConfirmDialog (recommended):
 * ```tsx
 * const { isDeleting, handleDelete } = useEntityDeletion({
 *   entityName: 'campaign',
 *   deleteFn: deleteCampaign,
 * })
 * const { confirm, dialogProps } = useConfirmDialog()
 *
 * const onDeleteClick = async (id: string, name: string) => {
 *   const confirmed = await confirm({
 *     title: `Delete ${entityName}`,
 *     description: `Are you sure you want to delete "${name}"?`,
 *     variant: 'destructive',
 *   })
 *   if (confirmed) {
 *     handleDelete(id, name)
 *   }
 * }
 * ```
 */
export function useEntityDeletion({
  entityName,
  deleteFn,
  onSuccess,
  useNativeConfirm = true,
}: UseEntityDeletionOptions) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    // Only use native confirm if explicitly enabled (backward compatibility)
    if (useNativeConfirm) {
      if (!confirm(`Delete ${entityName} "${name}"?`)) return
    }

    setIsDeleting(true)
    try {
      await deleteFn(id)
      onSuccess?.()
    } catch (error) {
      logger.error(`Failed to delete ${entityName}`, error, { entityId: id, entityName: name })
      setIsDeleting(false)
    }
  }

  return { isDeleting, handleDelete }
}