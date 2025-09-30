import { BaseService } from './BaseService'
import type { AudioPlaylist, AudioPlaylistInsert, AudioPlaylistUpdate, AudioFile, PlaylistAudioInsert } from '@/types'
import { logger } from '@/lib/utils/logger'

/**
 * Service for managing audio playlists
 */
class AudioPlaylistService extends BaseService<AudioPlaylist, AudioPlaylistInsert, AudioPlaylistUpdate> {
  constructor() {
    super('audio_playlists')
  }

  /**
   * Get all audio files in a playlist (ordered)
   */
  async getPlaylistAudio(playlistId: string): Promise<AudioFile[]> {
    try {
      const { data, error } = await this.supabase
        .from('playlist_audio')
        .select(`
          order_index,
          audio_files (*)
        `)
        .eq('playlist_id', playlistId)
        .order('order_index', { ascending: true })

      if (error) throw error

      type JoinResult = { order_index: number; audio_files: AudioFile }
      return ((data || []) as unknown as JoinResult[])
        .map(item => item.audio_files)
        .filter((file): file is AudioFile => file !== null)
    } catch (error) {
      logger.error('Failed to get playlist audio', error, { playlistId })
      throw error
    }
  }

  /**
   * Add an audio file to a playlist
   */
  async addAudioToPlaylist(playlistId: string, audioFileId: string, orderIndex?: number): Promise<void> {
    try {
      // Get current max order_index if not provided
      if (orderIndex === undefined) {
        const { data } = await this.supabase
          .from('playlist_audio')
          .select('order_index')
          .eq('playlist_id', playlistId)
          .order('order_index', { ascending: false })
          .limit(1)

        orderIndex = data?.[0]?.order_index !== undefined ? data[0].order_index + 1 : 0
      }

      const { error } = await this.supabase
        .from('playlist_audio')
        .insert({
          playlist_id: playlistId,
          audio_file_id: audioFileId,
          order_index: orderIndex
        } as PlaylistAudioInsert)

      if (error) throw error
    } catch (error) {
      logger.error('Failed to add audio to playlist', error, { playlistId, audioFileId })
      throw error
    }
  }

  /**
   * Remove an audio file from a playlist
   */
  async removeAudioFromPlaylist(playlistId: string, audioFileId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('playlist_audio')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('audio_file_id', audioFileId)

      if (error) throw error
    } catch (error) {
      logger.error('Failed to remove audio from playlist', error, { playlistId, audioFileId })
      throw error
    }
  }

  /**
   * Reorder audio files in a playlist
   */
  async reorderPlaylistAudio(playlistId: string, audioFileIds: string[]): Promise<void> {
    try {
      // Delete all existing mappings for this playlist
      await this.supabase
        .from('playlist_audio')
        .delete()
        .eq('playlist_id', playlistId)

      // Insert new mappings with correct order
      const updates = audioFileIds.map((audioFileId, index) => ({
        playlist_id: playlistId,
        audio_file_id: audioFileId,
        order_index: index
      }))

      const { error } = await this.supabase
        .from('playlist_audio')
        .insert(updates as never[])

      if (error) throw error
    } catch (error) {
      logger.error('Failed to reorder playlist audio', error, { playlistId, audioFileIds })
      throw error
    }
  }

  /**
   * Get all playlists that contain a specific audio file
   */
  async getPlaylistsForAudio(audioFileId: string): Promise<AudioPlaylist[]> {
    try {
      const { data, error } = await this.supabase
        .from('playlist_audio')
        .select(`
          audio_playlists (*)
        `)
        .eq('audio_file_id', audioFileId)

      if (error) throw error

      type PlaylistJoinResult = { audio_playlists: AudioPlaylist }
      return ((data || []) as unknown as PlaylistJoinResult[])
        .map(item => item.audio_playlists)
        .filter((playlist): playlist is AudioPlaylist => playlist !== null)
    } catch (error) {
      logger.error('Failed to get playlists for audio', error, { audioFileId })
      throw error
    }
  }

  /**
   * Check if an audio file is in a playlist
   */
  async isAudioInPlaylist(playlistId: string, audioFileId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('playlist_audio')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('audio_file_id', audioFileId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      logger.error('Failed to check if audio is in playlist', error, { playlistId, audioFileId })
      throw error
    }
  }
}

export const audioPlaylistService = new AudioPlaylistService()
