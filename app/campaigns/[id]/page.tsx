'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { SessionList } from '@/components/sessions/SessionList'
import { SceneList } from '@/components/scenes/SceneList'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { campaigns, fetchCampaigns } = useCampaignStore()

  const campaign = campaigns.get(resolvedParams.id)

  useEffect(() => {
    if (!campaign) {
      fetchCampaigns()
    }
  }, [campaign, fetchCampaigns])

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-neutral-400">Loading campaign...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
            {campaign.description && (
              <p className="mt-2 text-neutral-400">{campaign.description}</p>
            )}
          </div>
        </div>

        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="scenes">Scenes</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <SessionList campaignId={resolvedParams.id} />
          </TabsContent>

          <TabsContent value="scenes">
            <SceneList campaignId={resolvedParams.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}