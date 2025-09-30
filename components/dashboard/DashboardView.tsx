'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { ChevronLeft, CirclePlay, BookOpen, Music, Flame } from 'lucide-react'
import { CampaignDisplayCard } from './CampaignDisplayCard'
import { CampaignModal } from '@/components/campaigns/CampaignModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { AudioPlayerFooter } from './AudioPlayerFooter'
import type { Campaign } from '@/types'

export function DashboardView() {
  const router = useRouter()
  const { campaigns, isLoading, fetchCampaigns } = useCampaignStore()
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>(undefined)

  useEffect(() => {
    // Only fetch if we don't have data yet (persisted state loads immediately)
    if (campaigns.size === 0 && !isLoading) {
      fetchCampaigns()
    }
  }, [campaigns.size, isLoading, fetchCampaigns])

  const campaignArray = Array.from(campaigns.values())

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setIsCampaignModalOpen(true)
  }

  return (
    <div className="h-screen w-full bg-[#111111] flex flex-col">
      <div className="flex-1 min-h-0 flex overflow-hidden gap-2 px-2 pt-2">
        {/* Navigation Sidebar */}
        <nav className="w-14 flex-shrink-0" aria-label="Main navigation">
          <div className="bg-[#191919] rounded-lg p-2 h-full flex flex-col gap-2">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Navigate back"
            >
              <ChevronLeft className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              className="w-10 h-10 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Play"
            >
              <CirclePlay className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Library"
            >
              <BookOpen className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Music"
            >
              <Music className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Effects"
            >
              <Flame className="w-[18px] h-[18px] text-white/70" />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 bg-[#191919] rounded-lg overflow-hidden flex flex-col">
          <PageHeader title="Campaigns" description="Text description" />

          {/* Campaign List Section */}
          <section className="flex-1 overflow-y-auto" aria-label="Campaign list">
            <div className="w-[640px] mx-auto pt-[40px] pb-[40px]">
              {campaignArray.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-400">No campaigns yet</p>
                  <p className="text-xs text-neutral-500 mt-1">Create your first campaign to get started</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4" role="list">
                  {campaignArray.map((campaign) => (
                    <li key={campaign.id}>
                      <CampaignDisplayCard campaign={campaign} onEdit={handleEditCampaign} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Audio Player Footer - Only show when track is loaded */}
      <AudioPlayerFooter />

      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => {
          setIsCampaignModalOpen(false)
          setEditingCampaign(undefined)
        }}
        campaign={editingCampaign}
      />
    </div>
  )
}