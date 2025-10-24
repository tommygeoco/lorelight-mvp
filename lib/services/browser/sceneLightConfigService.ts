import { createClient } from '@/lib/auth/supabase'
import type { SceneLightConfig, SceneLightConfigInsert, SceneLightConfigUpdate } from '@/types'

/**
 * Service for managing scene-light config relationships (junction table)
 */
class SceneLightConfigService {
  /**
   * Get all light configs for a scene
   */
  async getConfigsForScene(sceneId: string): Promise<SceneLightConfig[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('scene_light_configs')
      .select('*')
      .eq('scene_id', sceneId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching scene light configs:', error)
      throw new Error(`Failed to fetch light configs: ${error.message}`)
    }

    return data as SceneLightConfig[]
  }

  /**
   * Add a light config to a scene
   */
  async addConfig(config: SceneLightConfigInsert): Promise<SceneLightConfig> {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('scene_light_configs')
      .insert({
        ...config,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding scene light config:', error)
      throw new Error(`Failed to add light config: ${error.message}`)
    }

    return data as SceneLightConfig
  }

  /**
   * Update a scene light config (selection, order)
   */
  async updateConfig(id: string, updates: SceneLightConfigUpdate): Promise<SceneLightConfig> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('scene_light_configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating scene light config:', error)
      throw new Error(`Failed to update light config: ${error.message}`)
    }

    return data as SceneLightConfig
  }

  /**
   * Remove a light config from a scene
   */
  async removeConfig(id: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
      .from('scene_light_configs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error removing scene light config:', error)
      throw new Error(`Failed to remove light config: ${error.message}`)
    }
  }
}

export const sceneLightConfigService = new SceneLightConfigService()

