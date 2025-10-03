import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useToastStore } from './toastStore'

export type AudioSource = 'library' | 'playlist' | 'scene'

export interface AudioSourceContext {
  type: AudioSource
  id: string | null // playlist ID, scene ID, or null for library
  name: string // Display name for the source
}

interface AudioPlayerState {
  // Current playback state
  currentTrackId: string | null
  currentTrackUrl: string | null
  isPlaying: boolean
  volume: number
  isMuted: boolean
  isLooping: boolean
  currentTime: number
  duration: number
  sourceContext: AudioSourceContext | null

  // Audio element (not persisted)
  audioElement: HTMLAudioElement | null

  // Actions
  loadTrack: (trackId: string, trackUrl: string, sourceContext?: AudioSourceContext) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  stop: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleLoop: () => void
  seek: (time: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setAudioElement: (element: HTMLAudioElement | null) => void
}

/**
 * Audio player store
 * Context7: Minimal state, direct audio element control
 */
export const useAudioStore = create<AudioPlayerState>()(
  persist(
    immer((set, get) => ({
      currentTrackId: null,
      currentTrackUrl: null,
      isPlaying: false,
      volume: 0.7,
      isMuted: false,
      isLooping: false,
      currentTime: 0,
      duration: 0,
      sourceContext: null,
      audioElement: null,

      loadTrack: (trackId, trackUrl, sourceContext) => {
        const { audioElement, volume, isLooping, currentTrackId, isPlaying } = get()

        if (!trackUrl) {
          return
        }

        // If same track is already loaded, don't reload it
        if (currentTrackId === trackId && audioElement?.src) {
          return
        }

        // Remember playing state to restore after loading
        const wasPlaying = isPlaying

        set(state => {
          state.currentTrackId = trackId
          state.currentTrackUrl = trackUrl
          state.isPlaying = false
          state.currentTime = 0
          state.sourceContext = sourceContext || null
        })

        if (audioElement) {
          audioElement.src = trackUrl
          audioElement.volume = volume
          audioElement.loop = isLooping
          audioElement.load()

          // Auto-play if something was playing before
          if (wasPlaying) {
            audioElement.play().then(() => {
              set({ isPlaying: true })
            }).catch(() => {
              // Failed to auto-play, stay paused
            })
          }
        }
      },

      play: () => {
        const { audioElement, volume, isMuted } = get()
        if (audioElement) {
          // Ensure audio is not muted and has proper volume
          audioElement.muted = isMuted
          if (!isMuted && audioElement.volume === 0) {
            audioElement.volume = volume
          }

          audioElement.play().catch(err => {
            set({ isPlaying: false })

            // Show user-friendly error message
            if (err.name === 'NotSupportedError') {
              useToastStore.getState().addToast(
                'This audio file appears to be corrupted or unavailable. Please try deleting and re-uploading it.',
                'error'
              )
            }
          })
          set({ isPlaying: true })
        }
      },

      pause: () => {
        const { audioElement, sourceContext } = get()
        if (audioElement) {
          audioElement.pause()
        }
        set({ isPlaying: false })

        // Deactivate scene if audio was from a scene
        if (sourceContext?.type === 'scene' && sourceContext.id) {
          const sceneId = sourceContext.id

          // Update database - fire and forget
          import('@/store/sceneStore').then(({ useSceneStore }) => {
            useSceneStore.getState().deactivateScene(sceneId).catch(console.error)
          })

          // Update sessionSceneStore UI - all sessions with this scene
          import('@/store/sessionSceneStore').then(({ useSessionSceneStore }) => {
            const state = useSessionSceneStore.getState()
            const updatedSessionScenes = new Map(state.sessionScenes)

            // Find all sessions containing this scene and deactivate it
            updatedSessionScenes.forEach((scenes, sessionId) => {
              const sceneIndex = scenes.findIndex(s => s.id === sceneId)
              if (sceneIndex !== -1) {
                const updatedScenes = scenes.map(s =>
                  s.id === sceneId
                    ? { ...s, is_active: false, updated_at: new Date().toISOString() }
                    : s
                )
                updatedSessionScenes.set(sessionId, updatedScenes)
              }
            })

            useSessionSceneStore.setState({ sessionScenes: updatedSessionScenes })
          })
        }
      },

      togglePlay: () => {
        const { isPlaying } = get()
        if (isPlaying) {
          get().pause()
        } else {
          get().play()
        }
      },

      stop: () => {
        const { audioElement, sourceContext } = get()
        if (audioElement) {
          audioElement.pause()
          audioElement.currentTime = 0
        }
        set({
          isPlaying: false,
          currentTime: 0,
        })

        // Deactivate scene if audio was from a scene
        if (sourceContext?.type === 'scene' && sourceContext.id) {
          const sceneId = sourceContext.id

          // Update database - fire and forget
          import('@/store/sceneStore').then(({ useSceneStore }) => {
            useSceneStore.getState().deactivateScene(sceneId).catch(console.error)
          })

          // Update sessionSceneStore UI - all sessions with this scene
          import('@/store/sessionSceneStore').then(({ useSessionSceneStore }) => {
            const state = useSessionSceneStore.getState()
            const updatedSessionScenes = new Map(state.sessionScenes)

            // Find all sessions containing this scene and deactivate it
            updatedSessionScenes.forEach((scenes, sessionId) => {
              const sceneIndex = scenes.findIndex(s => s.id === sceneId)
              if (sceneIndex !== -1) {
                const updatedScenes = scenes.map(s =>
                  s.id === sceneId
                    ? { ...s, is_active: false, updated_at: new Date().toISOString() }
                    : s
                )
                updatedSessionScenes.set(sessionId, updatedScenes)
              }
            })

            useSessionSceneStore.setState({ sessionScenes: updatedSessionScenes })
          })
        }
      },

      setVolume: (volume) => {
        const { audioElement } = get()
        const clampedVolume = Math.max(0, Math.min(1, volume))

        if (audioElement) {
          audioElement.volume = clampedVolume
        }

        set({
          volume: clampedVolume,
          isMuted: false,
        })
      },

      toggleMute: () => {
        const { audioElement, isMuted } = get()
        const newMuted = !isMuted

        if (audioElement) {
          audioElement.muted = newMuted
        }

        set({ isMuted: newMuted })
      },

      toggleLoop: () => {
        const { audioElement, isLooping } = get()
        const newLooping = !isLooping

        if (audioElement) {
          audioElement.loop = newLooping
        }

        set({ isLooping: newLooping })
      },

      seek: (time) => {
        const { audioElement } = get()
        if (audioElement) {
          audioElement.currentTime = time
        }
        set({ currentTime: time })
      },

      setCurrentTime: (currentTime) => {
        set({ currentTime })
      },

      setDuration: (duration) => {
        set({ duration })
      },

      setAudioElement: (element) => {
        set({ audioElement: element })
      },
    })),
    {
      name: 'audio-store',
      partialize: (state) => ({
        currentTrackId: state.currentTrackId,
        currentTrackUrl: state.currentTrackUrl,
        volume: state.volume,
        isLooping: state.isLooping,
        currentTime: state.currentTime,
        sourceContext: state.sourceContext,
      }),
    }
  )
)