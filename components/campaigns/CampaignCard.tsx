'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Campaign } from '@/types'
import { useCampaignStore } from '@/store/campaignStore'
import { Trash2, Edit } from 'lucide-react'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (campaign: Campaign) => void
  onSelect: (campaign: Campaign) => void
}

export function CampaignCard({ campaign, onEdit, onSelect }: CampaignCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteCampaign = useCampaignStore(state => state.deleteCampaign)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete campaign "${campaign.name}"?`)) return

    setIsDeleting(true)
    try {
      await deleteCampaign(campaign.id)
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      setIsDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(campaign)
  }

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-neutral-600 hover:bg-neutral-900"
      onClick={() => onSelect(campaign)}
    >
      <CardHeader>
        <CardTitle className="text-xl">{campaign.name}</CardTitle>
        {campaign.description && (
          <CardDescription className="line-clamp-2">
            {campaign.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardFooter className="justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          disabled={isDeleting}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}