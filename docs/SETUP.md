# Lorelight MVP - Setup Instructions

## 1. Environment Variables

The `.env.local` file has been created with all credentials from the existing Lorelight project **EXCEPT** the `SUPABASE_SERVICE_ROLE_KEY`.

### Getting the Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/hedhioooreyzwotndeqf/settings/api
2. Copy the `service_role` key (secret, not public!)
3. Replace the placeholder in `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_actual_key_here
   ```

**Important**: The service role key is a SECRET key with full database access. Never commit it to git!

## 2. Database Setup

### Option A: Use Existing Supabase Project (Recommended)

We're using the same Supabase project as the original Lorelight, which means we'll add the MVP tables alongside the existing ones.

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to existing project
supabase link --project-ref hedhioooreyzwotndeqf

# Push the migration
supabase db push
```

This will create these new tables:
- `campaigns`
- `sessions`
- `scenes`
- `audio_files`
- `light_configs`
- `hue_settings`

**These tables are separate from the original Lorelight tables**, so there's no conflict. Both versions can run side-by-side.

### Option B: Create New Supabase Project

If you want a completely separate database:

1. Go to https://supabase.com/dashboard
2. Create new project: "lorelight-mvp"
3. Update `.env.local` with new project credentials
4. Push migration: `supabase db push`

## 3. Start Development Server

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

Visit: http://localhost:3000

## 4. First-Time Flow

1. Click "Get Started" or "Sign Up"
2. Create an account
3. You'll be redirected to the dashboard
4. Create your first campaign
5. Click the campaign to add sessions
6. Click a session to manage scenes

## Current Status

### ✅ Working Now
- Authentication (signup, login, logout)
- Campaign management (CRUD)
- Session management (CRUD)
- Active session switching
- Protected routes
- Real-time database sync

### 🚧 Next Steps
- Scene builder
- Audio library
- Audio player
- Hue integration
- API routes for upload

## Troubleshooting

### "Supabase client requires URL and Key"

Make sure `.env.local` exists with valid credentials. Restart the dev server after creating/updating `.env.local`.

### "RLS policy violation"

The migration creates RLS policies that require authentication. Make sure you're logged in.

### Tables not found

Run the migration: `supabase db push`

### Turbopack issues

If you see weird errors, try without Turbopack:
```bash
npm run dev -- --no-turbopack
```

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

Key tables:
- **campaigns**: Top-level organization
- **sessions**: Game sessions within campaigns
- **scenes**: Pre-configured audio + lighting states
- **audio_files**: Cloud-stored audio library
- **light_configs**: Saved Hue light presets
- **hue_settings**: Per-user Hue authentication

All tables have Row Level Security (RLS) enforcing user isolation.