import { create, StateCreator } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet, castDraft } from 'immer'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

/**
 * Base interface for entities with common fields
 */
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  user_id: string
}

/**
 * Base service interface that all entity services must implement
 */
export interface BaseService<T extends BaseEntity, TInsert = Partial<T>> {
  list?: () => Promise<T[]>
  listByCampaign?: (campaignId: string) => Promise<T[]>
  get?: (id: string) => Promise<T | null>
  create: (data: TInsert) => Promise<T>
  update: (id: string, updates: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<void>
  setActive?: (id: string, campaignId: string) => Promise<T>
  reorder?: (campaignId: string, ids: string[]) => Promise<void>
}

/**
 * Base state interface for all entity stores
 */
export interface BaseEntityState<T extends BaseEntity> {
  entities: Map<string, T>
  isLoading: boolean
  error: string | null
  currentEntityId: string | null
}

/**
 * Base actions interface for all entity stores
 */
export interface BaseEntityActions<T extends BaseEntity, TInsert> {
  fetch: (campaignId?: string) => Promise<void>
  create: (data: TInsert) => Promise<T>
  update: (id: string, updates: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
  setActive?: (id: string, campaignId: string) => Promise<void>
  reorder?: (campaignId: string, ids: string[]) => Promise<void>
  setCurrent: (id: string | null) => void
  clearError: () => void
}

export type EntityStore<T extends BaseEntity, TInsert> = BaseEntityState<T> & BaseEntityActions<T, TInsert>

/**
 * Configuration for creating an entity store
 */
export interface CreateEntityStoreConfig<T extends BaseEntity, TInsert> {
  name: string
  service: BaseService<T, TInsert>
  enableOptimisticCreate?: boolean
  enableFetchTracking?: boolean // For tracking which campaigns have been fetched
  partialize?: (state: EntityStore<T, TInsert>) => Partial<EntityStore<T, TInsert>>
}

/**
 * Factory function to create a Zustand entity store with standard CRUD operations
 *
 * Context7 patterns:
 * - Optimistic updates for instant UI feedback
 * - Rollback on errors
 * - Persist current entity ID to localStorage
 * - Map-based storage for O(1) lookups
 * - Immer for immutable updates
 *
 * NOTE: This factory has TypeScript issues with Immer's Draft types and Map/Set.
 * It's kept as a reference pattern for future implementation.
 * Current stores use manual implementation which works correctly.
 *
 * Note: Not used in production due to TypeScript Draft type issues:
 * - Draft<T> type compatibility with Map.set()
 * - Conditional type handling for fetchedCampaigns Set
 *
 * @example
 * ```ts
 * export const useCampaignStore = createEntityStore({
 *   name: 'campaign',
 *   service: campaignService,
 *   enableOptimisticCreate: true,
 * })
 * ```
 */
export function createEntityStore<T extends BaseEntity, TInsert = Partial<T>>(
  config: CreateEntityStoreConfig<T, TInsert>
) {
  const { name, service, enableOptimisticCreate = false, enableFetchTracking = false, partialize } = config

  type State = EntityStore<T, TInsert> & (typeof enableFetchTracking extends true ? { fetchedCampaigns: Set<string> } : Record<string, never>)

  const storeCreator: StateCreator<State, [['zustand/immer', never], ['zustand/persist', unknown]], [], State> = (set, get) => ({
    entities: new Map(),
    isLoading: false,
    error: null,
    currentEntityId: null,
    ...(enableFetchTracking ? { fetchedCampaigns: new Set<string>() } : {}),

    fetch: async (campaignId?: string) => {
      set({ isLoading: true, error: null } as Partial<State>)
      try {
        let entities: T[]

        if (campaignId && service.listByCampaign) {
          entities = await service.listByCampaign(campaignId)
        } else if (service.list) {
          entities = await service.list()
        } else {
          throw new Error('No list method available on service')
        }

        set(state => {
          if (campaignId) {
            // Clear old entities for this campaign
            state.entities.forEach((entity, id) => {
              if ('campaign_id' in entity && (entity as T & { campaign_id: string }).campaign_id === campaignId) {
                state.entities.delete(id)
              }
            })
          } else {
            // Full refresh
            state.entities.clear()
          }

          // Add new entities
          entities.forEach(entity => {
            state.entities.set(entity.id, castDraft(entity))
          })

          if (enableFetchTracking && campaignId) {
            (state as unknown as State & { fetchedCampaigns: Set<string> }).fetchedCampaigns.add(campaignId)
          }

          state.isLoading = false
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : `Failed to fetch ${name}s`,
          isLoading: false
        } as Partial<State>)
      }
    },

    create: async (data) => {
      set({ error: null } as Partial<State>)

      if (enableOptimisticCreate) {
        // Optimistic ID (will be replaced by real ID from database)
        const tempId = `temp-${Date.now()}`
        const optimisticEntity = {
          id: tempId,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        } as unknown as T

        // Optimistically add to state
        set(state => {
          state.entities.set(tempId, castDraft(optimisticEntity))
        })

        try {
          const newEntity = await service.create(data)
          // Replace optimistic entry with real data
          set(state => {
            state.entities.delete(tempId)
            state.entities.set(newEntity.id, castDraft(newEntity))
          })
          return newEntity
        } catch (error) {
          // Rollback on error
          set(state => {
            state.entities.delete(tempId)
            state.error = error instanceof Error ? error.message : `Failed to create ${name}`
          })
          throw error
        }
      } else {
        // Non-optimistic create
        try {
          const newEntity = await service.create(data)
          set(state => {
            state.entities.set(newEntity.id, castDraft(newEntity))
          })
          return newEntity
        } catch (error) {
          const message = error instanceof Error ? error.message : `Failed to create ${name}`
          set({ error: message } as Partial<State>)
          throw error
        }
      }
    },

    update: async (id, updates) => {
      set({ error: null } as Partial<State>)
      const original = get().entities.get(id)
      if (!original) return

      // Optimistically update
      set(state => {
        state.entities.set(id, castDraft({ ...original, ...updates, updated_at: new Date().toISOString() }))
      })

      try {
        const updated = await service.update(id, updates)
        set(state => {
          state.entities.set(id, castDraft(updated))
        })
      } catch (error) {
        // Rollback on error
        set(state => {
          state.entities.set(id, castDraft(original))
          state.error = error instanceof Error ? error.message : `Failed to update ${name}`
        })
        throw error
      }
    },

    delete: async (id) => {
      set({ error: null } as Partial<State>)
      const original = get().entities.get(id)
      if (!original) return

      // Optimistically remove
      set(state => {
        state.entities.delete(id)
        if (state.currentEntityId === id) {
          state.currentEntityId = null
        }
      })

      try {
        await service.delete(id)
      } catch (error) {
        // Rollback on error
        set(state => {
          state.entities.set(id, castDraft(original))
          state.error = error instanceof Error ? error.message : `Failed to delete ${name}`
        })
        throw error
      }
    },

    ...(service.setActive ? {
      setActive: async (id: string, campaignId: string) => {
        set({ error: null } as Partial<State>)
        try {
          const updated = await service.setActive!(id, campaignId)
          set(state => {
            // Update all entities - deactivate others, activate target
            state.entities.forEach((entity, entityId) => {
              if ('campaign_id' in entity && (entity as T & { campaign_id: string }).campaign_id === campaignId) {
                if (entityId === id) {
                  state.entities.set(entityId, castDraft(updated))
                } else {
                  // Deactivate logic depends on entity type
                  const deactivated = { ...entity }
                  if ('is_active' in deactivated) {
                    (deactivated as T & { is_active: boolean }).is_active = false
                  }
                  if ('status' in deactivated) {
                    (deactivated as T & { status: string }).status = 'planning'
                  }
                  state.entities.set(entityId, castDraft(deactivated as T))
                }
              }
            })
            state.currentEntityId = id
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : `Failed to set active ${name}`
          set({ error: message } as Partial<State>)
          throw error
        }
      }
    } : {}),

    ...(service.reorder ? {
      reorder: async (campaignId: string, ids: string[]) => {
        set({ error: null } as Partial<State>)
        try {
          await service.reorder!(campaignId, ids)
          // Update local state with new order
          set(state => {
            ids.forEach((id, index) => {
              const entity = state.entities.get(id)
              if (entity && 'order_index' in entity) {
                state.entities.set(id, castDraft({ ...entity, order_index: index } as T))
              }
            })
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : `Failed to reorder ${name}s`
          set({ error: message } as Partial<State>)
          throw error
        }
      }
    } : {}),

    setCurrent: (id) => {
      set({ currentEntityId: id } as Partial<State>)
    },

    clearError: () => {
      set({ error: null } as Partial<State>)
    },
  } as State)

  const defaultPartialize = (state: State): Partial<State> => ({
    currentEntityId: state.currentEntityId,
  } as Partial<State>)

  const persistConfig: PersistOptions<State> = {
    name: `${name}-store`,
    partialize: (partialize || defaultPartialize) as (state: State) => State,
  }

  // Type assertion needed due to Zustand middleware type complexity with immer+persist
  return create<State>()(
    immer(
      persist(
        storeCreator as any,
        persistConfig
      )
    )
  )
}