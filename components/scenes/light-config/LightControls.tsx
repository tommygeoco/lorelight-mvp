import { memo } from 'react'
import { Lightbulb, Sparkles, Flame, Zap, Activity, Wind } from 'lucide-react'
import type { HueLight } from '@/types'
import type { LightConfig, LightEffect, ColorPreset } from './useLightConfigState'

interface LightControlsProps {
  light: HueLight
  config: LightConfig
  onBrightnessChange: (bri: number) => void
  onColorChange: (preset: ColorPreset) => void
  onEffectChange: (effect: LightEffect) => void
}

const COLOR_PRESETS: ColorPreset[] = [
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
 * LightControls - Individual light configuration UI
 * Context7: Brightness, color presets, and effects for a single light
 */
const LightControlsComponent = ({
  light,
  config,
  onBrightnessChange,
  onColorChange,
  onEffectChange
}: LightControlsProps) => {
  return (
    <div className="bg-white/[0.03] rounded-[8px] p-3 space-y-3">
      {/* Light Name */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-white/50" />
        <span className="text-[13px] font-medium text-white">{light.name}</span>
      </div>

      {/* Brightness */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-white/50">Brightness</span>
          <span className="text-white/70">{Math.round((config.bri / 254) * 100)}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="254"
          value={config.bri}
          onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${(config.bri / 254) * 100}%, rgba(255, 255, 255, 0.1) ${(config.bri / 254) * 100}%)`
          }}
        />
      </div>

      {/* Color Presets */}
      <div className="space-y-1.5">
        <span className="text-[12px] text-white/50">Color</span>
        <div className="grid grid-cols-6 gap-1.5">
          {COLOR_PRESETS.map(preset => {
            const isActive =
              ('ct' in preset && config.ct === preset.ct) ||
              ('hue' in preset && config.hue === preset.hue)

            return (
              <button
                key={preset.name}
                onClick={() => onColorChange(preset)}
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
        <span className="text-[12px] text-white/50">Effects (colorloop only - others coming soon)</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onEffectChange('none')}
            className={`px-2 py-2 rounded-[6px] text-[11px] font-medium transition-colors inline-flex items-center justify-center gap-1 ${
              !config.effect || config.effect === 'none'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            None
          </button>
          <button
            onClick={() => onEffectChange('colorloop')}
            className={`px-2 py-2 rounded-[6px] text-[11px] font-medium transition-colors inline-flex items-center justify-center gap-1 ${
              config.effect === 'colorloop'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Color Loop
          </button>
          {/* Disabled effects - coming soon */}
          <button
            disabled
            title="Coming soon"
            className="px-2 py-2 rounded-[6px] text-[11px] font-medium bg-white/5 text-white/30 cursor-not-allowed opacity-50"
          >
            <Flame className="w-3 h-3" />
            Fireplace
          </button>
          <button
            disabled
            title="Coming soon"
            className="px-2 py-2 rounded-[6px] text-[11px] font-medium bg-white/5 text-white/30 cursor-not-allowed opacity-50"
          >
            <Zap className="w-3 h-3" />
            Lightning
          </button>
        </div>
      </div>
    </div>
  )
}

// Memoize to prevent re-renders
export const LightControls = memo(LightControlsComponent)

