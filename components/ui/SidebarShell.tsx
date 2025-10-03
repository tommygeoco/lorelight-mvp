import { ReactNode } from 'react'

interface SidebarShellProps {
  title: string
  action?: {
    icon: ReactNode
    onClick: () => void
    label: string
  }
  emptyState?: {
    message: string
  }
  children?: ReactNode
  onContextMenu?: (e: React.MouseEvent) => void
  className?: string
}

/**
 * SidebarShell - Standardized sidebar container
 *
 * Design System:
 * - Width: 320px
 * - Background: #191919
 * - Header: Title + optional action button
 * - Content: Scrollable with custom scrollbar
 * - Empty state: Centered message with standard styling
 */
export function SidebarShell({
  title,
  action,
  emptyState,
  children,
  onContextMenu,
  className = ''
}: SidebarShellProps) {
  const hasContent = !!children

  return (
    <div className={`w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {action && (
          <button
            onClick={action.onClick}
            className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
            aria-label={action.label}
          >
            {action.icon}
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4"
        onContextMenu={onContextMenu}
      >
        {hasContent ? (
          children
        ) : emptyState ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-[0.875rem]">{emptyState.message}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
