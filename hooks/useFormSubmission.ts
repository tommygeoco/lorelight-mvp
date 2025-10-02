import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'

interface UseFormSubmissionOptions<TEntity, TCreateData, TUpdateData> {
  /** Entity being edited (undefined = create mode) */
  entity?: TEntity
  /** Function to create new entity */
  onCreate: (data: TCreateData) => Promise<TEntity>
  /** Function to update existing entity (may return void if optimistic update) */
  onUpdate: (id: string, data: TUpdateData) => Promise<TEntity | void>
  /** Function to delete entity (optional) */
  onDelete?: (id: string) => Promise<void>
  /** Callback after successful submit */
  onSuccess?: (entity?: TEntity) => void
  /** Extract ID from entity */
  getId: (entity: TEntity) => string
  /** Initialize form fields from entity */
  initializeFields: (entity: TEntity) => void
  /** Reset form fields to defaults */
  resetFields: () => void
  /** Build create data from form fields */
  buildCreateData: () => TCreateData
  /** Build update data from form fields */
  buildUpdateData: () => TUpdateData
  /** Validate form (return true if valid) */
  validate?: () => boolean
  /** Entity type name for logging (e.g., 'campaign', 'scene') */
  entityType: string
  /** Optional context for logging */
  logContext?: Record<string, unknown>
}

interface UseFormSubmissionReturn {
  /** Whether form is in edit mode */
  isEditMode: boolean
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Whether delete is in progress */
  isDeleting: boolean
  /** Whether delete dialog is open */
  isDeleteDialogOpen: boolean
  /** Open delete confirmation dialog */
  openDeleteDialog: () => void
  /** Close delete confirmation dialog */
  closeDeleteDialog: () => void
  /** Handle form submission */
  handleSubmit: (e: React.FormEvent) => Promise<void>
  /** Handle entity deletion */
  handleDelete: () => Promise<void>
}

/**
 * Reusable hook for form submission logic in create/edit modals
 *
 * Consolidates common patterns:
 * - Create vs Edit mode detection
 * - Form initialization from entity
 * - Submit with loading state
 * - Delete with confirmation
 * - Error logging
 *
 * @example
 * ```tsx
 * function CampaignModal({ campaign, onClose }) {
 *   const [name, setName] = useState('')
 *   const [description, setDescription] = useState('')
 *   const { createCampaign, updateCampaign, deleteCampaign } = useCampaignStore()
 *
 *   const {
 *     isEditMode,
 *     isSubmitting,
 *     isDeleting,
 *     isDeleteDialogOpen,
 *     openDeleteDialog,
 *     closeDeleteDialog,
 *     handleSubmit,
 *     handleDelete,
 *   } = useFormSubmission({
 *     entity: campaign,
 *     onCreate: createCampaign,
 *     onUpdate: updateCampaign,
 *     onDelete: deleteCampaign,
 *     onSuccess: onClose,
 *     getId: (c) => c.id,
 *     initializeFields: (c) => {
 *       setName(c.name)
 *       setDescription(c.description || '')
 *     },
 *     resetFields: () => {
 *       setName('')
 *       setDescription('')
 *     },
 *     buildCreateData: () => ({
 *       name: name.trim(),
 *       description: description.trim() || null,
 *     }),
 *     buildUpdateData: () => ({
 *       name: name.trim(),
 *       description: description.trim() || null,
 *     }),
 *     validate: () => name.trim().length > 0,
 *     entityType: 'campaign',
 *   })
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       // ... form fields
 *     </form>
 *   )
 * }
 * ```
 */
export function useFormSubmission<TEntity, TCreateData, TUpdateData>({
  entity,
  onCreate,
  onUpdate,
  onDelete,
  onSuccess,
  getId,
  initializeFields,
  resetFields,
  buildCreateData,
  buildUpdateData,
  validate,
  entityType,
  logContext = {},
}: UseFormSubmissionOptions<TEntity, TCreateData, TUpdateData>): UseFormSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const isEditMode = !!entity

  // Initialize form fields when entity changes
  useEffect(() => {
    if (isEditMode && entity) {
      initializeFields(entity)
    } else {
      resetFields()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, entity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Run validation if provided
    if (validate && !validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      let result: TEntity | undefined

      if (isEditMode && entity) {
        // Update existing entity (may return void for optimistic updates)
        const updateData = buildUpdateData()
        const updated = await onUpdate(getId(entity), updateData)
        result = updated || entity
      } else {
        // Create new entity
        const createData = buildCreateData()
        result = await onCreate(createData)
      }

      onSuccess?.(result)
    } catch (error) {
      logger.error(
        `Failed to ${isEditMode ? 'update' : 'create'} ${entityType}`,
        error,
        {
          ...logContext,
          entityId: entity ? getId(entity) : undefined,
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!entity || !onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(getId(entity))
      setIsDeleteDialogOpen(false)
      onSuccess?.(entity)
    } catch (error) {
      logger.error(`Failed to delete ${entityType}`, error, {
        ...logContext,
        entityId: getId(entity),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    isEditMode,
    isSubmitting,
    isDeleting,
    isDeleteDialogOpen,
    openDeleteDialog: () => setIsDeleteDialogOpen(true),
    closeDeleteDialog: () => setIsDeleteDialogOpen(false),
    handleSubmit,
    handleDelete,
  }
}
