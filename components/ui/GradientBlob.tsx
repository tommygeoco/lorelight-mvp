interface GradientBlobProps {
  color: string
  opacity?: number
  blur?: number
  className?: string
  style?: React.CSSProperties
}

export function GradientBlob({
  color,
  opacity = 0.5,
  blur = 60,
  className = '',
  style = {}
}: GradientBlobProps) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        opacity,
        ...style
      }}
    />
  )
}