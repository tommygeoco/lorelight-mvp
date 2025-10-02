import { Button } from './button'
import { Plus } from 'lucide-react'

type EmptyStateVariant = 'bordered' | 'simple' | 'centered' | 'inline'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  /** Visual variant - defaults to 'bordered' */
  variant?: EmptyStateVariant
  /** Additional CSS classes */
  className?: string
  /** Show loading state */
  isLoading?: boolean
  /** Disable action button */
  disabled?: boolean
}

/**
 * EmptyState component for displaying empty list states
 *
 * Variants:
 * - `bordered`: Large box with dashed border (default) - for primary empty states
 * - `simple`: Simple text-only centered - for secondary/inline empty states
 * - `centered`: Larger text centered vertically - for full-screen empty states
 * - `inline`: Compact single-line text - for small list areas
 *
 * Usage:
 * ```tsx
 * // Bordered with action button (primary empty state)
 * <EmptyState
 *   title="No sessions yet"
 *   description="Create your first session to start playing"
 *   actionLabel="Create Session"
 *   onAction={handleCreate}
 *   variant="bordered"
 *   icon={<Plus />}
 * />
 *
 * // Simple text-only (secondary empty state)
 * <EmptyState
 *   title="No campaigns yet"
 *   description="Create your first campaign to get started"
 *   variant="simple"
 * />
 *
 * // Centered for full-screen (selection prompt)
 * <EmptyState
 *   title="No scene selected"
 *   description="Select a scene from the sidebar to view details"
 *   variant="centered"
 * />
 *
 * // Inline for small areas
 * <EmptyState
 *   title="No audio files in this folder"
 *   variant="inline"
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  variant = 'bordered',
  className = '',
  isLoading = false,
  disabled = false,
}: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-white/40">Loading...</p>
      </div>
    )
  }

  // Bordered variant (original design)
  if (variant === 'bordered') {
    return (
      <div className={`rounded-[8px] border-2 border-dashed border-neutral-800 p-12 text-center ${className}`}>
        {icon && <div className="mb-4 flex justify-center text-white/40">{icon}</div>}
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {description && (
          <p className="mt-2 text-[1rem] text-white/40">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button className="mt-4" onClick={onAction} disabled={disabled}>
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }

  // Simple variant (text-only, compact padding)
  if (variant === 'simple') {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-white/40 text-[0.875rem]">
          {title}
          {description && (
            <>
              <br />
              {description}
            </>
          )}
        </p>
        {actionLabel && onAction && (
          <Button
            className="mt-3"
            onClick={onAction}
            disabled={disabled}
            variant="outline"
            size="sm"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }

  // Centered variant (full-screen empty state)
  if (variant === 'centered') {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md">
          {icon && <div className="mb-4 flex justify-center text-white/40">{icon}</div>}
          <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
          {description && (
            <p className="text-white/40 text-[1rem]">{description}</p>
          )}
          {actionLabel && onAction && (
            <Button className="mt-4" onClick={onAction} disabled={disabled}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Inline variant (compact, single line or minimal)
  if (variant === 'inline') {
    return (
      <div className={`text-center py-8 text-white/40 ${className}`}>
        {title}
      </div>
    )
  }

  // Fallback to bordered
  return (
    <div className={`rounded-[8px] border-2 border-dashed border-neutral-800 p-12 text-center ${className}`}>
      {icon && <div className="mb-4 flex justify-center text-white/40">{icon}</div>}
      <h3 className="text-lg font-medium text-white">{title}</h3>
      {description && (
        <p className="mt-2 text-[1rem] text-white/40">{description}</p>
      )}
    </div>
  )
}