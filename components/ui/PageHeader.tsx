interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="relative h-auto w-full overflow-hidden flex-shrink-0">
      {/* Radial Gradient Background - Full width */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Pink gradient - left side */}
        <div
          className="absolute"
          style={{
            left: '0',
            top: '-100px',
            width: '100%',
            height: '300px',
            background: 'radial-gradient(ellipse 800px 200px at 25% 0%, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Purple gradient - right side */}
        <div
          className="absolute"
          style={{
            left: '0',
            top: '-100px',
            width: '100%',
            height: '300px',
            background: 'radial-gradient(ellipse 800px 200px at 75% 0%, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Title - 640px wide centered */}
      <div className="relative w-[640px] mx-auto pt-24">
        <h1
          className="text-[60px] font-normal text-white tracking-[-1.2px]"
          style={{ fontFamily: '"PP Mondwest", sans-serif' }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-[#eeeeee] font-normal mt-1 whitespace-pre-line">
            {description}
          </p>
        )}
      </div>
    </header>
  )
}