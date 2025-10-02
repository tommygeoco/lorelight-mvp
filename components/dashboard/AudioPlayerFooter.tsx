'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Play, Volume1 } from 'lucide-react'
import { useAudioStore } from '@/store/audioStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { formatTime } from '@/lib/utils/time'

export function AudioPlayerFooter() {
  const {
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    currentTrackId,
    togglePlay,
    toggleMute,
    setVolume,
    seek
  } = useAudioStore()

  const audioFileMap = useAudioFileMap()
  const currentTrack = currentTrackId ? audioFileMap.get(currentTrackId) : null

  const [hoveredTime, setHoveredTime] = useState<number | null>(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Generate scene-aware gradient for artwork
  const getSceneGradient = (trackId: string) => {
    // Use trackId to generate consistent but varied gradients
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Warm
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Deep
    ]
    const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return gradients[hash % gradients.length]
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    seek(newTime)
  }

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const time = percentage * duration
    setHoveredTime(time)
  }

  const handleVolumeMouseEnter = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current)
    }
    setShowVolumeSlider(true)
  }

  const handleVolumeMouseLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current)
      }
    }
  }, [])

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1

  return (
    <div className="relative">
      {/* Top gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(139, 92, 246, 0.3) 100%)'
        }}
      />

      <div className="flex items-center gap-6 px-6 py-4 bg-[#111111] backdrop-blur-xl">
        {/* Left: Track Info (25%) */}
        <div className="flex-[0_0_25%] flex items-center gap-3 min-w-0">
          {/* Scene Artwork */}
          <div
            className="relative w-14 h-14 rounded-[8px] shadow-lg flex-shrink-0 overflow-hidden group"
            style={{ background: currentTrack ? getSceneGradient(currentTrack.id) : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}
          >
            {/* Animated glow when playing */}
            {isPlaying && currentTrack && (
              <div
                className="absolute inset-0 opacity-30 animate-pulse"
                style={{ background: getSceneGradient(currentTrack.id), filter: 'blur(8px)' }}
              />
            )}

            {/* Scene badge overlay */}
            {currentTrack && (
              <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm rounded-[4px] px-1.5 py-0.5 text-[10px] font-medium text-white/90 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                Scene Audio
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">
              {currentTrack?.name || 'No track loaded'}
            </div>
            <div className="text-xs font-medium text-white/40 truncate">
              {currentTrack ? 'Ambient Soundscape' : 'Awaiting command...'}
            </div>
          </div>
        </div>

        {/* Center: Playback Controls (50%) */}
        <div className="flex-[0_0_50%] flex flex-col items-center gap-2">
          {/* Play Button + Time */}
          <div className="flex items-center gap-4 w-full justify-center">
            {/* Play/Pause Button - Hero element */}
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-200 group
                ${currentTrack
                  ? 'bg-white hover:bg-white hover:scale-105 active:scale-95 shadow-lg'
                  : 'bg-white/10 cursor-not-allowed'
                }
              `}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {/* Glow effect when playing */}
              {isPlaying && currentTrack && (
                <>
                  <div className="absolute inset-0 rounded-full bg-white opacity-50 blur-xl animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/50 to-pink-500/50 opacity-30 blur-md" />
                </>
              )}

              {isPlaying ? (
                <Pause className="w-5 h-5 text-black relative z-10" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 text-black ml-0.5 relative z-10" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full max-w-2xl">
            {/* Current Time */}
            <div className="text-xs font-medium text-white/50 tabular-nums min-w-[40px] text-right">
              {formatTime(currentTime)}
            </div>

            {/* Progress Track */}
            <div
              ref={progressRef}
              className="relative flex-1 h-2 rounded-full overflow-hidden cursor-pointer group"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoveredTime(null)}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
            >
              {/* Background track */}
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/15 transition-colors" />

              {/* Filled progress with gradient */}
              <div
                className="absolute inset-y-0 left-0 transition-all duration-150"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
                }}
              />

              {/* Scrubber handle (appears on hover) */}
              {currentTrack && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              )}

              {/* Hover time tooltip */}
              {hoveredTime !== null && currentTrack && progressRef.current && (
                <div
                  className="absolute -top-8 bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md pointer-events-none"
                  style={{
                    left: `${((hoveredTime / duration) * 100)}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {formatTime(hoveredTime)}
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="text-xs font-medium text-white/50 tabular-nums min-w-[40px]">
              {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Right: Volume Controls (25%) */}
        <div className="flex-[0_0_25%] flex items-center justify-end gap-4">
          {/* Volume Control */}
          <div
            className="relative flex items-center gap-3"
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
          >
            {/* Mute Button with radial indicator */}
            <button
              onClick={toggleMute}
              className="relative w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors group"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {/* Radial volume indicator arc */}
              {!isMuted && (
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="url(#volumeGradient)"
                    strokeWidth="2"
                    strokeDasharray={`${volume * 100} 100`}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                  <defs>
                    <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              <VolumeIcon className="w-5 h-5 relative z-10" />
            </button>

            {/* Horizontal slider (default, always visible) */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider w-24 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                aria-label="Volume"
                style={{
                  background: `linear-gradient(to right,
                    #8b5cf6 0%,
                    #ec4899 ${(isMuted ? 0 : volume) * 50}%,
                    #ec4899 ${(isMuted ? 0 : volume) * 100}%,
                    rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%,
                    rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>

            {/* Vertical popover slider (appears on hover) */}
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-3 bg-[#191919] border border-white/10 rounded-[8px] p-3 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col items-center gap-2">
                  {/* Volume percentage */}
                  <div className="text-xs font-medium text-white/60 tabular-nums">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </div>

                  {/* Vertical slider */}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider-vertical h-24 w-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    aria-label="Volume"
                    style={{
                      background: `linear-gradient(to top,
                        #8b5cf6 0%,
                        #ec4899 ${(isMuted ? 0 : volume) * 50}%,
                        #ec4899 ${(isMuted ? 0 : volume) * 100}%,
                        rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%,
                        rgba(255,255,255,0.1) 100%)`,
                      WebkitAppearance: 'slider-vertical',
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: transform 0.15s ease;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: transform 0.15s ease;
        }

        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }

        .volume-slider-vertical::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}
