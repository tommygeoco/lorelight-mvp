'use client'

import { Plus } from 'lucide-react'
import { Button } from './button'

type ActionVariant = 'primary' | 'secondary' | 'icon-only'
type SectionVariant = 'default' | 'sidebar'

interface SectionAction {
  label?: string | React.ReactNode
  onClick: () => void
  icon?: React.ReactNode
  disabled?: boolean
  variant?: ActionVariant
  ariaLabel?: string
}

interface SectionHeaderProps {
  /** Section title */
  title: string
  /** Optional action button configuration */
  action?: SectionAction
  /** Optional HTML ID for accessibility */
  id?: string
  /** Visual variant - defaults to 'default' */
  variant?: SectionVariant
  /** Additional CSS classes */
  className?: string
}

/**
 * SectionHeader component for consistent section headings with optional action buttons
 *
 * Variants:
 * - `default`: Content area header with 48px height and 24px top padding
 * - `sidebar`: Compact sidebar header with flex layout
 *
 * Action Variants:
 * - `primary`: White background button with text + icon
 * - `secondary`: Outlined button with text + icon
 * - `icon-only`: Icon-only button (common in sidebars)
 *
 * Usage:
 * ```tsx
 * // Default with primary action
 * <SectionHeader
 *   title="Sessions"
 *   id="sessions-heading"
 *   action={{
 *     label: 'New',
 *     icon: <Plus className="w-4 h-4" />,
 *     onClick: handleCreate,
 *     variant: 'primary'
 *   }}
 * />
 *
 * // Sidebar with icon-only action
 * <SectionHeader
 *   title="Scenes"
 *   variant="sidebar"
 *   action={{
 *     icon: <Plus className="w-[18px] h-[18px]" />,
 *     onClick: handleAdd,
 *     variant: 'icon-only',
 *     ariaLabel: 'Add new scene'
 *   }}
 * />
 *
 * // Simple header without action
 * <SectionHeader title="Ambience" id="ambience-heading" />
 * ```
 */
export function SectionHeader({
  title,
  action,
  id,
  variant = 'default',
  className = '',
}: SectionHeaderProps) {
  // Sidebar variant (compact, flex layout)
  if (variant === 'sidebar') {
    return (
      <header className={`flex items-center justify-between p-2 mb-2 ${className}`}>
        <h2 id={id} className="text-[#b4b4b4] font-semibold text-sm">
          {title}
        </h2>
        {action && (
          <>
            {action.variant === 'icon-only' ? (
              <button
                onClick={action.onClick}
                disabled={action.disabled}
                className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={action.ariaLabel || `Add ${title.toLowerCase()}`}
              >
                {action.icon || <Plus className="w-[18px] h-[18px] text-white/70" />}
              </button>
            ) : (
              <Button
                onClick={action.onClick}
                disabled={action.disabled}
                size="sm"
                variant={action.variant === 'secondary' ? 'outline' : 'default'}
              >
                {action.icon}
                {action.label}
              </Button>
            )}
          </>
        )}
      </header>
    )
  }

  // Default variant (content area header)
  return (
    <header className={`h-[48px] pt-[24px] flex items-center ${action ? 'justify-between' : ''} ${className}`}>
      <h2 id={id} className="text-sm font-semibold text-white">
        {title}
      </h2>
      {action && (
        <Button
          onClick={action.onClick}
          disabled={action.disabled}
          className="bg-white text-black hover:bg-white/90 h-8 px-3"
          size="sm"
        >
          {action.icon && <span className="mr-1">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </header>
  )
}
