'use client'

import { useState, useRef } from 'react'
import { LorelightGradient } from './LorelightGradient'

interface PageHeaderProps {
  title: string
  description?: string
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string | null) => void
}

export function PageHeader({ title, description, onTitleChange, onDescriptionChange }: PageHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLTextAreaElement>(null)

  const isEditable = !!onTitleChange

  const handleTitleMount = (el: HTMLInputElement | null) => {
    if (el) {
      titleInputRef.current = el
      el.focus()
      el.select()
    }
  }

  const handleDescMount = (el: HTMLTextAreaElement | null) => {
    if (el) {
      descInputRef.current = el
      el.focus()
      el.select()
    }
  }

  const handleTitleSave = () => {
    const newTitle = titleInputRef.current?.value || ''
    setIsEditingTitle(false)

    if (newTitle.trim() === '' || newTitle.trim() === title) return

    onTitleChange?.(newTitle.trim())
  }

  const handleDescSave = () => {
    const newDesc = descInputRef.current?.value || ''
    const trimmedDesc = newDesc.trim() || null

    setIsEditingDesc(false)

    if (trimmedDesc === description) return

    onDescriptionChange?.(trimmedDesc)
  }

  return (
    <header className="relative h-auto w-full flex-shrink-0">
      {/* Lorelight Gradient - Responds to active scene lights */}
      <LorelightGradient />

      {/* Title - 640px wide centered */}
      <div className="relative w-[640px] mx-auto pt-12">
        {isEditable && isEditingTitle ? (
          <input
            ref={handleTitleMount}
            type="text"
            defaultValue={title}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleTitleSave()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                setIsEditingTitle(false)
              }
            }}
            className="w-full bg-transparent border-none outline-none text-white tracking-[-1.2px] placeholder:text-white/40"
            style={{ fontFamily: '"PP Mondwest", sans-serif', fontSize: '60px' }}
            placeholder="Campaign name..."
            data-1p-ignore="true"
            data-lpignore="true"
          />
        ) : (
          <h1
            onClick={() => isEditable && setIsEditingTitle(true)}
            className={`text-[60px] font-normal text-white tracking-[-1.2px] ${isEditable ? 'cursor-text' : ''}`}
            style={{ fontFamily: '"PP Mondwest", sans-serif' }}
            data-1p-ignore="true"
            data-lpignore="true"
          >
            {title}
          </h1>
        )}

        <div className="mt-1">
          {isEditable && isEditingDesc ? (
            <textarea
              ref={(el) => {
                handleDescMount(el)
                if (el) {
                  // Match exact height of content
                  el.style.height = 'auto'
                  el.style.height = el.scrollHeight + 'px'
                }
              }}
              defaultValue={description || ''}
              onBlur={handleDescSave}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setIsEditingDesc(false)
                }
              }}
              className="block w-full p-0 m-0 bg-transparent border-none outline-none text-[#eeeeee] font-normal placeholder:text-white/40 resize-none overflow-hidden"
              style={{ lineHeight: '1.5' }}
              placeholder="Add a description..."
              data-1p-ignore="true"
              data-lpignore="true"
            />
          ) : description || isEditable ? (
            <p 
              onClick={() => isEditable && setIsEditingDesc(true)}
              className={`block p-0 m-0 text-[#eeeeee] font-normal whitespace-pre-wrap ${isEditable ? 'cursor-text' : ''}`}
              style={{ lineHeight: '1.5' }}
              data-1p-ignore="true"
              data-lpignore="true"
            >
              {description || (isEditable && <span className="text-white/40">Add a description...</span>)}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
}