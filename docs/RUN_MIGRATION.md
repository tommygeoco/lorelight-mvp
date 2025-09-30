# Running the Database Migration

You have two options to run the migration:

## Option 1: Via Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/editor

2. Click the "SQL Editor" in the left sidebar

3. Click "New Query"

4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`

5. Paste into the SQL editor

6. Click "Run" or press Cmd+Enter

7. You should see "Success. No rows returned"

8. Verify tables were created:
   - Go to "Table Editor" in left sidebar
   - You should see: campaigns, sessions, scenes, audio_files, light_configs, hue_settings

## Option 2: Via Supabase CLI

If you have Supabase CLI installed:

```bash
# Install CLI (if not installed)
npm install -g supabase

# Link to project
supabase link --project-ref hedhioooreyzwotndeqf

# Push migration
supabase db push
```

## After Running Migration

Restart your dev server:

```bash
npm run dev
```

Then visit http://localhost:3000 and you should be able to:
1. Sign up / Log in
2. Create campaigns
3. Create sessions
4. Everything should work!

## Verify Migration Worked

After running the migration, check the Supabase dashboard:

1. Go to Table Editor: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/editor
2. You should see these new tables:
   - campaigns
   - sessions
   - scenes
   - audio_files
   - light_configs
   - hue_settings

Each table should have RLS policies enabled (green shield icon).

## If Something Goes Wrong

If you see errors about existing tables or policies, it means some parts were already created. You can either:

1. **Drop and recreate** (WARNING: loses data):
   ```sql
   DROP TABLE IF EXISTS campaigns, sessions, scenes, audio_files, light_configs, hue_settings CASCADE;
   ```
   Then run the full migration again.

2. **Skip conflicting parts**: Comment out the parts of the migration that already exist.

## Migration File Location

The migration file is here:
`/Users/tommygeoco/Dev/lorelight-mvp/supabase/migrations/001_initial_schema.sql`

You can open it in your editor to see what will be created.