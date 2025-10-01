'use client'

import { useState, useRef, useEffect } from 'react'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  /** Content to display in tooltip */
  content: string
  /** Position relative to trigger element */
  position?: TooltipPosition
  /** Delay before showing tooltip (ms) */
  delay?: number
  /** Child element that triggers tooltip */
  children: React.ReactElement
  /** Additional CSS classes for tooltip */
  className?: string
  /** Disable tooltip */
  disabled?: boolean
}

/**
 * Tooltip component for displaying contextual information on hover
 *
 * Features:
 * - Keyboard accessible (shows on focus)
 * - Mouse hover support
 * - Customizable position and delay
 * - Auto-positioning to stay in viewport
 *
 * Usage:
 * ```tsx
 * <Tooltip content="Dashboard" position="right">
 *   <button>
 *     <Home className="w-5 h-5" />
 *   </button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  position = 'right',
  delay = 0,
  children,
  className = '',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [computedPosition, setComputedPosition] = useState(position)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      // Compute position to avoid viewport overflow
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const tooltipRect = tooltipRef.current.getBoundingClientRect()

        // Check if tooltip would overflow right side
        if (
          position === 'right' &&
          triggerRect.right + tooltipRect.width + 12 > window.innerWidth
        ) {
          setComputedPosition('left')
        }
        // Check if tooltip would overflow left side
        else if (position === 'left' && triggerRect.left - tooltipRect.width - 12 < 0) {
          setComputedPosition('right')
        }
        // Check if tooltip would overflow bottom
        else if (
          position === 'bottom' &&
          triggerRect.bottom + tooltipRect.height + 12 > window.innerHeight
        ) {
          setComputedPosition('top')
        }
        // Check if tooltip would overflow top
        else if (position === 'top' && triggerRect.top - tooltipRect.height - 12 < 0) {
          setComputedPosition('bottom')
        } else {
          setComputedPosition(position)
        }
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getPositionClasses = () => {
    const base = 'absolute z-[100] whitespace-nowrap'

    switch (computedPosition) {
      case 'top':
        return `${base} bottom-full left-1/2 -translate-x-1/2 mb-2`
      case 'bottom':
        return `${base} top-full left-1/2 -translate-x-1/2 mt-2`
      case 'left':
        return `${base} right-full top-1/2 -translate-y-1/2 mr-2`
      case 'right':
      default:
        return `${base} left-full top-1/2 -translate-y-1/2 ml-2`
    }
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`${getPositionClasses()} ${className}`}
        >
          <div className="bg-white text-black text-xs font-medium px-2 py-1.5 rounded-[4px] shadow-lg">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
