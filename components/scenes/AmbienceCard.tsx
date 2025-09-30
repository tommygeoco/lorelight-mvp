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
    <div className="bg-[var(--card-surface)] rounded-[24px] relative overflow-hidden shadow-lg h-[164px]">
      {/* Gradient decorations for lighting */}
      {isLighting && (
        <>
          <div
            className="absolute w-[250.43px] h-[200.85px] -top-[45.5px] left-[146.45px] opacity-100 mix-blend-screen blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)' }}
          />
          <div
            className="absolute w-[250.43px] h-[200.85px] -top-[45.5px] left-[236.47px] opacity-100 mix-blend-screen blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%)' }}
          />
        </>
      )}

      {/* Audio background */}
      {!isLighting && thumbnail && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 to-blue-600/40 rounded-[24px]" />
          <div className="absolute inset-0 backdrop-blur-[50px] bg-white/[0.01]" />
        </>
      )}

      {/* Content with 16px padding */}
      <div className="relative p-4 flex flex-col h-full">
        {/* Thumbnail - 64x64 at top */}
        {thumbnail ? (
          <div
            className="w-16 h-16 rounded-[24px] shadow-md bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
        ) : (
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-md flex-shrink-0" />
        )}

        {/* Content - 104px from top (16px padding + 64px thumbnail + 24px gap) */}
        <div className="mt-6">
          <div className="font-bold text-white text-base truncate">
            {title}
          </div>
          <div className="font-medium text-white/70 mix-blend-overlay truncate">
            {subtitle}
          </div>
        </div>

        {/* Icon - absolute at top-right with 16px padding */}
        {isLighting ? (
          <Lightbulb className="absolute top-4 right-4 w-[18px] h-[18px] text-white/40" />
        ) : (
          <Music className="absolute top-4 right-4 w-[18px] h-[18px] text-white/40" />
        )}
      </div>
    </div>
  )
}