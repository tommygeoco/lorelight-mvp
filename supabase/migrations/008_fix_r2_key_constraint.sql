-- Remove NOT NULL constraint from r2_key column or drop it if not needed
DO $$
BEGIN
  -- Check if r2_key column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_files'
    AND column_name = 'r2_key'
  ) THEN
    -- Remove NOT NULL constraint
    ALTER TABLE audio_files ALTER COLUMN r2_key DROP NOT NULL;
  END IF;
END $$;
