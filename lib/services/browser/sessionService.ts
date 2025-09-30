import { createClient } from '@/lib/auth/supabase'
import type { Session, SessionInsert, SessionUpdate } from '@/types'

/**
 * Session service for CRUD operations
 * Context7: Optimized for session management within campaigns
 */
class SessionService {
  private supabase = createClient()

  /**
   * Get all sessions for a campaign
   */
  async listByCampaign(campaignId: string): Promise<Session[]> {
    // Check if user is authenticated
    const { data: { user } } = await this.supabase.auth.getUser()
    console.log('Current user when fetching sessions:', user?.id)

    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    console.log('Session fetch result:', { data, error, campaignId })

    if (error) {
      console.error('Error fetching sessions:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error),
      })
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
      console.error('Error fetching session:', error)
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
      console.error('Error fetching active session:', error)
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
    console.log('Creating session with data:', insertData)

    const { data, error } = await this.supabase
      .from('sessions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error),
      })
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
      console.error('Error updating session:', error)
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
      console.error('Error deleting session:', error)
      throw error
    }
  }
}

export const sessionService = new SessionService()