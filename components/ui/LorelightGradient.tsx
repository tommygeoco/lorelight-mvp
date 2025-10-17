'use client'

/**
 * Lorelight Gradient - Dynamic header gradients that respond to active scene lighting
 * Gradient variation randomizes on each color change for delightful variety
 */

import { useEffect, useState, useRef } from 'react'
import { useActiveSceneGradient } from '@/hooks/useActiveSceneGradient'
import { getCurrentVariation, randomizeVariation } from '@/lib/utils/gradientVariations'
import { GradientBlob } from './GradientBlob'

// Default Lorelight colors (purple/pink)
const DEFAULT_COLOR_1 = 'rgba(236, 72, 153, 0.4)' // Pink
const DEFAULT_COLOR_2 = 'rgba(139, 92, 246, 0.4)' // Purple

/**
 * Lorelight Gradient Component
 * Renders multiple gradient blobs that randomize on color changes
 * All pages share the same variation until colors change
 */
export function LorelightGradient() {
  const sceneColors = useActiveSceneGradient()
  const [variation, setVariation] = useState(getCurrentVariation())
  const prevColorsRef = useRef<string | null>(null)

  // Use scene colors if available, otherwise default
  const color1 = sceneColors?.color1 ?? DEFAULT_COLOR_1
  const color2 = sceneColors?.color2 ?? DEFAULT_COLOR_2

  // Detect color changes and randomize variation
  useEffect(() => {
    const currentColors = `${color1}|${color2}`
    
    if (prevColorsRef.current !== null && prevColorsRef.current !== currentColors) {
      // Colors changed - randomize the variation
      randomizeVariation()
      setVariation(getCurrentVariation())
    }
    
    prevColorsRef.current = currentColors
  }, [color1, color2])

  // For variations with more than 2 blobs, we need to distribute colors
  // We'll alternate between color1 and color2
  const getColorForBlob = (index: number): string => {
    if (index === 0) return color1
    if (index === 1) return color2
    
    // For additional blobs, alternate between the two colors
    return index % 2 === 0 ? color1 : color2
  }

  return (
    <div 
      className="absolute left-0 right-0 pointer-events-none" 
      style={{ top: '-100px', height: '300px' }}
    >
      {variation.blobs.map((blob, index) => (
        <GradientBlob
          key={index}
          color={getColorForBlob(index)}
          left={blob.left}
          top={blob.top}
          width={blob.width}
          height={blob.height}
          blur={blob.blur}
          rotation={blob.rotation}
          animationDelay={blob.animationDelay}
        />
      ))}
    </div>
  )
}
