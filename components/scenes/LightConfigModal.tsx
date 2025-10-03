'use client'

import { useState, useEffect } from 'react'
import { X, Lightbulb, Eye, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { useHueStore } from '@/store/hueStore'

interface LightConfig {
  on: boolean
  bri: number // 1-254
  hue?: number // 0-65535
  sat?: number // 0-254
  ct?: number // 153-500 (color temperature)
  effect?: 'none' | 'colorloop'
  transitiontime: number
}

interface RoomState {
  expanded: boolean
  lights: Map<string, LightConfig>
}

interface LightConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: unknown) => void
  initialConfig?: unknown
}

// Preset colors for quick selection
const COLOR_PRESETS = [
  { name: 'Warm White', ct: 370 },
  { name: 'Daylight', ct: 250 },
  { name: 'Cool White', ct: 180 },
  { name: 'Red', hue: 0, sat: 254 },
  { name: 'Orange', hue: 5000, sat: 254 },
  { name: 'Yellow', hue: 10000, sat: 254 },
  { name: 'Green', hue: 25500, sat: 254 },
  { name: 'Cyan', hue: 35000, sat: 254 },
  { name: 'Blue', hue: 46920, sat: 254 },
  { name: 'Purple', hue: 50000, sat: 254 },
  { name: 'Pink', hue: 56100, sat: 254 },
]

/**
 * LightConfigModal - Per-light configuration with colors and effects
 * Allows configuring each light individually within rooms
 */
