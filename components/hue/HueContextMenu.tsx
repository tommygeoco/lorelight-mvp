'use client'

import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react'
import { Edit2, Trash2 } from 'lucide-react'

interface HueContextMenuProps {
  entityName: string
  onDelete?: () => Promise<void>
  triggerButton: React.ReactNode
  onStartEdit?: () => void
}

export function HueContextMenu({
  entityName,
  onDelete,
  triggerButton,
  onStartEdit
}: HueContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleStartRename = () => {
    onStartEdit?.()
    setIsOpen(false)
  }

  const handleDelete = async () => {
    if (!onDelete) return

    if (!confirm(`Are you sure you want to delete "${entityName}"?`)) {
      return
    }

    setIsLoading(true)
    try {
      await onDelete()
      setIsOpen(false)
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  // Clone the trigger button and add click handler if it's an ellipsis button
  const enhancedTrigger = isValidElement(triggerButton)
    ? cloneElement(triggerButton as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
        onClick: handleToggleMenu
      })
    : triggerButton

  return (
    <div className="relative" ref={menuRef}>
      {enhancedTrigger}

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-[140px] bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 overflow-hidden">
          <button
            onClick={handleStartRename}
            disabled={isLoading}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors text-left"
          >
            <Edit2 className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[13px] text-white">Rename</span>
          </button>

          {onDelete && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[13px] text-red-400">Delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
