'use client'

import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import { Button } from './button'

interface InputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (value: string) => void
  title: string
  label: string
  placeholder?: string
  defaultValue?: string
  submitText?: string
  cancelText?: string
  isLoading?: boolean
}

export function InputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  placeholder = '',
  defaultValue = '',
  submitText = 'Create',
  cancelText = 'Cancel',
  isLoading = false,
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue)

  // Reset value when modal opens with new defaultValue
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue)
    }
  }, [isOpen, defaultValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
          >
            {isLoading ? 'Loading...' : submitText}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="input-modal-field" className="block text-sm font-medium text-white/90 mb-2">
          {label}
        </label>
        <input
          id="input-modal-field"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
        />
      </form>
    </BaseModal>
  )
}
