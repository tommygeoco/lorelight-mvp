'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { useSessionStore } from '@/store/sessionStore'
import { Button } from '@/components/ui/button'
import { Plus, Play, ChevronLeft, CirclePlay, Settings, Music, Flame, Trash2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Session } from '@/types'
import { STRINGS } from '@/lib/constants/strings'

export default function SessionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { campaigns, fetchCampaigns } = useCampaignStore()
  const { sessions, fetchSessionsForCampaign, createSession, deleteSession, fetchedCampaigns, isLoading } = useSessionStore()
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const campaign = campaigns.get(resolvedParams.id)
  const campaignSessions = Array.from(sessions.values())
    .filter((s) => s.campaign_id === resolvedParams.id)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  useEffect(() => {
    if (campaigns.size === 0) {
      fetchCampaigns()
    }
  }, [campaigns.size, fetchCampaigns])

  useEffect(() => {
    // Only fetch if we haven't fetched this campaign's sessions yet
    if (!fetchedCampaigns.has(resolvedParams.id) && !isLoading) {
      fetchSessionsForCampaign(resolvedParams.id)
    }
  }, [resolvedParams.id, fetchedCampaigns, isLoading, fetchSessionsForCampaign])

  // If no campaign data and campaigns haven't loaded yet, redirect
  if (!campaign && campaigns.size === 0) {
    return null
  }

  if (!campaign) {
    router.push('/campaigns')
    return null
  }

  const handleCreateSession = async () => {
    setIsCreating(true)
    try {
      await createSession({
        campaign_id: resolvedParams.id,
        title: `Session ${campaignSessions.length + 1}`,
        description: null,
      })
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handlePlaySession = (session: Session) => {
    router.push(`/campaigns/${resolvedParams.id}/sessions/${session.id}/play`)
  }

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmId(sessionId)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    setIsDeleting(true)
    try {
      await deleteSession(deleteConfirmId)
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Failed to delete session:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const sidebarButtons = [
    {
      icon: <ChevronLeft className="w-[18px] h-[18px] text-white/70" />,
      label: 'Navigate back to campaigns',
      onClick: () => router.push('/campaigns'),
    },
    {
      icon: <CirclePlay className="w-[18px] h-[18px] text-white/70" />,
      label: 'Sessions',
      onClick: () => {},
      isActive: true,
    },
    {
      icon: <Settings className="w-[18px] h-[18px] text-white/70" />,
      label: 'Campaign settings',
      onClick: () => {},
    },
    {
      icon: <Music className="w-[18px] h-[18px] text-white/70" />,
      label: 'Music library',
      onClick: () => {},
    },
    {
      icon: <Flame className="w-[18px] h-[18px] text-white/70" />,
      label: 'Lighting effects',
      onClick: () => {},
    },
  ]

  return (
    <DashboardLayout sidebar={<DashboardSidebar buttons={sidebarButtons} />}>
      <div className="w-[640px] mx-auto">
        <PageHeader
          title={campaign.name}
          description={campaign.description || 'Select a session to begin playing'}
        />

        {/* Sessions Content */}
        <div className="pt-[40px] pb-[40px]">
          <section aria-labelledby="sessions-heading">
            <header className="h-[48px] pt-[24px] flex items-center justify-between">
              <h2 id="sessions-heading" className="text-base font-semibold text-white">Sessions</h2>
              <Button
                onClick={handleCreateSession}
                disabled={isCreating}
                className="bg-white text-black hover:bg-white/90 h-8 px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isCreating ? STRINGS.common.creating : 'New'}
              </Button>
            </header>

            {/* Sessions list */}
            {campaignSessions.length === 0 ? (
              <div className="pt-[24px]">
                <div className="rounded-[8px] border-2 border-dashed border-neutral-800 p-12 text-center">
                  <h3 className="text-lg font-medium text-white">No sessions yet</h3>
                  <p className="mt-2 text-neutral-400">
                    Create your first session to start playing
                  </p>
                  <Button className="mt-4" onClick={handleCreateSession} disabled={isCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-[24px] space-y-2">
                {campaignSessions.map((session) => (
                  <article
                    key={session.id}
                    className="bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-[8px] p-4 cursor-pointer group flex items-center justify-between"
                    onClick={() => handlePlaySession(session)}
                  >
                    <h3 className="text-base font-semibold text-white">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteClick(session.id, e)}
                        className="w-9 h-9 rounded-[8px] hover:bg-red-500/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 group/delete"
                        aria-label="Delete session"
                      >
                        <Trash2 className="w-4 h-4 text-white/40 group-hover/delete:text-red-400 transition-colors" />
                      </button>
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
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Session"
        description="Are you sure you want to delete this session? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  )
}