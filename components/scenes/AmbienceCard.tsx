import { Lightbulb, Music, LucideIcon } from 'lucide-react'

interface AmbienceCardProps {
  variant: 'lighting' | 'audio'
  title: string
  subtitle: string
  hasConfig: boolean
  onClick: () => void
  icon?: LucideIcon
}

/**
 * AmbienceCard - Clickable card for audio/lighting configuration
 * Context7: Figma design with gradient background and icon overlay
 */
export function AmbienceCard({
  variant,
  title,
  subtitle,
  hasConfig,
  onClick,
  icon: CustomIcon
}: AmbienceCardProps) {
  const Icon = CustomIcon || (variant === 'lighting' ? Lightbulb : Music)

  return (
    <button
      onClick={onClick}
      className="basis-0 grow min-w-px bg-[#222222] rounded-[12px] p-[16px] shadow-md relative overflow-hidden cursor-pointer hover:bg-[#252525] transition-colors text-left"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        {variant === 'lighting' && (
          <div className="absolute left-[146px] top-[-45px] w-[250px] h-[200px]">
            <div className="w-full h-full rounded-full bg-purple-400/20 blur-[80px]" />
          </div>
        )}
        {variant === 'audio' && hasConfig && (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-800/20 backdrop-blur-[50px]" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-[24px]">
        {/* Icon placeholder */}
        <div className="w-[64px] h-[64px] bg-white/5 rounded-[6px] shadow-lg" />

        {/* Text */}
        <div className="flex flex-col gap-[6px]">
          <h3 className="font-['Inter'] text-[16px] font-bold leading-[24px] text-white truncate">
            {title}
          </h3>
          <p className="font-['Inter'] text-[14px] font-medium leading-[20px] text-white/60 truncate">
            {subtitle}
          </p>
        </div>

        {/* Icon indicator */}
        <div className="absolute right-[16px] top-[16px] opacity-40">
          <Icon className="w-[18px] h-[18px] text-white" />
        </div>
      </div>
    </button>
  )
}
