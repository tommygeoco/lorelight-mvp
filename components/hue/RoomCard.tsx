'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Home as HomeIcon, Power, Palette, MoreVertical } from 'lucide-react'
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
  const { applyLightConfig, fetchLightsAndRooms, deleteRoom, activeRoomIds, setRoomActive } = useHueStore()
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  // Get lights in this room
  const roomLights = room.lights
    .map(lightId => lights.get(lightId))
    .filter((light): light is HueLight => !!light)

  const isRoomActive = activeRoomIds.has(room.id)
  const lightsOnCount = roomLights.filter(light => light.state.on).length

  // Calculate average brightness of lights that are on
  const actualAvgBrightness = roomLights.length > 0
    ? Math.round(
        roomLights
          .filter(l => l.state.on)
          .reduce((sum, l) => sum + l.state.bri, 0) / lightsOnCount || 0
      )
    : 0

  // Check if lights have mixed brightness (different values)
  const lightsOnBrightness = roomLights
    .filter(l => l.state.on)
    .map(l => l.state.bri)
  const hasMixedBrightness = lightsOnCount > 1 &&
    Math.max(...lightsOnBrightness) - Math.min(...lightsOnBrightness) > 10

  // Optimistic local state
  const [localRoomActive, setLocalRoomActive] = useState(isRoomActive)
  const [localBrightness, setLocalBrightness] = useState(actualAvgBrightness)
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const sliderRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const lastApiCall = useRef<Promise<void> | null>(null)
  const isUpdating = useRef(false)
  const hasUserSetBrightness = useRef(false) // Track if user has manually set brightness

  // Sync room active state but DON'T sync brightness from props after initial mount
  // This prevents individual light changes from affecting the room slider
  useEffect(() => {
    if (!isDragging && !isUpdating.current) {
      setLocalRoomActive(isRoomActive)
    }
  }, [isRoomActive, isDragging])

  // Only sync brightness on initial mount or when explicitly toggled
  useEffect(() => {
    if (!hasUserSetBrightness.current && !isDragging) {
      setLocalBrightness(actualAvgBrightness)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency - only run on mount

  const handleTogglePower = async () => {
    const newActiveState = !localRoomActive

    // Optimistic update
    setLocalRoomActive(newActiveState)
    setRoomActive(room.id, newActiveState)

    // API call in background
    try {
      const promise = applyLightConfig({
        groups: {
          [room.id]: { on: newActiveState, transitiontime: 2 },
        },
      })
      lastApiCall.current = promise
      await promise

      // CRITICAL: Immediately fetch actual state after power toggle
      // Hue lights restore to their saved state, which may differ from UI
      await fetchLightsAndRooms()

      // Update gradient system with full light states
      if (newActiveState && roomLights.length > 0) {
        // Get fresh light states after fetch
        const updatedRoomLights = room.lights
          .map(lightId => useHueStore.getState().lights.get(lightId))
          .filter((light): light is HueLight => !!light)
        
        const fullConfig = {
          lights: Object.fromEntries(
            updatedRoomLights.map(light => [
              light.id,
              {
                on: light.state.on,
                bri: light.state.bri,
                hue: light.state.hue,
                sat: light.state.sat,
                xy: light.state.xy,
              }
            ])
          )
        }
        useHueStore.getState().setActiveLightConfig(fullConfig as any)
      } else if (!newActiveState) {
        // Clear gradient when turning off
        useHueStore.getState().setActiveLightConfig(null)
      }
    } catch {
      // Revert on error
      setLocalRoomActive(isRoomActive)
      setRoomActive(room.id, isRoomActive)
    }
  }

  const handleRoomBrightnessInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const brightness = parseInt(e.currentTarget.value)

    // Mark as updating to prevent prop sync
    isUpdating.current = true
    hasUserSetBrightness.current = true

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
        // When user adjusts room brightness, set ALL lights to this value (resets mixed state)
        // Also mark room as active since we're turning on lights
        setRoomActive(room.id, true)
        const promise = applyLightConfig({
          groups: {
            [room.id]: { bri: brightness, on: true, transitiontime: 1 },
          },
        })
        lastApiCall.current = promise
        await promise

        // Fetch to get updated light states
        await fetchLightsAndRooms()

        // Update gradient system with full light states
        const updatedRoomLights = room.lights
          .map(lightId => useHueStore.getState().lights.get(lightId))
          .filter((light): light is HueLight => !!light)
        
        if (updatedRoomLights.length > 0) {
          const fullConfig = {
            lights: Object.fromEntries(
              updatedRoomLights.map(light => [
                light.id,
                {
                  on: light.state.on,
                  bri: light.state.bri,
                  hue: light.state.hue,
                  sat: light.state.sat,
                  xy: light.state.xy,
                }
              ])
            )
          }
          useHueStore.getState().setActiveLightConfig(fullConfig as any)
        }

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
  }, [room.id, actualAvgBrightness, applyLightConfig, fetchLightsAndRooms, setRoomActive])

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

      // Mark room as active since we're turning on lights
      setRoomActive(room.id, true)

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
      await fetchLightsAndRooms()

      // Update gradient system with full light states
      const updatedRoomLights = room.lights
        .map(lightId => useHueStore.getState().lights.get(lightId))
        .filter((light): light is HueLight => !!light)
      
      if (updatedRoomLights.length > 0) {
        const fullConfig = {
          lights: Object.fromEntries(
            updatedRoomLights.map(light => [
              light.id,
              {
                on: light.state.on,
                bri: light.state.bri,
                hue: light.state.hue,
                sat: light.state.sat,
                xy: light.state.xy,
              }
            ])
          )
        }
        useHueStore.getState().setActiveLightConfig(fullConfig as any)
      }
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
              localRoomActive ? 'bg-purple-500/20' : 'bg-white/5'
            }`}>
              <HomeIcon className={`w-5 h-5 transition-colors ${
                localRoomActive ? 'text-purple-400' : 'text-white/40'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{room.name}</h3>
              <p className="text-xs text-white/50">
                {lightsOnCount} of {roomLights.length} lights on
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Only show color picker if room has at least one RGB-capable light */}
            {hasAnyRgbLight && (
              <button
                onClick={() => setIsColorPickerOpen(true)}
                disabled={!localRoomActive}
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                  localRoomActive
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
                aria-label="Change color"
                title={localRoomActive ? 'Change color' : 'Turn on lights to change color'}
              >
                <Palette className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleTogglePower}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                localRoomActive
                  ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              aria-label={localRoomActive ? 'Turn off all' : 'Turn on all'}
            >
              <Power className="w-4 h-4" />
            </button>

            <HueContextMenu
              entityName={room.name}
              onStartEdit={() => {
                // Note: Inline rename not implemented - rooms renamed via Hue app
              }}
              onDelete={async () => {
                await deleteRoom(room.id)
              }}
              triggerButton={
                <button
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Room options"
                >
                  <MoreVertical className="w-4 h-4 text-white/70" />
                </button>
              }
            />
          </div>
        </div>

      {/* Brightness Slider */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={localRoomActive ? 'text-white/50' : 'text-white/30'}>Brightness</span>
            {hasMixedBrightness && hasUserSetBrightness.current && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                Mixed
              </span>
            )}
          </div>
          <span className={localRoomActive ? 'text-white font-medium' : 'text-white/40 font-medium'}>{brightnessPercent}%</span>
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
          disabled={!localRoomActive}
          className={`w-full h-2 rounded-full appearance-none slider ${
            !localRoomActive
              ? 'cursor-not-allowed opacity-40'
              : hasMixedBrightness && hasUserSetBrightness.current
              ? 'cursor-pointer opacity-60'
              : 'cursor-pointer'
          }`}
          style={{
            touchAction: 'none',
            pointerEvents: 'auto',
            // @ts-expect-error CSS custom property
            '--slider-progress': `${brightnessPercent}%`
          }}
        />
      </div>

      {/* Individual Light Controls */}
      {roomLights.length > 0 && (
        <div className="mt-4 space-y-2">
          {roomLights.map((light) => (
            <RoomLightRow key={light.id} light={light} />
          ))}
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
