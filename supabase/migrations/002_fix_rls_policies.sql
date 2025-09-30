-- Fix RLS policies for MVP tables
-- This ensures policies work correctly with Supabase Auth

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON campaigns;

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

DROP POLICY IF EXISTS "Users can view their own scenes" ON scenes;
DROP POLICY IF EXISTS "Users can insert their own scenes" ON scenes;
DROP POLICY IF EXISTS "Users can update their own scenes" ON scenes;
DROP POLICY IF EXISTS "Users can delete their own scenes" ON scenes;

DROP POLICY IF EXISTS "Users can view their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can insert their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can update their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON audio_files;

DROP POLICY IF EXISTS "Users can view their own light configs" ON light_configs;
DROP POLICY IF EXISTS "Users can insert their own light configs" ON light_configs;
DROP POLICY IF EXISTS "Users can update their own light configs" ON light_configs;
DROP POLICY IF EXISTS "Users can delete their own light configs" ON light_configs;

DROP POLICY IF EXISTS "Users can view their own hue settings" ON hue_settings;
DROP POLICY IF EXISTS "Users can insert their own hue settings" ON hue_settings;
DROP POLICY IF EXISTS "Users can update their own hue settings" ON hue_settings;
DROP POLICY IF EXISTS "Users can delete their own hue settings" ON hue_settings;

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Scenes policies
CREATE POLICY "Users can view their own scenes"
  ON scenes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenes"
  ON scenes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes"
  ON scenes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes"
  ON scenes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Audio files policies
CREATE POLICY "Users can view their own audio files"
  ON audio_files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio files"
  ON audio_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio files"
  ON audio_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio files"
  ON audio_files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Light configs policies
CREATE POLICY "Users can view their own light configs"
  ON light_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own light configs"
  ON light_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own light configs"
  ON light_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own light configs"
  ON light_configs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Hue settings policies
CREATE POLICY "Users can view their own hue settings"
  ON hue_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hue settings"
  ON hue_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hue settings"
  ON hue_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hue settings"
  ON hue_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);