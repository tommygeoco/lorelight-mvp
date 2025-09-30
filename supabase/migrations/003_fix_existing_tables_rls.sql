-- Fix RLS policies for only the tables that exist
-- This script only touches campaigns and sessions tables

-- First, check if RLS is enabled and enable if needed
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON campaigns;

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

-- Campaigns policies with TO authenticated
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

-- Sessions policies with TO authenticated
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