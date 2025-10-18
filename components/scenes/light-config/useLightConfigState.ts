import { useState, useEffect } from 'react'
import type { HueRoom } from '@/types'

export type LightEffect = 'none' | 'colorloop' | 'fireplace' | 'candle' | 'lightning' | 'pulse' | 'breath'

export interface LightConfig {
  on: boolean
  bri: number // 1-254
  hue?: number // 0-65535
  sat?: number // 0-254
  ct?: number // 153-500 (color temperature)
  effect?: LightEffect
  transitiontime: number
}

export interface RoomState {
  expanded: boolean
  lights: Map<string, LightConfig>
}

export interface ColorPreset {
  name: string
  ct?: number
  hue?: number
  sat?: number
}

/**
 * Custom hook for managing light configuration state
 * Context7: Extracts complex state logic from LightConfigModal
 */
export function useLightConfigState(
  isOpen: boolean,
  initialConfig: unknown,
  rooms: Map<string, HueRoom>
) {
  const [roomStates, setRoomStates] = useState<Map<string, RoomState>>(new Map())

  // Load initial configuration
  useEffect(() => {
    if (!isOpen || !initialConfig || typeof initialConfig !== 'object' || !('lights' in initialConfig)) {
      return
    }

    const configObj = initialConfig as { lights: Record<string, LightConfig>; rooms?: string[] }
    const lightsConfig = configObj.lights
    const savedRoomIds = configObj.rooms || []
    const newRoomStates = new Map<string, RoomState>()

    // If we have saved room IDs, use those
    if (savedRoomIds.length > 0) {
      rooms.forEach(room => {
        if (savedRoomIds.includes(room.id)) {
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
        }
      })
    } else {
      // Legacy mode: Group lights by room
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
    }

    setRoomStates(newRoomStates)
  }, [isOpen, initialConfig, rooms])

  const handleToggleRoom = (roomId: string, room: { lights: string[] }) => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      const exists = newStates.has(roomId)

      if (exists) {
        newStates.delete(roomId)
      } else {
        const defaultLights = new Map<string, LightConfig>()
        room.lights.forEach(lightId => {
          defaultLights.set(lightId, {
            on: true,
            bri: 254,
            transitiontime: 4,
          })
        })
        newStates.set(roomId, {
          expanded: false,
          lights: defaultLights
        })
      }
      return newStates
    })
  }

  const handleToggleExpanded = (roomId: string) => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      const roomState = newStates.get(roomId)
      if (roomState) {
        newStates.set(roomId, { ...roomState, expanded: !roomState.expanded })
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

  const handleLightColor = (roomId: string, lightId: string, preset: ColorPreset) => {
    setRoomStates(prev => {
      const newStates = new Map(prev)
      const roomState = newStates.get(roomId)
      if (roomState) {
        const lightConfig = roomState.lights.get(lightId)
        if (lightConfig) {
          const newConfig: LightConfig = { ...lightConfig }
          if ('ct' in preset) {
            newConfig.ct = preset.ct
            delete newConfig.hue
            delete newConfig.sat
          } else if ('hue' in preset) {
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

  const handleLightEffect = (roomId: string, lightId: string, effect: LightEffect) => {
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

  const buildFinalConfig = () => {
    const config: Record<string, LightConfig> = {}
    const selectedRoomIds: string[] = []

    roomStates.forEach((roomState, roomId) => {
      selectedRoomIds.push(roomId)
      
      roomState.lights.forEach((lightConfig, lightId) => {
        // Merge logic for shared lights across rooms
        if (config[lightId]) {
          const existing = config[lightId]
          const hasExistingColor = 'hue' in existing || 'ct' in existing
          const hasNewColor = 'hue' in lightConfig || 'ct' in lightConfig
          
          if (hasNewColor && !hasExistingColor) {
            config[lightId] = lightConfig
          } else if (!hasNewColor && hasExistingColor) {
            // Keep existing
          } else if (lightConfig.bri !== 254 && existing.bri === 254) {
            config[lightId] = lightConfig
          }
        } else {
          config[lightId] = lightConfig
        }
      })
    })

    // Special handling: If no rooms selected, mark as "lights off"
    return selectedRoomIds.length === 0 
      ? { lights: config, rooms: selectedRoomIds, lightsOff: true }
      : { lights: config, rooms: selectedRoomIds }
  }

  const totalLightsConfigured = Array.from(roomStates.values()).reduce(
    (sum, room) => sum + room.lights.size,
    0
  )

  return {
    roomStates,
    totalLightsConfigured,
    handleToggleRoom,
    handleToggleExpanded,
    handleLightBrightness,
    handleLightColor,
    handleLightEffect,
    buildFinalConfig,
  }
}

