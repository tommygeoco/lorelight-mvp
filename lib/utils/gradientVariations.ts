/**
 * Gradient Variation System
 * Defines unique gradient configurations for different pages
 * Each configuration creates a distinct visual character
 */

export interface BlobConfig {
  left: string
  top: string
  width: number
  height: number
  blur: number
  rotation: number
  animationDelay: number
}

export interface GradientVariation {
  name: string
  description: string
  blobs: BlobConfig[]
}

/**
 * Predefined gradient variations
 * Each creates a unique visual character for different pages
 */
const gradientVariations: GradientVariation[] = [
  // 0. Wide Horizontal Spread - Expansive feel
  {
    name: 'Expansive',
    description: 'Wide, horizontal spread - feels open and expansive',
    blobs: [
      { left: '15%', top: '-50px', width: 1400, height: 280, blur: 70, rotation: 0, animationDelay: 0 },
      { left: '60%', top: '-30px', width: 1300, height: 260, blur: 65, rotation: 0, animationDelay: 100 },
    ],
  },

  // 1. Diagonal Cluster - Dynamic storytelling
  {
    name: 'Dynamic',
    description: 'Diagonal cluster - dynamic and storytelling',
    blobs: [
      { left: '20%', top: '-60px', width: 1100, height: 320, blur: 60, rotation: 25, animationDelay: 0 },
      { left: '45%', top: '-40px', width: 1000, height: 300, blur: 55, rotation: 20, animationDelay: 100 },
      { left: '65%', top: '-20px', width: 900, height: 280, blur: 50, rotation: 15, animationDelay: 200 },
    ],
  },

  // 2. Vertical Emphasis - Theatrical lighting
  {
    name: 'Theatrical',
    description: 'Vertical emphasis - theatrical stage lighting',
    blobs: [
      { left: '25%', top: '-80px', width: 800, height: 400, blur: 65, rotation: 0, animationDelay: 0 },
      { left: '50%', top: '-70px', width: 850, height: 420, blur: 70, rotation: 0, animationDelay: 100 },
      { left: '70%', top: '-60px', width: 780, height: 380, blur: 60, rotation: 0, animationDelay: 200 },
    ],
  },

  // 3. Tight Central Cluster - Focused control
  {
    name: 'Focused',
    description: 'Tight central cluster - precise control',
    blobs: [
      { left: '35%', top: '-40px', width: 900, height: 260, blur: 50, rotation: 0, animationDelay: 0 },
      { left: '45%', top: '-50px', width: 920, height: 270, blur: 52, rotation: 0, animationDelay: 100 },
      { left: '55%', top: '-45px', width: 880, height: 255, blur: 48, rotation: 0, animationDelay: 200 },
      { left: '65%', top: '-35px', width: 900, height: 265, blur: 51, rotation: 0, animationDelay: 300 },
    ],
  },

  // 4. Balanced Wide - Stable planning view
  {
    name: 'Balanced',
    description: 'Balanced wide spread - stable and organized',
    blobs: [
      { left: '20%', top: '-40px', width: 1300, height: 300, blur: 65, rotation: 0, animationDelay: 0 },
      { left: '65%', top: '-40px', width: 1300, height: 300, blur: 65, rotation: 0, animationDelay: 100 },
    ],
  },

  // 5. Layered Cascade - Depth and movement
  {
    name: 'Cascade',
    description: 'Layered cascade - sense of depth',
    blobs: [
      { left: '10%', top: '-70px', width: 1200, height: 350, blur: 75, rotation: 10, animationDelay: 0 },
      { left: '40%', top: '-50px', width: 1100, height: 320, blur: 65, rotation: 5, animationDelay: 100 },
      { left: '70%', top: '-30px', width: 1000, height: 290, blur: 55, rotation: 0, animationDelay: 200 },
    ],
  },

  // 6. Asymmetric Bold - Creative energy
  {
    name: 'Bold',
    description: 'Asymmetric bold - creative and energetic',
    blobs: [
      { left: '15%', top: '-60px', width: 1500, height: 340, blur: 70, rotation: -15, animationDelay: 0 },
      { left: '70%', top: '-30px', width: 1000, height: 250, blur: 55, rotation: 10, animationDelay: 100 },
    ],
  },

  // 7. Radial Burst - Central focus
  {
    name: 'Radial',
    description: 'Radial burst from center - attention grabbing',
    blobs: [
      { left: '40%', top: '-50px', width: 1200, height: 320, blur: 60, rotation: 0, animationDelay: 0 },
      { left: '48%', top: '-60px', width: 1000, height: 280, blur: 55, rotation: 45, animationDelay: 100 },
      { left: '56%', top: '-40px', width: 1100, height: 300, blur: 58, rotation: 90, animationDelay: 200 },
    ],
  },

  // 8. Gentle Flow - Calm and serene
  {
    name: 'Serene',
    description: 'Gentle flowing - calm and peaceful',
    blobs: [
      { left: '25%', top: '-35px', width: 1400, height: 260, blur: 80, rotation: 5, animationDelay: 0 },
      { left: '55%', top: '-45px', width: 1350, height: 270, blur: 75, rotation: -5, animationDelay: 100 },
    ],
  },

  // 9. Sharp Contrast - Modern and edgy
  {
    name: 'Edgy',
    description: 'Sharp contrast - modern aesthetic',
    blobs: [
      { left: '20%', top: '-55px', width: 950, height: 300, blur: 45, rotation: 30, animationDelay: 0 },
      { left: '50%', top: '-65px', width: 1000, height: 320, blur: 50, rotation: -20, animationDelay: 100 },
      { left: '75%', top: '-45px', width: 920, height: 290, blur: 48, rotation: 15, animationDelay: 200 },
    ],
  },

  // 10. Scattered Stars - Playful and varied
  {
    name: 'Playful',
    description: 'Scattered pattern - playful variety',
    blobs: [
      { left: '15%', top: '-50px', width: 900, height: 280, blur: 55, rotation: 20, animationDelay: 0 },
      { left: '42%', top: '-60px', width: 850, height: 260, blur: 52, rotation: -15, animationDelay: 100 },
      { left: '68%', top: '-40px', width: 920, height: 290, blur: 58, rotation: 10, animationDelay: 200 },
      { left: '85%', top: '-55px', width: 800, height: 250, blur: 50, rotation: -5, animationDelay: 300 },
    ],
  },

  // 11. Minimal Duo - Clean simplicity
  {
    name: 'Minimal',
    description: 'Minimal two-blob - clean and simple',
    blobs: [
      { left: '30%', top: '-45px', width: 1100, height: 290, blur: 60, rotation: 0, animationDelay: 0 },
      { left: '60%', top: '-45px', width: 1100, height: 290, blur: 60, rotation: 0, animationDelay: 100 },
    ],
  },

  // 12. Dramatic Sweep - Cinematic feel
  {
    name: 'Cinematic',
    description: 'Dramatic sweep - cinematic quality',
    blobs: [
      { left: '10%', top: '-70px', width: 1600, height: 360, blur: 75, rotation: 20, animationDelay: 0 },
      { left: '55%', top: '-40px', width: 1200, height: 300, blur: 65, rotation: -10, animationDelay: 100 },
    ],
  },

  // 13. Organic Cluster - Natural feel
  {
    name: 'Organic',
    description: 'Organic cluster - natural arrangement',
    blobs: [
      { left: '28%', top: '-55px', width: 1150, height: 310, blur: 62, rotation: 8, animationDelay: 0 },
      { left: '48%', top: '-48px', width: 1050, height: 290, blur: 58, rotation: -12, animationDelay: 100 },
      { left: '65%', top: '-60px', width: 1100, height: 300, blur: 60, rotation: 5, animationDelay: 200 },
    ],
  },

  // 14. Wide Arc - Embracing layout
  {
    name: 'Embracing',
    description: 'Wide arc - welcoming embrace',
    blobs: [
      { left: '8%', top: '-50px', width: 1250, height: 320, blur: 68, rotation: 15, animationDelay: 0 },
      { left: '48%', top: '-60px', width: 1350, height: 340, blur: 72, rotation: 0, animationDelay: 100 },
      { left: '80%', top: '-45px', width: 1200, height: 310, blur: 65, rotation: -15, animationDelay: 200 },
    ],
  },
]

/**
 * Current variation index - shared across all pages
 * Randomizes on color changes
 */
let currentVariationIndex = 0

/**
 * Randomize the gradient variation
 * Called when gradient colors change
 */
export function randomizeVariation(): void {
  currentVariationIndex = Math.floor(Math.random() * gradientVariations.length)
}

/**
 * Get the current gradient variation
 * All pages use the same variation until it's randomized again
 */
export function getCurrentVariation(): GradientVariation {
  return gradientVariations[currentVariationIndex]
}

/**
 * Get all available variations (for design system preview)
 */
export function getAllGradientVariations(): GradientVariation[] {
  return gradientVariations
}

