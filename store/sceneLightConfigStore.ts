import { create } from 'zustand'
import type { SceneLightConfig } from '@/types'
import { sceneLightConfigService } from '@/lib/services/browser/sceneLightConfigService'

interface SceneLightConfigState {
  configs: Map<string, SceneLightConfig> // keyed by config id
  sceneConfigs: Map<string, string[]> // scene_id -> array of config ids
  isLoading: boolean
  error: string | null
  _version: number // for triggering re-renders

  // Actions
  fetchConfigsForScene: (sceneId: string) => Promise<void>
  addConfig: (sceneId: string, lightConfigId: string, isSelected?: boolean) => Promise<SceneLightConfig>
  updateConfig: (id: string, updates: { is_selected?: boolean; order_index?: number }) => Promise<void>
  removeConfig: (id: string) => Promise<void>
  setSelectedConfig: (sceneId: string, configId: string) => Promise<void>
  clearConfigs: () => void
}

export const useSceneLightConfigStore = create<SceneLightConfigState>((set, get) => ({
  configs: new Map(),
  sceneConfigs: new Map(),
  isLoading: false,
  error: null,
  _version: 0,

  fetchConfigsForScene: async (sceneId: string) => {
    // Skip if already fetched
    const state = get()
    if (state.sceneConfigs.has(sceneId)) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const configs = await sceneLightConfigService.getConfigsForScene(sceneId)
      
      set((state) => {
        const newConfigs = new Map(state.configs)
        const configIds: string[] = []
        
        configs.forEach((config) => {
          newConfigs.set(config.id, config)
          configIds.push(config.id)
        })

        const newSceneConfigs = new Map(state.sceneConfigs)
        newSceneConfigs.set(sceneId, configIds)

        return {
          configs: newConfigs,
          sceneConfigs: newSceneConfigs,
          isLoading: false,
          _version: state._version + 1
        }
      })
    } catch (error) {
      console.error('Failed to fetch scene light configs:', error)
      set({ error: 'Failed to load light configurations', isLoading: false })
    }
  },

  addConfig: async (sceneId: string, lightConfigId: string, isSelected?: boolean) => {
    const state = get()
    const existingConfigIds = state.sceneConfigs.get(sceneId) || []
    const orderIndex = existingConfigIds.length
    
    // Auto-select if it's the first config
    const shouldSelect = isSelected !== undefined ? isSelected : existingConfigIds.length === 0

    const newConfig = await sceneLightConfigService.addConfig({
      scene_id: sceneId,
      light_config_id: lightConfigId,
      is_selected: shouldSelect,
      order_index: orderIndex
    })

    set((state) => {
      const newConfigs = new Map(state.configs)
      newConfigs.set(newConfig.id, newConfig)

      const newSceneConfigs = new Map(state.sceneConfigs)
      const configIds = newSceneConfigs.get(sceneId) || []
      newSceneConfigs.set(sceneId, [...configIds, newConfig.id])

      return {
        configs: newConfigs,
        sceneConfigs: newSceneConfigs,
        _version: state._version + 1
      }
    })

    return newConfig
  },

  updateConfig: async (id: string, updates: { is_selected?: boolean; order_index?: number }) => {
    await sceneLightConfigService.updateConfig(id, updates)

    set((state) => {
      const newConfigs = new Map(state.configs)
      const existing = newConfigs.get(id)
      if (existing) {
        newConfigs.set(id, { ...existing, ...updates, updated_at: new Date().toISOString() })
      }

      return {
        configs: newConfigs,
        _version: state._version + 1
      }
    })
  },

  removeConfig: async (id: string) => {
    const config = get().configs.get(id)
    if (!config) return

    await sceneLightConfigService.removeConfig(id)

    set((state) => {
      const newConfigs = new Map(state.configs)
      newConfigs.delete(id)

      const newSceneConfigs = new Map(state.sceneConfigs)
      const configIds = newSceneConfigs.get(config.scene_id) || []
      newSceneConfigs.set(
        config.scene_id,
        configIds.filter((cid) => cid !== id)
      )

      return {
        configs: newConfigs,
        sceneConfigs: newSceneConfigs,
        _version: state._version + 1
      }
    })
  },

  setSelectedConfig: async (sceneId: string, configId: string) => {
    const state = get()
    const configIds = state.sceneConfigs.get(sceneId) || []
    
    // Deselect all others, select this one
    const updates = configIds.map((id) => ({
      id,
      is_selected: id === configId
    }))

    await Promise.all(
      updates.map((update) => sceneLightConfigService.updateConfig(update.id, { is_selected: update.is_selected }))
    )

    set((state) => {
      const newConfigs = new Map(state.configs)
      updates.forEach(({ id, is_selected }) => {
        const existing = newConfigs.get(id)
        if (existing) {
          newConfigs.set(id, { ...existing, is_selected, updated_at: new Date().toISOString() })
        }
      })

      return {
        configs: newConfigs,
        _version: state._version + 1
      }
    })
  },

  clearConfigs: () => {
    set({ configs: new Map(), sceneConfigs: new Map(), _version: 0 })
  }
}))

