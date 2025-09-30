import { BaseService } from './BaseService'
import type { ScenePreset, ScenePresetInsert, ScenePresetUpdate } from '@/types'
import { logger } from '@/lib/utils/logger'

/**
 * Service for managing scene presets (templates)
 */
class ScenePresetService extends BaseService<ScenePreset, ScenePresetInsert, ScenePresetUpdate> {
  constructor() {
    super('scene_presets')
  }

  /**
   * Get all system presets (built-in templates)
   */
  async getSystemPresets(): Promise<ScenePreset[]> {
    try {
      const { data, error } = await this.supabase
        .from('scene_presets')
        .select('*')
        .eq('is_system', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get system presets', error)
      throw error
    }
  }

  /**
   * Get all user-created custom presets
   */
  async getUserPresets(): Promise<ScenePreset[]> {
    try {
      const { data, error } = await this.supabase
        .from('scene_presets')
        .select('*')
        .eq('is_system', false)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get user presets', error)
      throw error
    }
  }

  /**
   * Get all presets (system + user)
   */
  async getAllPresets(): Promise<ScenePreset[]> {
    try {
      const { data, error } = await this.supabase
        .from('scene_presets')
        .select('*')
        .order('is_system', { ascending: false }) // System presets first
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get all presets', error)
      throw error
    }
  }

  /**
   * Create a custom user preset (override to prevent creating system presets)
   */
  async create(input: ScenePresetInsert): Promise<ScenePreset> {
    // Ensure is_system is false for user-created presets
    const safeInput = {
      ...input,
      is_system: false
    }
    return super.create(safeInput as ScenePresetInsert)
  }

  /**
   * Update a preset (only if it's user-created)
   */
  async update(id: string, updates: ScenePresetUpdate): Promise<ScenePreset> {
    try {
      // First check if it's a system preset
      const preset = await this.get(id)
      if (preset?.is_system) {
        throw new Error('Cannot modify system presets')
      }

      return await super.update(id, updates)
    } catch (error) {
      logger.error('Failed to update preset', error, { id, updates })
      throw error
    }
  }

  /**
   * Delete a preset (only if it's user-created)
   */
  async delete(id: string): Promise<void> {
    try {
      // First check if it's a system preset
      const preset = await this.get(id)
      if (preset?.is_system) {
        throw new Error('Cannot delete system presets')
      }

      await super.delete(id)
    } catch (error) {
      logger.error('Failed to delete preset', error, { id })
      throw error
    }
  }
}

export const scenePresetService = new ScenePresetService()
