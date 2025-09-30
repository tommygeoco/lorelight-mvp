'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { SessionList } from '@/components/sessions/SessionList'
import { SceneList } from '@/components/scenes/SceneList'
import { SessionSceneView } from '@/components/sessions/SessionSceneView'
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
    // Only fetch if we don't have any campaigns at all
    if (campaigns.size === 0) {
      fetchCampaigns()
    }
  }, [campaigns.size, fetchCampaigns])

  // If we still don't have the campaign after checking, show a minimal loading state
  if (!campaign && campaigns.size === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-neutral-400">Loading campaign...</div>
      </div>
    )
  }

  // If campaigns loaded but this one doesn't exist, redirect
  if (!campaign && campaigns.size > 0) {
    router.push('/dashboard')
    return null
  }

  // TypeScript guard - campaign is guaranteed to exist here
  if (!campaign) return null

  const CampaignHeader = () => (
    <>
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

      <div className="mb-6">
        <TabsList>
          <TabsTrigger value="play">Play</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="scenes">Scenes</TabsTrigger>
        </TabsList>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-black">
      <Tabs defaultValue="play" className="h-screen flex flex-col">
        <TabsContent value="play" forceMount className="data-[state=inactive]:hidden flex-1 m-0">
          <SessionSceneView campaignId={resolvedParams.id} />
        </TabsContent>

        <TabsContent value="sessions" forceMount className="data-[state=inactive]:hidden flex-1 m-0">
          <div className="h-full overflow-auto p-8">
            <div className="mx-auto max-w-7xl">
              <CampaignHeader />
              <SessionList campaignId={resolvedParams.id} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scenes" forceMount className="data-[state=inactive]:hidden flex-1 m-0">
          <div className="h-full overflow-auto p-8">
            <div className="mx-auto max-w-7xl">
              <CampaignHeader />
              <SceneList campaignId={resolvedParams.id} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}