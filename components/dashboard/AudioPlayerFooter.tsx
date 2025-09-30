'use client'

import { Lightbulb, Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useAudioStore } from '@/store/audioStore'
import { useAudioFileStore } from '@/store/audioFileStore'

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

  const { audioFiles } = useAudioFileStore()

  // Get current track info
  const audioFileMap = audioFiles instanceof Map ? audioFiles : new Map()
  const currentTrack = currentTrackId ? audioFileMap.get(currentTrackId) : null

  // Hide footer completely if no track is loaded
  if (!currentTrack) {
    return null
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-6 px-6 py-4">
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
            {currentTrack.name}
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
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Volume Up Icon (decorative) */}
        <button className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors">
          <Volume2 className="w-5 h-5" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 bg-[#eeeeee] rounded-[8px] flex items-center justify-center hover:bg-white transition-colors"
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