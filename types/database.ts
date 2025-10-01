export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          title: string
          date: string | null
          status: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          title: string
          date?: string | null
          status?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          title?: string
          date?: string | null
          status?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audio_files: {
        Row: {
          id: string
          user_id: string
          name: string
          file_url: string
          file_size: number | null
          duration: number | null
          format: string | null
          tags: string[] | null
          folder_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          file_url: string
          file_size?: number | null
          duration?: number | null
          format?: string | null
          tags?: string[] | null
          folder_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          file_url?: string
          file_size?: number | null
          duration?: number | null
          format?: string | null
          tags?: string[] | null
          folder_id?: string | null
          created_at?: string
        }
      }
      light_configs: {
        Row: {
          id: string
          user_id: string
          name: string
          brightness: number | null
          color_temp: number | null
          rgb_color: Json | null
          transition_duration: number
          room_ids: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brightness?: number | null
          color_temp?: number | null
          rgb_color?: Json | null
          transition_duration?: number
          room_ids?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brightness?: number | null
          color_temp?: number | null
          rgb_color?: Json | null
          transition_duration?: number
          room_ids?: string[] | null
          created_at?: string
        }
      }
      scenes: {
        Row: {
          id: string
          campaign_id: string
          user_id: string | null
          name: string
          description: string | null
          light_settings: Json | null
          audio_settings: Json | null
          light_config: Json
          audio_config: Json | null
          scene_audio_files: Json | null
          encounters: Json | null
          notes: string
          tags: string[]
          is_global: boolean
          is_active: boolean
          scene_type: string
          order_index: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id?: string | null
          name: string
          description?: string | null
          light_settings?: Json | null
          audio_settings?: Json | null
          light_config?: Json
          audio_config?: Json | null
          scene_audio_files?: Json | null
          encounters?: Json | null
          notes?: string
          tags?: string[]
          is_global?: boolean
          is_active?: boolean
          scene_type: string
          order_index?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          light_settings?: Json | null
          audio_settings?: Json | null
          light_config?: Json
          audio_config?: Json | null
          scene_audio_files?: Json | null
          encounters?: Json | null
          notes?: string
          tags?: string[]
          is_global?: boolean
          is_active?: boolean
          scene_type?: string
          order_index?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      hue_settings: {
        Row: {
          id: string
          user_id: string
          bridge_ip: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          selected_rooms: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bridge_ip?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          selected_rooms?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bridge_ip?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          selected_rooms?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      session_scenes: {
        Row: {
          id: string
          session_id: string
          scene_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          scene_id: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          scene_id?: string
          order_index?: number
          created_at?: string
        }
      }
      audio_folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audio_playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      playlist_audio: {
        Row: {
          id: string
          playlist_id: string
          audio_file_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          audio_file_id: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          audio_file_id?: string
          order_index?: number
          created_at?: string
        }
      }
    }
  }
}