'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, Hash, Sparkles, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ColorPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  initialColor?: string // hex color
  initialBrightness?: number // 0-254
  hasColorSupport?: boolean // True if RGB supported, false for CT-only
  onApply: (color: { hex: string; xy: [number, number]; bri: number }) => Promise<void>
}

// Convert hex to Hue XY color space (CIE 1931)
function hexToXY(hex: string): [number, number] {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  // Gamma correction
  const red = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  const green = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  const blue = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  // Convert to XYZ using Wide RGB D65
  const X = red * 0.664511 + green * 0.154324 + blue * 0.162028
  const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685
  const Z = red * 0.000088 + green * 0.072310 + blue * 0.986039

  // Calculate xy
  const sum = X + Y + Z
  if (sum === 0) return [0, 0]

  const x = X / sum
  const y = Y / sum

  // Clamp to Hue gamut
  return [
    Math.max(0, Math.min(1, x)),
    Math.max(0, Math.min(1, y))
  ]
}


export function ColorPickerModal({
  open,
  onOpenChange,
  entityName,
  initialColor = '895EFF',
  initialBrightness = 254,
  hasColorSupport = true,
  onApply
}: ColorPickerModalProps) {
  const [hexColor, setHexColor] = useState(initialColor.replace('#', '').toUpperCase())
  const [brightness, setBrightness] = useState(initialBrightness)
  const [pickerPosition, setPickerPosition] = useState({ x: 0.3, y: 0.3 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)

  // Draw color wheel (only if RGB supported)
  useEffect(() => {
    if (!hasColorSupport) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set actual drawing dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2

    // Create gradient color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 90) * Math.PI / 180
      const endAngle = (angle - 89) * Math.PI / 180

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, 'white')
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`)

      ctx.fillStyle = gradient
      ctx.fill()
    }
  }, [open, hasColorSupport])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Normalize to 0-1 range
    const normalizedX = x / rect.width
    const normalizedY = y / rect.height

    setPickerPosition({ x: normalizedX, y: normalizedY })

    // Get color from canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(x, y, 1, 1)
    const [r, g, b] = imageData.data

    const hex = [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
    setHexColor(hex)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    handleCanvasClick(e)
  }, [handleCanvasClick])

  const handleHexInput = (value: string) => {
    // Remove # and non-hex characters
    const cleaned = value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6).toUpperCase()
    setHexColor(cleaned)
  }

  const handleDone = async () => {
    const fullHex = hexColor.length === 6 ? hexColor : '895EFF'
    const xy = hexToXY(fullHex)

    await onApply({
      hex: fullHex,
      xy,
      bri: brightness
    })

    onOpenChange(false)
  }

  const brightnessPercent = Math.round((brightness / 254) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[402px] max-w-[402px] bg-[#222222] border border-white/10 rounded-[32px] p-0 overflow-hidden">
        <div className="flex flex-col h-[821px] max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex flex-col gap-6 px-6 pt-6 pb-0 shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-[18px] h-[18px] text-white" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-[18px] h-[18px] rounded-[4px] bg-[#895EFF]" />
                <p className="font-semibold text-[14px] text-[#eeeeee] leading-[20px]">
                  {entityName}
                </p>
              </div>

              <button className="p-1 rounded-full hover:bg-white/10 transition-colors opacity-0 pointer-events-none">
                <ChevronLeft className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Color Wheel - Only show for RGB-capable lights */}
          {hasColorSupport && (
            <div className="flex flex-col gap-4 items-center justify-center p-6 shrink-0">
              <div className="relative w-full">
                <canvas
                  ref={canvasRef}
                  className="w-full aspect-square cursor-crosshair rounded-full"
                  onClick={handleCanvasClick}
                  onMouseDown={() => { isDragging.current = true }}
                  onMouseUp={() => { isDragging.current = false }}
                  onMouseLeave={() => { isDragging.current = false }}
                  onMouseMove={handleMouseMove}
                />
                <div
                  className="absolute w-8 h-8 border-[3px] border-white rounded-full pointer-events-none"
                  style={{
                    left: `${pickerPosition.x * 100}%`,
                    top: `${pickerPosition.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: `#${hexColor}`
                  }}
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col gap-2 px-6 shrink-0">
            {/* Hex Input - Only show for RGB-capable lights */}
            {hasColorSupport && (
              <div className="bg-white/[0.07] flex gap-4 h-14 items-center px-4 py-2 rounded-[12px]">
                <Hash className="w-[18px] h-[18px] text-white/50" />
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="flex-1 bg-transparent font-semibold text-[16px] text-[#eeeeee] leading-[24px] outline-none"
                  placeholder="895EFF"
                  maxLength={6}
                />
              </div>
            )}

            {/* White/CT only message */}
            {!hasColorSupport && (
              <div className="bg-white/[0.07] flex gap-4 items-center justify-center px-4 py-8 rounded-[12px]">
                <p className="text-sm text-white/70 text-center">
                  This light only supports white/warm light.<br/>
                  Adjust brightness below.
                </p>
              </div>
            )}

            {/* Brightness Slider */}
            <div className="bg-white/[0.07] flex gap-6 h-14 items-center px-4 py-2 rounded-[12px]">
              <div className="w-[18px] h-[18px] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1V3M9 15V17M17 9H15M3 9H1M14.65 14.65L13.24 13.24M4.76 4.76L3.35 3.35M14.65 3.35L13.24 4.76M4.76 13.24L3.35 14.65M12 9C12 10.66 10.66 12 9 12C7.34 12 6 10.66 6 9C6 7.34 7.34 6 9 6C10.66 6 12 7.34 12 9Z" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="flex-1 relative h-6 flex items-center">
                <div
                  className="absolute inset-0 rounded-full border border-white/10"
                  style={{
                    background: `linear-gradient(to right, transparent 0%, #895EFF ${brightnessPercent}%)`
                  }}
                />
                <input
                  type="range"
                  min="1"
                  max="254"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute w-[18px] h-[18px] bg-[#895EFF] border-[3px] border-white rounded-full pointer-events-none"
                  style={{ right: '0px', top: '3px' }}
                />
              </div>

              <p className="font-semibold text-[16px] text-[#b4b4b4] leading-[24px] min-w-[48px] text-right">
                {brightnessPercent}%
              </p>
            </div>

            {/* Effect Selector (disabled for MVP) */}
            <div className="bg-white/[0.07] flex gap-4 h-14 items-center px-4 py-2 rounded-[12px] opacity-50">
              <Sparkles className="w-[18px] h-[18px] text-white/50" />
              <p className="flex-1 font-semibold text-[16px] text-[#b4b4b4] leading-[24px]">
                No effect
              </p>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </div>
          </div>

          {/* Done Button */}
          <div className="flex-1 flex items-end justify-center p-6 min-h-0">
            <button
              onClick={handleDone}
              className="w-full bg-white/[0.07] hover:bg-white/10 transition-colors rounded-full px-4 py-4 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)]"
            >
              <p className="font-semibold text-[16px] text-[#b4b4b4] leading-[24px] text-center">
                Done
              </p>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
