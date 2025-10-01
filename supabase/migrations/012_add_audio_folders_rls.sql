-- Enable RLS on audio_folders
ALTER TABLE audio_folders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own folders
CREATE POLICY "Users can read own audio folders"
  ON audio_folders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own folders
CREATE POLICY "Users can insert own audio folders"
  ON audio_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own folders
CREATE POLICY "Users can update own audio folders"
  ON audio_folders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own folders
CREATE POLICY "Users can delete own audio folders"
  ON audio_folders
  FOR DELETE
  USING (auth.uid() = user_id);
