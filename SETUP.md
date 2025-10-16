# Lorelight MVP - Setup Guide

Complete guide to setting up and running the Lorelight MVP locally.

---

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free tier works)
- **Cloudflare R2** account (for audio storage)
- **Philips Hue Bridge** (optional, for smart lighting features)

---

## Quick Start (3 Steps)

### 1. Install Dependencies

```bash
cd /Users/tommygeoco/Dev/lorelight-mvp
npm install
```

### 2. Configure Environment Variables

Copy the example file and add your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2 (Required for audio uploads)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_DOMAIN=your-r2-public-domain.com

# Philips Hue (Optional)
HUE_CLIENT_ID=your-hue-client-id
HUE_CLIENT_SECRET=your-hue-client-secret
HUE_APP_ID=your-hue-app-id
```

**See below for detailed instructions on getting each credential.**

### 3. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Detailed Setup Instructions

### Getting Supabase Credentials

#### 1. Supabase URL and Anon Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 2. Supabase Service Role Key

This key has full database access and must be kept secret!

1. Go to **Settings** → **API** in your Supabase dashboard
2. Find the **Project API keys** section
3. Locate the `service_role` key (marked as "secret")
4. Click "Copy" or "Reveal" to see the key
5. It will be a long JWT token starting with `eyJ...`
6. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

**Security Warning:**
- Never commit this key to git
- Never expose it in browser code
- Only use server-side in API routes

---

### Database Setup

#### Option A: Use Existing Tables (Recommended)

If you're working with an existing Lorelight database that already has tables, **you don't need to run migrations**. The tables are already there!

Verify by checking your Supabase dashboard → Table Editor. You should see:
- campaigns
- sessions  
- scenes
- audio_files
- light_configs
- hue_settings
- session_scenes
- audio_folders
- audio_playlists
- scene_presets
- scene_blocks
- scene_npcs

If these exist, skip to "Start Development Server" below.

#### Option B: Run Migrations (Fresh Database)

If starting with a fresh database:

**Via Supabase Dashboard (Easiest):**

1. Go to your project's SQL Editor
2. Click "New Query"
3. Copy contents from `supabase/migrations/` files in order (001, 002, etc.)
4. Paste and run each migration
5. Verify success ("Success. No rows returned" or row counts)

**Via Supabase CLI:**

```bash
# Install CLI globally
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

**Verify Migration:**
- Go to Table Editor in Supabase dashboard
- All tables listed above should exist
- Each table should have RLS enabled (green shield icon)

---

### Cloudflare R2 Setup

R2 is used for audio file storage (alternative to S3).

#### 1. Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click "Create bucket"
4. Name your bucket (e.g., "lorelight-audio")
5. Choose a location close to your users

#### 2. Get Access Keys

1. In R2, go to **Manage R2 API Tokens**
2. Click "Create API Token"
3. Give it a name (e.g., "Lorelight Upload")
4. Set permissions: **Object Read & Write**
5. Apply to your bucket
6. Copy the credentials:
   - **Account ID**: `R2_ACCOUNT_ID`
   - **Access Key ID**: `R2_ACCESS_KEY_ID`
   - **Secret Access Key**: `R2_SECRET_ACCESS_KEY`

#### 3. Configure Public Access (Optional)

For direct browser playback:

1. Go to your bucket settings
2. Enable "Public Access" or set up a custom domain
3. Add the public URL to `.env.local` as `R2_PUBLIC_DOMAIN`

---

### Philips Hue Setup (Optional)

Only needed if you want smart lighting features.

#### 1. Create Hue Developer Account

