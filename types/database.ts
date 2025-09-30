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
          session_id: string
          user_id: string
          name: string
          description: string | null
          audio_file_id: string | null
          light_config_id: string | null
          thumbnail_url: string | null
          scene_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          name: string
          description?: string | null
          audio_file_id?: string | null
          light_config_id?: string | null
          thumbnail_url?: string | null
          scene_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          name?: string
          description?: string | null
          audio_file_id?: string | null
          light_config_id?: string | null
          thumbnail_url?: string | null
          scene_order?: number
          created_at?: string
          updated_at?: string
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
    }
  }
}