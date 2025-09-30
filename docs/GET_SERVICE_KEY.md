# How to Get Your Supabase Service Role Key

## Step-by-Step Instructions

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/settings/api

2. **Find "Project API keys" section**

3. **Look for these two keys**:
   - `anon` `public` - This is already in your `.env.local` ✓
   - `service_role` `secret` - **This is what you need!**

4. **Copy the `service_role` key**:
   - It will be a long JWT token starting with `eyJ...`
   - It's labeled as "secret" (not public!)
   - Click the "Copy" button or "Reveal" to see it

5. **Update `.env.local`**:
   Replace this line:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   With:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...actual_long_token_here
   ```

## What Each Key Does

- **`anon` key** (already configured):
  - Used by browser/client
  - Respects Row Level Security (RLS)
  - Safe to expose publicly

- **`service_role` key** (what you need):
  - Used by server-side code
  - Bypasses RLS (full database access)
  - **MUST be kept secret!**
  - Never commit to git
  - Never expose to browser

## Security Note

The service role key has full database access. That's why it's kept secret and only used in server-side API routes. The MVP project is configured to only use it server-side, never in the browser.

## After Adding the Key

1. Save `.env.local`
2. Restart your dev server: `npm run dev`
3. The error should be gone!

## Alternative: Check Original Lorelight

If you can't find it in the dashboard, check the original Lorelight project:

```bash
cd /Users/tommygeoco/Dev/lorelight
cat .env.local | grep SERVICE_ROLE
```

If it's there, copy that value to the MVP project.