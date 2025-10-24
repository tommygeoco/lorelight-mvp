import { Plus } from 'lucide-react'

interface AddButtonProps {
  onClick: () => void
  children: React.ReactNode
  fullWidth?: boolean
}

/**
 * Shared Add Button component for consistent "Add X" buttons
 */
export function AddButton({ onClick, children, fullWidth = true }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-[16px] py-[12px] rounded-[12px] bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-colors font-['Inter'] text-[14px] ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      <Plus className="w-4 h-4" />
      {children}
    </button>
  )
}

