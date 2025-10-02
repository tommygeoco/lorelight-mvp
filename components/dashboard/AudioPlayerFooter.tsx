'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Pause, Play, Volume1, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react'
import { useAudioStore } from '@/store/audioStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { formatTime } from '@/lib/utils/time'

// Scene-aware gradient constants (module-level for performance)
const SCENE_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
] as const

const PURPLE_PINK_GRADIENT = 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)'

/**
 * Generate consistent gradient for a track ID using hash
 */
function getSceneGradient(trackId: string): string {
  const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return SCENE_GRADIENTS[hash % SCENE_GRADIENTS.length]
}

export function AudioPlayerFooter() {
  const {
    isPlaying,
    isMuted,
    isLooping,
    volume,
    currentTime,
    duration,
    currentTrackId,
    togglePlay,
    toggleMute,
    toggleLoop,
    setVolume,
    seek
  } = useAudioStore()

  const audioFileMap = useAudioFileMap()
  const currentTrack = currentTrackId ? audioFileMap.get(currentTrackId) : null

  // Progress bar dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Calculate seek position from mouse/touch event
  const calculateSeekPosition = useCallback((clientX: number): number => {
    if (!progressBarRef.current) return 0
    const rect = progressBarRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    return percentage
  }, [])

  // Handle mouse/touch down - start dragging
  const handleSeekStart = useCallback((clientX: number) => {
    if (!currentTrack) return
    setIsDragging(true)
    const percentage = calculateSeekPosition(clientX)
    setDragProgress(percentage * 100)
  }, [currentTrack, calculateSeekPosition])

  // Handle mouse/touch move - update preview position
  const handleSeekMove = useCallback((clientX: number) => {
    if (!isDragging) return
    const percentage = calculateSeekPosition(clientX)
    setDragProgress(percentage * 100)
  }, [isDragging, calculateSeekPosition])

  // Handle mouse/touch up - commit seek
  const handleSeekEnd = useCallback(() => {
    if (!isDragging) return
    const newTime = (dragProgress / 100) * duration
    seek(newTime)
    setIsDragging(false)
  }, [isDragging, dragProgress, duration, seek])

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleSeekStart(e.clientX)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleSeekStart(e.touches[0].clientX)
    }
  }

  // Global mouse/touch move and up listeners
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleSeekMove(e.clientX)
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault()
        handleSeekMove(e.touches[0].clientX)
      }
    }

    const handleGlobalMouseUp = () => {
      handleSeekEnd()
    }

    const handleGlobalTouchEnd = () => {
      handleSeekEnd()
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    document.addEventListener('touchend', handleGlobalTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isDragging, handleSeekMove, handleSeekEnd])

  // Memoize calculations
  const displayProgress = useMemo(
    () => isDragging ? dragProgress : (duration > 0 ? (currentTime / duration) * 100 : 0),
    [isDragging, dragProgress, currentTime, duration]
  )

  const displayTime = useMemo(
    () => isDragging ? (dragProgress / 100) * duration : currentTime,
    [isDragging, dragProgress, duration, currentTime]
  )

  const artworkGradient = useMemo(
    () => currentTrack ? getSceneGradient(currentTrack.id) : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    [currentTrack]
  )

  const volumePercentage = useMemo(
    () => (isMuted ? 0 : volume) * 100,
    [isMuted, volume]
  )

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  return (
    <div
      className="relative bg-[#111111] flex items-center px-4 pt-5 pb-5 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #111111 0%, #151515 50%, #111111 100%)'
      }}
    >
      {/* Subtle purple vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(139, 92, 246, 0.03) 100%)'
        }}
      />

      {/* Compact horizontal layout */}
      <div className="w-full max-w-full flex items-center gap-4 relative z-10">

        {/* Left: Track Info */}
        <div className="flex items-center gap-3 min-w-0 w-80">
          {/* Artwork */}
          <div className="relative">
            <div
              className="w-14 h-14 rounded-md flex-shrink-0 relative group overflow-hidden shadow-lg"
              style={{ background: artworkGradient }}
            >
            </div>

            {/* Equalizer bars when playing */}
            {isPlaying && currentTrack && (
              <div className="absolute -bottom-1 -right-1 bg-black/80 backdrop-blur-sm rounded-md px-1 py-0.5">
                <div className="flex items-end gap-0.5">
                  <div className="w-0.5 bg-purple-500 animate-equalizer-1" style={{ height: '8px' }} />
                  <div className="w-0.5 bg-purple-500 animate-equalizer-2" style={{ height: '12px' }} />
                  <div className="w-0.5 bg-purple-500 animate-equalizer-3" style={{ height: '6px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Track Details */}
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            <div
              className="text-[15px] font-medium text-white truncate"
              title={currentTrack?.name || 'No track loaded'}
            >
              {currentTrack?.name || 'No track loaded'}
            </div>
            <div className="text-[13px] text-white/40 truncate">
              {currentTrack ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-purple-400/60">♪</span>
                  Scene Audio
                </span>
              ) : (
                'Select a scene to begin'
              )}
            </div>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-auto">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Shuffle (disabled for now) */}
            <div title="Shuffle (coming soon)">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center text-white/20 cursor-not-allowed transition-colors"
                aria-label="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>

            {/* Skip Back (disabled for now) */}
            <div title="Previous track (coming soon)">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center text-white/20 cursor-not-allowed transition-colors"
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4" fill="currentColor" />
              </button>
            </div>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className={`
                relative w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-200
                ${currentTrack
                  ? 'bg-white hover:bg-white/90 hover:scale-105 active:scale-95 shadow-lg'
                  : 'bg-white/10 cursor-not-allowed'
                }
              `}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black relative z-10" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5 relative z-10" fill="currentColor" />
              )}
            </button>

            {/* Skip Forward (disabled for now) */}
            <div title="Next track (coming soon)">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center text-white/20 cursor-not-allowed transition-colors"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" fill="currentColor" />
              </button>
            </div>

            {/* Loop */}
            <div title={!currentTrack ? "No track loaded" : isLooping ? "Loop enabled - Click to disable" : "Loop disabled - Click to enable"}>
              <button
                onClick={toggleLoop}
                disabled={!currentTrack}
                className={`
                  w-8 h-8 flex items-center justify-center transition-colors
                  ${!currentTrack
                    ? 'text-white/20 cursor-not-allowed'
                    : isLooping
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-white/60 hover:text-white'
                  }
                `}
                aria-label={isLooping ? "Loop enabled" : "Loop disabled"}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar with purple gradient */}
          <div className="flex items-center gap-2 w-full">
            <div className="text-xs text-white/50 tabular-nums w-10 text-right font-mono">
              {formatTime(displayTime)}
            </div>

            <div
              ref={progressBarRef}
              className={`relative flex-1 rounded-full bg-white/10 group overflow-visible transition-all ${
                isDragging ? 'h-1.5 cursor-grabbing' : 'h-1 cursor-pointer'
              }`}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={displayTime}
            >
              {/* Purple glow underneath */}
              {currentTrack && displayProgress > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50 transition-all"
                  style={{
                    width: `${displayProgress}%`,
                    background: PURPLE_PINK_GRADIENT,
                    transitionDuration: isDragging ? '0ms' : '150ms',
                  }}
                />
              )}

              {/* Filled progress with purple gradient */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{
                  width: `${displayProgress}%`,
                  background: currentTrack ? PURPLE_PINK_GRADIENT : 'white',
                  transitionDuration: isDragging ? '0ms' : '150ms',
                }}
              />

              {/* Shimmer effect when playing (not while dragging) */}
              {isPlaying && currentTrack && displayProgress > 0 && !isDragging && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
                  style={{ width: `${displayProgress}%` }}
                >
                  <div
                    className="absolute inset-0 shimmer-effect"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    }}
                  />
                </div>
              )}

              {/* Scrubber handle - visible on hover or while dragging */}
              {currentTrack && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 transition-opacity pointer-events-none ${
                    isDragging || displayProgress > 0 ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
                  } ${isDragging ? '!opacity-100' : ''}`}
                  style={{ left: `calc(${displayProgress}% - 6px)` }}
                >
                  <div className="w-3 h-3 bg-white rounded-full shadow-lg relative">
                    <div className="absolute inset-0 bg-purple-500/50 rounded-full blur-sm" />
                  </div>
                </div>
              )}

            </div>

            <div className="text-xs text-white/50 tabular-nums w-10 font-mono">
              {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Right: Volume Control */}
        <div className="flex items-center gap-2 w-80 justify-end">
          {/* Empty spacer to push volume controls to the right */}
          <div className="flex-1" />

          <button
            onClick={toggleMute}
            className="flex items-center justify-center text-white/70 hover:text-purple-400 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeIcon className="w-5 h-5" />
          </button>

          <div className="w-32 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider w-full h-1 rounded-full appearance-none cursor-pointer"
              aria-label="Volume"
              style={{
                background: `linear-gradient(
                  to right,
                  #8b5cf6 0%,
                  #ec4899 ${volumePercentage * 0.5}%,
                  #ec4899 ${volumePercentage}%,
                  rgba(255, 255, 255, 0.2) ${volumePercentage}%,
                  rgba(255, 255, 255, 0.2) 100%
                )`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
