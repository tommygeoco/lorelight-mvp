'use client'

import { useState } from 'react'
import { Home as HomeIcon, Power, ChevronRight } from 'lucide-react'
import { useHueStore } from '@/store/hueStore'
import type { HueRoom, HueLight } from '@/lib/services/browser/hueService'

interface RoomCardProps {
  room: HueRoom
  lights: Map<string, HueLight>
}

export function RoomCard({ room, lights }: RoomCardProps) {
  const { applyLightConfig } = useHueStore()
  const [isTogglingPower, setIsTogglingPower] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Get lights in this room
  const roomLights = room.lights
    .map(lightId => lights.get(lightId))
    .filter((light): light is HueLight => !!light)

  const anyLightOn = roomLights.some(light => light.state.on)
  const lightsOnCount = roomLights.filter(light => light.state.on).length

  const handleTogglePower = async () => {
    setIsTogglingPower(true)
    try {
      await applyLightConfig({
        groups: {
          [room.id]: { on: !anyLightOn, transitiontime: 2 },
        },
      })
    } catch (error) {
      console.error('Failed to toggle room', error)
    } finally {
      setIsTogglingPower(false)
    }
  }

  const handleRoomBrightness = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const brightness = parseInt(e.target.value)
    try {
      await applyLightConfig({
        groups: {
          [room.id]: { bri: brightness, on: true, transitiontime: 1 },
        },
      })
    } catch (error) {
      console.error('Failed to change room brightness', error)
    }
  }

  // Calculate average brightness of lights that are on
  const avgBrightness = roomLights.length > 0
    ? Math.round(
        roomLights
          .filter(l => l.state.on)
          .reduce((sum, l) => sum + l.state.bri, 0) / lightsOnCount || 0
      )
    : 0
  const brightnessPercent = Math.round((avgBrightness / 254) * 100)

  return (
    <div className="bg-[var(--card-surface)] border border-white/10 rounded-[8px] p-4 hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${
            anyLightOn ? 'bg-purple-500/20' : 'bg-white/5'
          }`}>
            <HomeIcon className={`w-5 h-5 ${
              anyLightOn ? 'text-purple-400' : 'text-white/40'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{room.name}</h3>
            <p className="text-xs text-white/50">
              {lightsOnCount} of {roomLights.length} lights on • {room.type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePower}
            disabled={isTogglingPower}
            className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
              anyLightOn
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/40'
            }`}
            aria-label={anyLightOn ? 'Turn off all' : 'Turn on all'}
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight className={`w-4 h-4 text-white/70 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* Room Brightness Slider */}
      {anyLightOn && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Room Brightness</span>
            <span className="text-white font-medium">{brightnessPercent}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="254"
            value={avgBrightness}
            onChange={handleRoomBrightness}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
          />
        </div>
      )}

      {/* Expanded Lights List */}
      {isExpanded && roomLights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          {roomLights.map((light) => (
            <div
              key={light.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  light.state.on ? 'bg-yellow-400' : 'bg-white/20'
                }`} />
                <span className="text-white/70">{light.name}</span>
              </div>
              <span className="text-white/50 text-xs">
                {light.state.on ? `${Math.round((light.state.bri / 254) * 100)}%` : 'Off'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Status when all off */}
      {!anyLightOn && (
        <div className="text-xs text-white/40">
          All lights off
        </div>
      )}
    </div>
  )
}
