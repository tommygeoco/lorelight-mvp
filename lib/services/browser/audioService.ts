import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AudioFile, AudioFileInsert, AudioFileUpdate } from '@/types'

/**
 * Audio file service for CRUD operations
 * Context7: Efficient audio file management with R2 integration
 */
class AudioService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Get all audio files for the current user
   */
  async list(): Promise<AudioFile[]> {
    const { data, error } = await this.supabase
      .from('audio_files')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get audio files filtered by tags
   */
  async listByTags(tags: string[]): Promise<AudioFile[]> {
    const { data, error } = await this.supabase
      .from('audio_files')
      .select('*')
      .overlaps('tags', tags)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get a single audio file by ID
   */
  async get(id: string): Promise<AudioFile | null> {
    const { data, error } = await this.supabase
      .from('audio_files')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * Create a new audio file entry
   * Note: File must be uploaded to R2 first
   */
  async create(audioFile: Omit<AudioFileInsert, 'user_id'>): Promise<AudioFile> {
    const { data: { user } } = await this.supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('audio_files')
      .insert({
        ...audioFile,
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
   * Update an audio file entry
   */
  async update(id: string, updates: AudioFileUpdate): Promise<AudioFile> {
    const { data, error } = await this.supabase
      .from('audio_files')
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
   * Delete an audio file entry
   * Note: Actual file in R2 should be deleted separately
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('audio_files')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  /**
   * Upload an audio file to R2
   */
  async upload(file: File): Promise<{ fileUrl: string; fileName: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    return response.json()
  }
}

export const audioService = new AudioService()