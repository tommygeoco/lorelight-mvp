import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { hueService, type HueLight, type HueRoom } from '@/lib/services/browser/hueService'
import { logger } from '@/lib/utils/logger'
import type { SceneLightConfig } from '@/types'

interface HueState {
  // Bridge settings
  bridgeIp: string | null
  username: string | null
  isConnected: boolean

  // Available lights and rooms
  lights: Map<string, HueLight>
  rooms: Map<string, HueRoom>
  error: string | null

  // Active light config (for gradient system)
  activeLightConfig: SceneLightConfig | null

  // Active room IDs (tracks which rooms have been explicitly activated)
  activeRoomIds: Set<string>

  // Actions
  discoverBridge: () => Promise<void>
  connectBridge: (bridgeIp: string) => Promise<void>
  disconnectBridge: () => void
  fetchLightsAndRooms: () => Promise<void>
  clearError: () => void
  applyLightConfig: (config: {
    lights?: Record<string, { on?: boolean; bri?: number; hue?: number; sat?: number; ct?: number; xy?: [number, number]; transitiontime?: number }>
    groups?: Record<string, { on?: boolean; bri?: number; hue?: number; sat?: number; ct?: number; xy?: [number, number]; transitiontime?: number }>
  }) => Promise<void>
  setActiveLightConfig: (config: SceneLightConfig | null) => void
  setRoomActive: (roomId: string, active: boolean) => void
  createRoom: (name: string, lightIds: string[], roomClass?: string) => Promise<string>
  renameRoom: (groupId: string, newName: string) => Promise<void>
  deleteRoom: (groupId: string) => Promise<void>
  renameLight: (lightId: string, newName: string) => Promise<void>
}

/**
 * Hue Store
 * Context7: Manages Philips Hue bridge connection and light control
 */
