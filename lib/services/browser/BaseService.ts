import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

/**
 * Base service class for common CRUD operations
 *
 * Usage:
 * ```typescript
 * class CampaignService extends BaseService<Campaign, CampaignInsert, CampaignUpdate> {
 *   constructor() {
 *     super('campaigns')
 *   }
 *
 *   // Add custom methods here
 * }
 * ```
 */
export abstract class BaseService<
  TEntity extends { id: string },
  TInsert = Omit<TEntity, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  TUpdate = Partial<TInsert>
> {
  private _supabase?: SupabaseClient
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  /**
   * Lazy-loaded Supabase client
   */
  protected get supabase(): SupabaseClient {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * List all entities for the current user
   */
  async list(orderBy: keyof TEntity = 'created_at' as keyof TEntity, ascending = false): Promise<TEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order(orderBy as string, { ascending })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error(`Failed to list ${this.tableName}`, error)
      throw error
    }
  }

  /**
   * Get a single entity by ID
   */
  async get(id: string): Promise<TEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      logger.error(`Failed to get ${this.tableName}`, error, { entityId: id })
      throw error
    }
  }

  /**
   * Create a new entity
   */
  async create(input: TInsert): Promise<TEntity> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(input as never)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error(`Failed to create ${this.tableName}`, error, { input })
      throw error
    }
  }

  /**
   * Update an existing entity
   */
  async update(id: string, updates: TUpdate): Promise<TEntity> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error(`Failed to update ${this.tableName}`, error, { entityId: id, updates })
      throw error
    }
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      logger.error(`Failed to delete ${this.tableName}`, error, { entityId: id })
      throw error
    }
  }

  /**
   * List entities by a specific field value
   */
  async listBy(field: keyof TEntity, value: unknown): Promise<TEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq(field as string, value)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error(`Failed to list ${this.tableName} by ${String(field)}`, error, { field, value })
      throw error
    }
  }
}