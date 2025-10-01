'use client'

import { ReactNode } from 'react'

interface SidebarButton {
  icon: ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
}

interface DashboardSidebarProps {
  buttons: SidebarButton[]
}

export function DashboardSidebar({ buttons }: DashboardSidebarProps) {
  return (
    <nav className="h-full" aria-label="Main navigation">
      <div className="bg-[#191919] rounded-[8px] p-2 h-full flex flex-col gap-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`w-10 h-10 rounded-[8px] flex items-center justify-center transition-colors ${
              button.isActive
                ? 'bg-white/[0.07] hover:bg-white/10'
                : 'hover:bg-white/5'
            }`}
            aria-label={button.label}
          >
            {button.icon}
          </button>
        ))}
      </div>
    </nav>
  )
}
