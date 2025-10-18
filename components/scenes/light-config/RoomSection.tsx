import { memo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { HueRoom, HueLight } from '@/types'
import type { RoomState, LightConfig, ColorPreset, LightEffect } from './useLightConfigState'
import { LightControls } from './LightControls'

interface RoomSectionProps {
  room: HueRoom
  roomState: RoomState | undefined
  allLights: Map<string, HueLight>
  isConfigured: boolean
  onToggleRoom: () => void
  onToggleExpanded: () => void
  onLightBrightness: (lightId: string, bri: number) => void
  onLightColor: (lightId: string, preset: ColorPreset) => void
  onLightEffect: (lightId: string, effect: LightEffect) => void
}

/**
 * RoomSection - Room checkbox, header, and expandable light list
 * Context7: Extracted from LightConfigModal for better organization
 */
const RoomSectionComponent = ({
  room,
  roomState,
  allLights,
  isConfigured,
  onToggleRoom,
  onToggleExpanded,
  onLightBrightness,
  onLightColor,
  onLightEffect
}: RoomSectionProps) => {
  const roomLights = room.lights
    .map(lightId => allLights.get(lightId))
    .filter((light): light is HueLight => !!light)

  const isExpanded = roomState?.expanded || false

  return (
    <div
      key={room.id}
      className="bg-white/[0.02] rounded-[8px] border border-white/10 transition-all"
    >
      {/* Room Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={isConfigured}
              onChange={onToggleRoom}
              className="w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-[14px] font-medium text-white">{room.name}</div>
              <div className="text-[12px] text-white/40">
                {room.lights.length} light{room.lights.length !== 1 ? 's' : ''}
              </div>
            </div>
          </label>

          {isConfigured && roomLights.length > 0 && (
            <button
              onClick={onToggleExpanded}
              className="px-2 py-1 hover:bg-white/5 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse room' : 'Expand room'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/50" />
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
              <LightControls
                key={light.id}
                light={light}
                config={lightConfig}
                onBrightnessChange={(bri) => onLightBrightness(light.id, bri)}
                onColorChange={(preset) => onLightColor(light.id, preset)}
                onEffectChange={(effect) => onLightEffect(light.id, effect)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// Memoize to prevent re-renders
export const RoomSection = memo(RoomSectionComponent)