1. Go to [Philips Hue Developer Portal](https://developers.meethue.com/)
2. Sign up for a developer account
3. Create a new app

#### 2. Get OAuth Credentials

1. In your app settings, note:
   - **Client ID**: `HUE_CLIENT_ID`
   - **Client Secret**: `HUE_CLIENT_SECRET`
   - **App ID**: `HUE_APP_ID`

#### 3. Configure Redirect URL

Set OAuth redirect URL to:
```
http://localhost:3000/api/hue/callback
```

For production, update to your production domain.

---

## First-Time Application Flow

Once the server is running:

1. Visit **http://localhost:3000**
2. Click "Sign Up" to create an account
3. Verify your email (if Supabase email confirmation is enabled)
4. Log in with your credentials
5. You'll be redirected to the dashboard
6. Create your first campaign
7. Click the campaign to add sessions
8. Click a session to manage scenes
9. (Optional) Set up Hue lights via the Lights page

---

## Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run all checks before committing
npm run lint && npm run typecheck && npm run build
```

---

## Troubleshooting

### "Supabase URL required"

**Problem:** Environment variables not loaded

**Solution:**
1. Ensure `.env.local` exists in project root
2. Restart dev server after creating/updating `.env.local`
3. Check for typos in environment variable names

---

### "RLS policy violation"

**Problem:** Row Level Security preventing access

**Solution:**
1. Make sure you're logged in to the app
2. Check that RLS policies exist on all tables (green shield in Supabase dashboard)
3. Verify `user_id` columns exist and match your auth user ID

---

### "Table doesn't exist"

**Problem:** Database migrations not run

**Solution:**
- Run migrations (see "Database Setup" above)
- Verify tables exist in Supabase Table Editor
- Check for typos in table names

---

### "relation 'X' already exists"

**Problem:** Tables already exist (this is actually good!)

**Solution:**
- Skip migrations, tables are already set up
- Just start the dev server and use the app

---

### Missing Columns (e.g., `session_date`)

**Problem:** Schema mismatch between versions

**Solution:**
- The app has fallbacks for missing columns
- Check which columns exist in your Supabase Table Editor
- Update migrations if needed to add missing columns

---

### Turbopack Issues

**Problem:** Weird errors with Turbopack

**Solution:**
```bash
# Try running without Turbopack
npm run dev -- --no-turbopack
```

---

### R2 Upload Failures

**Problem:** SSL connection errors or timeouts

**Solution:**
- Check R2 credentials are correct
- Verify bucket name and account ID
- Check network/firewall settings
- See retry logic in `lib/r2.ts` (5 attempts with exponential backoff)

---

### Hue Bridge Not Found

**Problem:** Can't discover Hue bridge

**Solution:**
1. Ensure bridge is on same network
2. Try pressing the bridge button
3. Check bridge IP is accessible
4. Try manual IP entry instead of auto-discovery

---

## Database Schema

### Core Tables

- **campaigns**: Top-level organization for games
- **sessions**: Individual game sessions within campaigns
- **scenes**: Pre-configured audio + lighting states
- **session_scenes**: Many-to-many junction (sessions ↔ scenes)
- **audio_files**: Cloud-stored audio library
- **audio_folders**: Hierarchical folder organization
- **audio_playlists**: Audio collections
- **playlist_audio**: Many-to-many junction (playlists ↔ audio)
- **light_configs**: Saved Hue light presets
- **hue_settings**: Per-user Hue authentication
- **scene_presets**: System + user scene templates
- **scene_blocks**: Notion-like rich text content (Enhanced feature)
- **scene_npcs**: NPC/enemy management (Enhanced feature)

All tables have Row Level Security (RLS) enforcing user isolation.

---

## Architecture Overview

```
lorelight-mvp/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (upload, Hue, admin)
│   ├── campaigns/         # Campaign management pages
│   ├── audio/             # Audio library page
│   ├── lights/            # Hue lighting page
│   └── login/signup/      # Auth pages
├── components/            # React components
│   ├── ui/               # Reusable UI components (BaseModal, etc.)
│   ├── audio/            # Audio player, library, playlists
│   ├── campaigns/        # Campaign components
│   ├── sessions/         # Session components
│   ├── scenes/           # Scene management
│   └── hue/              # Philips Hue components
├── lib/
│   ├── services/         # Service layer (data access)
│   ├── auth/             # Supabase auth helpers
│   ├── utils/            # Utility functions
│   └── r2.ts             # Cloudflare R2 client
├── store/                # Zustand state management
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
└── supabase/migrations/  # Database migrations
```

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom design system (shadcn/ui inspired)
- **State Management**: Zustand with Immer and persistence
- **Database**: Supabase (PostgreSQL with RLS)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: Supabase Auth
- **Smart Lights**: Philips Hue API

---

## What's Working Now

### Essential Features
- ✅ User authentication (signup, login, logout)
- ✅ Campaign CRUD operations
- ✅ Session CRUD operations  
- ✅ Scene management
- ✅ Audio library with uploads to R2
- ✅ Audio player (persistent footer)
- ✅ Philips Hue integration
- ✅ Scene switching with audio + lights

### Enhanced Features (Power User)
- ✅ Scene Blocks (Notion-like rich text)
- ✅ Scene NPCs (Enemy management)
- ✅ Audio folders & playlists
- ✅ Advanced file explorer

---

## What's Coming

See `docs/TECHNICAL_PRD.md` for the complete roadmap.

### Near-Term
- Chunked upload for large files
- Pagination for audio library
- Virtual scrolling for file explorer
- Rate limiting on API routes

### Future
- Combat tracker
- Dice roller
- Session recording
- Shared campaigns
- Mobile app

---

## Performance Targets

- **Scene switch**: <100ms
- **Page load**: <500ms (Time to Interactive)
- **Audio resume**: <50ms
- **Audio library**: <500ms (50 files)
- **Lighthouse score**: >90

---

## Security Notes

### Environment Variables
- `.env.local` is in `.gitignore` - never commit it
- Service role key must remain secret
- Use separate credentials for dev vs production

### Row Level Security
- All tables enforce user isolation via RLS
- Users can only access their own data
- Enforced at database level (not just application)

### API Routes
- All routes require authentication
- Server-side only uses service role key
- File uploads validated for type and size

---

## Getting Help

### Documentation
- `README.md` - Project overview and current status
- `DESIGN_SYSTEM.md` - UI component library and patterns
- `TECHNICAL_PRD.md` - Complete product requirements
- `CHANGELOG.md` - Version history and features

### Common Issues
Check "Troubleshooting" section above for solutions to common problems.

### Database Inspection
Use Supabase dashboard SQL Editor to run queries and inspect data:
```sql
-- Check your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Check campaigns
SELECT * FROM campaigns WHERE user_id = 'your-user-id';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'campaigns';
```

---

## Production Deployment

When ready to deploy:

1. Set all environment variables in your hosting platform
2. Run `npm run build` to verify production build
3. Deploy to Vercel, Netlify, or similar
4. Configure custom domain
5. Enable HTTPS (required for Hue OAuth)
6. Update Hue OAuth redirect URLs to production domain
7. Test all features in production environment

See `docs/TECHNICAL_PRD.md` for complete deployment checklist.

---

**You're all set!** 🚀

Run `npm run dev` and start building your DM command center.

