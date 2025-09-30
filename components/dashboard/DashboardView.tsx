'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { ChevronLeft, CirclePlay, BookOpen, Music, Flame } from 'lucide-react'
import { CampaignCard } from './CampaignCard'
import { PageHeader } from '@/components/ui/PageHeader'

export function DashboardView() {
  const router = useRouter()
  const { campaigns, isLoading, fetchCampaigns } = useCampaignStore()

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const campaignArray = Array.from(campaigns.values())

  return (
    <div className="h-screen w-full bg-[#111111]">
      <div className="h-full flex overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-[72px] flex-shrink-0 p-2" aria-label="Main navigation">
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
        <main className="flex-1 bg-[#191919] rounded-tl-lg rounded-tr-2xl mt-2 mr-2 mb-2 overflow-hidden flex flex-col">
          <PageHeader title="Campaigns" description="Text description" />

          {/* Campaign List Section */}
          <section className="flex-1 overflow-y-auto" aria-label="Campaign list">
            <div className="w-[640px] mx-auto pt-[40px] pb-[40px]">
              {isLoading ? (
                <p className="text-center py-8 text-sm text-neutral-400">Loading campaigns...</p>
              ) : campaignArray.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-neutral-400">No campaigns yet</p>
                  <p className="text-xs text-neutral-500 mt-1">Create your first campaign to get started</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4" role="list">
                  {campaignArray.map((campaign) => (
                    <li key={campaign.id}>
                      <CampaignCard campaign={campaign} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}