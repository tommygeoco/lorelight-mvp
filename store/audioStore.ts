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
          
          // Note: Audio player is now independent of scene state
          // Only scene activation should control scene state, not audio player
        }
      },

      pause: () => {
        const { audioElement } = get()
        if (audioElement) {
          audioElement.pause()
        }
        set({ isPlaying: false })
        
        // Note: Audio playback is now independent of scene state
        // Scenes remain active when audio is paused
        // Only explicit scene deactivation should stop audio and deactivate scene
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
        const { audioElement } = get()
        if (audioElement) {
          audioElement.pause()
          audioElement.currentTime = 0
        }
        set({
          isPlaying: false,
          currentTime: 0,
        })
        
        // Note: Audio player is now independent of scene state
        // Stopping audio doesn't deactivate scenes
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