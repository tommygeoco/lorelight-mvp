import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useToastStore } from './toastStore'

export type AudioSource = 'library' | 'playlist' | 'scene'

export interface AudioSourceContext {
  type: AudioSource
  id: string | null // playlist ID, scene ID, or null for library
  name: string // Display name for the source
  campaignId?: string // Campaign ID for scenes
  sessionId?: string // Session ID for scenes
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
  play: (options?: { skipSceneActivation?: boolean }) => void
  pause: (options?: { skipSceneDeactivation?: boolean }) => void
  togglePlay: () => void
  stop: (options?: { skipSceneDeactivation?: boolean }) => void
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

      play: (options) => {
        const { audioElement, volume, isMuted, sourceContext } = get()
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

          // If playing a scene (and not called from scene activation), activate the scene
          if (!options?.skipSceneActivation && sourceContext?.type === 'scene' && sourceContext.id) {
            const sceneId = sourceContext.id

            // Update database - activate scene
            import('@/store/sceneStore').then(({ useSceneStore }) => {
              useSceneStore.getState().activateScene(sceneId).catch(console.error)
            }).catch(console.error)

            // Update sessionSceneStore - find all sessions with this scene and activate it
            Promise.all([
              import('@/store/sessionSceneStore'),
              import('immer')
            ]).then(([{ useSessionSceneStore }, { castDraft }]) => {
              const store = useSessionSceneStore.getState()

              // Find all sessions containing this scene and update them
              store.sessionScenes.forEach((scenes, sessionId) => {
                const hasScene = scenes.some(s => s.id === sceneId)
                if (hasScene) {
                  // Update all scenes in this session (activate this one, deactivate others)
                  const updatedScenes = scenes.map(s => ({
                    ...s,
                    is_active: s.id === sceneId,
                    updated_at: new Date().toISOString()
                  }))

                  // Update the session with all scene changes at once
                  useSessionSceneStore.setState((state) => {
                    state.sessionScenes.set(sessionId, castDraft(updatedScenes))
                    state._version++
                  })
                }
              })
            }).catch(console.error)
          }
        }
      },

      pause: (options) => {
        const { audioElement, sourceContext } = get()
        if (audioElement) {
          audioElement.pause()
        }
        set({ isPlaying: false })

        // If pausing a scene (and not called from scene deactivation), deactivate the scene
        if (!options?.skipSceneDeactivation && sourceContext?.type === 'scene' && sourceContext.id) {
          const sceneId = sourceContext.id

          // Update database - deactivate scene
          import('@/store/sceneStore').then(({ useSceneStore }) => {
            useSceneStore.getState().deactivateScene(sceneId).catch(console.error)
          }).catch(console.error)

          // Update sessionSceneStore - find all sessions with this scene and deactivate
          import('@/store/sessionSceneStore').then(({ useSessionSceneStore }) => {
            const state = useSessionSceneStore.getState()
            const sessionScenes = state.sessionScenes

            sessionScenes.forEach((scenes, sessionId) => {
              const hasScene = scenes.some(s => s.id === sceneId)
              if (hasScene) {
                // Use the store's updateSceneInSession action instead of setState
                state.updateSceneInSession(sessionId, sceneId, {
                  is_active: false,
                  updated_at: new Date().toISOString()
                })
              }
            })
          }).catch(console.error)
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

      stop: (options) => {
        const { audioElement, sourceContext } = get()
        if (audioElement) {
          audioElement.pause()
          audioElement.currentTime = 0
        }
        set({
          isPlaying: false,
          currentTime: 0,
        })

        // If stopping a scene (and not called from scene deactivation), deactivate the scene
        if (!options?.skipSceneDeactivation && sourceContext?.type === 'scene' && sourceContext.id) {
          const sceneId = sourceContext.id

          // Update database - deactivate scene
          import('@/store/sceneStore').then(({ useSceneStore }) => {
            useSceneStore.getState().deactivateScene(sceneId).catch(console.error)
          }).catch(console.error)

          // Update sessionSceneStore - find all sessions with this scene and deactivate
          import('@/store/sessionSceneStore').then(({ useSessionSceneStore }) => {
            const state = useSessionSceneStore.getState()
            const sessionScenes = state.sessionScenes

            sessionScenes.forEach((scenes, sessionId) => {
              const hasScene = scenes.some(s => s.id === sceneId)
              if (hasScene) {
                // Use the store's updateSceneInSession action instead of setState
                state.updateSceneInSession(sessionId, sceneId, {
                  is_active: false,
                  updated_at: new Date().toISOString()
                })
              }
            })
          }).catch(console.error)
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