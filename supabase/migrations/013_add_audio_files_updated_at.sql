-- Migration 013: Add updated_at column to audio_files table
-- This fixes the error when updating audio files

-- Add updated_at column to audio_files if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audio_files' AND column_name='updated_at') THEN
        ALTER TABLE audio_files ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Create trigger to automatically update updated_at on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_audio_files_updated_at ON audio_files;
CREATE TRIGGER update_audio_files_updated_at
    BEFORE UPDATE ON audio_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
