-- Fix audio_files table schema - add missing columns if they don't exist
DO $$
BEGIN
  -- Add file_url if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_files'
    AND column_name = 'file_url'
  ) THEN
    ALTER TABLE audio_files ADD COLUMN file_url TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add file_size if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_files'
    AND column_name = 'file_size'
  ) THEN
    ALTER TABLE audio_files ADD COLUMN file_size BIGINT;
  END IF;

  -- Add duration if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_files'
    AND column_name = 'duration'
  ) THEN
    ALTER TABLE audio_files ADD COLUMN duration NUMERIC;
  END IF;

  -- Add format if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'format'
    AND column_name = 'file_size'
  ) THEN
    ALTER TABLE audio_files ADD COLUMN format TEXT;
  END IF;

  -- Add tags if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_files'
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE audio_files ADD COLUMN tags TEXT[];
  END IF;
END $$;
