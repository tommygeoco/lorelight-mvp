import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session, SessionInsert, SessionUpdate } from '@/types'

/**
 * Session service for CRUD operations
 * Context7: Optimized for session management within campaigns
 */
class SessionService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Get all sessions for a campaign
   */
  async listByCampaign(campaignId: string): Promise<Session[]> {
    // Check if user is authenticated
    await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })


    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get a single session by ID
   */
  async get(id: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * Get the active session for a campaign
   */
  async getActive(campaignId: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'active')
      .single()

    if (error) {
      // No active session is not an error
      if (error.code === 'PGRST116') {
        return null
      }
      return null
    }

    return data
  }

  /**
   * Create a new session
   */
  async create(session: Omit<SessionInsert, 'user_id'>): Promise<Session> {
    const { data: { user } } = await this.supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const insertData = {
      ...session,
      user_id: user.id,
    }

    const { data, error } = await this.supabase
      .from('sessions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  /**
   * Update a session
   */
  async update(id: string, updates: SessionUpdate): Promise<Session> {
    const { data, error } = await this.supabase
      .from('sessions')
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
   * Set a session as active (and deactivate others in the campaign)
   */
  async setActive(id: string, campaignId: string): Promise<Session> {
    // First, deactivate all sessions in the campaign
    await this.supabase
      .from('sessions')
      .update({ status: 'planning' })
      .eq('campaign_id', campaignId)
      .eq('status', 'active')

    // Then activate the target session
    return this.update(id, { status: 'active' })
  }

  /**
   * Delete a session
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sessions')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}

export const sessionService = new SessionService()