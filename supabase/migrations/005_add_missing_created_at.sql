-- Add created_at column to audio_files if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_files'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE audio_files
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;
