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
        console.log('loadTrack called:', { trackId, trackUrl })
        const { audioElement, volume, isLooping } = get()

        if (!trackUrl) {
          console.error('loadTrack: trackUrl is undefined!')
          return
        }

        set(state => {
          state.currentTrackId = trackId
          state.currentTrackUrl = trackUrl
          state.isPlaying = false
          state.currentTime = 0
        })

        if (audioElement) {
          console.log('Setting audio src to:', trackUrl)
          audioElement.src = trackUrl
          audioElement.volume = volume
          audioElement.loop = isLooping
          console.log('Audio src after setting:', audioElement.src)
          console.log('About to call audioElement.load()')
          audioElement.load()
          console.log('audioElement.load() completed')
        } else {
          console.error('loadTrack: audioElement is null!')
        }
      },

      play: () => {
        const { audioElement, volume, isMuted } = get()
        if (audioElement) {
          console.log('play() called - current src:', audioElement.src)
          console.log('play() - volume before:', audioElement.volume)
          console.log('play() - muted before:', audioElement.muted)
          console.log('play() - readyState:', audioElement.readyState)

          // Ensure audio is not muted and has proper volume
          audioElement.muted = isMuted
          if (!isMuted && audioElement.volume === 0) {
            audioElement.volume = volume
          }

          console.log('play() - volume after:', audioElement.volume)
          console.log('play() - muted after:', audioElement.muted)

          audioElement.play().catch(err => {
            console.error('Error playing audio:', err)
            set({ isPlaying: false })

            // Show user-friendly error message
            if (err.name === 'NotSupportedError') {
              alert('This audio file appears to be corrupted or unavailable. Please try deleting and re-uploading it.')
            }
          })
          set({ isPlaying: true })
        } else {
          console.error('play() - audioElement is null!')
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
      }),
    }
  )
)