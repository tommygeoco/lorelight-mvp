import { createClient } from '@/lib/auth/supabase'
import type { Campaign, CampaignInsert, CampaignUpdate } from '@/types'

/**
 * Campaign service for CRUD operations
 * Context7: Direct, efficient database operations
 */
class CampaignService {
  private supabase = createClient()

  /**
   * Get all campaigns for the current user
   */
  async list(): Promise<Campaign[]> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
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
      console.error('Error fetching campaign:', error)
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
      console.error('Error creating campaign:', error)
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
      console.error('Error updating campaign:', error)
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
      console.error('Error deleting campaign:', error)
      throw error
    }
  }
}

export const campaignService = new CampaignService()