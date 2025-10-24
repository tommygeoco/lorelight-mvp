-- Migration 019: Scene Manager Improvements
-- Remove Maps/NPCs features and add multi-config support for ambience

-- ============================================================================
-- 0. Ensure light_configs table exists (may be missing from earlier migrations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS light_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brightness INTEGER CHECK (brightness >= 0 AND brightness <= 100),
  color_temp INTEGER,
  rgb_color JSONB,
  transition_duration INTEGER DEFAULT 400,
  room_ids TEXT[],
  effect TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for light_configs (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_light_configs_user_id ON light_configs(user_id);

-- Enable RLS
ALTER TABLE light_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies (only create if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'light_configs' AND policyname = 'light_configs_select_policy'
  ) THEN
    CREATE POLICY light_configs_select_policy
      ON light_configs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'light_configs' AND policyname = 'light_configs_insert_policy'
  ) THEN
    CREATE POLICY light_configs_insert_policy
      ON light_configs FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'light_configs' AND policyname = 'light_configs_update_policy'
  ) THEN
    CREATE POLICY light_configs_update_policy
      ON light_configs FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'light_configs' AND policyname = 'light_configs_delete_policy'
  ) THEN
    CREATE POLICY light_configs_delete_policy
      ON light_configs FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 1. Drop scene_maps table and all related objects
-- ============================================================================

-- Drop RLS policies first
DROP POLICY IF EXISTS scene_maps_select_policy ON scene_maps;
DROP POLICY IF EXISTS scene_maps_insert_policy ON scene_maps;
DROP POLICY IF EXISTS scene_maps_update_policy ON scene_maps;
DROP POLICY IF EXISTS scene_maps_delete_policy ON scene_maps;

-- Drop trigger and function
DROP TRIGGER IF EXISTS scene_maps_updated_at ON scene_maps;
DROP FUNCTION IF EXISTS update_scene_maps_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_scene_maps_scene_id;
DROP INDEX IF EXISTS idx_scene_maps_order;
DROP INDEX IF EXISTS idx_scene_maps_user_id;

-- Drop table
DROP TABLE IF EXISTS scene_maps;

-- ============================================================================
-- 2. Remove scene_npcs.image_url column
-- ============================================================================

ALTER TABLE scene_npcs 
  DROP COLUMN IF EXISTS image_url;

-- ============================================================================
-- 3. Remove favorites/recent columns from scenes (replaced with new design)
-- ============================================================================

DROP INDEX IF EXISTS idx_scenes_is_favorite;
DROP INDEX IF EXISTS idx_scenes_last_viewed;

ALTER TABLE scenes
  DROP COLUMN IF EXISTS is_favorite,
  DROP COLUMN IF EXISTS last_viewed_at;

-- ============================================================================
-- 4. Create scene_light_configs junction table (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scene_light_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  light_config_id UUID NOT NULL REFERENCES light_configs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_selected BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scene_id, light_config_id)
);

-- Indexes for scene_light_configs
CREATE INDEX idx_scene_light_configs_scene_id ON scene_light_configs(scene_id);
CREATE INDEX idx_scene_light_configs_light_config_id ON scene_light_configs(light_config_id);
CREATE INDEX idx_scene_light_configs_user_id ON scene_light_configs(user_id);
CREATE INDEX idx_scene_light_configs_order ON scene_light_configs(scene_id, order_index);

-- Enable RLS
ALTER TABLE scene_light_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY scene_light_configs_select_policy
  ON scene_light_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY scene_light_configs_insert_policy
  ON scene_light_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY scene_light_configs_update_policy
  ON scene_light_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY scene_light_configs_delete_policy
  ON scene_light_configs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. Create scene_audio_files junction table (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scene_audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  audio_file_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_selected BOOLEAN DEFAULT false,
  volume NUMERIC DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1),
  loop BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scene_id, audio_file_id)
);

-- Indexes for scene_audio_files
CREATE INDEX idx_scene_audio_files_scene_id ON scene_audio_files(scene_id);
CREATE INDEX idx_scene_audio_files_audio_file_id ON scene_audio_files(audio_file_id);
CREATE INDEX idx_scene_audio_files_user_id ON scene_audio_files(user_id);
CREATE INDEX idx_scene_audio_files_order ON scene_audio_files(scene_id, order_index);

-- Enable RLS
ALTER TABLE scene_audio_files ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY scene_audio_files_select_policy
  ON scene_audio_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY scene_audio_files_insert_policy
  ON scene_audio_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY scene_audio_files_update_policy
  ON scene_audio_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY scene_audio_files_delete_policy
  ON scene_audio_files FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. Create scene_block_tags table for note tagging
-- ============================================================================

CREATE TABLE IF NOT EXISTS scene_block_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  block_id UUID NOT NULL REFERENCES scene_blocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(block_id, tag_name)
);

-- Indexes for scene_block_tags
CREATE INDEX idx_scene_block_tags_block_id ON scene_block_tags(block_id);
CREATE INDEX idx_scene_block_tags_scene_id ON scene_block_tags(scene_id);
CREATE INDEX idx_scene_block_tags_tag_name ON scene_block_tags(scene_id, tag_name);
CREATE INDEX idx_scene_block_tags_user_id ON scene_block_tags(user_id);

-- Enable RLS
ALTER TABLE scene_block_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY scene_block_tags_select_policy
  ON scene_block_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY scene_block_tags_insert_policy
  ON scene_block_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY scene_block_tags_update_policy
  ON scene_block_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY scene_block_tags_delete_policy
  ON scene_block_tags FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. Add updated_at triggers for new tables
-- ============================================================================

-- Trigger function (reuse existing pattern)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for new tables
CREATE TRIGGER scene_light_configs_updated_at
  BEFORE UPDATE ON scene_light_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER scene_audio_files_updated_at
  BEFORE UPDATE ON scene_audio_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

