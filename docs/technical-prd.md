# Lorelight MVP - Technical Product Requirements Document

## Executive Summary

Lorelight MVP is a streamlined DM command center focused on the core experience: seamless scene management with integrated audio playback and smart lighting control for tabletop RPG sessions. This version removes complexity while delivering a polished, performant experience.

## Product Vision

Create a battle-tested, lightning-fast tool that allows DMs to switch between pre-configured scenes (ambient music + lighting) with zero friction during live gameplay sessions.

## Core Features (MVP Scope)

### 1. Campaign & Session Management
- **Campaigns**: Top-level organizational containers
  - Name, description, thumbnail
  - Contains multiple sessions
- **Sessions**: Individual game sessions within a campaign
  - Name, date, status (planning/active/completed)
  - Contains scenes specific to that session
  - Quick access to "active" session

### 2. Audio System
- **Audio Library**: Cloud-stored audio files (music & SFX)
  - Upload to Cloudflare R2
  - Support MP3, WAV, OGG formats
  - Organize with tags (ambient, combat, tension, etc.)
  - Search and filter capabilities
- **Audio Player**: Persistent footer player
  - Play/pause/stop
  - Volume control with mute
  - Loop toggle
  - Time scrubbing
  - Track progress indicator
  - Maintains playback across navigation

### 3. Smart Lighting (Philips Hue)
- **Light Setup**: One-time configuration
  - OAuth authentication with Hue Bridge
  - Room/zone selection
  - Light group creation
- **Scene Lighting**: Pre-configured light states
  - Brightness (0-100%)
  - Color temperature or RGB color
  - Transition duration
  - Save/recall light configurations

### 4. Scene Management
- **Scene Creator**: Combine audio + lighting
  - Scene name and description
  - Select audio track (music or SFX)
  - Configure lighting preset
  - Optional thumbnail
  - Preview before saving
- **Scene Switcher**: Quick scene activation
  - Grid or list view of scenes
  - One-click scene switching
  - Visual feedback on active scene
  - Smooth transitions between scenes

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Authentication**: Supabase Auth
- **Smart Lights**: Philips Hue API (OAuth 2.0)

### Database Schema

```sql
-- Users (managed by Supabase Auth)

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  session_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audio Files
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration NUMERIC,
  format TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Light Configurations
CREATE TABLE light_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brightness INTEGER CHECK (brightness >= 0 AND brightness <= 100),
  color_temp INTEGER,
  rgb_color JSONB,
  transition_duration INTEGER DEFAULT 400,
  room_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scenes
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE SET NULL,
  light_config_id UUID REFERENCES light_configs(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  scene_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hue Settings (per user)
CREATE TABLE hue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bridge_ip TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  selected_rooms TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)

All tables enforce user isolation:
```sql
-- Example RLS policy (apply to all tables)
CREATE POLICY "Users can only access their own data"
  ON campaigns
  FOR ALL
  USING (auth.uid() = user_id);
```

### Service Layer Architecture

```
/src/lib/services/
├── auth/
│   └── supabaseClient.ts      # Supabase client factory
├── browser/
│   ├── campaignService.ts     # Campaign CRUD operations
│   ├── sessionService.ts      # Session CRUD operations
│   ├── sceneService.ts        # Scene CRUD operations
│   ├── audioService.ts        # Audio file operations
│   ├── lightService.ts        # Light config operations
│   └── hueService.ts          # Hue API integration
└── storage/
    └── r2Service.ts           # Cloudflare R2 operations
```

### State Management (Zustand)

```typescript
// Global stores
├── authStore.ts          // User authentication state
├── campaignStore.ts      // Campaign data
├── sessionStore.ts       // Session data
├── sceneStore.ts         // Scene data
├── audioStore.ts         // Audio playback state
├── lightStore.ts         // Light control state
└── uiStore.ts            // UI state (sidebars, modals, etc.)
```

### Component Structure

```
/src/components/
├── auth/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── campaigns/
│   ├── CampaignList.tsx
│   ├── CampaignCard.tsx
│   └── CampaignForm.tsx
├── sessions/
│   ├── SessionList.tsx
│   ├── SessionCard.tsx
│   └── SessionForm.tsx
├── scenes/
│   ├── SceneGrid.tsx
│   ├── SceneCard.tsx
│   ├── SceneForm.tsx
│   └── SceneSwitcher.tsx
├── audio/
│   ├── AudioLibrary.tsx
│   ├── AudioUploader.tsx
│   ├── AudioPlayer.tsx
│   └── AudioTrackCard.tsx
├── lighting/
│   ├── HueSetup.tsx
│   ├── LightConfigForm.tsx
│   └── LightPreview.tsx
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Footer.tsx
└── ui/
    └── [shadcn components]
