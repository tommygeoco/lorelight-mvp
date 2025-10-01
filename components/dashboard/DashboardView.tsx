'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { CampaignDisplayCard } from './CampaignDisplayCard'
import { CampaignModal } from '@/components/campaigns/CampaignModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'
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

  const sidebarButtons = getSidebarButtons({
    view: 'dashboard',
    router,
    onOpenAudioLibrary: () => {}, // TODO: Implement when AudioLibrary is added
    onOpenHueSetup: () => {}, // TODO: Implement when needed
  })

  return (
    <DashboardLayoutWithSidebar navSidebar={<DashboardSidebar buttons={sidebarButtons} />}>
      <div className="w-[640px] mx-auto">
        <PageHeader title="Campaigns" description="Text description" />

        {/* Campaign List Section */}
        <section className="pt-[40px] pb-[40px]" aria-label="Campaign list">
          {campaignArray.length === 0 ? (
            <EmptyState
              title="No campaigns yet"
              description="Create your first campaign to get started"
              variant="simple"
            />
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
    </DashboardLayoutWithSidebar>
  )
}