import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SceneNPC, SceneNPCInsert, SceneNPCUpdate } from '@/types'

/**
 * Scene NPC service for managing NPCs linked to scenes
 * Context7: Enemy and NPC tracking for DM reference
 */
class SceneNPCService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Get all NPCs for a scene
   */
  async listByScene(sceneId: string): Promise<SceneNPC[]> {
    await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('scene_npcs')
      .select('*')
      .eq('scene_id', sceneId)
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get a single NPC by ID
   */
  async get(id: string): Promise<SceneNPC | null> {
    const { data, error } = await this.supabase
      .from('scene_npcs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * Create a new scene NPC
   */
  async create(npcData: SceneNPCInsert): Promise<SceneNPC> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('scene_npcs')
      .insert({
        ...npcData,
        user_id: user.user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  /**
   * Update a scene NPC
   */
  async update(id: string, updates: SceneNPCUpdate): Promise<SceneNPC> {
    const { data, error } = await this.supabase
      .from('scene_npcs')
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
   * Delete a scene NPC
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('scene_npcs')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  /**
   * Reorder NPCs within a scene
   */
  async reorder(sceneId: string, npcIds: string[]): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    // Update order_index for each NPC
    const updates = npcIds.map((npcId, index) => ({
      id: npcId,
      scene_id: sceneId,
      order_index: index,
      user_id: user.user!.id,
    }))

    const { error } = await this.supabase
      .from('scene_npcs')
      .upsert(updates, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }
}

export const sceneNPCService = new SceneNPCService()
