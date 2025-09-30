import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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

  // Audio element (not persisted)
  audioElement: HTMLAudioElement | null

  // Actions
  loadTrack: (trackId: string, trackUrl: string) => void
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
      audioElement: null,

      loadTrack: (trackId, trackUrl) => {
        const { audioElement, volume, isLooping } = get()

        set(state => {
          state.currentTrackId = trackId
          state.currentTrackUrl = trackUrl
          state.isPlaying = false
          state.currentTime = 0
        })

        if (audioElement) {
          audioElement.src = trackUrl
          audioElement.volume = volume
          audioElement.loop = isLooping
          audioElement.load()
        }
      },

      play: () => {
        const { audioElement } = get()
        if (audioElement) {
          audioElement.play().catch(err => {
            console.error('Error playing audio:', err)
            set({ isPlaying: false })
          })
          set({ isPlaying: true })
        }
      },

      pause: () => {
        const { audioElement } = get()
        if (audioElement) {
          audioElement.pause()
        }
        set({ isPlaying: false })
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
        const { audioElement, isMuted, volume } = get()

        if (audioElement) {
          audioElement.volume = isMuted ? volume : 0
        }

        set({ isMuted: !isMuted })
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
      }),
    }
  )
)