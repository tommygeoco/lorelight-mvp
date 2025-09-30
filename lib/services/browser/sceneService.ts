import { createClient } from '@/lib/auth/supabase'
import type { Scene, SceneInsert, SceneUpdate, SceneWithRelations } from '@/types'

/**
 * Scene service for CRUD operations
 * Context7: Optimized for scene management with optional relations
 */
class SceneService {
  private supabase = createClient()

  /**
   * Get all scenes for a session
   */
  async listBySession(sessionId: string): Promise<Scene[]> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('session_id', sessionId)
      .order('scene_order', { ascending: true })

    if (error) {
      console.error('Error fetching scenes:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get all scenes for a session with audio and light config relations
   */
  async listBySessionWithRelations(sessionId: string): Promise<SceneWithRelations[]> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select(`
        *,
        audio_file:audio_files(*),
        light_config:light_configs(*)
      `)
      .eq('session_id', sessionId)
      .order('scene_order', { ascending: true })

    if (error) {
      console.error('Error fetching scenes with relations:', error)
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
   * Get a single scene with relations
   */
  async getWithRelations(id: string): Promise<SceneWithRelations | null> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select(`
        *,
        audio_file:audio_files(*),
        light_config:light_configs(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching scene with relations:', error)
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

    // Get the next scene_order number
    const { data: scenes } = await this.supabase
      .from('scenes')
      .select('scene_order')
      .eq('session_id', scene.session_id)
      .order('scene_order', { ascending: false })
      .limit(1)

    const nextOrder = scenes && scenes.length > 0 ? (scenes[0].scene_order || 0) + 1 : 0

    const { data, error } = await this.supabase
      .from('scenes')
      .insert({
        ...scene,
        user_id: user.id,
        scene_order: scene.scene_order ?? nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating scene:', error)
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
   * Reorder scenes within a session
   */
  async reorder(sessionId: string, sceneIds: string[]): Promise<void> {
    const updates = sceneIds.map((id, index) => ({
      id,
      scene_order: index,
    }))

    for (const update of updates) {
      await this.supabase
        .from('scenes')
        .update({ scene_order: update.scene_order })
        .eq('id', update.id)
        .eq('session_id', sessionId)
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