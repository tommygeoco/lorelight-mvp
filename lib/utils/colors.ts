/**
 * Color conversion utilities for Philips Hue lights
 * Converts Hue's HSB color space to RGB for gradients
 */

import type { HueLightState } from '@/types'

/**
 * Convert Philips Hue HSB to RGB
 * Hue format: hue (0-65535), sat (0-254), bri (0-254)
 * Returns: RGB as { r, g, b } (0-255)
 */
export function hueToRgb(hue: number, sat: number, bri: number): { r: number; g: number; b: number } {
  // Normalize Hue values to 0-1 range
  const h = (hue / 65535) * 360 // Convert to 0-360 degrees
  const s = sat / 254
  const v = bri / 254

  // HSV to RGB conversion
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0, g = 0, b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

/**
 * Convert RGB to CSS rgba string
 */
export function rgbToRgba(r: number, g: number, b: number, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Extract gradient colors from a HueLightState
 * Returns rgba strings for use in gradients
 */
export function lightStateToGradientColor(light: HueLightState, alpha: number = 0.4): string {
  // If light is off, return dark color
  if (!light.on) {
    return `rgba(20, 20, 25, ${alpha * 0.3})`
  }

  // If light has RGB (hue/sat), use it
  if (light.hue !== undefined && light.sat !== undefined) {
    const rgb = hueToRgb(light.hue, light.sat, light.bri)
    return rgbToRgba(rgb.r, rgb.g, rgb.b, alpha)
  }

  // If only brightness (white light), create warm white gradient
  const brightness = light.bri / 254
  const warmWhite = {
    r: Math.round(255 * brightness),
    g: Math.round(245 * brightness),
    b: Math.round(230 * brightness),
  }
  return rgbToRgba(warmWhite.r, warmWhite.g, warmWhite.b, alpha)
}

/**
 * Create a brightness variation of a light (for single-light gradients)
 */
export function createBrightnessVariation(
  light: HueLightState,
  brightnessMultiplier: number,
  alpha: number = 0.4
): string {
  if (!light.on) {
    return `rgba(20, 20, 25, ${alpha * 0.3})`
  }

  const adjustedBri = Math.min(254, Math.max(0, light.bri * brightnessMultiplier))

  if (light.hue !== undefined && light.sat !== undefined) {
    const rgb = hueToRgb(light.hue, light.sat, adjustedBri)
    return rgbToRgba(rgb.r, rgb.g, rgb.b, alpha)
  }

  // White light variation
  const brightness = adjustedBri / 254
  const warmWhite = {
    r: Math.round(255 * brightness),
    g: Math.round(245 * brightness),
    b: Math.round(230 * brightness),
  }
  return rgbToRgba(warmWhite.r, warmWhite.g, warmWhite.b, alpha)
}

