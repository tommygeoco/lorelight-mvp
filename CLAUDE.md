# Lorelight MVP Development Notes

## Project Overview
Lorelight MVP is a focused DM command center for tabletop RPG sessions with smart lighting, audio management, and scene switching.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Supabase (Authentication & Database)
- Cloudflare R2 (Audio Storage)
- Philips Hue (Lighting Control)
- Zustand (State Management)

## Important Commands

### Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checking
```

### Testing
When implementing features, always run these commands before marking tasks as complete:
```bash
npm run lint
npm run typecheck
```

## Architecture Principles

### Cloud-First
- No IndexedDB - Supabase from day one
- All data synced in real-time
- Offline support via optimistic updates

### Service Layer Pattern
All database operations go through `/lib/services/`:
```typescript
// ❌ Don't: Direct Supabase calls in components
const { data } = await supabase.from('campaigns').select()

// ✅ Do: Use service layer
import { campaignService } from '@/lib/services/browser/campaignService'
const campaigns = await campaignService.list()
```

### State Management (Zustand)
- Stores in `/store/` directory
- Use Immer for immutable updates with Map/Set support
- Persist critical state to localStorage
- **IMPORTANT**: Always enable MapSet plugin when using Map/Set with Immer

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'

// Enable Immer MapSet plugin for Map/Set support
enableMapSet()

export const useCampaignStore = create<State>()(
  persist(
    immer((set) => ({
      campaigns: new Map(),
      actions: {
        add: (campaign) => set(state => {
          state.campaigns.set(campaign.id, campaign)
        })
      }
    })),
    { name: 'campaign-store' }
  )
)
```

### Component Organization
```
/components/
├── feature/          # Feature-specific components
│   ├── FeatureList.tsx
│   ├── FeatureCard.tsx
│   └── FeatureForm.tsx
└── ui/              # Shared UI components (shadcn)
```

## Environment Variables
Required in `.env.local` (copy from `.env.example`):
```
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2 (Required)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Philips Hue (Optional)
HUE_CLIENT_ID=
HUE_CLIENT_SECRET=
HUE_APP_ID=
```

## Key Files
- `/lib/auth/supabase.ts` - Supabase client configuration
- `/lib/services/` - Service layer for data operations
- `/store/` - Zustand state management
- `/components/` - React components
- `/app/` - Next.js app router pages
- `/supabase/migrations/` - Database migrations

## Common Issues and Solutions

### Immer + Map/Set Issues
- **Error**: `[Immer] The plugin for 'MapSet' has not been loaded`
- **Solution**: Add `import { enableMapSet } from 'immer'` and call `enableMapSet()` at module top
- **TypeScript Warning**: `TS2589: Type instantiation is excessively deep` is expected with Immer+Map, runtime works fine

### TypeScript Errors
- `createServerSupabaseClient` is async - always use `await`
- Use proper error typing instead of `any`
- Enable strict mode in tsconfig.json

### ESLint Warnings
- Escape apostrophes in JSX with `&apos;`
- Remove unused imports and variables
- Prefer `const` over `let` when variables aren't reassigned

### Authentication
- Server-side: Use `getUser()` not `getSession()`
- Client-side: Use `useAuthStore()` hook
- All API routes require authentication

### Infinite Loops in Data Fetching
- Track which data has been fetched using a Set (e.g., `fetchedCampaigns`)
- Don't refetch based on empty results - distinguish "not fetched" from "fetched but empty"

## Performance Requirements

### Speed Targets
- Scene switch: <100ms
- Page load: <500ms
- Audio resume: <50ms
- Lighthouse score: >90

### Optimization Strategies
1. **Audio Preloading**: Last played track preloaded on mount
2. **Lazy Loading**: Components loaded on demand
3. **Optimistic Updates**: UI updates immediately
4. **Connection Pooling**: Reuse Supabase connections
5. **Debounced Saves**: Auto-save with 500ms debounce

## Database Schema

### Core Tables
- `campaigns` - Top-level organization
- `sessions` - Game sessions within campaigns
- `scenes` - Pre-configured audio + lighting states
- `audio_files` - Cloud-stored audio files
- `light_configs` - Saved Hue light configurations
- `hue_settings` - Per-user Hue authentication

All tables have Row Level Security (RLS) enforcing user isolation.

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types without explicit reason
- Interface for all component props
- Proper error typing

### React
- Functional components only
- Custom hooks for shared logic
- Proper cleanup in useEffect
- Memoization for expensive operations

### Performance
- Bundle size <500KB gzipped
- First Contentful Paint <1s
- Time to Interactive <2s

## Testing Approach
- Check README or package.json for test commands
- Never assume test framework
- Run linting and type checking as minimum validation

## Deployment
```bash
npm run build
npm run typecheck
npm run lint
# Deploy to Vercel/Netlify
```

## MVP Scope (What's Included)
✅ Campaign & Session management
✅ Scene creation & switching
✅ Audio library & playback
✅ Philips Hue integration
✅ User authentication

## Explicitly Excluded (Post-MVP)
❌ Combat tracker
❌ NPC/Location/Item management
❌ Dice roller
❌ Notes system
❌ Session recording
❌ Shared campaigns

## Development Workflow
1. Create feature branch
2. Implement feature
3. Run `npm run lint && npm run typecheck`
4. Test manually
5. Commit with descriptive message
6. Create pull request