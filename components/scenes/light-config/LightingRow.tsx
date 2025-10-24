'use client'

import { memo } from 'react'
import { Lightbulb, X } from 'lucide-react'
import type { SceneLightConfig, LightConfig } from '@/types'

interface LightingRowProps {
  sceneLightConfig: SceneLightConfig
  lightConfig: LightConfig | undefined
  onActivate: () => void
  onRemove: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

const LightingRowComponent = ({
  sceneLightConfig,
  lightConfig,
  onActivate,
  onRemove,
  onContextMenu
}: LightingRowProps) => {
  return (
    <div
      onClick={onActivate}
      className={`group transition-colors cursor-pointer border-b border-white/5 last:border-b-0 ${
        sceneLightConfig.is_selected ? 'bg-white/5 hover:bg-white/[0.07]' : 'hover:bg-white/5'
      }`}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center px-3 py-2">
        <div className="flex items-center w-full gap-3">
          <Lightbulb className="w-4 h-4 text-white/60 flex-shrink-0" />
          <span className="flex-1 text-[14px] font-medium text-white truncate">
            {lightConfig?.name || 'Unknown Light'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-[6px] hover:bg-white/10 flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Remove from scene"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const LightingRow = memo(LightingRowComponent)
