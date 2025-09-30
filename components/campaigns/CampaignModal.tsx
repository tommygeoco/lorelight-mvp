'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useCampaignStore } from '@/store/campaignStore'
import { Textarea } from '@/components/ui/textarea'
import { logger } from '@/lib/utils/logger'
import { STRINGS } from '@/lib/constants/strings'

interface CampaignModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CampaignModal({ isOpen, onClose }: CampaignModalProps) {
  const { createCampaign } = useCampaignStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await createCampaign({
        name: name.trim(),
        description: description.trim() || null,
        thumbnail_url: null,
      })
      // Reset form and close
      setName('')
      setDescription('')
      onClose()
    } catch (error) {
      logger.error('Failed to create campaign', error, { campaignName: name })
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
      <div className="bg-[var(--card-surface)] border border-white/10 rounded-[24px] w-[402px] max-h-[90vh] overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <h2 className="text-[16px] font-semibold text-white">{STRINGS.campaigns.create}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-[24px] hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <X className="w-[18px] h-[18px] text-white/70" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="px-6 py-6 space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[14px] font-semibold text-[#eeeeee]">
                {STRINGS.campaigns.nameLabel}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={STRINGS.campaigns.namePlaceholder}
                required
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[24px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-[14px] font-semibold text-[#eeeeee]">
                {STRINGS.campaigns.descriptionLabel}
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={STRINGS.campaigns.descriptionPlaceholder}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[24px] transition-colors"
            >
              {STRINGS.common.cancel}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[24px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? STRINGS.common.creating : STRINGS.campaigns.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}