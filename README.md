# Lorelight MVP

A streamlined DM command center for tabletop RPG sessions with integrated audio playback and smart lighting control.

## Features

- **Campaign & Session Management**: Organize your games hierarchically
- **Scene System**: Pre-configured audio + lighting combinations
- **Audio Library**: Cloud-stored music and SFX with instant playback
- **Smart Lighting**: Philips Hue integration for immersive ambience
- **Lightning Fast**: <100ms scene switching

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- Cloudflare R2 account
- Philips Hue Bridge (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checking
```

## Project Structure

```
lorelight-mvp/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── audio/             # Audio library & player
│   ├── campaigns/         # Campaign management
│   ├── scenes/            # Scene creation & switching
│   ├── sessions/          # Session management
│   ├── lighting/          # Hue integration
│   └── ui/                # Shared UI components
├── lib/                   # Utilities and services
│   ├── services/          # Backend services
│   └── utils/             # Helper functions
├── store/                 # Zustand state management
├── supabase/              # Database migrations
└── types/                 # TypeScript definitions
```

## Documentation

- [Technical PRD](./docs/technical-prd.md) - Complete technical specifications
- [CLAUDE.md](./CLAUDE.md) - Development guidelines for Claude Code

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Authentication**: Supabase Auth
- **Smart Lights**: Philips Hue API

## Performance Targets

- Scene switch: <100ms
- Page load: <500ms
- Audio resume: <50ms
- Lighthouse score: >90

## License

MIT