'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useSceneStore } from '@/store/sceneStore'
import { Textarea } from '@/components/ui/textarea'

interface SceneModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
}

export function SceneModal({ isOpen, onClose, campaignId }: SceneModalProps) {
  const { createScene } = useSceneStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await createScene({
        campaign_id: campaignId,
        name: name.trim(),
        description: description.trim() || undefined,
        scene_type: 'narrative',
        notes: '',
        light_config: {},
        is_active: false,
        order_index: 0, // Will be set by the service
      })
      // Reset form and close
      setName('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Failed to create scene:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      if (error && typeof error === 'object' && 'message' in error) {
        alert(`Failed to create scene: ${(error as Error).message}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--card-surface)] border border-white/10 rounded-[24px] w-[402px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <h2 className="text-[16px] font-semibold text-white">New Scene</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <X className="w-[18px] h-[18px] text-white/70" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="px-6 py-6 space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="scene-name" className="block text-[14px] font-semibold text-[#eeeeee]">
                Name
              </label>
              <input
                id="scene-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter scene name..."
                required
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="scene-description" className="block text-[14px] font-semibold text-[#eeeeee]">
                Description
              </label>
              <Textarea
                id="scene-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Scene'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}