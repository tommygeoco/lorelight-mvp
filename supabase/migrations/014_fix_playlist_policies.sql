-- Migration 014: Fix audio playlist RLS policies
-- Ensures users can create and manage their own playlists

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own playlists" ON audio_playlists;
DROP POLICY IF EXISTS "Users can create their own playlists" ON audio_playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON audio_playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON audio_playlists;
DROP POLICY IF EXISTS "Users can view their playlist audio" ON playlist_audio;
DROP POLICY IF EXISTS "Users can manage their playlist audio" ON playlist_audio;

-- Ensure RLS is enabled
ALTER TABLE audio_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_audio ENABLE ROW LEVEL SECURITY;

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

-- Playlist audio policies (separate policies for each operation)
CREATE POLICY "Users can view their playlist audio"
  ON playlist_audio FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audio_playlists
    WHERE audio_playlists.id = playlist_audio.playlist_id
    AND audio_playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their playlist audio"
  ON playlist_audio FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM audio_playlists
    WHERE audio_playlists.id = playlist_audio.playlist_id
    AND audio_playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their playlist audio"
  ON playlist_audio FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM audio_playlists
    WHERE audio_playlists.id = playlist_audio.playlist_id
    AND audio_playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their playlist audio"
  ON playlist_audio FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM audio_playlists
    WHERE audio_playlists.id = playlist_audio.playlist_id
    AND audio_playlists.user_id = auth.uid()
  ));
