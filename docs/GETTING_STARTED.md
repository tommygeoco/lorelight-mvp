# Lorelight MVP - Getting Started

## What's Been Created

A brand new Next.js 15 project scaffolded for the Lorelight MVP with the following foundation:

### Core Configuration
- ✅ Next.js 15 with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS 4
- ✅ ESLint configuration
- ✅ Key dependencies installed (Zustand, Supabase, Immer, etc.)

### Database Foundation
- ✅ Complete SQL schema with 6 core tables:
  - `campaigns` - Top-level campaign organization
  - `sessions` - Individual game sessions
  - `scenes` - Pre-configured audio + lighting states
  - `audio_files` - Cloud-stored audio library
  - `light_configs` - Saved Hue light presets
  - `hue_settings` - Per-user Hue authentication
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Proper indexes for performance
- ✅ Auto-updating `updated_at` triggers

### Type System
- ✅ Complete TypeScript definitions for all database tables
- ✅ Type-safe insert/update/select operations
- ✅ Extended types for relations (SceneWithRelations, etc.)

### Utilities
- ✅ Supabase client factory
- ✅ Utility functions (cn, formatBytes, formatDuration, debounce)
- ✅ UUID generation helper

### Documentation
- ✅ Comprehensive Technical PRD (`docs/technical-prd.md`)
- ✅ CLAUDE.md with development guidelines
- ✅ Environment variable template (`.env.example`)
- ✅ Project README

## Next Steps

### 1. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cd /Users/tommygeoco/Dev/lorelight-mvp
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials:
- Supabase project URL and keys
- Cloudflare R2 credentials (same as existing Lorelight)
- Philips Hue credentials (optional, same as existing Lorelight)

### 2. Set Up Supabase

If you want to use the same Supabase project as the existing Lorelight:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your existing project
supabase link --project-ref your-project-ref

# Push the new schema (this will create new tables alongside existing ones)
supabase db push
```

**OR** create a new Supabase project for the MVP:

1. Go to https://supabase.com/dashboard
2. Create new project: "lorelight-mvp"
3. Copy credentials to `.env.local`
4. Run migration: `supabase db push`

### 3. Remaining Implementation Tasks

The foundation is complete. To build the MVP, you'll need:

#### Phase 1: Authentication (1-2 days)
- [ ] Auth context provider
- [ ] Login/signup pages
- [ ] Protected route middleware
- [ ] User session management

#### Phase 2: Service Layer (2-3 days)
- [ ] Campaign service (CRUD operations)
- [ ] Session service
- [ ] Scene service
- [ ] Audio service
- [ ] Light config service
- [ ] Hue API integration service

#### Phase 3: State Management (1-2 days)
- [ ] Campaign store (Zustand)
- [ ] Session store
- [ ] Scene store
- [ ] Audio player store
- [ ] Light control store
- [ ] UI store

#### Phase 4: UI Components (3-4 days)
- [ ] Campaign list & forms
- [ ] Session list & forms
- [ ] Scene grid & switcher
- [ ] Audio library & uploader
- [ ] Audio player (footer)
- [ ] Light configuration UI
- [ ] Hue setup wizard

#### Phase 5: Core Features (2-3 days)
- [ ] Scene switching logic
- [ ] Audio playback system
- [ ] Hue light control
- [ ] Cloudflare R2 upload integration

#### Phase 6: Polish (1-2 days)
- [ ] Error handling
- [ ] Loading states
- [ ] Smooth transitions
- [ ] Performance optimization

**Total Estimated Time: 10-15 days**

## Key Differences from Existing Lorelight

### What's Included (MVP Focus)
- ✅ Campaigns & Sessions
- ✅ Scenes (audio + lighting)
- ✅ Audio library & player
- ✅ Philips Hue integration
- ✅ Cloud-first (no IndexedDB)

### What's Excluded (Post-MVP)
- ❌ Combat tracker
- ❌ NPCs, Locations, Items
- ❌ Dice roller
- ❌ Notes system
- ❌ Rules reference

### Architecture Improvements
- **Cloud-First**: No IndexedDB migration needed
- **Service Layer**: Consistent API for all data operations
- **Type Safety**: Full TypeScript coverage from day one
- **Performance**: Built-in optimization patterns
- **Simplicity**: Single responsibility per component

## Development Workflow

```bash
# Start development server
npm run dev

# Before committing
npm run lint
npm run typecheck

# Build for production
npm run build
```

## File Structure Overview

```
lorelight-mvp/
├── app/                    # Next.js pages (to be created)
├── components/             # React components (to be created)
├── lib/
│   ├── auth/
│   │   └── supabase.ts    # ✅ Supabase client
│   ├── services/          # Service layer (to be created)
│   └── utils.ts           # ✅ Utility functions
├── store/                 # Zustand stores (to be created)
├── types/
│   ├── database.ts        # ✅ Database types
│   └── index.ts           # ✅ Application types
├── supabase/
│   ├── config.toml        # ✅ Supabase config
│   └── migrations/
│       └── 001_initial_schema.sql  # ✅ Database schema
├── docs/
│   ├── technical-prd.md   # ✅ Complete technical spec
│   └── GETTING_STARTED.md # ✅ This file
├── .env.example           # ✅ Environment template
├── CLAUDE.md              # ✅ Development guidelines
└── README.md              # ✅ Project overview
```

## Testing the Foundation

To verify the setup is working:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Check for TypeScript errors
npm run typecheck

# 3. Check for linting issues
npm run lint

# 4. Start dev server
npm run dev
```

Visit http://localhost:3000 - you should see the default Next.js page.

## Copying Credentials from Existing Lorelight

You can reuse all your existing credentials:

```bash
# Copy Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=<same as lorelight>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same as lorelight>
SUPABASE_SERVICE_ROLE_KEY=<same as lorelight>

# Copy R2 credentials
R2_ACCOUNT_ID=<same as lorelight>
R2_ACCESS_KEY_ID=<same as lorelight>
R2_SECRET_ACCESS_KEY=<same as lorelight>
R2_BUCKET_NAME=<same as lorelight>
R2_ENDPOINT=<same as lorelight>

# Copy Hue credentials (if configured)
HUE_CLIENT_ID=<same as lorelight>
HUE_CLIENT_SECRET=<same as lorelight>
HUE_APP_ID=<same as lorelight>
```

The MVP will use the same cloud resources but with a simplified, focused feature set.

## Questions?

Refer to:
- **Technical Details**: `docs/technical-prd.md`
- **Development Guidelines**: `CLAUDE.md`
- **Database Schema**: `supabase/migrations/001_initial_schema.sql`

---

**Ready to build!** The foundation is solid. Start with authentication, then build out the service layer, and finally create the UI components.