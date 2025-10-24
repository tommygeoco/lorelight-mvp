import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SceneBlock, SceneBlockInsert, SceneBlockUpdate, SceneBlockTag } from '@/types'

/**
 * Scene Block service for Notion-like content blocks
 * Context7: Rich text editing for scene notes
 */
class SceneBlockService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Get all blocks for a scene
   */
  async listByScene(sceneId: string): Promise<SceneBlock[]> {
    await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('scene_blocks')
      .select('*')
      .eq('scene_id', sceneId)
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get a single block by ID
   */
  async get(id: string): Promise<SceneBlock | null> {
    const { data, error } = await this.supabase
      .from('scene_blocks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * Create a new scene block
   */
  async create(blockData: SceneBlockInsert): Promise<SceneBlock> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('scene_blocks')
      .insert({
        ...blockData,
        order_index: Math.floor(blockData.order_index), // Floor for DB integer column
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
   * Update a scene block
   */
  async update(id: string, updates: SceneBlockUpdate): Promise<SceneBlock> {
    const { data, error } = await this.supabase
      .from('scene_blocks')
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
   * Delete a scene block
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('scene_blocks')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  /**
   * Reorder blocks within a scene
   */
  async reorder(sceneId: string, blockIds: string[]): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    // Update order_index for each block
    const updates = blockIds.map((blockId, index) => ({
      id: blockId,
      scene_id: sceneId,
      order_index: index,
      user_id: user.user!.id,
    }))

    const { error } = await this.supabase
      .from('scene_blocks')
      .upsert(updates, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  /**
   * Get all tags for a scene
   */
  async getTagsForScene(sceneId: string): Promise<SceneBlockTag[]> {
    const { data, error } = await this.supabase
      .from('scene_block_tags')
      .select('*')
      .eq('scene_id', sceneId)

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get tags for a specific block
   */
  async getTagsForBlock(blockId: string): Promise<SceneBlockTag[]> {
    const { data, error } = await this.supabase
      .from('scene_block_tags')
      .select('*')
      .eq('block_id', blockId)

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Add a tag to a block
   */
  async addTag(sceneId: string, blockId: string, tagName: string): Promise<SceneBlockTag> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('scene_block_tags')
      .insert({
        scene_id: sceneId,
        block_id: blockId,
        tag_name: tagName,
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
   * Remove a tag from a block
   */
  async removeTag(blockId: string, tagName: string): Promise<void> {
    const { error } = await this.supabase
      .from('scene_block_tags')
      .delete()
      .eq('block_id', blockId)
      .eq('tag_name', tagName)

    if (error) {
      throw error
    }
  }

  /**
   * Remove all tags from a block
   */
  async removeAllTagsFromBlock(blockId: string): Promise<void> {
    const { error } = await this.supabase
      .from('scene_block_tags')
      .delete()
      .eq('block_id', blockId)

    if (error) {
      throw error
    }
  }
}

export const sceneBlockService = new SceneBlockService()
