'use client'

import { useEffect, useRef } from 'react'
import { Bold, Italic, Underline, Strikethrough, Link as LinkIcon } from 'lucide-react'

interface RichTextToolbarProps {
  selection: Range
  onFormat: (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => void
  onLink: () => void
  onClose: () => void
}

/**
 * RichTextToolbar - Floating toolbar for text formatting
 * Context7: Positioned above selection, keyboard shortcuts, auto-close
 */
export function RichTextToolbar({ selection, onFormat, onLink, onClose }: RichTextToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Position toolbar above selection
  useEffect(() => {
    if (!toolbarRef.current) return

    const rect = selection.getBoundingClientRect()
    const toolbar = toolbarRef.current

    // Center toolbar above selection, 48px offset
    const left = rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2)
    const top = rect.top - toolbar.offsetHeight - 48

    toolbar.style.left = `${left}px`
    toolbar.style.top = `${top}px`
  }, [selection])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B = Bold
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        onFormat('bold')
      }
      // Cmd/Ctrl + I = Italic
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        onFormat('italic')
      }
      // Cmd/Ctrl + U = Underline
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        onFormat('underline')
      }
      // Cmd/Ctrl + Shift + X = Strikethrough
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault()
        onFormat('strikethrough')
      }
      // Escape = Close
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onFormat, onClose])

  return (
    <div
      ref={toolbarRef}
      className="fixed bg-[#191919] border border-white/10 rounded-[8px] shadow-xl px-2 py-2 flex items-center gap-1 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bold */}
      <button
        onClick={() => onFormat('bold')}
        className="w-8 h-8 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-colors"
        title="Bold (Cmd+B)"
        aria-label="Bold"
      >
        <Bold className="w-4 h-4 text-white/70" />
      </button>

      {/* Italic */}
      <button
        onClick={() => onFormat('italic')}
        className="w-8 h-8 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-colors"
        title="Italic (Cmd+I)"
        aria-label="Italic"
      >
        <Italic className="w-4 h-4 text-white/70" />
      </button>

      {/* Underline */}
      <button
        onClick={() => onFormat('underline')}
        className="w-8 h-8 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-colors"
        title="Underline (Cmd+U)"
        aria-label="Underline"
      >
        <Underline className="w-4 h-4 text-white/70" />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => onFormat('strikethrough')}
        className="w-8 h-8 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-colors"
        title="Strikethrough (Cmd+Shift+X)"
        aria-label="Strikethrough"
      >
        <Strikethrough className="w-4 h-4 text-white/70" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Link */}
      <button
        onClick={onLink}
        className="w-8 h-8 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-colors"
        title="Add Link"
        aria-label="Add link"
      >
        <LinkIcon className="w-4 h-4 text-white/70" />
      </button>
    </div>
  )
}