export function LightConfigModal({ isOpen, onClose, onSave, initialConfig }: LightConfigModalProps) {
  const { rooms, lights, isConnected, fetchLightsAndRooms, applyLightConfig } = useHueStore()
  const [roomStates, setRoomStates] = useState<Map<string, RoomState>>(new Map())
  const [isPreviewing, setIsPreviewing] = useState(false)

  // Load initial configuration
  useEffect(() => {
    if (isOpen && initialConfig && typeof initialConfig === 'object' && 'lights' in initialConfig) {
      const lightsConfig = (initialConfig as { lights: Record<string, LightConfig> }).lights
      const newRoomStates = new Map<string, RoomState>()

      // Group lights by room
      rooms.forEach(room => {
        const roomLights = new Map<string, LightConfig>()
        room.lights.forEach(lightId => {
          if (lightsConfig[lightId]) {
            roomLights.set(lightId, lightsConfig[lightId])
          }
        })
        if (roomLights.size > 0) {
          newRoomStates.set(room.id, {
            expanded: false,
            lights: roomLights
          })
        }
      })

      setRoomStates(newRoomStates)
    }
  }, [isOpen, initialConfig, rooms])

  // Fetch rooms/lights when modal opens
  useEffect(() => {
    if (isOpen && isConnected) {
      fetchLightsAndRooms()
    }
  }, [isOpen, isConnected, fetchLightsAndRooms])

  if (!isOpen) return null

  const handleToggleRoom = (roomId: string, room: { lights: string[] }) => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      if (newStates.has(roomId)) {
        newStates.delete(roomId)
      } else {
        // Add all lights in room with default config
        const roomLights = new Map<string, LightConfig>()
        room.lights.forEach(lightId => {
          roomLights.set(lightId, {
            on: true,
            bri: 254,
            transitiontime: 4
          })
        })
        newStates.set(roomId, {
          expanded: false,
          lights: roomLights
        })
      }
      return newStates
    })
  }

  const handleToggleRoomExpanded = (roomId: string) => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      const roomState = newStates.get(roomId)
      if (roomState) {
        newStates.set(roomId, {
          ...roomState,
          expanded: !roomState.expanded
        })
      }
      return newStates
    })
  }

  const handleLightBrightness = (roomId: string, lightId: string, bri: number) => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      const roomState = newStates.get(roomId)
      if (roomState) {
        const lightConfig = roomState.lights.get(lightId)
        if (lightConfig) {
          roomState.lights.set(lightId, { ...lightConfig, bri })
          newStates.set(roomId, { ...roomState })
        }
      }
      return newStates
    })
  }

  const handleLightColor = (roomId: string, lightId: string, preset: typeof COLOR_PRESETS[0]) => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      const roomState = newStates.get(roomId)
      if (roomState) {
        const lightConfig = roomState.lights.get(lightId)
        if (lightConfig) {
          const newConfig = { ...lightConfig }
          if ('ct' in preset) {
            // Color temperature mode
            newConfig.ct = preset.ct
            delete newConfig.hue
            delete newConfig.sat
          } else {
            // Color mode
            newConfig.hue = preset.hue
            newConfig.sat = preset.sat
            delete newConfig.ct
          }
          roomState.lights.set(lightId, newConfig)
          newStates.set(roomId, { ...roomState })
        }
      }
      return newStates
    })
  }

  const handleLightEffect = (roomId: string, lightId: string, effect: 'none' | 'colorloop') => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      const roomState = newStates.get(roomId)
      if (roomState) {
        const lightConfig = roomState.lights.get(lightId)
        if (lightConfig) {
          roomState.lights.set(lightId, { ...lightConfig, effect })
          newStates.set(roomId, { ...roomState })
        }
      }
      return newStates
    })
  }

  const handlePreview = async () => {
    if (!isConnected) return

    setIsPreviewing(true)
    try {
      const config: Record<string, LightConfig> = {}

      roomStates.forEach(roomState => {
        roomState.lights.forEach((lightConfig, lightId) => {
          config[lightId] = lightConfig
        })
      })

      await applyLightConfig({ lights: config })
    } catch (error) {
      console.error('Failed to preview lights:', error)
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleSave = () => {
    const config: Record<string, LightConfig> = {}

    roomStates.forEach(roomState => {
      roomState.lights.forEach((lightConfig, lightId) => {
        config[lightId] = lightConfig
      })
    })

    onSave({ lights: config })
    onClose()
  }

  const roomsArray = Array.from(rooms.values())
  const totalLightsConfigured = Array.from(roomStates.values()).reduce(
    (sum, room) => sum + room.lights.size,
    0
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#191919] rounded-[16px] w-[680px] max-h-[85vh] flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Configure Lighting</h2>
              {totalLightsConfigured > 0 && (
                <p className="text-[12px] text-white/40">{totalLightsConfigured} lights configured</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-custom">
          {!isConnected ? (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-[14px]">
                Connect to your Hue bridge to configure lighting
              </p>
            </div>
          ) : roomsArray.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-[14px]">
                No rooms found. Create rooms in the Hue app first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {roomsArray.map(room => {
                const roomState = roomStates.get(room.id)
                const isConfigured = !!roomState
                const isExpanded = roomState?.expanded || false
                const roomLights = room.lights.map(id => lights.get(id)).filter(Boolean)

                return (
                  <div
                    key={room.id}
                    className={`bg-white/[0.02] rounded-[12px] border transition-colors ${
                      isConfigured ? 'border-purple-500/50' : 'border-white/10'
                    }`}
                  >
                    {/* Room Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isConfigured}
                            onChange={() => handleToggleRoom(room.id, room)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                          />
                          <div>
                            <div className="text-[14px] font-semibold text-white">{room.name}</div>
                            <div className="text-[12px] text-white/40">
                              {roomLights.length} {roomLights.length === 1 ? 'light' : 'lights'}
                            </div>
                          </div>
                        </label>
                        {isConfigured && (
                          <button
                            onClick={() => handleToggleRoomExpanded(room.id)}
                            className="p-1 hover:bg-white/5 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-white/50" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-white/50" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Light Controls */}
                    {isConfigured && isExpanded && (
                      <div className="border-t border-white/10 p-4 space-y-4">
                        {roomLights.map(light => {
                          if (!light) return null
                          const lightConfig = roomState?.lights.get(light.id)
                          if (!lightConfig) return null

                          return (
                            <div key={light.id} className="bg-white/[0.03] rounded-[8px] p-3 space-y-3">
                              {/* Light Name */}
                              <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-white/50" />
                                <span className="text-[13px] font-medium text-white">{light.name}</span>
                              </div>

                              {/* Brightness */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[12px]">
                                  <span className="text-white/50">Brightness</span>
                                  <span className="text-white/70">{Math.round((lightConfig.bri / 254) * 100)}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="254"
                                  value={lightConfig.bri}
                                  onChange={(e) => handleLightBrightness(room.id, light.id, parseInt(e.target.value))}
                                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${(lightConfig.bri / 254) * 100}%, rgba(255, 255, 255, 0.1) ${(lightConfig.bri / 254) * 100}%)`
                                  }}
                                />
                              </div>

                              {/* Color Presets */}
                              <div className="space-y-1.5">
                                <span className="text-[12px] text-white/50">Color</span>
                                <div className="grid grid-cols-6 gap-1.5">
                                  {COLOR_PRESETS.map(preset => {
                                    const isActive =
                                      ('ct' in preset && lightConfig.ct === preset.ct) ||
                                      ('hue' in preset && lightConfig.hue === preset.hue)

                                    return (
                                      <button
                                        key={preset.name}
                                        onClick={() => handleLightColor(room.id, light.id, preset)}
                                        className={`h-7 rounded-[6px] transition-all ${
                                          isActive
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#191919]'
                                            : 'hover:scale-105'
                                        }`}
                                        style={{
                                          background: 'ct' in preset
                                            ? `hsl(${30 + ((preset.ct ?? 250) - 153) / 5}, 100%, 80%)`
                                            : `hsl(${((preset.hue ?? 0) / 65535) * 360}, 100%, 50%)`
                                        }}
                                        title={preset.name}
                                      />
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Effects */}
                              <div className="space-y-1.5">
                                <span className="text-[12px] text-white/50">Effect</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleLightEffect(room.id, light.id, 'none')}
                                    className={`flex-1 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
                                      lightConfig.effect !== 'colorloop'
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                                  >
                                    None
                                  </button>
                                  <button
                                    onClick={() => handleLightEffect(room.id, light.id, 'colorloop')}
                                    className={`flex-1 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
                                      lightConfig.effect === 'colorloop'
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    Color Loop
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <button
            onClick={handlePreview}
            disabled={!isConnected || totalLightsConfigured === 0 || isPreviewing}
            className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreviewing ? 'Previewing...' : 'Preview on Lights'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={totalLightsConfigured === 0}
              className="px-4 py-2 text-[14px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
