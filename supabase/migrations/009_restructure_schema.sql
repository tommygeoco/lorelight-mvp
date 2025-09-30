-- Migration 009: Restructure schema for proper scene/session relationships and add organizational features
-- This migration fixes the core data model to support scene reusability and adds audio library organization

-- ============================================================================
-- PART 1: Fix Scene-Campaign-Session Relationships
-- ============================================================================

-- Scenes table already has campaign_id from previous migrations (004)
-- Current schema: scenes(id, campaign_id, user_id, name, description, audio_file_id, light_config_id, is_active, order_index, notes, ...)
-- Note: Scenes belong to campaigns directly, not sessions. The session_scenes junction table will be manually populated by users.

-- Drop and recreate session_scenes table to ensure clean state
DROP TABLE IF EXISTS session_scenes CASCADE;

-- Create session_scenes junction table (many-to-many relationship between sessions and scenes)
CREATE TABLE session_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, scene_id)
);

-- No data migration needed - users will add scenes to sessions via the UI

-- ============================================================================
-- PART 2: Add Scene Audio/Lighting Overrides
-- ============================================================================

-- Add scene-specific audio/lighting configuration overrides (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scenes' AND column_name='audio_config') THEN
        ALTER TABLE scenes ADD COLUMN audio_config JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scenes' AND column_name='lighting_config') THEN
        ALTER TABLE scenes ADD COLUMN lighting_config JSONB;
    END IF;
END $$;

-- ============================================================================
-- PART 3: Audio Library Organization (Tags, Folders, Playlists)
-- ============================================================================

-- Audio folders table (for organizing audio files)
CREATE TABLE audio_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES audio_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audio playlists table
CREATE TABLE audio_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Playlist-audio junction table (many-to-many)
CREATE TABLE playlist_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES audio_playlists(id) ON DELETE CASCADE,
  audio_file_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, audio_file_id)
);

-- Add folder_id to audio_files (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audio_files' AND column_name='folder_id') THEN
        ALTER TABLE audio_files ADD COLUMN folder_id UUID REFERENCES audio_folders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- PART 4: Scene Presets
-- ============================================================================

-- Scene presets table (system templates + user-created)
CREATE TABLE scene_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji
  default_lighting JSONB, -- { brightness: number, color_temp: number, rgb_color: {r,g,b} }
  default_audio_tags TEXT[], -- suggested tags for audio
  is_system BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert system presets (user-editable defaults)
INSERT INTO scene_presets (name, description, icon, default_lighting, default_audio_tags, is_system, user_id) VALUES
  ('Tavern', 'Warm, cozy atmosphere for social scenes', '🍺', '{"brightness": 80, "color_temp": 2700}', ARRAY['ambient', 'tavern', 'social'], true, null),
  ('Combat', 'High energy, dramatic lighting for battle', '⚔️', '{"brightness": 100, "color_temp": 6500}', ARRAY['combat', 'battle', 'intense'], true, null),
  ('Dungeon', 'Dark, ominous atmosphere for exploration', '🕯️', '{"brightness": 30, "color_temp": 2000}', ARRAY['ambient', 'dungeon', 'dark'], true, null),
  ('Rest', 'Calm, peaceful scenes for downtime', '🌙', '{"brightness": 50, "color_temp": 3000}', ARRAY['ambient', 'calm', 'rest'], true, null),
  ('Intro', 'Session opening and recap', '📖', '{"brightness": 70, "color_temp": 4000}', ARRAY['ambient', 'intro'], true, null),
  ('Outro', 'Session closing and cliffhanger', '🎬', '{"brightness": 60, "color_temp": 4500}', ARRAY['ambient', 'outro'], true, null),
  ('Death', 'Somber, dramatic moment', '💀', '{"brightness": 20, "color_temp": 2000}', ARRAY['dark', 'dramatic', 'somber'], true, null),
  ('Intermission', 'Break time, casual atmosphere', '☕', '{"brightness": 75, "color_temp": 5000}', ARRAY['ambient', 'casual', 'break'], true, null);

-- Add preset_id reference to scenes (optional, if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scenes' AND column_name='preset_id') THEN
        ALTER TABLE scenes ADD COLUMN preset_id UUID REFERENCES scene_presets(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- PART 5: Session Title Rename (for consistency)
-- ============================================================================

-- Rename sessions.name to sessions.title (if not already renamed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='name') THEN
        ALTER TABLE sessions RENAME COLUMN name TO title;
    END IF;
END $$;

-- ============================================================================
-- PART 6: Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS scenes_campaign_id_idx ON scenes(campaign_id);
CREATE INDEX IF NOT EXISTS scenes_preset_id_idx ON scenes(preset_id);
CREATE INDEX IF NOT EXISTS session_scenes_session_id_idx ON session_scenes(session_id);
CREATE INDEX IF NOT EXISTS session_scenes_scene_id_idx ON session_scenes(scene_id);
CREATE INDEX IF NOT EXISTS audio_folders_user_id_idx ON audio_folders(user_id);
CREATE INDEX IF NOT EXISTS audio_folders_parent_id_idx ON audio_folders(parent_id);
CREATE INDEX IF NOT EXISTS audio_files_folder_id_idx ON audio_files(folder_id);
CREATE INDEX IF NOT EXISTS audio_playlists_user_id_idx ON audio_playlists(user_id);
CREATE INDEX IF NOT EXISTS playlist_audio_playlist_id_idx ON playlist_audio(playlist_id);
CREATE INDEX IF NOT EXISTS playlist_audio_audio_file_id_idx ON playlist_audio(audio_file_id);
CREATE INDEX IF NOT EXISTS scene_presets_user_id_idx ON scene_presets(user_id);
CREATE INDEX IF NOT EXISTS scene_presets_is_system_idx ON scene_presets(is_system);

-- ============================================================================
-- PART 7: Row Level Security Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE session_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_presets ENABLE ROW LEVEL SECURITY;

-- Session scenes policies
CREATE POLICY "Users can view their session scenes"
  ON session_scenes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_scenes.session_id
    AND sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their session scenes"
  ON session_scenes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_scenes.session_id
    AND sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their session scenes"
  ON session_scenes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_scenes.session_id
    AND sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their session scenes"
  ON session_scenes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_scenes.session_id
    AND sessions.user_id = auth.uid()
  ));

-- Audio folders policies
CREATE POLICY "Users can view their own audio folders"
  ON audio_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own audio folders"
  ON audio_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio folders"
  ON audio_folders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio folders"
  ON audio_folders FOR DELETE
  USING (auth.uid() = user_id);

-- Audio playlists policies
CREATE POLICY "Users can view their own playlists"
  ON audio_playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
  ON audio_playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON audio_playlists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON audio_playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Playlist audio policies
CREATE POLICY "Users can view their playlist audio"
  ON playlist_audio FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audio_playlists
    WHERE audio_playlists.id = playlist_audio.playlist_id
    AND audio_playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their playlist audio"
  ON playlist_audio FOR ALL
  USING (EXISTS (
    SELECT 1 FROM audio_playlists
    WHERE audio_playlists.id = playlist_audio.playlist_id
    AND audio_playlists.user_id = auth.uid()
  ));

-- Scene presets policies
CREATE POLICY "Anyone can view all scene presets"
  ON scene_presets FOR SELECT
  USING (true);

CREATE POLICY "Users can create custom presets"
  ON scene_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update their custom presets"
  ON scene_presets FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false)
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete their custom presets"
  ON scene_presets FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);
