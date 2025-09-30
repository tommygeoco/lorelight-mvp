import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { Session, SessionInsert } from '@/types'
import { sessionService } from '@/lib/services/browser/sessionService'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

interface SessionState {
  sessions: Map<string, Session>
  isLoading: boolean
  error: string | null
  currentSessionId: string | null
  fetchedCampaigns: Set<string> // Track which campaigns we've fetched

  // Actions
  fetchSessionsForCampaign: (campaignId: string) => Promise<void>
  createSession: (session: Omit<SessionInsert, 'user_id'>) => Promise<Session>
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  setActiveSession: (id: string, campaignId: string) => Promise<void>
  setCurrentSession: (id: string | null) => void
  clearError: () => void
}

/**
 * Session store with Zustand + Immer
 * Context7: Quick session switching with minimal state
 */
export const useSessionStore = create<SessionState>()(
  persist(
    immer((set, get) => ({
      sessions: new Map(),
      isLoading: false,
      error: null,
      currentSessionId: null,
      fetchedCampaigns: new Set(),

      fetchSessionsForCampaign: async (campaignId) => {
        // Don't refetch if already loaded
        if (get().fetchedCampaigns.has(campaignId)) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const sessions = await sessionService.listByCampaign(campaignId)
          set(state => {
            // Clear old sessions for this campaign
            state.sessions.forEach((session, id) => {
              if (session.campaign_id === campaignId) {
                state.sessions.delete(id)
              }
            })
            // Add new sessions
            sessions.forEach(session => {
              state.sessions.set(session.id, session)
            })
            state.fetchedCampaigns.add(campaignId)
            state.isLoading = false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch sessions',
            isLoading: false
          })
        }
      },

      createSession: async (session) => {
        set({ error: null })
        try {
          const newSession = await sessionService.create(session)
          set(state => {
            state.sessions.set(newSession.id, newSession)
          })
          return newSession
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create session'
          set({ error: message })
          throw error
        }
      },

      updateSession: async (id, updates) => {
        set({ error: null })
        const original = get().sessions.get(id)
        if (!original) return

        set(state => {
          state.sessions.set(id, { ...original, ...updates, updated_at: new Date().toISOString() })
        })

        try {
          const updated = await sessionService.update(id, updates)
          set(state => {
            state.sessions.set(id, updated)
          })
        } catch (error) {
          set(state => {
            state.sessions.set(id, original)
            state.error = error instanceof Error ? error.message : 'Failed to update session'
          })
          throw error
        }
      },

      deleteSession: async (id) => {
        set({ error: null })
        const original = get().sessions.get(id)
        if (!original) return

        set(state => {
          state.sessions.delete(id)
          if (state.currentSessionId === id) {
            state.currentSessionId = null
          }
        })

        try {
          await sessionService.delete(id)
        } catch (error) {
          set(state => {
            state.sessions.set(id, original)
            state.error = error instanceof Error ? error.message : 'Failed to delete session'
          })
          throw error
        }
      },

      setActiveSession: async (id, campaignId) => {
        set({ error: null })
        try {
          const updated = await sessionService.setActive(id, campaignId)
          set(state => {
            // Update all sessions - deactivate others, activate target
            state.sessions.forEach((session, sessionId) => {
              if (session.campaign_id === campaignId) {
                if (sessionId === id) {
                  state.sessions.set(sessionId, updated)
                } else {
                  state.sessions.set(sessionId, { ...session, status: 'planning' })
                }
              }
            })
            state.currentSessionId = id
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to set active session'
          set({ error: message })
          throw error
        }
      },

      setCurrentSession: (id) => {
        set({ currentSessionId: id })
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    {
      name: 'session-store',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        fetchedCampaigns: Array.from(state.fetchedCampaigns),
      }),
      merge: (persistedState, currentState) => {
        const state = { ...currentState, ...(persistedState as object) }
        const persisted = persistedState as {
          currentSessionId?: string | null
          fetchedCampaigns?: string[]
        }

        if (typeof persisted?.currentSessionId !== 'undefined') {
          state.currentSessionId = persisted.currentSessionId
        }

        // Restore Set from array
        if (Array.isArray(persisted?.fetchedCampaigns)) {
          state.fetchedCampaigns = new Set(persisted.fetchedCampaigns)
        } else {
          state.fetchedCampaigns = new Set()
        }

        return state
      },
    }
  )
)