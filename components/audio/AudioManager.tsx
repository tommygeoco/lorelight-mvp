'use client'

import { useEffect, useRef } from 'react'
import { useAudioStore } from '@/store/audioStore'

/**
 * AudioManager - Manages the global HTML audio element
 * Context7: Single audio element, syncs with store state
 */
export function AudioManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { setAudioElement, setCurrentTime, setDuration } = useAudioStore()

  useEffect(() => {
    // Create audio element
    const audio = new Audio()
    // Note: crossOrigin removed to allow playback without CORS headers
    audio.preload = 'metadata'
    audioRef.current = audio

    // Restore audio src from persisted state if it exists
    const { currentTrackUrl, volume, isLooping } = useAudioStore.getState()
    if (currentTrackUrl) {
      // Verify the URL is accessible before loading
      fetch(currentTrackUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            audio.src = currentTrackUrl
            audio.volume = volume
            audio.loop = isLooping
            audio.load()
          } else {
            console.error('AudioManager: Persisted track URL returned error:', response.status)
            // Clear the bad persisted state
            useAudioStore.setState({
              currentTrackId: null,
              currentTrackUrl: null,
              isPlaying: false
            })
          }
        })
        .catch(err => {
          console.error('AudioManager: Failed to verify persisted track URL:', err)
          // Clear the bad persisted state
          useAudioStore.setState({
            currentTrackId: null,
            currentTrackUrl: null,
            isPlaying: false
          })
        })
    }

    setAudioElement(audio)

    // Event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setCurrentTime(0)
    }

    const handleError = () => {
      console.error('Audio error code:', audio.error?.code)
      console.error('Audio error message:', audio.error?.message)
      console.error('Audio src:', audio.src)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
      setAudioElement(null)
    }
  }, [setAudioElement, setCurrentTime, setDuration])

  return null // No UI, just audio management
}
