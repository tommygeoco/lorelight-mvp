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

// New v2 entity types
export type SessionScene = Tables<'session_scenes'>
export type AudioFolder = Tables<'audio_folders'>
export type AudioPlaylist = Tables<'audio_playlists'>
export type PlaylistAudio = Tables<'playlist_audio'>

// Note: SceneBlock and SceneNPC use placeholder types
// Migration 015 creates these tables but types/database.ts not yet regenerated
// These placeholder types work correctly at runtime

// Placeholder types (functionally equivalent to database types)
export interface SceneBlock {
  id: string
  scene_id: string
  type: BlockType
  content: BlockContent
  order_index: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface SceneNPC {
  id: string
  scene_id: string
  name: string
  description?: string | null
  stats?: Record<string, unknown> | null
  image_url?: string | null
  order_index: number
  created_at: string
  updated_at: string
  user_id: string
}

// Insert types
export type CampaignInsert = Inserts<'campaigns'>
export type SessionInsert = Inserts<'sessions'>
export type AudioFileInsert = Inserts<'audio_files'>
export type LightConfigInsert = Inserts<'light_configs'>
export type SceneInsert = Inserts<'scenes'>
export type HueSettingsInsert = Inserts<'hue_settings'>
export type SessionSceneInsert = Inserts<'session_scenes'>
export type AudioFolderInsert = Inserts<'audio_folders'>
export type AudioPlaylistInsert = Inserts<'audio_playlists'>
export type PlaylistAudioInsert = Inserts<'playlist_audio'>

// Temporary placeholder insert types
export type SceneBlockInsert = Omit<SceneBlock, 'id' | 'created_at' | 'updated_at'>
export type SceneNPCInsert = Omit<SceneNPC, 'id' | 'created_at' | 'updated_at'>

// Update types
export type CampaignUpdate = Updates<'campaigns'>
export type SessionUpdate = Updates<'sessions'>
export type AudioFileUpdate = Updates<'audio_files'>
export type LightConfigUpdate = Updates<'light_configs'>
export type SceneUpdate = Updates<'scenes'>
export type HueSettingsUpdate = Updates<'hue_settings'>
export type SessionSceneUpdate = Updates<'session_scenes'>
export type AudioFolderUpdate = Updates<'audio_folders'>
export type AudioPlaylistUpdate = Updates<'audio_playlists'>
export type PlaylistAudioUpdate = Updates<'playlist_audio'>

// Temporary placeholder update types
export type SceneBlockUpdate = Partial<Omit<SceneBlock, 'id' | 'created_at' | 'user_id'>>
export type SceneNPCUpdate = Partial<Omit<SceneNPC, 'id' | 'created_at' | 'user_id'>>

// Session status enum
export type SessionStatus = 'planning' | 'active' | 'completed'

// Scene block types (must be defined before SceneBlock interface)
export type BlockType =
  | 'text'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'image'
  | 'bulleted_list'
  | 'numbered_list'
  | 'checkbox_list'

export interface TextFormatting {
  start: number
  end: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  link?: string
}

export interface TextContent {
  text: string
  formatting: TextFormatting[]
}

export interface BlockContent {
  title?: string // Card title for note cards
  text?: TextContent
  items?: string[]
  checked?: boolean[]
  url?: string
  alt?: string
}

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

// Campaign with populated relations
export interface CampaignWithRelations extends Campaign {
  sessions?: Session[]
  scenes?: Scene[]
}

// Session with scenes
export interface SessionWithScenes extends Session {
  scenes: Scene[]
}

// Scene with relations
export interface SceneWithRelations extends Omit<Scene, 'light_config'> {
  audio_file?: AudioFile
  light_config?: LightConfig
}

// Audio file with folder and playlists
export interface AudioFileWithRelations extends AudioFile {
  folder?: AudioFolder
  playlists?: AudioPlaylist[]
}

// Audio config override type (stored in scenes.audio_config JSON)
export interface AudioConfig {
  volume?: number // 0-1
  startTime?: number // seconds
  loop?: boolean
}

// Lighting config override type (stored in scenes.lighting_config JSON)
export interface LightingConfig {
  brightnessOverride?: number // 0-100
  transitionDuration?: number // milliseconds
}

// Hue light state for scene light_config
export interface HueLightState {
  on: boolean
  bri: number
  hue?: number
  sat?: number
  ct?: number
  transitiontime: number
}

export interface SceneLightConfig {
  groups?: Record<string, HueLightState>
  lights?: Record<string, HueLightState>
}

// Scene audio config (stored in scenes.audio_config JSONB)
export interface SceneAudioConfig {
  audio_id: string
  volume: number
  loop: boolean
  start_time?: number
}

// UI Component types
export interface SidebarButton {
  icon: React.ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
}