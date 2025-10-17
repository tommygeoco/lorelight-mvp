'use client'

/**
 * GradientBlob - Reusable animated gradient blob component
 * Used to create dynamic, responsive gradient effects that respond to scene/light changes
 */

import { useEffect, useState } from 'react'

export interface GradientBlobProps {
  /** Color of the gradient blob (rgba string) */
  color: string
  /** Left position as percentage (e.g., "25%") */
  left: string
  /** Top position as percentage (e.g., "0%") */
  top: string
  /** Width of the ellipse in pixels */
  width: number
  /** Height of the ellipse in pixels */
  height: number
  /** Blur amount in pixels */
  blur: number
  /** Rotation angle in degrees */
  rotation?: number
  /** Animation delay in milliseconds for staggered effects */
  animationDelay?: number
}

export function GradientBlob({
  color,
  left,
  top,
  width,
  height,
  blur,
  rotation = 0,
  animationDelay = 0,
}: GradientBlobProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevColor, setPrevColor] = useState(color)

  // Detect color changes and trigger pulse animation
  useEffect(() => {
    if (color !== prevColor) {
      setPrevColor(color)
      setIsAnimating(true)
      
      // Reset animation state after pulse completes
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [color, prevColor])

  return (
    <div
      className="absolute transition-all ease-in-out pointer-events-none"
      style={{
        left,
        top,
        width: '100%',
        height: '100%',
        transitionDuration: `${1500 + animationDelay}ms`,
        transitionDelay: `${animationDelay}ms`,
      }}
    >
      <div
        className="w-full h-full transition-all ease-in-out"
        style={{
          background: `radial-gradient(ellipse ${width}px ${height}px at center top, ${color} 0%, transparent 70%)`,
          filter: `blur(${blur}px)`,
          transform: `rotate(${rotation}deg) scale(${isAnimating ? 1.05 : 1})`,
          opacity: isAnimating ? 1 : 0.9,
          transitionDuration: isAnimating ? '400ms' : '800ms',
          transitionDelay: `${animationDelay}ms`,
        }}
      />
    </div>
  )
}

