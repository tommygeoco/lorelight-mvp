interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="relative h-auto w-full overflow-hidden flex-shrink-0">
      {/* Radial Gradient Background - Full width */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
        <div className="relative w-[640px]">
          {/* Left pink ellipse */}
          <div
            className="absolute"
            style={{
              left: '92.37px',
              top: '-137.19px',
              width: '667.63px',
              height: '160px',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 0) 70%)',
              filter: 'blur(60px)',
            }}
          />
          {/* Right purple ellipse */}
          <div
            className="absolute"
            style={{
              left: '406.07px',
              top: '-137.19px',
              width: '667.63px',
              height: '160px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0) 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>
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