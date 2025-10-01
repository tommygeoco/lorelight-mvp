-- Migration 010: Remove scene_presets table and related features
-- This removes the scene presets feature that was added in migration 009

-- Drop RLS policies
DROP POLICY IF EXISTS scene_presets_select_policy ON scene_presets;
DROP POLICY IF EXISTS scene_presets_insert_policy ON scene_presets;
DROP POLICY IF EXISTS scene_presets_update_policy ON scene_presets;
DROP POLICY IF EXISTS scene_presets_delete_policy ON scene_presets;

-- Drop indexes
DROP INDEX IF EXISTS scene_presets_user_id_idx;
DROP INDEX IF EXISTS scene_presets_is_system_idx;

-- Drop the foreign key column from scenes table
ALTER TABLE scenes DROP COLUMN IF EXISTS preset_id;

-- Drop the scene_presets table
DROP TABLE IF EXISTS scene_presets;
