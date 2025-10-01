import { ReactNode } from 'react'
import { AudioPlayerFooter } from '@/components/dashboard/AudioPlayerFooter'

interface DashboardLayoutWithSidebarProps {
  navSidebar: ReactNode
  contentSidebar?: ReactNode
  children: ReactNode
}

export function DashboardLayoutWithSidebar({
  navSidebar,
  contentSidebar,
  children
}: DashboardLayoutWithSidebarProps) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Padded wrapper for sidebars and main */}
      <div className="flex-1 bg-[#111111] p-2 flex gap-2 overflow-hidden">
        {/* Left nav sidebar - 56px wide */}
        <div style={{ width: '56px' }} className="h-full">
          {navSidebar}
        </div>

        {/* Optional content sidebar (scenes list) - 320px wide */}
        {contentSidebar && (
          <div style={{ width: '320px' }} className="h-full">
            {contentSidebar}
          </div>
        )}

        {/* Main content - scrollable */}
        <main className="flex-1 bg-[#191919] rounded-[8px] overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Audio footer */}
      <div className="flex-shrink-0">
        <AudioPlayerFooter />
      </div>
    </div>
  )
}
