'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { ChevronLeft, CirclePlay, BookOpen, Music, Flame } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { CampaignDisplayCard } from './CampaignDisplayCard'
import { CampaignModal } from '@/components/campaigns/CampaignModal'
import { PageHeader } from '@/components/ui/PageHeader'
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

  const sidebarButtons = [
    {
      icon: <ChevronLeft className="w-[18px] h-[18px] text-white/70" />,
      label: 'Navigate back',
      onClick: () => router.push('/'),
    },
    {
      icon: <CirclePlay className="w-[18px] h-[18px] text-white/70" />,
      label: 'Play',
      onClick: () => {},
      isActive: true,
    },
    {
      icon: <BookOpen className="w-[18px] h-[18px] text-white/70" />,
      label: 'Library',
      onClick: () => {},
    },
    {
      icon: <Music className="w-[18px] h-[18px] text-white/70" />,
      label: 'Music',
      onClick: () => {},
    },
    {
      icon: <Flame className="w-[18px] h-[18px] text-white/70" />,
      label: 'Effects',
      onClick: () => {},
    },
  ]

  return (
    <DashboardLayout sidebar={<DashboardSidebar buttons={sidebarButtons} />}>
      <div className="w-[640px] mx-auto">
        <PageHeader title="Campaigns" description="Text description" />

        {/* Campaign List Section */}
        <section className="pt-[40px] pb-[40px]" aria-label="Campaign list">
          {campaignArray.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-400">No campaigns yet</p>
              <p className="text-xs text-neutral-500 mt-1">Create your first campaign to get started</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2" role="list">
              {campaignArray.map((campaign) => (
                <li key={campaign.id}>
                  <CampaignDisplayCard campaign={campaign} onEdit={handleEditCampaign} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => {
          setIsCampaignModalOpen(false)
          setEditingCampaign(undefined)
        }}
        campaign={editingCampaign}
      />
    </DashboardLayout>
  )
}