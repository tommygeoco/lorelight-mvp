import type { Database } from './database'

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Entity types
export type Campaign = Tables<'campaigns'>
export type Session = Tables<'sessions'>
export type AudioFile = Tables<'audio_files'>
export type LightConfig = Tables<'light_configs'>
export type Scene = Tables<'scenes'>
export type HueSettings = Tables<'hue_settings'>

// Insert types
export type CampaignInsert = Inserts<'campaigns'>
export type SessionInsert = Inserts<'sessions'>
export type AudioFileInsert = Inserts<'audio_files'>
export type LightConfigInsert = Inserts<'light_configs'>
export type SceneInsert = Inserts<'scenes'>
export type HueSettingsInsert = Inserts<'hue_settings'>

// Update types
export type CampaignUpdate = Updates<'campaigns'>
export type SessionUpdate = Updates<'sessions'>
export type AudioFileUpdate = Updates<'audio_files'>
export type LightConfigUpdate = Updates<'light_configs'>
export type SceneUpdate = Updates<'scenes'>
export type HueSettingsUpdate = Updates<'hue_settings'>

// Session status enum
export type SessionStatus = 'planning' | 'active' | 'completed'

// RGB Color type
export interface RGBColor {
  r: number
  g: number
  b: number
}

// Hue API types
export interface HueRoom {
  id: string
  name: string
  type: string
}

export interface HueLight {
  id: string
  name: string
  on: boolean
  brightness: number
  color?: {
    xy?: { x: number; y: number }
    ct?: number
  }
}

// Scene with populated relations
export interface SceneWithRelations extends Scene {
  audio_file?: AudioFile | null
  light_config?: LightConfig | null
}

// Session with populated relations
export interface SessionWithRelations extends Session {
  scenes?: Scene[]
}

// Campaign with populated relations
export interface CampaignWithRelations extends Campaign {
  sessions?: Session[]
}