'use client'

import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { ChevronLeft, CirclePlay, BookOpen, Music, Flame, Plus } from 'lucide-react'
import { CampaignCard } from './CampaignCard'
import { AudioPlayerFooter } from './AudioPlayerFooter'
import { useEffect } from 'react'

export function DashboardView() {
  const router = useRouter()
  const { campaigns, fetchCampaigns, isLoading, error } = useCampaignStore()

  useEffect(() => {
    if (campaigns.size === 0 && !isLoading) {
      fetchCampaigns()
    }
  }, [campaigns.size, isLoading, fetchCampaigns])

  const campaignArray = Array.from(campaigns.values())

  return (
    <div className="bg-[#111111] rounded-2xl h-screen flex flex-col relative overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar and Main Content Container */}
        <div className="flex gap-2 p-2 flex-1">
          {/* Sidebar */}
          <div className="bg-[#191919] rounded-lg p-2 flex flex-col gap-2 shrink-0">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              title="Back"
            >
              <ChevronLeft className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button className="w-10 h-10 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center transition-colors">
              <CirclePlay className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
              <BookOpen className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
              <Music className="w-[18px] h-[18px] text-white/70" />
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
              <Flame className="w-[18px] h-[18px] text-white/70" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-[#191919] rounded-lg flex flex-col overflow-hidden">
            {/* Hero Section with Gradient */}
            <div className="relative pt-20 pb-0 px-0">
              {/* Gradient Background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute w-[668px] h-40 -top-[137px] left-[92px] opacity-100 blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)' }}
                />
                <div
                  className="absolute w-[668px] h-40 -top-[137px] right-[30px] opacity-100 blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%)' }}
                />
              </div>

              {/* Title */}
              <div className="relative max-w-[640px] mx-auto px-0 pb-6">
                <h1
                  className="text-[60px] font-normal text-white mb-1 leading-[72px] tracking-tight"
                  style={{ fontFamily: '"PP Mondwest", sans-serif' }}
                >
                  Dashboard
                </h1>
                <p className="text-sm text-[#eeeeee] leading-5 font-normal">
                  Manage your campaigns and sessions
                </p>
              </div>
            </div>

            {/* Campaigns Section */}
            <div className="flex-1 overflow-y-auto px-0 py-10">
              <div className="max-w-[640px] mx-auto">
                <div className="flex items-center justify-between mb-6 px-0 pt-6">
                  <h2 className="text-base font-semibold text-white">Campaigns</h2>
                  <button
                    onClick={() => {
                      // TODO: Open create campaign modal
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Campaign
                  </button>
                </div>

                {error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-red-400">Error: {error}</div>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-neutral-400">Loading campaigns...</div>
                  </div>
                ) : campaignArray.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
                    <p className="text-sm text-neutral-400 mb-4">
                      Create your first campaign to get started
                    </p>
                    <button
                      onClick={() => {
                        // TODO: Open create campaign modal
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Campaign
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 px-0 pb-6">
                    {campaignArray.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player Footer */}
      <AudioPlayerFooter />
    </div>
  )
}