import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Campaign } from '@/types'
import { campaignService } from '@/lib/services/browser/campaignService'

interface CampaignState {
  campaigns: Map<string, Campaign>
  isLoading: boolean
  error: string | null
  currentCampaignId: string | null

  // Actions
  fetchCampaigns: () => Promise<void>
  createCampaign: (campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Campaign>
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
  setCurrentCampaign: (id: string | null) => void
  clearError: () => void
}

/**
 * Campaign store with Zustand + Immer
 * Context7: Optimistic updates with local state + database sync
 */
export const useCampaignStore = create<CampaignState>()(
  persist(
    immer((set, get) => ({
      campaigns: new Map(),
      isLoading: false,
      error: null,
      currentCampaignId: null,

      fetchCampaigns: async () => {
        set({ isLoading: true, error: null })
        try {
          const campaigns = await campaignService.list()
          set(state => {
            state.campaigns.clear()
            campaigns.forEach(campaign => {
              state.campaigns.set(campaign.id, campaign)
            })
            state.isLoading = false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
            isLoading: false
          })
        }
      },

      createCampaign: async (campaign) => {
        set({ error: null })
        // Optimistic ID (will be replaced by real ID from database)
        const tempId = `temp-${Date.now()}`
        const optimisticCampaign = {
          id: tempId,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...campaign,
        }

        // Optimistically add to state
        set(state => {
          state.campaigns.set(tempId, optimisticCampaign)
        })

        try {
          const newCampaign = await campaignService.create(campaign)
          // Replace optimistic entry with real data
          set(state => {
            state.campaigns.delete(tempId)
            state.campaigns.set(newCampaign.id, newCampaign)
          })
          return newCampaign
        } catch (error) {
          // Rollback on error
          set(state => {
            state.campaigns.delete(tempId)
            state.error = error instanceof Error ? error.message : 'Failed to create campaign'
          })
          throw error
        }
      },

      updateCampaign: async (id, updates) => {
        set({ error: null })
        // Store original for rollback
        const original = get().campaigns.get(id)
        if (!original) return

        // Optimistically update
        set(state => {
          state.campaigns.set(id, { ...original, ...updates, updated_at: new Date().toISOString() })
        })

        try {
          const updated = await campaignService.update(id, updates)
          set(state => {
            state.campaigns.set(id, updated)
          })
        } catch (error) {
          // Rollback on error
          set(state => {
            state.campaigns.set(id, original)
            state.error = error instanceof Error ? error.message : 'Failed to update campaign'
          })
          throw error
        }
      },

      deleteCampaign: async (id) => {
        set({ error: null })
        // Store original for rollback
        const original = get().campaigns.get(id)
        if (!original) return

        // Optimistically remove
        set(state => {
          state.campaigns.delete(id)
          if (state.currentCampaignId === id) {
            state.currentCampaignId = null
          }
        })

        try {
          await campaignService.delete(id)
        } catch (error) {
          // Rollback on error
          set(state => {
            state.campaigns.set(id, original)
            state.error = error instanceof Error ? error.message : 'Failed to delete campaign'
          })
          throw error
        }
      },

      setCurrentCampaign: (id) => {
        set({ currentCampaignId: id })
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    {
      name: 'campaign-store',
      partialize: (state) => ({
        currentCampaignId: state.currentCampaignId,
      }),
    }
  )
)