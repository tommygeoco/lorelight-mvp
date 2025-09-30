import { BaseService } from './BaseService'
import type { SessionScene, SessionSceneInsert, SessionSceneUpdate, Scene } from '@/types'
import { logger } from '@/lib/utils/logger'

/**
 * Service for managing session-scene relationships (many-to-many junction table)
 */
class SessionSceneService extends BaseService<SessionScene, SessionSceneInsert, SessionSceneUpdate> {
  constructor() {
    super('session_scenes')
  }

  /**
   * Get all scenes for a session (with scene details)
   */
  async getScenesForSession(sessionId: string): Promise<Scene[]> {
    try {
      const { data, error } = await this.supabase
        .from('session_scenes')
        .select(`
          order_index,
          scenes (*)
        `)
        .eq('session_id', sessionId)
        .order('order_index', { ascending: true })

      if (error) throw error

      // Extract scenes from the join result
      type JoinResult = { order_index: number; scenes: Scene }
      return ((data || []) as unknown as JoinResult[])
        .map(item => item.scenes)
        .filter((scene): scene is Scene => scene !== null)
    } catch (error) {
      logger.error('Failed to get scenes for session', error, { sessionId })
      throw error
    }
  }

  /**
   * Get all sessions that use a specific scene
   */
  async getSessionsForScene(sceneId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('session_scenes')
        .select('session_id')
        .eq('scene_id', sceneId)

      if (error) throw error
      return (data || []).map(item => item.session_id)
    } catch (error) {
      logger.error('Failed to get sessions for scene', error, { sceneId })
      throw error
    }
  }

  /**
   * Add a scene to a session
   */
  async addSceneToSession(sessionId: string, sceneId: string, orderIndex?: number): Promise<SessionScene> {
    try {
      // Get current max order_index if not provided
      if (orderIndex === undefined) {
        const { data } = await this.supabase
          .from('session_scenes')
          .select('order_index')
          .eq('session_id', sessionId)
          .order('order_index', { ascending: false })
          .limit(1)

        orderIndex = data?.[0]?.order_index !== undefined ? data[0].order_index + 1 : 0
      }

      return await this.create({
        session_id: sessionId,
        scene_id: sceneId,
        order_index: orderIndex
      } as SessionSceneInsert)
    } catch (error) {
      logger.error('Failed to add scene to session', error, { sessionId, sceneId })
      throw error
    }
  }

  /**
   * Remove a scene from a session
   */
  async removeSceneFromSession(sessionId: string, sceneId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('session_scenes')
        .delete()
        .eq('session_id', sessionId)
        .eq('scene_id', sceneId)

      if (error) throw error
    } catch (error) {
      logger.error('Failed to remove scene from session', error, { sessionId, sceneId })
      throw error
    }
  }

  /**
   * Reorder scenes in a session
   */
  async reorderScenes(sessionId: string, sceneIds: string[]): Promise<void> {
    try {
      // Batch update all order_index values
      const updates = sceneIds.map((sceneId, index) => ({
        session_id: sessionId,
        scene_id: sceneId,
        order_index: index
      }))

      // Delete all existing mappings for this session
      await this.supabase
        .from('session_scenes')
        .delete()
        .eq('session_id', sessionId)

      // Insert new mappings with correct order
      const { error } = await this.supabase
        .from('session_scenes')
        .insert(updates as never[])

      if (error) throw error
    } catch (error) {
      logger.error('Failed to reorder scenes', error, { sessionId, sceneIds })
      throw error
    }
  }

  /**
   * Check if a scene is in a session
   */
  async isSceneInSession(sessionId: string, sceneId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('session_scenes')
        .select('id')
        .eq('session_id', sessionId)
        .eq('scene_id', sceneId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      logger.error('Failed to check if scene is in session', error, { sessionId, sceneId })
      throw error
    }
  }
}

export const sessionSceneService = new SessionSceneService()
