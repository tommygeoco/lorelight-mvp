-- Add performance indexes for commonly queried fields
-- These indexes match actual query patterns in the application

-- Scenes table indexes
-- Most queries filter by campaign_id and/or is_active
CREATE INDEX IF NOT EXISTS scenes_campaign_id_idx ON scenes(campaign_id);
CREATE INDEX IF NOT EXISTS scenes_active_idx ON scenes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS scenes_campaign_active_idx ON scenes(campaign_id, is_active);
CREATE INDEX IF NOT EXISTS scenes_order_idx ON scenes(campaign_id, order_index);

-- Sessions table indexes
-- Queries filter by campaign_id and status
CREATE INDEX IF NOT EXISTS sessions_campaign_id_idx ON sessions(campaign_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);
CREATE INDEX IF NOT EXISTS sessions_campaign_status_idx ON sessions(campaign_id, status);

-- Audio files indexes
-- Queries filter by tags using array overlap
CREATE INDEX IF NOT EXISTS audio_files_tags_idx ON audio_files USING GIN(tags);

-- Light configs indexes
-- Most queries are by user_id (already has RLS but no explicit index)
CREATE INDEX IF NOT EXISTS light_configs_user_id_idx ON light_configs(user_id);