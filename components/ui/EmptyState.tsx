import { Button } from './button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

/**
 * EmptyState component for displaying empty list states
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   title="No campaigns yet"
 *   description="Create your first campaign to get started"
 *   actionLabel="Create Campaign"
 *   onAction={() => setIsModalOpen(true)}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-[8px] border-2 border-dashed border-neutral-800 p-12 text-center">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-medium text-white">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-neutral-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}