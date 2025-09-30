import { useState, useCallback } from 'react'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  confirmText?: string
  cancelText?: string
}

/**
 * Hook for managing confirmation dialogs
 *
 * Usage:
 * ```tsx
 * const { ConfirmDialog, confirm } = useConfirmDialog()
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Campaign',
 *     description: 'Are you sure you want to delete this campaign?',
 *     variant: 'destructive',
 *   })
 *
 *   if (confirmed) {
 *     await deleteCampaign(id)
 *   }
 * }
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <ConfirmDialog />
 *   </>
 * )
 * ```
 */
export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const confirm = useCallback(
    (options: Omit<ConfirmDialogState, 'isOpen' | 'onConfirm'> & { onConfirm?: () => void | Promise<void> }): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          title: options.title,
          description: options.description,
          variant: options.variant,
          confirmText: options.confirmText,
          cancelText: options.cancelText,
          onConfirm: async () => {
            if (options.onConfirm) {
              await options.onConfirm()
            }
            resolve(true)
          },
        })
      })
    },
    []
  )

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return {
    confirm,
    dialogProps: {
      isOpen: state.isOpen,
      onClose: handleClose,
      onConfirm: state.onConfirm,
      title: state.title,
      description: state.description,
      variant: state.variant,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
    },
  }
}