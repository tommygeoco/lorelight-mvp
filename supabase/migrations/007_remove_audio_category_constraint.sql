-- Remove NOT NULL constraint from category column if it exists
DO $$
BEGIN
  -- Check if category column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_files'
    AND column_name = 'category'
  ) THEN
    -- Remove NOT NULL constraint
    ALTER TABLE audio_files ALTER COLUMN category DROP NOT NULL;
  END IF;
END $$;
