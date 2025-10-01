interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="relative h-auto w-full overflow-visible flex-shrink-0">
      {/* Radial Gradient Background - Extends beyond container */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: '200vw', top: '-100px', height: '300px' }}>
        {/* Pink gradient - left side */}
        <div
          className="absolute"
          style={{
            left: '25%',
            top: '0',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse 1200px 300px at center top, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Purple gradient - right side */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '0',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse 1200px 300px at center top, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
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