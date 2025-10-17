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
  error: string | null

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
