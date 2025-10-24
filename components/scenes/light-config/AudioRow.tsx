'use client'

import { memo } from 'react'
import { Play, Pause, X } from 'lucide-react'
import type { SceneAudioFile, AudioFile } from '@/types'
import { formatTime } from '@/lib/utils/time'
import { useAudioPlayback } from '@/hooks/useAudioPlayback'

interface AudioRowProps {
  sceneAudioFile: SceneAudioFile
  audioFile: AudioFile | undefined
  isPlaying: boolean
  onPlay: () => void
  onRemove: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

const AudioRowComponent = ({
  sceneAudioFile,
  audioFile,
  onRemove,
  onContextMenu
}: AudioRowProps) => {
  const { handlePlay, currentTrackId, isPlaying } = useAudioPlayback({
    type: 'audio',
    id: audioFile?.id || '',
    name: audioFile?.name || ''
  })
  const isCurrentlyPlaying = currentTrackId === audioFile?.id && isPlaying

  const onPlayClick = async () => {
    if (audioFile) {
      handlePlay(audioFile)
      
      // When user plays audio, mark it as selected (becomes default)
      if (!sceneAudioFile.is_selected) {
        const { useSceneAudioFileStore } = await import('@/store/sceneAudioFileStore')
        await useSceneAudioFileStore.getState().setSelectedAudioFile(
          sceneAudioFile.scene_id,
          sceneAudioFile.id
        )
      }
    }
  }

  return (
    <div
      data-audio-row
      className={`group transition-colors cursor-pointer border-b border-white/5 ${
        isCurrentlyPlaying
          ? 'playing-track-gradient active'
          : sceneAudioFile.is_selected
          ? 'bg-white/5 hover:bg-white/[0.07]'
          : 'hover:bg-white/5'
      }`}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center px-3 py-2">
        <div className="flex items-center w-full">
          {/* Play/Pause Button with Visualizer - show bars when playing, pause on hover */}
          <div className="flex items-center w-[24px] h-4 justify-center relative flex-shrink-0">
            {/* Visualizer Bars - visible when playing and NOT hovering */}
            {isCurrentlyPlaying && (
              <div className="absolute flex items-center gap-0.5 h-4 group-hover:opacity-0 transition-opacity duration-200">
                <div className="visualizer-bar active" />
                <div className="visualizer-bar active" />
                <div className="visualizer-bar active" />
              </div>
            )}

            {/* Play/Pause Button - visible on hover or when not playing */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPlayClick()
              }}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white/50 hover:text-white transition-all ${
                isCurrentlyPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}
              title="Play/Pause"
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-4 h-4 fill-current icon-playing-glow" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>
          </div>

          {/* Track Name */}
          <div className="flex-1 text-left ml-6 min-w-0">
            <div className="text-[14px] font-medium text-white truncate">
              {audioFile?.name || 'Unknown Audio'}
            </div>
          </div>

          {/* Duration */}
          <div className="w-16 text-right">
            <div className="text-[13px] text-white/60">
              {audioFile?.duration ? formatTime(audioFile.duration) : '--:--'}
            </div>
          </div>

          {/* Tags */}
          <div className="w-32 text-right">
            <div className="text-[13px] text-white/60 truncate">
              {audioFile?.tags && audioFile.tags.length > 0 ? audioFile.tags.join(', ') : ''}
            </div>
          </div>

          {/* Remove button - shows on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-all flex-shrink-0 ml-2"
            aria-label="Remove from scene"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const AudioRow = memo(AudioRowComponent)
