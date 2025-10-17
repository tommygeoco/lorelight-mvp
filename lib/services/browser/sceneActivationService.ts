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
      this.activateAudio(scene.audio_config as SceneAudioConfig | null, scene.id, scene.name, scene.campaign_id),
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
  private async activateAudio(audioConfig: SceneAudioConfig | null, sceneId: string, sceneName: string, campaignId: string): Promise<void> {
    if (!audioConfig) return

    const { audio_id, volume, loop, start_time } = audioConfig
    const audioFile = await audioService.get(audio_id)

    if (!audioFile) {
      console.warn('Audio file not found for scene')
      return
    }

    // Load track into audio player with scene context
    const { useAudioStore } = await import('@/store/audioStore')
    const audioStore = useAudioStore.getState()

    // Load the track
    audioStore.loadTrack(audioFile.id, audioFile.file_url, {
      type: 'scene',
      id: sceneId,
      name: sceneName,
      campaignId
    })

    // Apply scene audio config
    if (volume !== undefined) {
      audioStore.setVolume(volume)
    }

    // Set loop state
    if (loop !== undefined && loop !== audioStore.isLooping) {
      audioStore.toggleLoop()
    }

    // Start playback (skip scene activation to prevent circular loop)
    audioStore.play({ skipSceneActivation: true })

    // Seek to start time if specified
    if (start_time && start_time > 0) {
      setTimeout(() => {
        audioStore.seek(start_time)
      }, 100)
    }
  }

  /**
   * Activate lights for scene
   */
  private async activateLights(lightConfig: SceneLightConfig | null): Promise<void> {
    if (!lightConfig) return

    try {
      // Import hueStore dynamically to apply lights
      const { useHueStore } = await import('@/store/hueStore')
      const hueStore = useHueStore.getState()
      
      // Check if bridge is connected
      if (!hueStore.isConnected) {
        console.warn('Hue bridge not connected, skipping light activation')
        return
      }

      // Apply the light configuration
      await hueStore.applyLightConfig(lightConfig)
    } catch (error) {
      console.error('Failed to activate scene lights:', error)
      // Don't throw - allow scene to activate even if lights fail
    }
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
   * Deactivate a specific scene
   * Stops audio playback and deactivates lights
   */
  async deactivateScene(sceneId: string): Promise<void> {
    const startTime = performance.now()

    // Stop audio playback (skip scene deactivation to prevent circular loop)
    const { useAudioStore } = await import('@/store/audioStore')
    const audioStore = useAudioStore.getState()
    audioStore.pause({ skipSceneDeactivation: true })

    // Update database - set scene as inactive
    await this.supabase
      .from('scenes')
      .update({ is_active: false })
      .eq('id', sceneId)

    const duration = performance.now() - startTime
    console.log(`✅ Scene deactivated in ${duration.toFixed(2)}ms`)
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
