-- Migration 018: Add scene interactions (favorites, recent), scene_maps table, and enhance scene_npcs
-- Part of Scene Manager Improvements
-- 
-- NOTE: This migration is partially superseded by Migration 019 (Scene Manager Redesign)
-- The following tables/columns created here are dropped in 019:
-- - scene_maps table (removed - feature deprecated)
-- - scenes.is_favorite column (removed - simplified to tags)
-- - scenes.last_viewed_at column (removed - simplified navigation)
-- - scene_npcs.image_url column (removed - feature simplified)
--
-- This migration remains for historical reference and upgrade path.

-- ============================================================================
-- 1. Add favorite and recent tracking to scenes table
-- ============================================================================

ALTER TABLE scenes 
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_scenes_is_favorite ON scenes(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_scenes_last_viewed ON scenes(user_id, last_viewed_at DESC NULLS LAST);

-- ============================================================================
-- 2. Create scene_maps table for map media attachments
-- ============================================================================

CREATE TABLE IF NOT EXISTS scene_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('local', 'uploaded')),
  file_path TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for scene_maps
CREATE INDEX IF NOT EXISTS idx_scene_maps_scene_id ON scene_maps(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_maps_order ON scene_maps(scene_id, order_index);
CREATE INDEX IF NOT EXISTS idx_scene_maps_user_id ON scene_maps(user_id);

-- Enable RLS for scene_maps
ALTER TABLE scene_maps ENABLE ROW LEVEL SECURITY;

-- RLS policies for scene_maps (user can only access their own maps)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scene_maps' AND policyname = 'scene_maps_select_policy'
  ) THEN
    CREATE POLICY scene_maps_select_policy
      ON scene_maps FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scene_maps' AND policyname = 'scene_maps_insert_policy'
  ) THEN
    CREATE POLICY scene_maps_insert_policy
      ON scene_maps FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scene_maps' AND policyname = 'scene_maps_update_policy'
  ) THEN
    CREATE POLICY scene_maps_update_policy
      ON scene_maps FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scene_maps' AND policyname = 'scene_maps_delete_policy'
  ) THEN
    CREATE POLICY scene_maps_delete_policy
      ON scene_maps FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 3. Enhance scene_npcs table (add image_url if not exists)
-- ============================================================================

ALTER TABLE scene_npcs 
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================================
-- 4. Add updated_at trigger for scene_maps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_scene_maps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scene_maps_updated_at ON scene_maps;
CREATE TRIGGER scene_maps_updated_at
  BEFORE UPDATE ON scene_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_scene_maps_updated_at();

