'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lightbulb, RefreshCw, Settings } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { HueSetup } from '@/components/hue/HueSetup'
import { AudioLibrary } from '@/components/audio/AudioLibrary'
import { LightCard } from '@/components/hue/LightCard'
import { RoomCard } from '@/components/hue/RoomCard'
import { useHueStore } from '@/store/hueStore'
import { useAuthStore } from '@/store/authStore'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'

export default function LightsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isConnected, lights, rooms, fetchLightsAndRooms } = useHueStore()

  const [isHueSetupOpen, setIsHueSetupOpen] = useState(false)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'rooms' | 'lights'>('rooms')
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  const sidebarButtons = getSidebarButtons({
    view: 'lights',
    router,
    onOpenAudioLibrary: () => setIsAudioLibraryOpen(true),
  })

  const roomsArray = Array.from(rooms.values())
  const lightsArray = Array.from(lights.values())

  // Get selected item
  const selectedRoom = activeTab === 'rooms' && selectedId
    ? roomsArray.find(r => r.id === selectedId)
    : null
  const selectedLight = activeTab === 'lights' && selectedId
    ? lightsArray.find(l => l.id === selectedId)
    : null

  // Auto-select first item when tab changes or data loads
  useEffect(() => {
    if (activeTab === 'rooms' && roomsArray.length > 0 && !selectedId) {
      setSelectedId(roomsArray[0].id)
    } else if (activeTab === 'lights' && lightsArray.length > 0 && !selectedId) {
      setSelectedId(lightsArray[0].id)
    }
  }, [activeTab, roomsArray, lightsArray, selectedId])

  if (!user) return null

  // Lights sidebar component
  const lightsSidebar = (
    <aside className="h-full" aria-label="Lights list">
      <div className="bg-[#191919] rounded-[8px] p-3 h-full flex flex-col overflow-y-auto">
        <SectionHeader
          title="Lights"
          variant="sidebar"
          action={{
            icon: <Settings className="w-[18px] h-[18px] text-white/70" />,
            onClick: () => setIsHueSetupOpen(true),
            variant: 'icon-only',
            ariaLabel: 'Hue settings'
          }}
        />

        {!isConnected ? (
          <div className="mt-4">
            <EmptyState
              title="No bridge connected"
              description="Connect your Hue bridge to get started"
              actionLabel="Connect Bridge"
              onAction={() => setIsHueSetupOpen(true)}
              variant="simple"
            />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mt-4 mb-3">
              <button
                onClick={() => {
                  setActiveTab('rooms')
                  setSelectedId(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors ${
                  activeTab === 'rooms'
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Rooms
              </button>
              <button
                onClick={() => {
                  setActiveTab('lights')
                  setSelectedId(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors ${
                  activeTab === 'lights'
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Lights
              </button>
            </div>

            {/* Rooms List */}
            {activeTab === 'rooms' && (
              <>
                {roomsArray.length === 0 ? (
                  <EmptyState
                    title="No rooms found"
                    description="No rooms configured"
                    variant="simple"
                  />
                ) : (
                  <ul role="list" className="space-y-2">
                    {roomsArray.map((room) => (
                      <li key={room.id}>
                        <button
                          onClick={() => setSelectedId(room.id)}
                          className={`w-full text-left px-3 py-2 rounded-[8px] transition-colors ${
                            selectedId === room.id
                              ? 'bg-white/10 text-white'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="font-medium text-sm">{room.name}</div>
                          <div className="text-xs text-white/50 mt-0.5">
                            {room.lights.length} {room.lights.length === 1 ? 'light' : 'lights'}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {/* Individual Lights List */}
            {activeTab === 'lights' && (
              <>
                {lightsArray.length === 0 ? (
                  <EmptyState
                    title="No lights found"
                    description="No lights connected"
                    variant="simple"
                  />
                ) : (
                  <ul role="list" className="space-y-2">
                    {lightsArray.map((light) => (
                      <li key={light.id}>
                        <button
                          onClick={() => setSelectedId(light.id)}
                          className={`w-full text-left px-3 py-2 rounded-[8px] transition-colors ${
                            selectedId === light.id
                              ? 'bg-white/10 text-white'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="font-medium text-sm">{light.name}</div>
                          <div className="text-xs text-white/50 mt-0.5">
                            {light.state.on ? 'On' : 'Off'} · {Math.round((light.state.bri / 254) * 100)}%
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )

  return (
    <DashboardLayoutWithSidebar
      navSidebar={<DashboardSidebar buttons={sidebarButtons} />}
      contentSidebar={lightsSidebar}
    >
      {isConnected ? (
        <div className="w-[640px] mx-auto">
          {selectedRoom && (
            <>
              <PageHeader
                title={selectedRoom.name}
                description={`${selectedRoom.lights.length} lights in this room`}
              />
              <div className="pt-[40px] pb-[40px]">
                <section aria-labelledby="room-controls">
                  <SectionHeader
                    title="Room Controls"
                    id="room-controls"
                    action={{
                      label: isRefreshing ? 'Refreshing...' : 'Refresh',
                      icon: <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />,
                      onClick: handleRefresh,
                      disabled: isRefreshing,
                      variant: 'secondary',
                    }}
                  />
                  <div className="mt-6">
                    <RoomCard room={selectedRoom} lights={lights} />
                  </div>
                </section>
              </div>
            </>
          )}

          {selectedLight && (
            <>
              <PageHeader
                title={selectedLight.name}
                description={selectedLight.type}
              />
              <div className="pt-[40px] pb-[40px]">
                <section aria-labelledby="light-controls">
                  <SectionHeader
                    title="Light Controls"
                    id="light-controls"
                    action={{
                      label: isRefreshing ? 'Refreshing...' : 'Refresh',
                      icon: <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />,
                      onClick: handleRefresh,
                      disabled: isRefreshing,
                      variant: 'secondary',
                    }}
                  />
                  <div className="mt-6">
                    <LightCard light={selectedLight} />
                  </div>
                </section>
              </div>
            </>
          )}

          {!selectedRoom && !selectedLight && (
            <div className="flex items-center justify-center h-full">
              <EmptyState
                title={activeTab === 'rooms' ? 'No room selected' : 'No light selected'}
                description={`Select a ${activeTab === 'rooms' ? 'room' : 'light'} from the sidebar to view controls`}
                variant="centered"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <EmptyState
            title="No bridge connected"
            description="Connect your Hue bridge from the sidebar to get started"
            variant="centered"
          />
        </div>
      )}

      <HueSetup isOpen={isHueSetupOpen} onClose={() => setIsHueSetupOpen(false)} />
      <AudioLibrary isOpen={isAudioLibraryOpen} onClose={() => setIsAudioLibraryOpen(false)} />
    </DashboardLayoutWithSidebar>
  )
}
