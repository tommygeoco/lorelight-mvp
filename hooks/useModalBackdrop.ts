import { useEffect, useCallback } from 'react'

interface UseModalBackdropOptions {
  isOpen: boolean
  onClose: () => void
}

/**
 * Hook to handle modal backdrop clicks and ESC key press
 * Standardizes modal closing behavior across all modals
 */
export function useModalBackdrop({ isOpen, onClose }: UseModalBackdropOptions) {
  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return { handleBackdropClick }
}
