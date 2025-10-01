'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Lightbulb, RefreshCw, Settings } from 'lucide-react'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { HueSetup } from '@/components/hue/HueSetup'
import { LightCard } from '@/components/hue/LightCard'
import { RoomCard } from '@/components/hue/RoomCard'
import { useHueStore } from '@/store/hueStore'
import { useAuthStore } from '@/store/authStore'

export default function LightsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isConnected, lights, rooms, fetchLightsAndRooms } = useHueStore()

  const [isHueSetupOpen, setIsHueSetupOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'rooms' | 'lights'>('rooms')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (isConnected) {
      handleRefresh()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchLightsAndRooms()
    } catch (error) {
      console.error('Failed to refresh lights', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const sidebarButtons = [
    {
      icon: <Home className="w-[18px] h-[18px] text-white/70" />,
      label: 'Dashboard',
      onClick: () => router.push('/'),
      isActive: false,
    },
    {
      icon: <Lightbulb className="w-[18px] h-[18px] text-white/70" />,
      label: 'Lights',
      onClick: () => {},
      isActive: true,
    },
  ]

  const roomsArray = Array.from(rooms.values())
  const lightsArray = Array.from(lights.values())

  if (!user) return null

  return (
    <div className="h-screen flex bg-[#111111]">
      {/* Sidebar */}
      <div className="w-[68px] p-3 flex-shrink-0">
        <DashboardSidebar buttons={sidebarButtons} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-[88px] flex items-end px-6 pb-[24px] border-b border-white/10">
          <div>
            <h1 className="font-extrabold text-[32px] text-white">Lights</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          {!isConnected ? (
            <div className="max-w-2xl mx-auto mt-12">
              <EmptyState
                title="No Hue bridge connected"
                description="Connect your Philips Hue bridge to control your smart lights during sessions."
                actionLabel="Connect Hue Bridge"
                onAction={() => setIsHueSetupOpen(true)}
                icon={<Lightbulb className="w-12 h-12" />}
                variant="bordered"
              />
            </div>
          ) : (
            <>
              <SectionHeader
                title="Smart Lights"
                action={{
                  label: isRefreshing ? 'Refreshing...' : 'Refresh',
                  icon: <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />,
                  onClick: handleRefresh,
                  disabled: isRefreshing,
                  variant: 'primary',
                }}
              />

              {/* Tabs */}
              <div className="flex gap-4 mt-4 mb-6">
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                    activeTab === 'rooms'
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Rooms ({roomsArray.length})
                </button>
                <button
                  onClick={() => setActiveTab('lights')}
                  className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                    activeTab === 'lights'
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Individual Lights ({lightsArray.length})
                </button>
                <button
                  onClick={() => setIsHueSetupOpen(true)}
                  className="ml-auto px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>

              {/* Rooms Tab */}
              {activeTab === 'rooms' && (
                <div className="pb-8">
                  {roomsArray.length === 0 ? (
                    <EmptyState
                      title="No rooms found"
                      description="No rooms or groups are configured in your Hue bridge."
                      variant="simple"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roomsArray.map((room) => (
                        <RoomCard key={room.id} room={room} lights={lights} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Lights Tab */}
              {activeTab === 'lights' && (
                <div className="pb-8">
                  {lightsArray.length === 0 ? (
                    <EmptyState
                      title="No lights found"
                      description="No lights are connected to your Hue bridge."
                      variant="simple"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lightsArray.map((light) => (
                        <LightCard key={light.id} light={light} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hue Setup Modal */}
      <HueSetup isOpen={isHueSetupOpen} onClose={() => setIsHueSetupOpen(false)} />
    </div>
  )
}
