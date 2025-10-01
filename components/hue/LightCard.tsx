'use client'

import { useState } from 'react'
import { Lightbulb, Power } from 'lucide-react'
import { useHueStore } from '@/store/hueStore'
import type { HueLight } from '@/lib/services/browser/hueService'

interface LightCardProps {
  light: HueLight
}

export function LightCard({ light }: LightCardProps) {
  const { applyLightConfig } = useHueStore()
  const [isTogglingPower, setIsTogglingPower] = useState(false)
  const [isBrightnessChanging, setIsBrightnessChanging] = useState(false)

  const handleTogglePower = async () => {
    setIsTogglingPower(true)
    try {
      await applyLightConfig({
        lights: {
          [light.id]: { on: !light.state.on, transitiontime: 2 },
        },
      })
    } catch (error) {
      console.error('Failed to toggle light', error)
    } finally {
      setIsTogglingPower(false)
    }
  }

  const handleBrightnessChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const brightness = parseInt(e.target.value)
    setIsBrightnessChanging(true)
    try {
      await applyLightConfig({
        lights: {
          [light.id]: { bri: brightness, on: true, transitiontime: 1 },
        },
      })
    } catch (error) {
      console.error('Failed to change brightness', error)
    } finally {
      setIsBrightnessChanging(false)
    }
  }

  const brightnessPercent = Math.round((light.state.bri / 254) * 100)

  return (
    <div className="bg-[var(--card-surface)] border border-white/10 rounded-[8px] p-4 hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${
            light.state.on ? 'bg-yellow-500/20' : 'bg-white/5'
          }`}>
            <Lightbulb className={`w-5 h-5 ${
              light.state.on ? 'text-yellow-400' : 'text-white/40'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{light.name}</h3>
            <p className="text-xs text-white/50">{light.type}</p>
          </div>
        </div>

        <button
          onClick={handleTogglePower}
          disabled={isTogglingPower}
          className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
            light.state.on
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-white/5 hover:bg-white/10 text-white/40'
          }`}
          aria-label={light.state.on ? 'Turn off' : 'Turn on'}
        >
          <Power className="w-4 h-4" />
        </button>
      </div>

      {/* Brightness Slider */}
      {light.state.on && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Brightness</span>
            <span className="text-white font-medium">{brightnessPercent}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="254"
            value={light.state.bri}
            onChange={handleBrightnessChange}
            disabled={isBrightnessChanging}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
          />
        </div>
      )}

      {/* Status */}
      {!light.state.on && (
        <div className="text-xs text-white/40">
          Off
        </div>
      )}
    </div>
  )
}
