'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface InlineEditorProps {
  initialValue: string
  onSave: (value: string) => Promise<void> | void
  onCancel?: () => void
  className?: string
  placeholder?: string
  autoFocus?: boolean
  multiline?: boolean
  debounceMs?: number
}

/**
 * InlineEditor - Notion-like inline text editing
 * Context7: Click to edit, auto-save on type, Escape to cancel
 */
export function InlineEditor({
  initialValue,
  onSave,
  onCancel,
  className = '',
  placeholder = 'Enter text...',
  autoFocus = false,
  multiline = false,
  debounceMs = 300,
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const lastSavedValue = useRef(initialValue)

  // Auto-focus and select all text
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [autoFocus])

  // Debounced auto-save
  const debouncedSave = useDebouncedCallback(
    async (newValue: string) => {
      if (newValue === lastSavedValue.current) return

      setIsSaving(true)
      try {
        await onSave(newValue)
        lastSavedValue.current = newValue
      } catch (error) {
        console.error('Failed to save:', error)
      } finally {
        setIsSaving(false)
      }
    },
    debounceMs
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSave(newValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setValue(lastSavedValue.current)
      onCancel?.()
    } else if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault()
      inputRef.current?.blur()
    }
  }

  const handleBlur = async () => {
    // Flush any pending debounced save
    await debouncedSave.flush()
  }

  const baseClasses = `
    w-full
    bg-transparent
    border-none
    text-white
    placeholder:text-white/40
    focus:outline-none
    ${isSaving ? 'opacity-50' : 'opacity-100'}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  if (multiline) {
    // Calculate line count (including empty placeholder state)
    const lineCount = Math.max(1, value.split('\n').length)

    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${baseClasses} resize-none`}
        style={{
          height: `${lineCount * 20}px`, // 20px = line-height from leading-[20px]
          minHeight: '20px'
        }}
        disabled={isSaving}
      />
    )
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={baseClasses}
      disabled={isSaving}
    />
  )
}
