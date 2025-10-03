'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Home as HomeIcon, Power, ChevronRight, Palette, MoreVertical } from 'lucide-react'
import { useHueStore } from '@/store/hueStore'
import { ColorPickerModal } from './ColorPickerModal'
import { HueContextMenu } from './HueContextMenu'
import { RoomLightRow } from './RoomLightRow'
import { hueService } from '@/lib/services/browser/hueService'
import type { HueRoom, HueLight } from '@/lib/services/browser/hueService'

interface RoomCardProps {
  room: HueRoom
  lights: Map<string, HueLight>
}

export function RoomCard({ room, lights }: RoomCardProps) {
  const { applyLightConfig, fetchLightsAndRooms, renameRoom, deleteRoom } = useHueStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  // Get lights in this room
  const roomLights = room.lights
    .map(lightId => lights.get(lightId))
    .filter((light): light is HueLight => !!light)

  const anyLightOn = roomLights.some(light => light.state.on)
  const lightsOnCount = roomLights.filter(light => light.state.on).length

  // Calculate average brightness of lights that are on
  const actualAvgBrightness = roomLights.length > 0
    ? Math.round(
        roomLights
          .filter(l => l.state.on)
          .reduce((sum, l) => sum + l.state.bri, 0) / lightsOnCount || 0
      )
    : 0

  // Optimistic local state
  const [localAnyOn, setLocalAnyOn] = useState(anyLightOn)
  const [localBrightness, setLocalBrightness] = useState(actualAvgBrightness)
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const sliderRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const lastApiCall = useRef<Promise<void> | null>(null)
  const isUpdating = useRef(false)

  // Sync local state with prop changes ONLY when not actively updating
  useEffect(() => {
    if (!isDragging && !isUpdating.current) {
      setLocalAnyOn(anyLightOn)
      setLocalBrightness(actualAvgBrightness)
    }
  }, [anyLightOn, actualAvgBrightness, isDragging])

  const handleTogglePower = async () => {
    const newOnState = !localAnyOn

    // Optimistic update
    setLocalAnyOn(newOnState)

    // API call in background
    try {
      const promise = applyLightConfig({
        groups: {
          [room.id]: { on: newOnState, transitiontime: 2 },
        },
      })
      lastApiCall.current = promise
      await promise

      // CRITICAL: Immediately fetch actual state after power toggle
      // Hue lights restore to their saved state, which may differ from UI
      await fetchLightsAndRooms()
    } catch {
      // Revert on error
      setLocalAnyOn(anyLightOn)
    }
  }

  const handleRoomBrightnessInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const brightness = parseInt(e.currentTarget.value)

    // Mark as updating to prevent prop sync
    isUpdating.current = true

    // CRITICAL: Use flushSync to bypass React batching for instant UI update
    flushSync(() => {
      setLocalBrightness(brightness)
    })

    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Debounce API call
    debounceTimer.current = setTimeout(async () => {
      try {
        const promise = applyLightConfig({
          groups: {
            [room.id]: { bri: brightness, on: true, transitiontime: 1 },
          },
        })
        lastApiCall.current = promise
        await promise

        // Allow prop sync again after a delay
        setTimeout(() => {
          isUpdating.current = false
        }, 500)
      } catch {
        // Revert on error
        setLocalBrightness(actualAvgBrightness)
        isUpdating.current = false
      }
    }, 300) // 300ms debounce
  }, [room.id, actualAvgBrightness, applyLightConfig])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = async () => {
    setIsDragging(false)

    // Wait for debounced API call to complete, then sync
    setTimeout(async () => {
      try {
        await fetchLightsAndRooms()
        // Allow prop sync again
        isUpdating.current = false
      } catch {
        // Ignore sync errors
        isUpdating.current = false
      }
    }, 800) // Wait for debounce + API call
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const brightnessPercent = Math.round((localBrightness / 254) * 100)

  // Check if any lights in the room support RGB color
  const hasAnyRgbLight = roomLights.some(light => hueService.hasColorSupport(light))

  const handleColorApply = async (color: { hex: string; xy: [number, number]; bri: number }) => {
    try {
      // Apply color to each RGB-capable light individually to preserve brightness
      const rgbLights = roomLights.filter(light => hueService.hasColorSupport(light))

      await applyLightConfig({
        lights: Object.fromEntries(
          rgbLights.map(light => [
            light.id,
            {
              xy: color.xy,
              // Preserve each light's current brightness
              bri: light.state.bri,
              on: true,
              transitiontime: 4
            }
          ])
        )
      })

      // Sync after color change
      setTimeout(() => {
        fetchLightsAndRooms()
      }, 500)
    } catch {
      // Handle error silently
    }
  }

  return (
    <>
      <div className="bg-[var(--card-surface)] border border-white/10 rounded-[8px] p-4 hover:border-white/20 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center transition-colors ${
              localAnyOn ? 'bg-purple-500/20' : 'bg-white/5'
            }`}>
              <HomeIcon className={`w-5 h-5 transition-colors ${
                localAnyOn ? 'text-purple-400' : 'text-white/40'
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
            {/* Only show color picker if room has at least one RGB-capable light */}
            {hasAnyRgbLight && (
              <button
                onClick={() => setIsColorPickerOpen(true)}
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                  localAnyOn
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white/40'
                }`}
                aria-label="Change color"
              >
                <Palette className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleTogglePower}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                localAnyOn
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/40'
              }`}
              aria-label={localAnyOn ? 'Turn off all' : 'Turn on all'}
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

            <HueContextMenu
              entityName={room.name}
              entityType="room"
              onRename={async (newName) => {
                await renameRoom(room.id, newName)
              }}
              onDelete={async () => {
                await deleteRoom(room.id)
              }}
              triggerButton={
                <button className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-white/10 transition-colors">
                  <MoreVertical className="w-4 h-4 text-white/70" />
                </button>
              }
            />
          </div>
        </div>

      {/* Room Brightness Slider */}
      {localAnyOn && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Room Brightness</span>
            <span className="text-white font-medium">{brightnessPercent}%</span>
          </div>
          <input
            ref={sliderRef}
            type="range"
            min="1"
            max="254"
            value={localBrightness}
            onInput={handleRoomBrightnessInput}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
            style={{
              touchAction: 'none',
              pointerEvents: 'auto'
            }}
          />
        </div>
      )}

      {/* Expanded Individual Light Controls */}
      {isExpanded && roomLights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          {roomLights.map((light) => (
            <RoomLightRow key={light.id} light={light} />
          ))}
        </div>
      )}

      {/* Status when all off */}
      {!localAnyOn && (
        <div className="text-xs text-white/40">
          All lights off
        </div>
      )}
    </div>

    <ColorPickerModal
      open={isColorPickerOpen}
      onOpenChange={setIsColorPickerOpen}
      entityName={room.name}
      initialBrightness={localBrightness}
      hasColorSupport={hasAnyRgbLight}
      onApply={handleColorApply}
    />
    </>
  )
}
