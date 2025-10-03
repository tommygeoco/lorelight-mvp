import { createClient } from '@/lib/auth/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SceneAudioConfig, SceneLightConfig } from '@/types'
import { sceneService } from './sceneService'
import { audioService } from './audioService'

/**
 * Scene Activation service for orchestrating audio + lighting changes
 * Context7: <100ms target for scene transitions
 */
class SceneActivationService {
  private _supabase?: SupabaseClient

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  /**
   * Activate a scene (audio + lights in parallel)
   * Performance target: <100ms
   */
  async activateScene(sceneId: string): Promise<void> {
    const startTime = performance.now()

    const scene = await sceneService.get(sceneId)
    if (!scene) {
      throw new Error('Scene not found')
    }

    // Parallel activation of audio + lights
    await Promise.all([
      this.activateAudio(scene.audio_config as SceneAudioConfig | null),
      this.activateLights(scene.light_config as SceneLightConfig | null),
    ])

    // Update active state in database
    await this.setActiveScene(scene.campaign_id, sceneId)

    const duration = performance.now() - startTime
    if (duration > 100) {
      console.warn(`⚠️ Scene activation took ${duration.toFixed(2)}ms (target: <100ms)`)
    } else {
      console.log(`✅ Scene activated in ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * Activate audio for scene
   */
  private async activateAudio(audioConfig: SceneAudioConfig | null): Promise<void> {
    if (!audioConfig) return

    const { audio_id, volume, loop, start_time } = audioConfig
    const audioFile = await audioService.get(audio_id)

    if (!audioFile) {
      console.warn('Audio file not found for scene')
      return
    }

    // Integration with audio playback system
    // Note: This will be connected to useAudioPlayback hook
    const event = new CustomEvent('scene-audio-activate', {
      detail: {
        audioFile,
        volume,
        loop,
        startTime: start_time,
      },
    })
    window.dispatchEvent(event)
  }

  /**
   * Activate lights for scene
   */
  private async activateLights(lightConfig: SceneLightConfig | null): Promise<void> {
    if (!lightConfig) return

    // TODO: Implement Hue integration when service is ready
    // For now, just log the configuration
    console.log('Would activate lights with config:', lightConfig)

    // TODO: Implement actual Hue API calls
    // try {
    //   if (lightConfig.groups) {
    //     await Promise.all(
    //       Object.entries(lightConfig.groups).map(([groupId, state]) =>
    //         hueService.setGroupState(groupId, state)
    //       )
    //     )
    //   }
    //   if (lightConfig.lights) {
    //     await Promise.all(
    //       Object.entries(lightConfig.lights).map(([lightId, state]) =>
    //         hueService.setLightState(lightId, state)
    //       )
    //     )
    //   }
    // } catch (error) {
    //   console.error('Failed to activate lights:', error)
    // }
  }

  /**
   * Set a scene as active and deactivate others in the campaign
   */
  private async setActiveScene(campaignId: string, sceneId: string): Promise<void> {
    // Deactivate all scenes in campaign
    await this.supabase
      .from('scenes')
      .update({ is_active: false })
      .eq('campaign_id', campaignId)

    // Activate the selected scene
    await this.supabase
      .from('scenes')
      .update({ is_active: true })
      .eq('id', sceneId)
  }

  /**
   * Deactivate all scenes in a campaign
   */
  async deactivateAll(campaignId: string): Promise<void> {
    await this.supabase
      .from('scenes')
      .update({ is_active: false })
      .eq('campaign_id', campaignId)
  }
}

export const sceneActivationService = new SceneActivationService()
