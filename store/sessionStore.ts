import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, SessionInsert } from '@/types'
import { sessionService } from '@/lib/services/browser/sessionService'

interface SessionState {
  sessions: Record<string, Session>
  isLoading: boolean
  error: string | null
  currentSessionId: string | null

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
 * Session store with Zustand
 * Context7: Quick session switching with minimal state
 * Using Record instead of Map for better Zustand compatibility
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: {},
      isLoading: false,
      error: null,
      currentSessionId: null,

      fetchSessionsForCampaign: async (campaignId) => {
        set({ isLoading: true, error: null })
        try {
          const sessions = await sessionService.listByCampaign(campaignId)
          const sessionsRecord = sessions.reduce((acc, session) => {
            acc[session.id] = session
            return acc
          }, {} as Record<string, Session>)
          set({
            sessions: sessionsRecord,
            isLoading: false
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
          set(state => ({
            ...state,
            sessions: {
              ...state.sessions,
              [newSession.id]: newSession
            }
          }))
          return newSession
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create session'
          set({ error: message })
          throw error
        }
      },

      updateSession: async (id, updates) => {
        set({ error: null })
        try {
          const updated = await sessionService.update(id, updates)
          set(state => ({
            ...state,
            sessions: {
              ...state.sessions,
              [id]: updated
            }
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update session'
          set({ error: message })
          throw error
        }
      },

      deleteSession: async (id) => {
        set({ error: null })
        try {
          await sessionService.delete(id)
          set(state => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _, ...restSessions } = state.sessions
            return {
              ...state,
              sessions: restSessions,
              currentSessionId: state.currentSessionId === id ? null : state.currentSessionId
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete session'
          set({ error: message })
          throw error
        }
      },

      setActiveSession: async (id, campaignId) => {
        set({ error: null })
        try {
          const updated = await sessionService.setActive(id, campaignId)
          set(state => {
            // Update all sessions - deactivate others, activate target
            const updatedSessions = { ...state.sessions }
            Object.entries(updatedSessions).forEach(([sessionId, session]) => {
              if (session.campaign_id === campaignId) {
                if (sessionId === id) {
                  updatedSessions[sessionId] = updated
                } else {
                  updatedSessions[sessionId] = { ...session, status: 'planning' }
                }
              }
            })
            return {
              ...state,
              sessions: updatedSessions,
              currentSessionId: id
            }
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
    }),
    {
      name: 'session-store',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
      }),
    }
  )
)