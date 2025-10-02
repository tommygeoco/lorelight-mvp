import { useCallback } from 'react'
import { useAudioStore, type AudioSourceContext } from '@/store/audioStore'
import { useToastStore } from '@/store/toastStore'
import type { AudioFile } from '@/types'

/**
 * Custom hook for audio playback functionality
 * Provides a unified interface for playing, pausing, and managing audio tracks
 */
export function useAudioPlayback(sourceContext?: AudioSourceContext) {
  const { currentTrackId, currentTrackUrl, isPlaying, loadTrack, togglePlay } = useAudioStore()
  const { addToast } = useToastStore()

  /**
   * Play or pause an audio file
   * If the same track is already loaded, toggles play/pause
   * If a different track, loads and plays the new track
   */
  const handlePlay = useCallback(
    (audioFile: AudioFile) => {
      const isSameTrack = currentTrackId === audioFile.id && currentTrackUrl === audioFile.file_url

      if (isSameTrack) {
        togglePlay()
      } else {
        if (!audioFile.file_url) {
          addToast('This audio file is missing its URL. Please re-upload.', 'error')
          return
        }
        // Load and immediately play the new track with source context
        loadTrack(audioFile.id, audioFile.file_url, sourceContext)
        // Ensure it starts playing even if another track was playing
        if (!isPlaying) {
          setTimeout(() => {
            togglePlay()
          }, 200)
        }
      }
    },
    [currentTrackId, currentTrackUrl, isPlaying, loadTrack, togglePlay, addToast, sourceContext]
  )

  return {
    handlePlay,
    currentTrackId,
    isPlaying,
  }
}
