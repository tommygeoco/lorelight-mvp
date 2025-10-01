'use client'

import { Lightbulb, Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useAudioStore } from '@/store/audioStore'
import { useAudioFileMap } from '@/hooks/useAudioFileMap'
import { formatTime } from '@/lib/utils/time'

export function AudioPlayerFooter() {
  const {
    isPlaying,
    isMuted,
    currentTime,
    duration,
    currentTrackId,
    togglePlay,
    toggleMute
  } = useAudioStore()

  const audioFileMap = useAudioFileMap()
  const currentTrack = currentTrackId ? audioFileMap.get(currentTrackId) : null

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-6 px-6 pt-2 pb-4 bg-[#111111]">
      {/* Left: Track Info */}
      <div className="flex-1 flex items-center gap-2">
        {/* Lighting Icon */}
        <div className="relative w-12 h-12 bg-white/[0.07] rounded-[8px] flex items-center justify-center overflow-hidden">
          {/* Gradient background effects */}
          <div
            className="absolute w-14 h-14 -left-7 top-3 mix-blend-screen blur-md"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)' }}
          />
          <div
            className="absolute w-14 h-14 -left-7 -top-7 mix-blend-screen blur-md"
            style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)' }}
          />
          <Lightbulb className="w-[18px] h-[18px] text-white/70 relative z-10" />
        </div>

        {/* Scene Thumbnail */}
        <div
          className="w-12 h-12 rounded-[8px] shadow-lg"
          style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
        />

        {/* Track Info */}
        <div className="flex flex-col">
          <div className="text-sm font-medium text-[#eeeeee]">
            {currentTrack?.name || 'No track loaded'}
          </div>
          <div className="text-xs font-medium text-[#7b7b7b]">
            Audio Track
          </div>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex-1 flex items-center justify-center gap-4">
        {/* Current Time */}
        <div className="text-sm font-medium text-[#7b7b7b]">
          {formatTime(currentTime)}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md h-[5px] rounded-[8px] overflow-hidden flex">
          <div
            className="bg-white transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
          <div className="bg-white/20 flex-1" />
        </div>

        {/* Duration */}
        <div className="text-sm font-medium text-[#7b7b7b]">
          {formatTime(duration)}
        </div>
      </div>

      {/* Right: Volume & Play Controls */}
      <div className="flex-1 flex items-center justify-end gap-6">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Volume Up Icon (decorative) */}
        <button
          className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Volume up"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 bg-[#eeeeee] rounded-[8px] flex items-center justify-center hover:bg-white transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-[18px] h-[18px] text-black" />
          ) : (
            <Play className="w-[18px] h-[18px] text-black ml-0.5" />
          )}
        </button>
      </div>
    </div>
  )
}