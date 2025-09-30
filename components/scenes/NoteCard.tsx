'use client'

interface NoteCardProps {
  title: string
  content: string
  className?: string
}

export function NoteCard({ title, content, className = '' }: NoteCardProps) {
  return (
    <div
      className={`bg-[var(--card-surface)] rounded-[24px] p-4 h-[169px] shadow-lg overflow-hidden ${className}`}
    >
      <div className="font-bold text-white text-base mb-2 line-clamp-2">
        {title}
      </div>
      <div className="text-xs text-[#b4b4b4] font-medium line-clamp-6">
        {content}
      </div>
    </div>
  )
}