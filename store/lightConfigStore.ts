import { create } from 'zustand'
import type { LightConfig } from '@/types'
import { createClient } from '@/lib/auth/supabase'

interface LightConfigState {
  lightConfigs: Map<string, LightConfig>
  isLoading: boolean
  error: string | null
  hasFetched: boolean

  // Actions
  fetchLightConfigs: () => Promise<void>
  createLightConfig: (config: Omit<LightConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<LightConfig>
  updateLightConfig: (id: string, updates: Partial<LightConfig>) => Promise<void>
  deleteLightConfig: (id: string) => Promise<void>
}

export const useLightConfigStore = create<LightConfigState>((set, get) => ({
  lightConfigs: new Map(),
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchLightConfigs: async () => {
    // Skip if already fetched
    if (get().hasFetched) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('light_configs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const configsMap = new Map<string, LightConfig>()
      data.forEach((config: LightConfig) => {
        configsMap.set(config.id, config)
      })

      set({ lightConfigs: configsMap, isLoading: false, hasFetched: true })
    } catch (error) {
      console.error('Failed to fetch light configs:', error)
      set({ error: 'Failed to load light configurations', isLoading: false })
    }
  },

  createLightConfig: async (config) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('light_configs')
      .insert({
        ...config,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    const newConfig = data as LightConfig
    set((state) => {
      const newConfigs = new Map(state.lightConfigs)
      newConfigs.set(newConfig.id, newConfig)
      return { lightConfigs: newConfigs }
    })

    return newConfig
  },

  updateLightConfig: async (id, updates) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('light_configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const updatedConfig = data as LightConfig
    set((state) => {
      const newConfigs = new Map(state.lightConfigs)
      newConfigs.set(id, updatedConfig)
      return { lightConfigs: newConfigs }
    })
  },

  deleteLightConfig: async (id) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('light_configs')
      .delete()
      .eq('id', id)

    if (error) throw error

    set((state) => {
      const newConfigs = new Map(state.lightConfigs)
      newConfigs.delete(id)
      return { lightConfigs: newConfigs }
    })
  }
}))

