'use client'

import { useRouter } from 'next/navigation'
import { Music } from 'lucide-react'
import type { Campaign } from '@/types'

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

export function CampaignCard({ campaign }: CampaignCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/campaigns/${campaign.id}/play`)
  }

  return (
    <button
      onClick={handleClick}
      className="group relative flex flex-col gap-6 p-4 rounded-xl overflow-hidden text-left transition-transform hover:scale-[1.02] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 rounded-xl" style={{ background: getCampaignGradient(campaign.id) }} />

      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[50px] bg-white/[0.01]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Campaign Icon/Thumbnail */}
        <div
          className="w-16 h-16 rounded-md shadow-lg"
          style={{
            background: getCampaignGradient(campaign.id),
            boxShadow: '0px 32px 9px 0px rgba(0,0,0,0), 0px 20px 8px 0px rgba(0,0,0,0.02), 0px 11px 7px 0px rgba(0,0,0,0.06), 0px 5px 5px 0px rgba(0,0,0,0.09), 0px 1px 3px 0px rgba(0,0,0,0.11)'
          }}
        />
      </div>

      {/* Campaign Info */}
      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-white leading-6 truncate">
            {campaign.name}
          </h3>
          <p className="text-sm font-medium text-white/60 leading-5 mix-blend-overlay">
            {campaign.description || 'No description'}
          </p>
        </div>
      </div>

      {/* Music Icon (top right) */}
      <div className="absolute top-4 right-4 opacity-40 z-10">
        <Music className="w-[18px] h-[18px] text-white" />
      </div>
    </button>
  )
}