export const useHueStore = create<HueState>()(
  persist(
    immer((set, get) => ({
      bridgeIp: null,
      username: null,
      isConnected: false,
      lights: new Map(),
      rooms: new Map(),
      error: null,
      activeLightConfig: null,
      activeRoomIds: new Set(),

      discoverBridge: async () => {
        try {
          const bridges = await hueService.discoverBridges()
          if (bridges.length > 0) {
            set({ bridgeIp: bridges[0].internalipaddress })
          } else {
            throw new Error('No bridges found on network')
          }
        } catch (error) {
          logger.error('Failed to discover bridge', error)
          throw error
        }
      },

      connectBridge: async (bridgeIp: string) => {
        try {
          const username = await hueService.createUser(bridgeIp)
          set({
            bridgeIp,
            username,
            isConnected: true,
          })

          // Fetch lights and rooms after connecting
          await get().fetchLightsAndRooms()
        } catch (error) {
          logger.error('Failed to connect to bridge', error)
          throw error
        }
      },

      disconnectBridge: () => {
        set({
          bridgeIp: null,
          username: null,
          isConnected: false,
          lights: new Map(),
          rooms: new Map(),
          activeRoomIds: new Set(),
        })
      },

      fetchLightsAndRooms: async () => {
        const { bridgeIp, username } = get()
        if (!bridgeIp || !username) {
          const error = 'Bridge not connected'
          set({ error })
          throw new Error(error)
        }

        try {
          set({ error: null })
          const [lights, rooms] = await Promise.all([
            hueService.getLights(bridgeIp, username),
            hueService.getRooms(bridgeIp, username),
          ])

          set(state => {
            state.lights.clear()
            Object.values(lights).forEach(light => {
              state.lights.set(light.id, light)
            })

            state.rooms.clear()
            Object.values(rooms).forEach(room => {
              state.rooms.set(room.id, room)
            })
          })
        } catch {
          const message = 'Unable to reach Hue Bridge. Make sure you\'re on the same network.'
          // Don't log network errors - this is expected when away from bridge
          set({ error: message })
          // Don't throw - error is handled via state
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setActiveLightConfig: (config) => {
        set({ activeLightConfig: config })
      },

      setRoomActive: (roomId, active) => {
        set(state => {
          if (active) {
            state.activeRoomIds.add(roomId)
          } else {
            state.activeRoomIds.delete(roomId)
          }
        })
      },

      applyLightConfig: async (config) => {
        const { bridgeIp, username, lights: availableLights } = get()
        
        console.log('[hueStore] applyLightConfig - config received:', config)
        console.log('[hueStore] availableLights count:', availableLights.size)
        
        if (!bridgeIp || !username) {
          throw new Error('Bridge not connected')
        }

        try {
          // Check if this is an explicit "lights off" config
          const configWithFlag = config as { lights?: Record<string, unknown>, lightsOff?: boolean }
          
          console.log('[hueStore] lightsOff flag:', configWithFlag.lightsOff)
          
          if (configWithFlag.lightsOff === true) {
            console.log('[hueStore] LIGHTS OFF MODE - turning off all lights')
            // Turn off all available lights
            const offConfig = {
              lights: Array.from(availableLights.keys()).reduce((acc, lightId) => {
                acc[lightId] = { on: false, transitiontime: 4 }
                return acc
              }, {} as Record<string, { on: boolean, transitiontime: number }>)
            }
            console.log('[hueStore] Sending off config for', Object.keys(offConfig.lights).length, 'lights')
            await hueService.applyLightConfig(bridgeIp, username, offConfig)
            console.log('[hueStore] All lights turned off successfully')
            // Set active config for gradient system
            set({ activeLightConfig: offConfig as unknown as SceneLightConfig })
          } else {
            console.log('[hueStore] Normal config mode')
            // Normal config application
            await hueService.applyLightConfig(bridgeIp, username, config)
            // Set active config for gradient system
            set({ activeLightConfig: config as SceneLightConfig })
          }
        } catch (error) {
          console.error('[hueStore] Failed to apply config:', error)
          logger.error('Failed to apply light config', error)
          throw error
        }
      },

      createRoom: async (name, lightIds, roomClass = 'Other') => {
        const { bridgeIp, username } = get()
        if (!bridgeIp || !username) {
          throw new Error('Bridge not connected')
        }

        try {
          const id = await hueService.createRoom(bridgeIp, username, name, lightIds, 'Room', roomClass)
          await get().fetchLightsAndRooms()
          return id
        } catch (error) {
          logger.error('Failed to create room', error)
          throw error
        }
      },

      renameRoom: async (groupId, newName) => {
        const { bridgeIp, username } = get()
        if (!bridgeIp || !username) {
          throw new Error('Bridge not connected')
        }

        try {
          await hueService.renameRoom(bridgeIp, username, groupId, newName)
          await get().fetchLightsAndRooms()
        } catch (error) {
          logger.error('Failed to rename room', error)
          throw error
        }
      },

      deleteRoom: async (groupId) => {
        const { bridgeIp, username } = get()
        if (!bridgeIp || !username) {
          throw new Error('Bridge not connected')
        }

        try {
          await hueService.deleteRoom(bridgeIp, username, groupId)
          await get().fetchLightsAndRooms()
        } catch (error) {
          logger.error('Failed to delete room', error)
          throw error
        }
      },

      renameLight: async (lightId, newName) => {
        const { bridgeIp, username } = get()
        if (!bridgeIp || !username) {
          throw new Error('Bridge not connected')
        }

        try {
          await hueService.renameLight(bridgeIp, username, lightId, newName)
          await get().fetchLightsAndRooms()
        } catch (error) {
          logger.error('Failed to rename light', error)
          throw error
        }
      },
    })),
    {
      name: 'hue-store',
      partialize: (state) => ({
        bridgeIp: state.bridgeIp,
        username: state.username,
        isConnected: state.isConnected,
      }),
    }
  )
)
