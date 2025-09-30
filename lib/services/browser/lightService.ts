import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LightConfig, LightConfigInsert, LightConfigUpdate } from '@/types'

/**
 * Light configuration service for CRUD operations
 * Context7: Manages saved Philips Hue light presets
 */
class LightService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Get all light configs for the current user
   */
  async list(): Promise<LightConfig[]> {
    const { data, error } = await this.supabase
      .from('light_configs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get a single light config by ID
   */
  async get(id: string): Promise<LightConfig | null> {
    const { data, error } = await this.supabase
      .from('light_configs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * Create a new light config
   */
  async create(config: Omit<LightConfigInsert, 'user_id'>): Promise<LightConfig> {
    const { data: { user } } = await this.supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('light_configs')
      .insert({
        ...config,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  /**
   * Update a light config
   */
  async update(id: string, updates: LightConfigUpdate): Promise<LightConfig> {
    const { data, error } = await this.supabase
      .from('light_configs')
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
   * Delete a light config
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('light_configs')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  /**
   * Apply a light configuration to Hue lights
   */
  async apply(config: LightConfig): Promise<void> {
    try {
      const response = await fetch('/api/hue/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to apply light configuration')
      }
    } catch (error) {
      throw error
    }
  }
}

export const lightService = new LightService()