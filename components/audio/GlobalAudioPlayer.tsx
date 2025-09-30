'use client'

import { Lightbulb, Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useState } from 'react'

export function GlobalAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress] = useState(42) // 0-100, will be dynamic later

  // Mock data - will be replaced with actual audio store
  const currentTrack = {
    title: 'Ambush in the Night',
    type: 'Encounter',
    currentTime: '1:24',
    duration: '3:48',
    thumbnail: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111111] z-50">
      <div className="flex items-center gap-6 px-6 py-4">
        {/* Left: Track Info */}
        <div className="flex-1 flex items-center gap-2">
          {/* Lighting Icon */}
          <div className="relative w-12 h-12 bg-white/[0.07] rounded-[24px] flex items-center justify-center overflow-hidden">
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
            className="w-12 h-12 rounded-[24px] shadow-lg"
            style={{ background: currentTrack.thumbnail }}
          />

          {/* Track Info */}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-[#eeeeee]">
              {currentTrack.title}
            </div>
            <div className="text-xs font-medium text-[#7b7b7b]">
              {currentTrack.type}
            </div>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {/* Current Time */}
          <div className="text-sm font-medium text-[#7b7b7b]">
            {currentTrack.currentTime}
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md h-[5px] rounded-full overflow-hidden flex">
            <div
              className="bg-white transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            <div className="bg-white/20 flex-1" />
          </div>

          {/* Duration */}
          <div className="text-sm font-medium text-[#7b7b7b]">
            {currentTrack.duration}
          </div>
        </div>

        {/* Right: Volume & Play Controls */}
        <div className="flex-1 flex items-center justify-end gap-6">
          {/* Speaker Icon */}
          <button
            onClick={() => setIsMuted(!isMuted)}
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
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 bg-[#eeeeee] rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-[18px] h-[18px] text-black" />
            ) : (
              <Play className="w-[18px] h-[18px] text-black ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}