```

### Page Routes

```
/                           # Landing page
/login                      # Login page
/signup                     # Signup page
/dashboard                  # Campaign list
/campaigns/[id]             # Session list for campaign
/campaigns/[id]/sessions/[sessionId]  # Scene dashboard (main app)
/audio                      # Audio library management
/lighting                   # Light configuration
/settings                   # User settings & Hue setup
```

## Performance Requirements

### Speed Targets
- **Scene Switch**: <100ms from click to audio/light change
- **Page Load**: <500ms to interactive
- **Audio Upload**: Chunked upload with progress indicator
- **Audio Playback**: <50ms to resume after page navigation

### Optimization Strategies
1. **Audio Preloading**: Last played track preloaded on page load
2. **State Persistence**: Last session/scene persisted in localStorage
3. **Lazy Loading**: Components loaded on demand
4. **Optimistic Updates**: UI updates immediately, sync in background
5. **Connection Pooling**: Reuse Supabase/Hue connections
6. **Debounced Saves**: Auto-save with 500ms debounce

## User Experience Flow

### First-Time Setup
1. Sign up / Log in
2. Create first campaign
3. Connect Philips Hue (optional, can skip)
4. Upload audio files
5. Create first session
6. Build first scene

### Session Preparation Flow
1. Select campaign
2. Create/select session
3. Build scenes:
   - Choose audio track
   - Configure lighting
   - Preview
   - Save
4. Set session to "active"

### Live Gameplay Flow
1. Open active session
2. View scene grid
3. Click scene to switch
4. Audio transitions smoothly
5. Lights fade to new state
6. Footer shows current track
7. Override audio/lights manually if needed

## Security Considerations

1. **Authentication**: Supabase Auth with secure JWT tokens
2. **Authorization**: RLS enforces user data isolation
3. **API Routes**: All protected with auth middleware
4. **File Upload**: Validate file types, size limits (50MB max)
5. **Hue OAuth**: Tokens encrypted at rest
6. **CORS**: Restricted to production domain

## Error Handling

### Audio Playback Errors
- Display toast notification
- Fallback to silence (don't break scene)
- Log error for debugging

### Hue Connection Errors
- Show connection status indicator
- Allow manual reconnection
- Gracefully degrade (audio still works)

### Network Errors
- Retry failed requests (3 attempts)
- Show offline indicator
- Queue changes for sync when back online

## Testing Strategy

### Unit Tests
- Service layer functions
- Zustand store actions
- Utility functions

### Integration Tests
- Auth flow
- Scene creation and switching
- Audio upload and playback
- Hue integration

### E2E Tests (Critical Paths)
1. Sign up → Create campaign → Create session → Create scene
2. Switch between scenes during active session
3. Upload audio → Use in scene → Playback

## Deployment

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
NEXT_PUBLIC_R2_PUBLIC_URL=

# Philips Hue
HUE_CLIENT_ID=
HUE_CLIENT_SECRET=
HUE_APP_ID=
NEXT_PUBLIC_HUE_REDIRECT_URI=

# App
NEXT_PUBLIC_APP_URL=
```

### Build & Deploy
```bash
npm run build
npm run typecheck
npm run lint
# Deploy to Vercel/Netlify
```

## Monitoring & Analytics

### Key Metrics
- Scene switch latency
- Audio playback success rate
- Hue connection reliability
- User retention (weekly active sessions)
- Average scenes per session

### Error Tracking
- Sentry for runtime errors
- Supabase logs for database errors
- Custom analytics for user flows

## Future Enhancements (Post-MVP)

These features are **explicitly excluded** from MVP but documented for future consideration:

- Combat tracker
- NPC/Location/Item management
- Dice roller
- Notes system
- Session recording/playback
- Shared campaigns (multi-DM)
- Mobile app
- Voice control
- Music streaming integration (Spotify, etc.)

## Development Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Next.js 15
- [ ] Supabase configuration
- [ ] Authentication system
- [ ] Basic routing structure

### Phase 2: Core Data (Week 2)
- [ ] Campaign/Session CRUD
- [ ] Service layer implementation
- [ ] Zustand store setup
- [ ] Basic UI layout

### Phase 3: Audio System (Week 3)
- [ ] R2 upload integration
- [ ] Audio library UI
- [ ] Audio player component
- [ ] Playback persistence

### Phase 4: Lighting (Week 4)
- [ ] Hue OAuth flow
- [ ] Light configuration UI
- [ ] Light preset management
- [ ] Connection reliability

### Phase 5: Scene System (Week 5)
- [ ] Scene creation form
- [ ] Scene grid/list UI
- [ ] Scene switching logic
- [ ] Smooth transitions

### Phase 6: Polish & Testing (Week 6)
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] User testing
- [ ] Bug fixes
- [ ] Documentation

## Success Criteria

MVP is considered successful when:

1. ✅ DM can create campaign/session/scene in <2 minutes
2. ✅ Scene switching happens in <100ms
3. ✅ Audio playback is reliable (>99% success rate)
4. ✅ Hue lights sync consistently
5. ✅ Zero critical bugs during 10-session playtest
6. ✅ All lint/typecheck passes
7. ✅ Core user flow has <3% error rate

## Technical Debt to Avoid

1. **No IndexedDB**: Cloud-first from day one
2. **No "god components"**: Keep components <200 lines
3. **No implicit any**: Strict TypeScript mode
4. **No inline styles**: Use Tailwind classes
5. **No direct Supabase client in components**: Use service layer
6. **No untyped API responses**: Define all response types
7. **No magic numbers**: Use named constants

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types without explicit reason
- Proper error typing
- Interface for all component props

### React
- Functional components only
- Custom hooks for shared logic
- Proper cleanup in useEffect
- Memoization for expensive operations

### Testing
- 80% code coverage target
- All critical paths tested
- Mock external dependencies
- Fast test suite (<30s)

### Performance
- Lighthouse score >90
- First Contentful Paint <1s
- Time to Interactive <2s
- Bundle size <500KB gzipped

---

## Quick Start Commands

```bash
# Development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Database migrations
supabase db push

# Run tests
npm test
```

---

**Document Version**: 1.0
**Last Updated**: 2025-09-29
**Status**: Ready for Implementation