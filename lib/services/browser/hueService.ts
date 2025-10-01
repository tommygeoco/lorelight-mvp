/**
 * Philips Hue API Service
 * Context7: Browser-side service for Hue bridge communication
 */

export interface HueBridge {
  id: string
  internalipaddress: string
}

export interface HueLight {
  id: string
  name: string
  state: {
    on: boolean
    bri: number // 1-254
    hue?: number // 0-65535
    sat?: number // 0-254
    ct?: number // Color temperature (153-500)
    xy?: [number, number] // CIE color space
  }
  type: string
}

export interface HueRoom {
  id: string
  name: string
  type: string
  lights: string[]
}

export interface LightState {
  on?: boolean
  bri?: number // brightness 1-254
  hue?: number // 0-65535
  sat?: number // saturation 0-254
  ct?: number // color temp 153-500
  xy?: [number, number]
  transitiontime?: number // in 100ms increments (e.g., 10 = 1 second)
}

class HueService {
  /**
   * Discover Hue bridges on local network
   * Uses our API route to avoid CORS issues
   */
  async discoverBridges(): Promise<HueBridge[]> {
    try {
      const response = await fetch('/api/hue/discover')
      if (!response.ok) throw new Error('Bridge discovery failed')
      const data = await response.json()

      // Check if the response has an error property
      if (data.error) {
        throw new Error(data.error)
      }

      return data
    } catch (error) {
      console.error('Failed to discover bridges:', error)
      return []
    }
  }

  /**
   * Create a new user on the bridge (requires bridge button press)
   */
  async createUser(bridgeIp: string, appName: string = 'lorelight'): Promise<string> {
    const response = await fetch(`http://${bridgeIp}/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        devicetype: `${appName}#user`,
      }),
    })

    const data = await response.json()

    if (data[0]?.error) {
      throw new Error(data[0].error.description)
    }

    if (data[0]?.success) {
      return data[0].success.username
    }

    throw new Error('Failed to create user')
  }

  /**
   * Get all lights from bridge
   */
  async getLights(bridgeIp: string, username: string): Promise<Record<string, HueLight>> {
    const response = await fetch(`http://${bridgeIp}/api/${username}/lights`)
    if (!response.ok) throw new Error('Failed to fetch lights')

    const lights = await response.json()

    // Transform to include id in each light object
    return Object.entries(lights).reduce((acc, [id, light]) => {
      acc[id] = { id, ...(light as Omit<HueLight, 'id'>) }
      return acc
    }, {} as Record<string, HueLight>)
  }

  /**
   * Get all rooms/groups from bridge
   */
  async getRooms(bridgeIp: string, username: string): Promise<Record<string, HueRoom>> {
    const response = await fetch(`http://${bridgeIp}/api/${username}/groups`)
    if (!response.ok) throw new Error('Failed to fetch rooms')

    const groups = await response.json()

    // Transform to include id in each group object
    return Object.entries(groups).reduce((acc, [id, group]) => {
      acc[id] = { id, ...(group as Omit<HueRoom, 'id'>) }
      return acc
    }, {} as Record<string, HueRoom>)
  }

  /**
   * Set state for a single light
   */
  async setLightState(
    bridgeIp: string,
    username: string,
    lightId: string,
    state: LightState
  ): Promise<void> {
    const response = await fetch(
      `http://${bridgeIp}/api/${username}/lights/${lightId}/state`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      }
    )

    if (!response.ok) throw new Error('Failed to set light state')
  }

  /**
   * Set state for all lights in a room/group
   */
  async setGroupState(
    bridgeIp: string,
    username: string,
    groupId: string,
    state: LightState
  ): Promise<void> {
    const response = await fetch(
      `http://${bridgeIp}/api/${username}/groups/${groupId}/action`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      }
    )

    if (!response.ok) throw new Error('Failed to set group state')
  }

  /**
   * Apply multiple light states at once
   */
  async applyLightConfig(
    bridgeIp: string,
    username: string,
    config: {
      lights?: Record<string, LightState>
      groups?: Record<string, LightState>
    }
  ): Promise<void> {
    const promises: Promise<void>[] = []

    if (config.lights) {
      for (const [lightId, state] of Object.entries(config.lights)) {
        promises.push(this.setLightState(bridgeIp, username, lightId, state))
      }
    }

    if (config.groups) {
      for (const [groupId, state] of Object.entries(config.groups)) {
        promises.push(this.setGroupState(bridgeIp, username, groupId, state))
      }
    }

    await Promise.all(promises)
  }
}

export const hueService = new HueService()
