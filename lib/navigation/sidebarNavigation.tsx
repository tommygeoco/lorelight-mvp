import { ChevronLeft, CirclePlay, Settings, Music, Flame } from 'lucide-react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { SidebarButton } from '@/types'

export type NavigationView = 'dashboard' | 'campaigns' | 'sessions' | 'scenes' | 'sessionScene' | 'lights' | 'audio'

interface NavigationContext {
  view: NavigationView
  campaignId?: string
  sessionId?: string
  router: AppRouterInstance
  onOpenAudioLibrary?: () => void
  onOpenHueSetup?: () => void
}

/**
 * Get standardized sidebar navigation buttons for any view
 *
 * Consistent Navigation Pattern (same buttons everywhere):
 * - Position 1: Back button (context-aware destination)
 * - Position 2: Campaigns (active on dashboard/campaigns/sessions/scenes)
 * - Position 3: Lights (active on lights page)
 * - Position 4: Music library (active on audio page)
 * - Position 5: Settings (placeholder for future)
 */
export function getSidebarButtons(context: NavigationContext): SidebarButton[] {
  const { view, campaignId, router } = context

  // Determine back button destination based on current view hierarchy
  let backLabel = 'Back'
  let backAction = () => router.push('/campaigns')

  switch (view) {
    case 'sessionScene':
      // Scene -> Sessions list
      backLabel = 'Back to sessions'
      backAction = campaignId ? () => router.push(`/campaigns/${campaignId}/sessions`) : () => router.back()
      break
    case 'scenes':
      // Scenes library -> Sessions list
      backLabel = 'Back to sessions'
      backAction = campaignId ? () => router.push(`/campaigns/${campaignId}/sessions`) : () => router.push('/campaigns')
      break
    case 'sessions':
      // Sessions list -> Campaigns list
      backLabel = 'Back to campaigns'
      backAction = () => router.push('/campaigns')
      break
    case 'lights':
      // Lights -> Campaigns
      backLabel = 'Back to campaigns'
      backAction = () => router.push('/campaigns')
      break
    case 'audio':
      // Audio Library -> Campaigns
      backLabel = 'Back to campaigns'
      backAction = () => router.push('/campaigns')
      break
    case 'dashboard':
    case 'campaigns':
    default:
      // Already at top level - back goes to campaigns
      backLabel = 'Back to campaigns'
      backAction = () => router.push('/campaigns')
  }

  return [
    // Position 1: Back button
    {
      icon: <ChevronLeft className="w-[18px] h-[18px] text-white/70" />,
      label: backLabel,
      onClick: backAction,
    },
    // Position 2: Campaigns
    {
      icon: <CirclePlay className="w-[18px] h-[18px] text-white/70" />,
      label: 'Campaigns',
      onClick: () => router.push('/campaigns'),
      isActive: view === 'dashboard' || view === 'campaigns' || view === 'sessions' || view === 'scenes' || view === 'sessionScene',
    },
    // Position 3: Lights
    {
      icon: <Flame className="w-[18px] h-[18px] text-white/70" />,
      label: 'Lights',
      onClick: () => router.push('/lights'),
      isActive: view === 'lights',
    },
    // Position 4: Music library
    {
      icon: <Music className="w-[18px] h-[18px] text-white/70" />,
      label: 'Music library',
      onClick: () => router.push('/audio'),
      isActive: view === 'audio',
    },
    // Position 5: Settings
    {
      icon: <Settings className="w-[18px] h-[18px] text-white/70" />,
      label: 'Settings',
      onClick: () => {},
    },
  ]
}
