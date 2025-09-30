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
    immer((set) => ({
      campaigns: new Map(),
      isLoading: false,
      error: null,
      currentCampaignId: null,

      fetchCampaigns: async () => {
        set({ isLoading: true, error: null })
        try {
          const campaigns = await campaignService.list()
          set(state => {
            state.campaigns = new Map(campaigns.map(c => [c.id, c]))
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
        try {
          const newCampaign = await campaignService.create(campaign)
          set(state => {
            state.campaigns.set(newCampaign.id, newCampaign)
          })
          return newCampaign
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create campaign'
          set({ error: message })
          throw error
        }
      },

      updateCampaign: async (id, updates) => {
        set({ error: null })
        try {
          const updated = await campaignService.update(id, updates)
          set(state => {
            state.campaigns.set(id, updated)
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update campaign'
          set({ error: message })
          throw error
        }
      },

      deleteCampaign: async (id) => {
        set({ error: null })
        try {
          await campaignService.delete(id)
          set(state => {
            state.campaigns.delete(id)
            if (state.currentCampaignId === id) {
              state.currentCampaignId = null
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete campaign'
          set({ error: message })
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