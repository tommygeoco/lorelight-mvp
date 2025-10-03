'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Settings, Power, Edit2, Trash2 } from 'lucide-react'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
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
  const { isConnected, lights, rooms, fetchLightsAndRooms, renameRoom, deleteRoom, renameLight, applyLightConfig } = useHueStore()

  const [isHueSetupOpen, setIsHueSetupOpen] = useState(false)
  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'rooms' | 'lights'>('rooms')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    type: 'room' | 'light'
    id: string
    name: string
  } | null>(null)

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

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleSaveEdit = async (id: string, type: 'room' | 'light') => {
    if (!editingName.trim() || editingName === (type === 'room' ? rooms.get(id)?.name : lights.get(id)?.name)) {
      setEditingId(null)
      setEditingName('')
      return
    }

    try {
      if (type === 'room') {
        await renameRoom(id, editingName.trim())
      } else {
        await renameLight(id, editingName.trim())
      }
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      console.error('Failed to rename:', error)
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, type: 'room' | 'light', id: string, name: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      id,
      name,
    })
  }

  const handleDeleteFromContextMenu = async () => {
    if (!contextMenu) return

    if (contextMenu.type === 'room') {
      await deleteRoom(contextMenu.id)
      if (selectedId === contextMenu.id) {
        setSelectedId(null)
      }
    }
    setContextMenu(null)
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

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
    <div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col" aria-label="Lights list">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Lights</h2>
        <button
          onClick={() => setIsHueSetupOpen(true)}
          className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
          aria-label="Hue settings"
          title="Configure Hue bridge"
        >
          <Settings className="w-[18px] h-[18px] text-white/70" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {!isConnected ? (
          <div className="px-6 py-4">
            <div className="text-center py-8">
              <p className="text-white/40 text-[0.875rem]">The lights await your command...<br />Connect your bridge via settings</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 px-6 pt-4 pb-3">
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
              <div className="px-6 pb-4">
                {roomsArray.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/40 text-[0.875rem]">No chambers discovered...<br />Configure rooms in your Hue app</p>
                  </div>
                ) : (
                  <ul role="list" className="space-y-2">
                    {roomsArray.map((room) => {
                      const isEditing = editingId === room.id
                      const roomLightsArray = room.lights
                        .map(lightId => lights.get(lightId))
                        .filter((light): light is NonNullable<typeof light> => !!light)
                      const anyLightOn = roomLightsArray.some(light => light.state.on)
                      const lightsOnCount = roomLightsArray.filter(light => light.state.on).length

                      return (
                        <li key={room.id}>
                          {isEditing ? (
                            <div className="px-3 py-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(room.id, 'room')
                                  if (e.key === 'Escape') {
                                    setEditingId(null)
                                    setEditingName('')
                                  }
                                }}
                                onBlur={() => handleSaveEdit(room.id, 'room')}
                                className="w-full bg-white/[0.07] border border-white/10 rounded-[8px] px-3 py-1.5 text-sm text-white outline-none focus:border-white/20"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => setSelectedId(room.id)}
                              onContextMenu={(e) => handleContextMenu(e, 'room', room.id, room.name)}
                              className={`w-full text-left px-3 py-2 rounded-[8px] transition-colors cursor-pointer ${
                                selectedId === room.id
                                  ? 'bg-white/10 text-white'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {/* Color indicator */}
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-[5px] ${
                                  anyLightOn ? 'bg-purple-400' : 'bg-white/20'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-[13px]">{room.name}</div>
                                  <div className="text-[11px] text-white/50 mt-0.5">
                                    {lightsOnCount} of {room.lights.length} on
                                  </div>
                                </div>
                                {/* On/Off toggle */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    const newOnState = !anyLightOn
                                    await applyLightConfig({
                                      groups: {
                                        [room.id]: { on: newOnState, transitiontime: 2 },
                                      },
                                    })
                                    setTimeout(() => fetchLightsAndRooms(), 500)
                                  }}
                                  className={`w-6 h-6 flex-shrink-0 rounded flex items-center justify-center transition-colors ${
                                    anyLightOn
                                      ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                                  }`}
                                  aria-label={anyLightOn ? 'Turn off' : 'Turn on'}
                                  title={anyLightOn ? 'Turn off' : 'Turn on'}
                                >
                                  <Power className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Individual Lights List */}
            {activeTab === 'lights' && (
              <div className="px-6 pb-4">
                {lightsArray.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/40 text-[0.875rem]">No lights discovered...<br />Check your Hue bridge connection</p>
                  </div>
                ) : (
                  <ul role="list" className="space-y-2">
                    {lightsArray.map((light) => {
                      const isEditing = editingId === light.id

                      return (
                        <li key={light.id}>
                          {isEditing ? (
                            <div className="px-3 py-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(light.id, 'light')
                                  if (e.key === 'Escape') {
                                    setEditingId(null)
                                    setEditingName('')
                                  }
                                }}
                                onBlur={() => handleSaveEdit(light.id, 'light')}
                                className="w-full bg-white/[0.07] border border-white/10 rounded-[8px] px-3 py-1.5 text-sm text-white outline-none focus:border-white/20"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => setSelectedId(light.id)}
                              onContextMenu={(e) => handleContextMenu(e, 'light', light.id, light.name)}
                              className={`w-full text-left px-3 py-2 rounded-[8px] transition-colors cursor-pointer ${
                                selectedId === light.id
                                  ? 'bg-white/10 text-white'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {/* Color indicator */}
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-[5px] ${
                                  light.state.on ? 'bg-yellow-400' : 'bg-white/20'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-[13px]">{light.name}</div>
                                  <div className="text-[11px] text-white/50 mt-0.5">
                                    {light.state.on ? 'On' : 'Off'} · {Math.round((light.state.bri / 254) * 100)}%
                                  </div>
                                </div>
                                {/* On/Off toggle */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    const newOnState = !light.state.on
                                    await applyLightConfig({
                                      lights: {
                                        [light.id]: { on: newOnState, transitiontime: 2 },
                                      },
                                    })
                                    setTimeout(() => fetchLightsAndRooms(), 500)
                                  }}
                                  className={`w-6 h-6 flex-shrink-0 rounded flex items-center justify-center transition-colors ${
                                    light.state.on
                                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                                  }`}
                                  aria-label={light.state.on ? 'Turn off' : 'Turn on'}
                                  title={light.state.on ? 'Turn off' : 'Turn on'}
                                >
                                  <Power className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
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
                title={activeTab === 'rooms' ? 'No chamber selected' : 'No light selected'}
                description={`Choose a ${activeTab === 'rooms' ? 'chamber' : 'light'} from the sidebar`}
                variant="centered"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <EmptyState
            title="No bridge connected"
            description="Link your Hue bridge to command the lights"
            variant="centered"
          />
        </div>
      )}

      <HueSetup isOpen={isHueSetupOpen} onClose={() => setIsHueSetupOpen(false)} />
      <AudioLibrary isOpen={isAudioLibraryOpen} onClose={() => setIsAudioLibraryOpen(false)} />

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleStartEdit(contextMenu.id, contextMenu.name)
              setContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Rename
          </button>
          {contextMenu.type === 'room' && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={handleDeleteFromContextMenu}
                className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </DashboardLayoutWithSidebar>
  )
}
