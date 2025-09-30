import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Generic skeleton loader component
 *
 * Usage:
 * ```tsx
 * <Skeleton className="h-4 w-full" />
 * <Skeleton className="h-10 w-10 rounded-full" />
 * ```
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/[0.05]',
        className
      )}
    />
  )
}

/**
 * Campaign card skeleton
 */
export function CampaignCardSkeleton() {
  return (
    <div className="bg-white/[0.02] rounded-xl p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>
        <Skeleton className="w-5 h-5 flex-shrink-0" />
      </div>
    </div>
  )
}

/**
 * Scene list item skeleton
 */
export function SceneListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-2 py-3">
      <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-full max-w-xs" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-32" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </td>
    </tr>
  )
}

/**
 * Card skeleton (for scene/ambience cards)
 */
export function CardSkeleton() {
  return (
    <div className="bg-[var(--card-surface)] rounded-xl p-4 h-[164px]">
      <Skeleton className="w-16 h-16 rounded-md mb-6" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  )
}