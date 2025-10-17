# Lorelight MVP

A streamlined DM command center for tabletop RPG sessions with integrated audio playback and smart lighting control.

## ✨ Current Status

**Production Ready** - Full-featured MVP with 3-tier architecture (Essential + Enhanced + Future features).

### Essential Features (Core MVP) ✅
- **Authentication**: Signup, login, logout with Supabase Auth
- **Campaign Management**: Create, edit, delete campaigns
- **Session Management**: Create, edit, delete sessions with active/inactive toggle
- **Scene System**: Pre-configured audio + lighting combinations with <100ms switching
- **Audio Library**: Upload to Cloudflare R2, organize with tags and folders
- **Audio Player**: Persistent footer player with playback controls
- **Philips Hue**: Smart lighting integration with room/light control
- **Performance**: Optimized with lazy loading, batch updates, indexed queries

### Enhanced Features (Power Users) ✅
- **Scene Blocks**: Notion-like rich text editor (8 block types: text, headings, lists, images)
- **Scene NPCs**: Enemy/NPC management with flexible stats and images
- **Advanced File Explorer**: Hierarchical folders, drag-and-drop, search & filter
- **Audio Playlists**: Many-to-many audio collections with reordering

### Future Features 🚧
- Combat tracker
- Dice roller  
- Session recording/playback
- Shared campaigns (multi-DM)
- Mobile app
- Voice control

### Code Quality ✅
- Zero lint errors, zero warnings
- Strict TypeScript mode (1 expected Immer+Map warning)
- 100% type coverage
- Row Level Security on all tables
- Production-ready error handling

See [CHANGELOG.md](./CHANGELOG.md) for version history and [docs/TECHNICAL_PRD.md](./docs/technical-prd.md) for complete feature specifications.

## Features (MVP Scope)

- **Campaign & Session Management**: Organize your games hierarchically ✅
- **Scene System**: Pre-configured audio + lighting combinations 🚧
- **Audio Library**: Cloud-stored music and SFX with instant playback 🚧
- **Smart Lighting**: Philips Hue integration for immersive ambience 🚧
- **Lightning Fast**: <100ms scene switching target

## Quick Start

```bash
# 1. Clone and install
git clone git@github.com:tommygeoco/lorelight-mvp.git
cd lorelight-mvp
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials (see SETUP.md)

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**First time?** See [SETUP.md](./SETUP.md) for complete setup instructions including:
- Getting Supabase credentials
- Running database migrations  
- Configuring Cloudflare R2
- Setting up Philips Hue (optional)

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

- **[SETUP.md](./SETUP.md)** - Complete setup guide with troubleshooting
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - UI components and design patterns
- **[docs/TECHNICAL_PRD.md](./docs/technical-prd.md)** - Product requirements & architecture
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and features

## Developer Guidelines

### Documentation Philosophy

**Core Principle: Consolidation Over Creation**

This codebase maintains a **strict 5-document limit** to prevent bloat and ensure maintainability:

1. **README.md** - Project overview, quick start, developer guidelines (this file)
2. **SETUP.md** - Environment setup, installation, troubleshooting
3. **DESIGN_SYSTEM.md** - UI components, patterns, styling rules
4. **docs/technical-prd.md** - Product requirements, architecture, roadmap
5. **CHANGELOG.md** - Version history, features, breaking changes

**Rules for Developers & AI Agents:**

✅ **DO:**
- Update existing docs when adding features
- Add sections to appropriate existing files
- Use code comments for implementation details
- Put troubleshooting in SETUP.md
- Put architecture decisions in README.md or PRD
- Document new components in DESIGN_SYSTEM.md
- Track changes in CHANGELOG.md

❌ **DON'T:**
- Create new markdown files (use existing structure)
- Duplicate information across files
- Create "PHASE_X_COMPLETE.md" or status docs
- Write separate "MIGRATION_GUIDE.md" or "TROUBLESHOOTING.md"
- Add planning docs like "SPEC.md" or "DESIGN.md" (use PRD)
- Create per-feature documentation files

**Exception:** Temporary working docs (REFACTORING_SUMMARY.md) can exist during major work but should be deleted after merging or archived.

**If you need to add significant documentation:**
1. Check if it fits in an existing file (90% of the time it does)
2. Add a new section to the most relevant file
3. Update the table of contents if needed
4. Never create a 6th permanent doc without explicit approval

**This prevents:** Documentation sprawl (we had 22 files, consolidated to 5 with zero information loss).

---

### Architecture Patterns

**Service Layer:**  
All database operations go through `/lib/services/browser/` - never call Supabase directly from components.

```typescript
// ❌ Don't: Direct Supabase calls
const { data } = await supabase.from('campaigns').select()

// ✅ Do: Use service layer
import { campaignService } from '@/lib/services/browser/campaignService'
const campaigns = await campaignService.list()
```

**State Management:**  
Zustand stores with Immer for immutable updates. Always enable MapSet plugin when using Map/Set.

```typescript
import { enableMapSet } from 'immer'
enableMapSet() // REQUIRED at module top

export const useMyStore = create<State>()(
  persist(
    immer((set) => ({
      items: new Map(), // Map/Set supported
      // ...
    })),
    { name: 'my-store' }
  )
)
```

**Optimistic Updates:**  
Update UI immediately, rollback on error:

```typescript
// Optimistic update
const original = get().items.get(id)
set(state => { state.items.set(id, updated) })

try {
  await service.update(id, updates)
} catch (error) {
  // Rollback
  set(state => { state.items.set(id, original) })
  throw error
}
```

**Component Organization:**
- Keep components <200 lines
- Extract sub-components for complex UI
- Use custom hooks for shared logic
- Follow design system patterns (see DESIGN_SYSTEM.md)

### Common Issues

**Immer + Map TypeScript Warning:**
```
TS2589: Type instantiation is excessively deep
```
- **Status**: Expected behavior, documented in code
- **Impact**: None - runtime works perfectly
- **Reason**: TypeScript limitation with recursive Immer types on Maps

**Audio Player / Scene Coupling:**
- **Status**: Known issue, documented in technical PRD
- **Current Behavior**: Audio player pause triggers scene deactivation
- **Expected Behavior**: Audio player should be independent; only scene activation/deactivation should control lights
- **Impact**: Minor UX issue - scene deactivates when pausing audio
- **Priority**: Medium (functional but not ideal)

**Authentication:**
- Server-side: Use `await getUser()` not `getSession()`
- Client-side: Use `useAuthStore()` hook
- All API routes require authentication check

**Performance:**
- Scene switch target: <100ms
- Use fetch-once pattern (Set/boolean flags)
- Implement optimistic updates for instant feedback
- Batch database operations when possible

### Code Quality Standards

**TypeScript:**
- Strict mode enabled
- No `any` types without explicit reason
- Interface for all component props

**React:**
- Functional components only
- Proper cleanup in useEffect
- Memoization for expensive operations

**Testing Before Commit:**
```bash
npm run lint        # Must pass with 0 errors
npm run typecheck   # 1 expected Immer+Map warning OK
npm run build       # Must succeed
```

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

This is a production-ready MVP with active development. See [docs/TECHNICAL_PRD.md](./docs/technical-prd.md) for roadmap and [CHANGELOG.md](./CHANGELOG.md) for recent changes.

**Before submitting PR:**
1. Run `npm run lint && npm run typecheck && npm run build`
2. Test affected features manually
3. Update documentation if needed
4. Follow existing patterns (service layer, Zustand stores, design system)

## Repository

GitHub: [tommygeoco/lorelight-mvp](https://github.com/tommygeoco/lorelight-mvp)

## License

MIT