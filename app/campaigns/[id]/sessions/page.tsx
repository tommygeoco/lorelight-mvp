'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/campaignStore'
import { useSessionStore } from '@/store/sessionStore'
import { Button } from '@/components/ui/button'
import { Plus, Play, Trash2 } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'
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
    } catch {
      // Error handled by store
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
    } catch {
      // Error handled by store
    } finally {
      setIsDeleting(false)
    }
  }

  const sidebarButtons = getSidebarButtons({
    view: 'sessions',
    campaignId: resolvedParams.id,
    router,
    onOpenAudioLibrary: () => {}, // TODO: Implement when AudioLibrary modal is added
    onOpenHueSetup: () => {}, // TODO: Implement when HueSetup modal is added
  })

  return (
    <DashboardLayoutWithSidebar navSidebar={<DashboardSidebar buttons={sidebarButtons} />}>
      <div className="w-[640px] mx-auto">
        <PageHeader
          title={campaign.name}
          description={campaign.description || 'Select a session to begin playing'}
        />

        {/* Sessions Content */}
        <div className="pt-[40px] pb-[40px]">
          <section aria-labelledby="sessions-heading">
            <SectionHeader
              title="Sessions"
              id="sessions-heading"
              action={{
                label: isCreating ? STRINGS.common.creating : 'New',
                icon: <Plus className="w-4 h-4" />,
                onClick: handleCreateSession,
                disabled: isCreating,
                variant: 'primary'
              }}
            />

            {/* Sessions list */}
            {campaignSessions.length === 0 ? (
              <div className="pt-[24px]">
                <EmptyState
                  title="No sessions yet"
                  description="Create your first session to start playing"
                  actionLabel="Create Session"
                  onAction={handleCreateSession}
                  disabled={isCreating}
                  variant="bordered"
                />
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
    </DashboardLayoutWithSidebar>
  )
}