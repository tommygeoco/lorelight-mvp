'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Lightbulb, Power, Palette, MoreVertical } from 'lucide-react'
import { useHueStore } from '@/store/hueStore'
import { ColorPickerModal } from './ColorPickerModal'
import { HueContextMenu } from './HueContextMenu'
import { hueService } from '@/lib/services/browser/hueService'
import type { HueLight } from '@/lib/services/browser/hueService'

interface LightCardProps {
  light: HueLight
}

export function LightCard({ light }: LightCardProps) {
  const { applyLightConfig, fetchLightsAndRooms } = useHueStore()

  // Optimistic local state
  const [localOn, setLocalOn] = useState(light.state.on)
  const [localBrightness, setLocalBrightness] = useState(light.state.bri)
  const [isDragging, setIsDragging] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  // Refs
  const sliderRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const lastApiCall = useRef<Promise<void> | null>(null)
  const isUpdating = useRef(false)

  // Sync local state with prop changes ONLY when not actively updating
  useEffect(() => {
    if (!isDragging && !isUpdating.current) {
      setLocalOn(light.state.on)
      setLocalBrightness(light.state.bri)
    }
  }, [light.state.on, light.state.bri, isDragging])

  const handleTogglePower = async () => {
    const newOnState = !localOn

    // Optimistic update
    setLocalOn(newOnState)

    // API call in background
    try {
      const promise = applyLightConfig({
        lights: {
          [light.id]: { on: newOnState, transitiontime: 2 },
        },
      })
      lastApiCall.current = promise
      await promise

      // CRITICAL: Immediately fetch actual state after power toggle
      // Hue lights restore to their saved state, which may differ from UI
      await fetchLightsAndRooms()
    } catch {
      // Revert on error
      setLocalOn(light.state.on)
    }
  }

  const handleBrightnessInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
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
          lights: {
            [light.id]: { bri: brightness, on: true, transitiontime: 1 },
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
        setLocalBrightness(light.state.bri)
        isUpdating.current = false
      }
    }, 300) // 300ms debounce
  }, [light.id, light.state.bri, applyLightConfig])

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

  const handleColorApply = async (color: { hex: string; xy: [number, number]; bri: number }) => {
    try {
      await applyLightConfig({
        lights: {
          [light.id]: {
            xy: color.xy,
            bri: color.bri,
            on: true,
            transitiontime: 4
          }
        }
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
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center transition-colors ${
              localOn ? 'bg-yellow-500/20' : 'bg-white/5'
            }`}>
              <Lightbulb className={`w-5 h-5 transition-colors ${
                localOn ? 'text-yellow-400' : 'text-white/40'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{light.name}</h3>
              <p className="text-xs text-white/50">{light.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Only show color picker for RGB-capable lights */}
            {hueService.hasColorSupport(light) && (
              <button
                onClick={() => setIsColorPickerOpen(true)}
                disabled={!localOn}
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                  localOn
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
                aria-label="Change color"
                title={localOn ? 'Change color' : 'Turn on light to change color'}
              >
                <Palette className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleTogglePower}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                localOn
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              aria-label={localOn ? 'Turn off' : 'Turn on'}
            >
              <Power className="w-4 h-4" />
            </button>

            <HueContextMenu
              entityName={light.name}
              onStartEdit={() => {
                // Note: Inline rename not implemented - lights renamed via Hue app
              }}
              triggerButton={
                <button
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Light options"
                >
                  <MoreVertical className="w-4 h-4 text-white/70" />
                </button>
              }
            />
          </div>
        </div>

      {/* Brightness Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={localOn ? 'text-white/50' : 'text-white/30'}>Brightness</span>
          <span className={localOn ? 'text-white font-medium' : 'text-white/40 font-medium'}>{brightnessPercent}%</span>
        </div>
        <input
          ref={sliderRef}
          type="range"
          min="1"
          max="254"
          value={localBrightness}
          onInput={handleBrightnessInput}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={!localOn}
          className={`w-full h-2 rounded-full appearance-none slider ${
            localOn ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
          }`}
          style={{
            touchAction: 'none',
            pointerEvents: 'auto',
            // @ts-expect-error CSS custom property
            '--slider-progress': `${brightnessPercent}%`
          }}
        />
      </div>
    </div>

    <ColorPickerModal
      open={isColorPickerOpen}
      onOpenChange={setIsColorPickerOpen}
      entityName={light.name}
      initialBrightness={localBrightness}
      hasColorSupport={hueService.hasColorSupport(light)}
      onApply={handleColorApply}
    />
    </>
  )
}
