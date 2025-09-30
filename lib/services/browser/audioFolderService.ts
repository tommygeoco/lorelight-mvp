import { BaseService } from './BaseService'
import type { AudioFolder, AudioFolderInsert, AudioFolderUpdate } from '@/types'
import { logger } from '@/lib/utils/logger'

/**
 * Service for managing audio folders (hierarchical organization)
 */
class AudioFolderService extends BaseService<AudioFolder, AudioFolderInsert, AudioFolderUpdate> {
  constructor() {
    super('audio_folders')
  }

  /**
   * Get all root-level folders (no parent)
   */
  async getRootFolders(): Promise<AudioFolder[]> {
    try {
      const { data, error } = await this.supabase
        .from('audio_folders')
        .select('*')
        .is('parent_id', null)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get root folders', error)
      throw error
    }
  }

  /**
   * Get subfolders of a parent folder
   */
  async getSubfolders(parentId: string): Promise<AudioFolder[]> {
    try {
      const { data, error } = await this.supabase
        .from('audio_folders')
        .select('*')
        .eq('parent_id', parentId)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get subfolders', error, { parentId })
      throw error
    }
  }

  /**
   * Get folder hierarchy (folder with its ancestors)
   */
  async getFolderPath(folderId: string): Promise<AudioFolder[]> {
    try {
      const path: AudioFolder[] = []
      let currentId: string | null = folderId

      while (currentId) {
        const folder = await this.get(currentId)
        if (!folder) break

        path.unshift(folder) // Add to beginning
        currentId = folder.parent_id
      }

      return path
    } catch (error) {
      logger.error('Failed to get folder path', error, { folderId })
      throw error
    }
  }

  /**
   * Create a subfolder
   */
  async createSubfolder(parentId: string, name: string): Promise<AudioFolder> {
    return this.create({
      name,
      parent_id: parentId
    } as AudioFolderInsert)
  }

  /**
   * Move folder to a new parent
   */
  async moveFolder(folderId: string, newParentId: string | null): Promise<AudioFolder> {
    try {
      // Validate: cannot move folder into itself or its descendants
      if (newParentId) {
        const descendants = await this.getAllDescendants(folderId)
        if (descendants.some(d => d.id === newParentId)) {
          throw new Error('Cannot move folder into its own descendant')
        }
      }

      return await this.update(folderId, {
        parent_id: newParentId
      } as AudioFolderUpdate)
    } catch (error) {
      logger.error('Failed to move folder', error, { folderId, newParentId })
      throw error
    }
  }

  /**
   * Get all descendants of a folder (recursive)
   */
  private async getAllDescendants(folderId: string): Promise<AudioFolder[]> {
    const descendants: AudioFolder[] = []
    const subfolders = await this.getSubfolders(folderId)

    for (const subfolder of subfolders) {
      descendants.push(subfolder)
      const subDescendants = await this.getAllDescendants(subfolder.id)
      descendants.push(...subDescendants)
    }

    return descendants
  }
}

export const audioFolderService = new AudioFolderService()
