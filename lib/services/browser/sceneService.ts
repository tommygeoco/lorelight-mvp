import { createClient } from '@/lib/auth/supabase'
import type { Scene, SceneInsert, SceneUpdate } from '@/types'

/**
 * Scene service for CRUD operations
 * Context7: Optimized for scene management within campaigns
 */
class SceneService {
  private supabase = createClient()

  /**
   * Get all scenes for a campaign
   */
  async listByCampaign(campaignId: string): Promise<Scene[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    console.log('Current user when fetching scenes:', user?.id)

    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('order_index', { ascending: true })

    console.log('Scene fetch result:', { data, error, campaignId })

    if (error) {
      console.error('Error fetching scenes:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error),
      })
      throw error
    }

    return data || []
  }

  /**
   * Get a single scene by ID
   */
  async get(id: string): Promise<Scene | null> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching scene:', error)
      return null
    }

    return data
  }

  /**
   * Get the active scene for a campaign
   */
  async getActive(campaignId: string): Promise<Scene | null> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .single()

    if (error) {
      // No active scene is not an error
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching active scene:', error)
      return null
    }

    return data
  }

  /**
   * Create a new scene
   */
  async create(scene: Omit<SceneInsert, 'user_id'>): Promise<Scene> {
    const { data: { user } } = await this.supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the next order_index number
    const { data: scenes } = await this.supabase
      .from('scenes')
      .select('order_index')
      .eq('campaign_id', scene.campaign_id)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrder = scenes && scenes.length > 0 ? (scenes[0].order_index || 0) + 1 : 0

    const insertData = {
      ...scene,
      user_id: user.id,
      order_index: scene.order_index ?? nextOrder,
    }
    console.log('Creating scene with data:', insertData)

    const { data, error } = await this.supabase
      .from('scenes')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating scene:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error),
      })
      throw error
    }

    return data
  }

  /**
   * Update a scene
   */
  async update(id: string, updates: SceneUpdate): Promise<Scene> {
    const { data, error } = await this.supabase
      .from('scenes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating scene:', error)
      throw error
    }

    return data
  }

  /**
   * Set a scene as active (and deactivate others in the campaign)
   */
  async setActive(id: string, campaignId: string): Promise<Scene> {
    // First, deactivate all scenes in the campaign
    await this.supabase
      .from('scenes')
      .update({ is_active: false })
      .eq('campaign_id', campaignId)
      .eq('is_active', true)

    // Then activate the target scene
    return this.update(id, { is_active: true })
  }

  /**
   * Reorder scenes within a campaign
   */
  async reorder(campaignId: string, sceneIds: string[]): Promise<void> {
    const updates = sceneIds.map((id, index) => ({
      id,
      order_index: index,
    }))

    for (const update of updates) {
      await this.supabase
        .from('scenes')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
        .eq('campaign_id', campaignId)
    }
  }

  /**
   * Delete a scene
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('scenes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting scene:', error)
      throw error
    }
  }
}

export const sceneService = new SceneService()