'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { useSessionStore } from '@/store/sessionStore'
import { Button } from '@/components/ui/button'
import { Plus, Play, ChevronLeft, CirclePlay, BookOpen, Music, Flame } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Session } from '@/types'
import { STRINGS } from '@/lib/constants/strings'
import { CampaignCardSkeleton } from '@/components/ui/Skeleton'

export default function SessionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { campaigns, fetchCampaigns } = useCampaignStore()
  const { sessions, fetchSessionsForCampaign, createSession } = useSessionStore()
  const [isCreating, setIsCreating] = useState(false)

  const campaign = campaigns.get(resolvedParams.id)
  const campaignSessions = Array.from(sessions.values()).filter(
    (s) => s.campaign_id === resolvedParams.id
  )

  useEffect(() => {
    if (campaigns.size === 0) {
      fetchCampaigns()
    }
  }, [campaigns.size, fetchCampaigns])

  useEffect(() => {
    fetchSessionsForCampaign(resolvedParams.id)
  }, [resolvedParams.id, fetchSessionsForCampaign])

  if (!campaign && campaigns.size === 0) {
    return (
      <div className="h-screen bg-[#111111]">
        <PageHeader title="Sessions" description="Loading..." />
        <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-4">
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
        </div>
      </div>
    )
  }

  if (!campaign) {
    router.push('/campaigns')
    return null
  }

  const handleCreateSession = async () => {
    setIsCreating(true)
    try {
      const newSession = await createSession({
        campaign_id: resolvedParams.id,
        title: `Session ${campaignSessions.length + 1}`,
        description: null,
      })
      router.push(`/campaigns/${resolvedParams.id}/sessions/${newSession.id}/play`)
    } catch (error) {
      console.error('Failed to create session:', error)
      setIsCreating(false)
    }
  }

  const handlePlaySession = (session: Session) => {
    router.push(`/campaigns/${resolvedParams.id}/sessions/${session.id}/play`)
  }

  return (
    <div className="h-screen w-full bg-[#111111]">
      <div className="h-full flex overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-[72px] flex-shrink-0 p-2" aria-label="Main navigation">
          <div className="bg-[#191919] rounded-lg p-2 h-full flex flex-col gap-2">
            <button
              onClick={() => router.push('/campaigns')}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Navigate back to campaigns"
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader
            title={campaign.name}
            description={campaign.description || 'Select a session to begin playing'}
          />

          <div className="flex-1 overflow-auto">
            <div className="max-w-[1280px] mx-auto px-8 py-8">
              {/* Header with create button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Sessions</h2>
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreating}
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreating ? STRINGS.common.creating : 'New Session'}
                </Button>
              </div>

              {/* Sessions grid */}
              {campaignSessions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-neutral-800 p-12 text-center">
                  <h3 className="text-lg font-medium text-white">No sessions yet</h3>
                  <p className="mt-2 text-sm text-neutral-400">
                    Create your first session to start playing
                  </p>
                  <Button className="mt-4" onClick={handleCreateSession} disabled={isCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignSessions.map((session) => (
                    <article
                      key={session.id}
                      className="bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-xl p-6 cursor-pointer group"
                      onClick={() => handlePlaySession(session)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {session.title}
                          </h3>
                          {session.description && (
                            <p className="text-sm text-white/50 line-clamp-2">
                              {session.description}
                            </p>
                          )}
                        </div>
                        {session.status === 'active' && (
                          <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded-md">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlaySession(session)
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" fill="currentColor" />
                          Play
                        </Button>
                        <span className="text-xs text-white/40">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}