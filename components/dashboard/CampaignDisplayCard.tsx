'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Campaign } from '@/types'
import { useSceneStore } from '@/store/sceneStore'

interface CampaignCardProps {
  campaign: Campaign
}

// Placeholder gradient colors for campaigns
const campaignGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
]

function getCampaignGradient(campaignId: string): string {
  // Use campaign ID to consistently pick a gradient
  const hash = campaignId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return campaignGradients[hash % campaignGradients.length]
}

/**
 * CampaignDisplayCard - Used in dashboard for campaign selection
 * Shows gradient thumbnail and navigation to campaign play view
 */
export function CampaignDisplayCard({ campaign }: CampaignCardProps) {
  const { fetchScenesForCampaign } = useSceneStore()

  const handleMouseEnter = () => {
    // Prefetch scenes for this campaign on hover
    fetchScenesForCampaign(campaign.id)
  }

  return (
    <article className="bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-xl">
      <Link
        href={`/campaigns/${campaign.id}/play`}
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
          <h3 className="text-base font-semibold text-white leading-6 truncate mb-1">
            {campaign.name}
          </h3>
          <p className="text-sm text-white/50 leading-5 truncate">
            {campaign.description || 'No description'}
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-white flex-shrink-0 opacity-30 group-hover:opacity-50 transition-opacity" aria-hidden="true" />
      </Link>
    </article>
  )
}