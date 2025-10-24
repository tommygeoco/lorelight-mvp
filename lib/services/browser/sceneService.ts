import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Scene, SceneInsert, SceneUpdate } from '@/types'

/**
 * Scene service for CRUD operations
 * Context7: Optimized for scene management within campaigns
 */
class SceneService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Get all scenes for a campaign
   */
  async listByCampaign(campaignId: string): Promise<Scene[]> {
    await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('order_index', { ascending: true })


    if (error) {
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

    const { data, error } = await this.supabase
      .from('scenes')
      .insert(insertData)
      .select()
      .single()

    if (error) {
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
   * Uses batch upsert for performance
   */
  async reorder(campaignId: string, sceneIds: string[]): Promise<void> {
    // Fetch all scenes to get current data
    const { data: currentScenes, error: fetchError } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('campaign_id', campaignId)
      .in('id', sceneIds)

    if (fetchError) throw fetchError
    if (!currentScenes) return

    // Build updates with new order_index
    const updates = currentScenes.map((scene) => ({
      ...scene,
      order_index: sceneIds.indexOf(scene.id),
      updated_at: new Date().toISOString(),
    }))

    // Batch upsert all at once
    const { error } = await this.supabase
      .from('scenes')
      .upsert(updates, { onConflict: 'id' })

    if (error) throw error
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
      throw error
    }
  }

  /**
   * Toggle favorite status for a scene
   */
  async toggleFavorite(id: string): Promise<Scene> {
    // First get the current favorite state
    const scene = await this.get(id)
    if (!scene) {
      throw new Error('Scene not found')
    }

    // Handle undefined as false (for when column doesn't exist yet)
    const currentFavorite = scene.is_favorite ?? false
    return this.update(id, { is_favorite: !currentFavorite })
  }

  /**
   * Update the last_viewed_at timestamp for a scene
   */
  async updateLastViewed(id: string): Promise<Scene> {
    return this.update(id, { last_viewed_at: new Date().toISOString() })
  }

  /**
   * Get all favorite scenes for the current user
   */
  async listFavorites(): Promise<Scene[]> {
    await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('is_favorite', true)
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get recently viewed scenes for the current user
   */
  async listRecent(limit: number = 30): Promise<Scene[]> {
    await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .not('last_viewed_at', 'is', null)
      .order('last_viewed_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  }
}

export const sceneService = new SceneService()