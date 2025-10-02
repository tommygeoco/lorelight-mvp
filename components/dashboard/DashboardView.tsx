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
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Plus } from 'lucide-react'
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
  })

  return (
    <DashboardLayoutWithSidebar navSidebar={<DashboardSidebar buttons={sidebarButtons} />}>
      <div className="w-[640px] mx-auto">
        <PageHeader title="Campaigns" description="Your worlds await adventure" />

        {/* Campaign List Section */}
        <div className="pt-[40px] pb-[40px]">
          <section aria-labelledby="campaigns-heading">
            <SectionHeader
              title="Campaigns"
              id="campaigns-heading"
              action={{
                label: 'New',
                icon: <Plus className="w-4 h-4" />,
                onClick: () => setIsCampaignModalOpen(true),
                variant: 'primary'
              }}
            />

            {campaignArray.length === 0 ? (
              <div className="pt-[24px]">
                <EmptyState
                  title="No campaigns yet"
                  description="Forge a new world to begin your journey"
                  actionLabel="Create Campaign"
                  onAction={() => setIsCampaignModalOpen(true)}
                  variant="bordered"
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-2 pt-[24px]" role="list">
                {campaignArray.map((campaign) => (
                  <li key={campaign.id}>
                    <CampaignDisplayCard campaign={campaign} onEdit={handleEditCampaign} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
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