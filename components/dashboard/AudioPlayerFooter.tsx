'use client'

import { useRef } from 'react'
import { Volume2, VolumeX, Pause, Play, Volume1, SkipBack, SkipForward } from 'lucide-react'
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

  const progressRef = useRef<HTMLDivElement>(null)

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Generate scene-aware gradient for artwork
  const getSceneGradient = (trackId: string) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
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


  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1

  return (
    <div
      className="relative bg-[#111111] flex items-center px-4 pt-5 pb-6 overflow-hidden"
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
        <div className="flex items-center gap-3 min-w-0 w-64">
          {/* Artwork with purple accent */}
          <div className="relative">
            <div
              className={`
                w-14 h-14 rounded-md flex-shrink-0 relative group overflow-hidden shadow-lg
                transition-all duration-300
                ${isPlaying && currentTrack ? 'ring-2 ring-purple-500/50' : ''}
              `}
              style={{
                background: currentTrack
                  ? getSceneGradient(currentTrack.id)
                  : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
              }}
            >
              {/* Subtle pulse when playing */}
              {isPlaying && currentTrack && (
                <div
                  className="absolute inset-0 opacity-20 animate-pulse"
                  style={{ background: getSceneGradient(currentTrack.id) }}
                />
              )}
            </div>

            {/* Animated equalizer bars when playing */}
            {isPlaying && currentTrack && (
              <div className="absolute -bottom-1 -right-1 flex items-end gap-0.5 bg-black/80 backdrop-blur-sm rounded-md px-1 py-0.5">
                <div className="w-0.5 bg-purple-500 rounded-full animate-equalizer-1" style={{ height: '8px' }} />
                <div className="w-0.5 bg-purple-500 rounded-full animate-equalizer-2" style={{ height: '12px' }} />
                <div className="w-0.5 bg-purple-500 rounded-full animate-equalizer-3" style={{ height: '6px' }} />
              </div>
            )}
          </div>

          {/* Track Details */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">
              {currentTrack?.name || 'No track loaded'}
            </div>
            <div className="text-xs text-white/40 truncate">
              {currentTrack ? (
                <span className="flex items-center gap-1">
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
            {/* Skip Back (disabled for now) */}
            <button
              disabled
              className="w-8 h-8 flex items-center justify-center text-white/20 cursor-not-allowed transition-colors hover:text-purple-500/30"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4" fill="currentColor" />
            </button>

            {/* Play/Pause with purple glow when active */}
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
            <button
              disabled
              className="w-8 h-8 flex items-center justify-center text-white/20 cursor-not-allowed transition-colors hover:text-purple-500/30"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4" fill="currentColor" />
            </button>
          </div>

          {/* Progress Bar with purple gradient */}
          <div className="flex items-center gap-2 w-full">
            <div className="text-xs text-white/50 tabular-nums w-10 text-right font-mono">
              {formatTime(currentTime)}
            </div>

            <div
              ref={progressRef}
              className="relative flex-1 h-1 rounded-full bg-white/10 cursor-pointer group overflow-visible"
              onClick={handleProgressClick}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
            >
              {/* Purple glow underneath */}
              {currentTrack && progress > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50 transition-all duration-150"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
                  }}
                />
              )}

              {/* Filled progress with purple gradient */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
                style={{
                  width: `${progress}%`,
                  background: currentTrack
                    ? 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)'
                    : 'white',
                }}
              />

              {/* Shimmer effect when playing */}
              {isPlaying && currentTrack && progress > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div
                    className="absolute inset-0 shimmer-effect"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    }}
                  />
                </div>
              )}

              {/* Hover scrubber with purple glow */}
              {currentTrack && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `calc(${progress}% - 6px)` }}
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
        <div className="flex items-center gap-2 w-32 justify-end">
          <button
            onClick={toggleMute}
            className="flex items-center justify-center text-white/70 hover:text-purple-400 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider w-full h-1 rounded-full appearance-none cursor-pointer"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .volume-slider {
          background: linear-gradient(
            to right,
            #8b5cf6 0%,
            #ec4899 ${(isMuted ? 0 : volume) * 50}%,
            #ec4899 ${(isMuted ? 0 : volume) * 100}%,
            rgba(255, 255, 255, 0.2) ${(isMuted ? 0 : volume) * 100}%,
            rgba(255, 255, 255, 0.2) 100%
          );
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0),
                      0 1px 3px rgba(0, 0, 0, 0.5);
          transition: all 0.2s ease;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 8px 2px rgba(139, 92, 246, 0.5),
                      0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0),
                      0 1px 3px rgba(0, 0, 0, 0.5);
          transition: all 0.2s ease;
        }

        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 8px 2px rgba(139, 92, 246, 0.5),
                      0 1px 3px rgba(0, 0, 0, 0.5);
        }

        @keyframes equalizer-1 {
          0%, 100% { height: 8px; }
          50% { height: 14px; }
        }

        @keyframes equalizer-2 {
          0%, 100% { height: 12px; }
          50% { height: 6px; }
        }

        @keyframes equalizer-3 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        .animate-equalizer-1 {
          animation: equalizer-1 0.8s ease-in-out infinite;
        }

        .animate-equalizer-2 {
          animation: equalizer-2 0.9s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        .animate-equalizer-3 {
          animation: equalizer-3 0.7s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        .shimmer-effect {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
