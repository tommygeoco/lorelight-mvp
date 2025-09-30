import { createClient } from '@/lib/auth/supabase'
import type { Campaign, CampaignInsert, CampaignUpdate } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Campaign service for CRUD operations
 * Context7: Direct, efficient database operations
 */
class CampaignService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Get all campaigns for the current user
   */
  async list(): Promise<Campaign[]> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get a single campaign by ID
   */
  async get(id: string): Promise<Campaign | null> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * Create a new campaign
   */
  async create(campaign: Omit<CampaignInsert, 'user_id'>): Promise<Campaign> {
    const { data: { user } } = await this.supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('campaigns')
      .insert({
        ...campaign,
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
   * Update a campaign
   */
  async update(id: string, updates: CampaignUpdate): Promise<Campaign> {
    const { data, error } = await this.supabase
      .from('campaigns')
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
   * Delete a campaign
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}

export const campaignService = new CampaignService()