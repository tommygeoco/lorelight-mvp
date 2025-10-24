import { createClient } from '@/lib/auth/supabase'
import type { SceneAudioFile, SceneAudioFileInsert, SceneAudioFileUpdate } from '@/types'

/**
 * Service for managing scene-audio file relationships (junction table)
 */
class SceneAudioFileService {
  /**
   * Get all audio files for a scene
   */
  async getAudioFilesForScene(sceneId: string): Promise<SceneAudioFile[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('scene_audio_files')
      .select('*')
      .eq('scene_id', sceneId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching scene audio files:', error)
      throw new Error(`Failed to fetch audio files: ${error.message}`)
    }

    return data as SceneAudioFile[]
  }

  /**
   * Add an audio file to a scene
   */
  async addAudioFile(audioFile: SceneAudioFileInsert): Promise<SceneAudioFile> {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('scene_audio_files')
      .insert({
        ...audioFile,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding scene audio file:', error)
      throw new Error(`Failed to add audio file: ${error.message}`)
    }

    return data as SceneAudioFile
  }

  /**
   * Update a scene audio file (selection, volume, loop, order)
   */
  async updateAudioFile(id: string, updates: SceneAudioFileUpdate): Promise<SceneAudioFile> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('scene_audio_files')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating scene audio file:', error)
      throw new Error(`Failed to update audio file: ${error.message}`)
    }

    return data as SceneAudioFile
  }

  /**
   * Remove an audio file from a scene
   */
  async removeAudioFile(id: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
      .from('scene_audio_files')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error removing scene audio file:', error)
      throw new Error(`Failed to remove audio file: ${error.message}`)
    }
  }
}

export const sceneAudioFileService = new SceneAudioFileService()

