# Check Your Sessions Table Columns

The MVP expects a `session_date` column but your database doesn't have it.

## Quick Fix - Check what columns exist:

1. Go to: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/editor
2. Click on "sessions" table in the left sidebar
3. Look at the columns

## Likely scenario:

Your existing Lorelight sessions table probably doesn't have a `session_date` column.

The code has been updated to use `created_at` for sorting instead, which should work fine.

## Try it now:

Refresh your browser and try clicking a campaign again. It should work now!