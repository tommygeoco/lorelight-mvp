'use client'

import Link from 'next/link'
import { ChevronRight, Settings } from 'lucide-react'
import type { Campaign } from '@/types'
import { useSceneStore } from '@/store/sceneStore'
import { getCampaignGradient } from '@/lib/utils/gradients'

interface CampaignCardProps {
  campaign: Campaign
  onEdit?: (campaign: Campaign) => void
}

/**
 * CampaignDisplayCard - Used in dashboard for campaign selection
 * Shows gradient thumbnail and navigation to campaign play view
 */
export function CampaignDisplayCard({ campaign, onEdit }: CampaignCardProps) {
  const { fetchScenesForCampaign } = useSceneStore()

  const handleMouseEnter = () => {
    // Prefetch scenes for this campaign on hover
    fetchScenesForCampaign(campaign.id)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(campaign)
  }

  return (
    <article className="bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-lg">
      <Link
        href={`/campaigns/${campaign.id}/sessions`}
        className="group flex items-center gap-4 p-4"
        onMouseEnter={handleMouseEnter}
        prefetch={true}
      >
        <div
          className="w-14 h-14 rounded-lg flex-shrink-0 shadow-lg"
          style={{
            background: getCampaignGradient(campaign.id),
          }}
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate mb-1">
            {campaign.name}
          </h3>
          <p className="text-white/50 truncate">
            {campaign.description || 'No description'}
          </p>
        </div>

        {onEdit && (
          <button
            onClick={handleEditClick}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Edit campaign"
          >
            <Settings className="w-4 h-4 text-white/70" />
          </button>
        )}

        <ChevronRight className="w-5 h-5 text-white flex-shrink-0 opacity-30 group-hover:opacity-50 transition-opacity" aria-hidden="true" />
      </Link>
    </article>
  )
}