'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { CampaignCard } from './CampaignCard'
import { CampaignForm } from './CampaignForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import type { Campaign } from '@/types'

export function CampaignList() {
  const router = useRouter()
  const {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    setCurrentCampaign,
  } = useCampaignStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleCreate = async (data: { name: string; description: string }) => {
    await createCampaign({
      name: data.name,
      description: data.description || null,
      thumbnail_url: null,
    })
    setIsCreateOpen(false)
  }

  const handleUpdate = async (data: { name: string; description: string }) => {
    if (!editingCampaign) return
    await updateCampaign(editingCampaign.id, {
      name: data.name,
      description: data.description || null,
    })
    setEditingCampaign(null)
  }

  const handleSelect = (campaign: Campaign) => {
    setCurrentCampaign(campaign.id)
    router.push(`/campaigns/${campaign.id}/play`)
  }

  const campaignArray = Array.from(campaigns.values())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-400">Loading campaigns...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Campaigns</h2>
          <p className="text-sm text-neutral-400">
            Select a campaign to manage sessions and scenes
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {campaignArray.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-800 p-12 text-center">
          <h3 className="text-lg font-medium text-white">No campaigns yet</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Get started by creating your first campaign
          </p>
          <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaignArray.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={setEditingCampaign}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Create a new campaign to organize your sessions and scenes
            </DialogDescription>
          </DialogHeader>
          <CampaignForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update your campaign details
            </DialogDescription>
          </DialogHeader>
          {editingCampaign && (
            <CampaignForm
              campaign={editingCampaign}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCampaign(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}