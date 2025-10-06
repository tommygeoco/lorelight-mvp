# Supabase scene_blocks Troubleshooting

## Issue
Table `scene_blocks` exists in database but returns 404 from REST API.

## Root Cause
PostgREST schema cache not updated after migration.

## Solutions (Try in order)

### Solution 1: SQL Permissions & Reload
```sql
-- Grant proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.scene_blocks TO authenticated;
GRANT SELECT ON public.scene_blocks TO anon;

-- Reload schema
NOTIFY pgrst, 'reload schema';
```

### Solution 2: API Settings
1. Go to: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/settings/api
2. Find "Exposed schemas" setting
3. Ensure `public` is in the list
4. Click "Save"
5. Wait 30 seconds for changes to propagate

### Solution 3: Manual Schema Refresh
1. Go to: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/api-docs
2. Click the "Refresh" icon in the top right
3. Wait for schema to reload

### Solution 4: Full Project Restart
1. Go to: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/settings/general
2. Pause project (wait 1 minute)
3. Resume project (wait 2 minutes)
4. Try again

### Solution 5: Alternative - Use Direct SQL
If REST API won't work, we can bypass it temporarily:

1. Create an Edge Function to access scene_blocks directly via SQL
2. Or use Supabase SQL queries instead of REST API

## Verification
After trying a solution, test with:
```sql
SELECT COUNT(*) FROM scene_blocks;
```

Then try creating a note block in the app.
