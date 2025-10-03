-- Migration 015: Add scene_blocks, scene_npcs, and light_configs tables
-- Purpose: Enable rich text editing and NPC management for scenes

-- Create scene_blocks table for Notion-like content blocks
CREATE TABLE IF NOT EXISTS scene_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'heading_1', 'heading_2', 'heading_3', 'image', 'bulleted_list', 'numbered_list', 'checkbox_list')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for scene_blocks
CREATE INDEX idx_scene_blocks_scene_id ON scene_blocks(scene_id);
CREATE INDEX idx_scene_blocks_order ON scene_blocks(scene_id, order_index);

-- Enable RLS for scene_blocks
ALTER TABLE scene_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for scene_blocks
CREATE POLICY "Users can view their own scene blocks"
  ON scene_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scene blocks"
  ON scene_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scene blocks"
  ON scene_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scene blocks"
  ON scene_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- Create scene_npcs table for NPCs linked to scenes
CREATE TABLE IF NOT EXISTS scene_npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stats JSONB,
  image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for scene_npcs
CREATE INDEX idx_scene_npcs_scene_id ON scene_npcs(scene_id);
CREATE INDEX idx_scene_npcs_order ON scene_npcs(scene_id, order_index);

-- Enable RLS for scene_npcs
ALTER TABLE scene_npcs ENABLE ROW LEVEL SECURITY;

-- RLS policies for scene_npcs
CREATE POLICY "Users can view their own scene NPCs"
  ON scene_npcs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scene NPCs"
  ON scene_npcs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scene NPCs"
  ON scene_npcs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scene NPCs"
  ON scene_npcs FOR DELETE
  USING (auth.uid() = user_id);

-- Note: light_configs table already exists from earlier migrations
-- We'll just add an index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_light_configs_campaign ON light_configs(campaign_id);

-- Add updated_at trigger for scene_blocks
CREATE OR REPLACE FUNCTION update_scene_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scene_blocks_updated_at
  BEFORE UPDATE ON scene_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_scene_blocks_updated_at();

-- Add updated_at trigger for scene_npcs
CREATE OR REPLACE FUNCTION update_scene_npcs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scene_npcs_updated_at
  BEFORE UPDATE ON scene_npcs
  FOR EACH ROW
  EXECUTE FUNCTION update_scene_npcs_updated_at();
