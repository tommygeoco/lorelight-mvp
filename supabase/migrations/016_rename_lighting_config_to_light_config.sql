-- Migration 016: Fix lighting_config/light_config column duplication
-- Both columns exist - keep light_config, drop lighting_config

-- Drop the old lighting_config column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='scenes' AND column_name='lighting_config'
    ) THEN
        -- Copy any existing data from lighting_config to light_config
        UPDATE scenes
        SET light_config = COALESCE(light_config, lighting_config)
        WHERE lighting_config IS NOT NULL AND light_config IS NULL;

        -- Drop the old column
        ALTER TABLE scenes DROP COLUMN lighting_config;
    END IF;
END $$;

-- Ensure light_config column exists (should already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='scenes' AND column_name='light_config'
    ) THEN
        ALTER TABLE scenes ADD COLUMN light_config JSONB;
    END IF;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
