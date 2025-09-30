import { useState, useCallback } from 'react'

interface UseFormSubmissionOptions<T> {
  onSubmit: (data: T) => Promise<void>
  validation?: (data: T) => string | null
  onSuccess?: () => void
}

/**
 * Hook for managing form submission state and error handling
 *
 * Usage:
 * ```tsx
 * const { handleSubmit, isSubmitting, error, clearError } = useFormSubmission({
 *   onSubmit: async (data) => {
 *     await campaignService.create(data)
 *   },
 *   validation: (data) => {
 *     if (!data.name.trim()) return 'Name is required'
 *     return null
 *   },
 *   onSuccess: () => {
 *     // Reset form, close modal, etc.
 *   }
 * })
 *
 * <form onSubmit={(e) => handleSubmit(e, formData)}>
 * ```
 */
export function useFormSubmission<T>({
  onSubmit,
  validation,
  onSuccess,
}: UseFormSubmissionOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent, data: T) => {
      e.preventDefault()

      // Run validation if provided
      if (validation) {
        const validationError = validation(data)
        if (validationError) {
          setError(validationError)
          return
        }
      }

      setIsSubmitting(true)
      setError(null)

      try {
        await onSubmit(data)
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setIsSubmitting(false)
      }
    },
    [onSubmit, validation, onSuccess]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    handleSubmit,
    isSubmitting,
    error,
    clearError,
  }
}