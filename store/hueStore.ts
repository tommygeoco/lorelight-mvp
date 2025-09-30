import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { hueService, type HueLight, type HueRoom } from '@/lib/services/browser/hueService'
import { logger } from '@/lib/utils/logger'

interface HueState {
  // Bridge settings
  bridgeIp: string | null
  username: string | null
  isConnected: boolean

  // Available lights and rooms
  lights: Map<string, HueLight>
  rooms: Map<string, HueRoom>

  // Actions
  discoverBridge: () => Promise<void>
  connectBridge: (bridgeIp: string) => Promise<void>
  disconnectBridge: () => void
  fetchLightsAndRooms: () => Promise<void>
  applyLightConfig: (config: {
    lights?: Record<string, { on?: boolean; bri?: number; hue?: number; sat?: number; ct?: number }>
    groups?: Record<string, { on?: boolean; bri?: number; hue?: number; sat?: number; ct?: number }>
  }) => Promise<void>
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
        })
      },

      fetchLightsAndRooms: async () => {
        const { bridgeIp, username } = get()
        if (!bridgeIp || !username) {
          throw new Error('Bridge not connected')
        }

        try {
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
        } catch (error) {
          logger.error('Failed to fetch lights and rooms', error)
          throw error
        }
      },

      applyLightConfig: async (config) => {
        const { bridgeIp, username } = get()
        if (!bridgeIp || !username) {
          throw new Error('Bridge not connected')
        }

        try {
          await hueService.applyLightConfig(bridgeIp, username, config)
        } catch (error) {
          logger.error('Failed to apply light config', error)
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
