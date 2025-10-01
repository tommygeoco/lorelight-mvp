import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastState>()(
  immer((set) => ({
    toasts: [],

    addToast: (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      set(state => {
        state.toasts.push({ id, message, type, duration })
      })

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          set(state => {
            state.toasts = state.toasts.filter(t => t.id !== id)
          })
        }, duration)
      }
    },

    removeToast: (id: string) => {
      set(state => {
        state.toasts = state.toasts.filter(t => t.id !== id)
      })
    },

    clearAll: () => {
      set(state => {
        state.toasts = []
      })
    },
  }))
)
