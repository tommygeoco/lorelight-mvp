'use client'

import { Lightbulb, Music } from 'lucide-react'

interface AmbienceCardProps {
  type: 'lighting' | 'audio'
  title: string
  subtitle: string
  thumbnail?: string
}

export function AmbienceCard({ type, title, subtitle, thumbnail }: AmbienceCardProps) {
  const isLighting = type === 'lighting'

  return (
    <div className="bg-[#222222] rounded-xl p-4 relative overflow-hidden shadow-lg">
      {/* Gradient decorations for lighting */}
      {isLighting && (
        <>
          <div
            className="absolute w-40 h-40 -top-11 right-8 opacity-30 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)' }}
          />
          <div
            className="absolute w-40 h-40 -top-11 left-8 opacity-30 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)' }}
          />
        </>
      )}

      {/* Audio background */}
      {!isLighting && thumbnail && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 to-blue-600/40 rounded-xl" />
          <div className="absolute inset-0 backdrop-blur-[50px] bg-white/[0.01]" />
        </>
      )}

      <div className={isLighting ? '' : 'relative'}>
        {/* Thumbnail */}
        {thumbnail ? (
          <div
            className="w-16 h-16 rounded-md mb-6 shadow-md bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
        ) : (
          <div className="w-16 h-16 rounded-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6 shadow-md" />
        )}

        {/* Content */}
        <div className="space-y-1.5">
          <div className="font-bold text-white text-base truncate">
            {title}
          </div>
          <div className="font-medium text-sm text-white/70 mix-blend-overlay truncate">
            {subtitle}
          </div>
        </div>

        {/* Icon */}
        {isLighting ? (
          <Lightbulb className="absolute top-4 right-4 w-[18px] h-[18px] text-white/40" />
        ) : (
          <Music className="absolute top-4 right-4 w-[18px] h-[18px] text-white/40" />
        )}
      </div>
    </div>
  )
}