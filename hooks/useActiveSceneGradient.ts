/**
 * Hook to detect active scene and extract gradient colors from its lights
 * Priority: Active Scene → Standalone Light Config → Default Purple
 */

import { useEffect, useState } from 'react'
import { useSceneStore } from '@/store/sceneStore'
import { useHueStore } from '@/store/hueStore'
import type { SceneLightConfig, HueLightState } from '@/types'
import { lightStateToGradientColor, createBrightnessVariation } from '@/lib/utils/colors'

export interface GradientColors {
  color1: string
  color2: string
}

/**
 * Extract up to 2 light states from a scene's light config
 */
function extractLightStates(lightConfig: SceneLightConfig | null): HueLightState[] {
  if (!lightConfig) return []

  const lights: HueLightState[] = []

  // Extract from groups first
  if (lightConfig.groups) {
    const groupLights = Object.values(lightConfig.groups)
    lights.push(...groupLights)
  }

  // Then from individual lights
  if (lightConfig.lights) {
    const individualLights = Object.values(lightConfig.lights)
    lights.push(...individualLights)
  }

  // Return first 2 lights
  return lights.slice(0, 2)
}

/**
 * Check if all lights are off
 */
function allLightsOff(lights: HueLightState[]): boolean {
  return lights.length > 0 && lights.every(light => !light.on)
}

/**
 * Check if light is RGB (has hue/sat) or just brightness
 */
function isRgbLight(light: HueLightState): boolean {
  return light.hue !== undefined && light.sat !== undefined
}

/**
 * Generate gradient colors based on active scene lights
 */
function generateGradientColors(lights: HueLightState[]): GradientColors | null {
  if (lights.length === 0) {
    return null // No active scene, use default
  }

  // All lights off → extremely subtle dark gradient
  if (allLightsOff(lights)) {
    return {
      color1: 'rgba(20, 20, 25, 0.08)',
      color2: 'rgba(15, 15, 20, 0.06)',
    }
  }

  // Single light
  if (lights.length === 1) {
    const light = lights[0]
    
    if (isRgbLight(light)) {
      // RGB light → use color with brightness variations
      // Adjust opacity based on brightness (low brightness gets boosted visibility)
      const brightnessRatio = light.bri / 254
      const baseOpacity = brightnessRatio < 0.3 ? 0.45 : brightnessRatio > 0.8 ? 0.35 : 0.4
      
      return {
        color1: lightStateToGradientColor(light, baseOpacity),
        color2: createBrightnessVariation(light, 0.6, baseOpacity * 0.9),
      }
    } else {
      // Brightness-only light → warm white gradient with min/max brightness
      const brightnessRatio = light.bri / 254
      const baseOpacity = brightnessRatio < 0.3 ? 0.45 : brightnessRatio > 0.8 ? 0.35 : 0.4
      
      return {
        color1: createBrightnessVariation(light, 1.0, baseOpacity),
        color2: createBrightnessVariation(light, 0.5, baseOpacity * 0.85),
      }
    }
  }

  // Multiple lights (2+) → use first two with brightness-adjusted opacity
  const light1 = lights[0]
  const light2 = lights[1]

  // Calculate average brightness for opacity adjustment
  const avgBrightness = (light1.bri + light2.bri) / (2 * 254)
  const baseOpacity = avgBrightness < 0.3 ? 0.45 : avgBrightness > 0.8 ? 0.35 : 0.4

  return {
    color1: lightStateToGradientColor(light1, baseOpacity),
    color2: lightStateToGradientColor(light2, baseOpacity),
  }
}

/**
 * Hook to get gradient colors based on priority:
 * 1. Active scene's light config
 * 2. Standalone active light config
 * 3. Default purple gradient (null)
 */
export function useActiveSceneGradient(): GradientColors | null {
  const scenes = useSceneStore((state) => state.scenes)
  const activeLightConfig = useHueStore((state) => state.activeLightConfig)
  const [gradientColors, setGradientColors] = useState<GradientColors | null>(null)

  useEffect(() => {
    // Priority 1: Check for active scene
    const activeScene = Array.from(scenes.values()).find(scene => scene.is_active)

    if (activeScene) {
      // Scene is active - use its light config
      const lightConfig = activeScene.light_config as SceneLightConfig | null
      const lights = extractLightStates(lightConfig)
      const colors = generateGradientColors(lights)
      setGradientColors(colors)
      return
    }

    // Priority 2: Check for standalone active light config
    if (activeLightConfig) {
      const lights = extractLightStates(activeLightConfig)
      const colors = generateGradientColors(lights)
      setGradientColors(colors)
      return
    }

    // Priority 3: No active scene or light config - use default
    setGradientColors(null)
  }, [scenes, activeLightConfig])

  return gradientColors
}

