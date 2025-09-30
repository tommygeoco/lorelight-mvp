# Lorelight MVP

A streamlined DM command center for tabletop RPG sessions with integrated audio playback and smart lighting control.

## ✨ Current Status

**Phase 2 Complete** - Campaign and session management fully functional with dark theme UI.

### What's Working Now
- ✅ User authentication (signup, login, protected routes)
- ✅ Campaign management (create, edit, delete, list)
- ✅ Session management (create, edit, delete, active/inactive toggle)
- ✅ Dark theme UI (black background, white borders)
- ✅ Type-safe database operations
- ✅ Zero lint/type errors

### Coming Next
- 🚧 Scene system (grid view, scene switching)
- 🚧 Audio library and playback
- 🚧 Philips Hue lighting integration

See [PROGRESS.md](./docs/PROGRESS.md) for detailed status.

## Features (MVP Scope)

- **Campaign & Session Management**: Organize your games hierarchically ✅
- **Scene System**: Pre-configured audio + lighting combinations 🚧
- **Audio Library**: Cloud-stored music and SFX with instant playback 🚧
- **Smart Lighting**: Philips Hue integration for immersive ambience 🚧
- **Lightning Fast**: <100ms scene switching target

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)
- Cloudflare R2 account (for audio storage - later phase)
- Philips Hue Bridge (optional - later phase)

### Installation

```bash
# Clone repository
git clone git@github.com:tommygeoco/lorelight-mvp.git
cd lorelight-mvp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Setup

Required variables in `.env.local`:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2 (Coming in Phase 4)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Philips Hue (Coming in Phase 5)
HUE_CLIENT_ID=
HUE_CLIENT_SECRET=
HUE_APP_ID=
```

See [docs/SETUP.md](./docs/SETUP.md) for detailed setup instructions.

### Database Setup

**Important**: This MVP works with an existing Lorelight database. If you're setting up from scratch:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations (if using fresh database)
supabase db push
```

**Note**: The existing Lorelight database uses different column names:
- Sessions: `title`, `date`, `description` (not `name`, `session_date`, `notes`)
- This MVP is configured to work with the existing schema

## Development Commands

```bash
npm run dev        # Start development server (with Turbopack)
npm run build      # Build for production
npm run start      # Run production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checking
```

## Project Structure

```
lorelight-mvp/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # Main dashboard
│   └── campaigns/         # Campaign & session pages
├── components/            # React components
│   ├── auth/             # Authentication forms
│   ├── campaigns/        # Campaign management ✅
│   ├── sessions/         # Session management ✅
│   ├── scenes/           # Scene system 🚧
│   └── ui/               # Shared UI (shadcn/ui)
├── lib/                  # Utilities and services
│   ├── auth/            # Supabase auth helpers
│   ├── services/        # Backend services (all ready)
│   └── utils.ts         # Helper functions
├── store/               # Zustand state management
│   ├── authStore.ts    # Authentication state
│   ├── campaignStore.ts # Campaign state ✅
│   ├── sessionStore.ts  # Session state ✅
│   └── audioStore.ts   # Audio playback state
├── contexts/           # React contexts
├── supabase/          # Database migrations
├── types/             # TypeScript definitions
└── docs/              # Documentation
```

## Documentation

- [PROGRESS.md](./docs/PROGRESS.md) - Detailed build progress and status
- [CLAUDE.md](./CLAUDE.md) - Development guidelines for Claude Code
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference guide
- [docs/SETUP.md](./docs/SETUP.md) - Environment setup instructions

## Tech Stack

- **Framework**: Next.js 15.3.4 (App Router with Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (dark theme)
- **State**: Zustand (with localStorage persistence)
- **Database**: Supabase (PostgreSQL with RLS)
- **Storage**: Cloudflare R2 (Phase 4)
- **Authentication**: Supabase Auth
- **Smart Lights**: Philips Hue API (Phase 5)

## Performance Targets

- Scene switch: <100ms
- Page load: <500ms
- Audio resume: <50ms
- Lighthouse score: >90

## Architecture Highlights

- **Service Layer**: All database operations abstracted for consistency
- **Type Safety**: 100% TypeScript coverage with strict mode
- **State Management**: Zustand with Record-based stores (no Immer)
- **Dark Theme**: Consistent black (#000000) background, white text, neutral borders
- **Error Handling**: Enhanced logging and user-friendly error messages
- **RLS Policies**: User data isolation enforced at database level

## Contributing

This is a focused MVP build. See [PROGRESS.md](./docs/PROGRESS.md) for current priorities.

## Repository

GitHub: [tommygeoco/lorelight-mvp](https://github.com/tommygeoco/lorelight-mvp)

## License

MIT