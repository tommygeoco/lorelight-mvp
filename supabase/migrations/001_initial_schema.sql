-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  session_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audio files table
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration NUMERIC,
  format TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Light configurations table
CREATE TABLE light_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brightness INTEGER CHECK (brightness >= 0 AND brightness <= 100),
  color_temp INTEGER,
  rgb_color JSONB,
  transition_duration INTEGER DEFAULT 400,
  room_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scenes table
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE SET NULL,
  light_config_id UUID REFERENCES light_configs(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  scene_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hue settings table (per user)
CREATE TABLE hue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bridge_ip TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  selected_rooms TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX campaigns_user_id_idx ON campaigns(user_id);
CREATE INDEX sessions_campaign_id_idx ON sessions(campaign_id);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_status_idx ON sessions(status);
CREATE INDEX scenes_session_id_idx ON scenes(session_id);
CREATE INDEX scenes_user_id_idx ON scenes(user_id);
CREATE INDEX audio_files_user_id_idx ON audio_files(user_id);
CREATE INDEX light_configs_user_id_idx ON light_configs(user_id);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE light_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hue_settings ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Audio files policies
CREATE POLICY "Users can view their own audio files"
  ON audio_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio files"
  ON audio_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio files"
  ON audio_files FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio files"
  ON audio_files FOR DELETE
  USING (auth.uid() = user_id);

-- Light configs policies
CREATE POLICY "Users can view their own light configs"
  ON light_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own light configs"
  ON light_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own light configs"
  ON light_configs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own light configs"
  ON light_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Scenes policies
CREATE POLICY "Users can view their own scenes"
  ON scenes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenes"
  ON scenes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes"
  ON scenes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes"
  ON scenes FOR DELETE
  USING (auth.uid() = user_id);

-- Hue settings policies
CREATE POLICY "Users can view their own hue settings"
  ON hue_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hue settings"
  ON hue_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hue settings"
  ON hue_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hue settings"
  ON hue_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at
  BEFORE UPDATE ON scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hue_settings_updated_at
  BEFORE UPDATE ON hue_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();