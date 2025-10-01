-- Migration 011: Fix scene_type constraint to allow common scene types

-- Drop the existing constraint
ALTER TABLE scenes DROP CONSTRAINT IF EXISTS scenes_scene_type_check;

-- Add new constraint with allowed values
ALTER TABLE scenes ADD CONSTRAINT scenes_scene_type_check 
  CHECK (scene_type IN ('story', 'combat', 'exploration', 'social', 'rest', 'default'));

-- Make scene_type nullable with default value
ALTER TABLE scenes ALTER COLUMN scene_type SET DEFAULT 'default';
