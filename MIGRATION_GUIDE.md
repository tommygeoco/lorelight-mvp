# Lorelight v2 Migration Guide

## Overview
This guide documents the migration from v1 (session-owned scenes) to v2 (campaign-owned scenes with many-to-many session relationships).

## Migration Status: ✅ Phase 1 Complete

### Completed:
- ✅ Migration SQL created (`supabase/migrations/009_restructure_schema.sql`)
- ✅ TypeScript types updated (`types/index.ts`)
- ✅ New type definitions added for all v2 tables

### Next Steps:
1. **Apply Migration to Supabase**
2. **Update Service Layer** (create services for new tables)
3. **Update Zustand Stores** (fix scene relationships, add new stores)
4. **Update Components** (use new data structures)

---

## How to Apply the Migration

### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy contents of `supabase/migrations/009_restructure_schema.sql`
3. Paste into SQL editor
4. Click "Run"
5. Verify all tables created successfully

### Option B: Via Supabase CLI
```bash
# If you have Supabase CLI linked
npx supabase db push

# Or apply specific migration
npx supabase db push --include-all
```

### Option C: Manual Table Creation
If you prefer to apply changes incrementally, follow this order:
1. Add `campaign_id` to scenes
2. Create `session_scenes` table
3. Migrate existing data
4. Create audio organization tables
5. Create `scene_presets` table
6. Add indexes and RLS policies

---

## Schema Changes Summary

### 1. Scenes Table
**Before:**
- `session_id` UUID NOT NULL (scenes belonged to sessions)

**After:**
- `campaign_id` UUID NOT NULL (scenes belong to campaigns)
- `session_id` UUID NULL (optional, for backwards compatibility)
- `preset_id` UUID NULL (reference to scene preset)
- `audio_config` JSONB (scene-specific audio overrides)
- `lighting_config` JSONB (scene-specific lighting overrides)
- `scene_order` renamed to `order_index`

### 2. New Tables

#### `session_scenes` (Junction Table)
Many-to-many relationship between sessions and scenes.
```sql
- id UUID PRIMARY KEY
- session_id UUID NOT NULL → sessions(id)
- scene_id UUID NOT NULL → scenes(id)
- order_index INTEGER
- UNIQUE(session_id, scene_id)
```

#### `audio_folders`
Organize audio files in folders.
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL
- name TEXT NOT NULL
- parent_id UUID → audio_folders(id) [hierarchical]
```

#### `audio_playlists`
Group audio files into playlists.
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL
- name TEXT NOT NULL
- description TEXT
```

#### `playlist_audio` (Junction Table)
Many-to-many relationship between playlists and audio files.
```sql
- id UUID PRIMARY KEY
- playlist_id UUID NOT NULL → audio_playlists(id)
- audio_file_id UUID NOT NULL → audio_files(id)
- order_index INTEGER
- UNIQUE(playlist_id, audio_file_id)
```

#### `scene_presets`
System and user-created scene templates.
```sql
- id UUID PRIMARY KEY
- name TEXT NOT NULL
- description TEXT
- icon TEXT (emoji)
- default_lighting JSONB
- default_audio_tags TEXT[]
- is_system BOOLEAN (true for built-in presets)
- user_id UUID (null for system presets)
```

**System Presets:**
- 🍺 Tavern (warm, social)
- ⚔️ Combat (high energy)
- 🕯️ Dungeon (dark, ominous)
- 🌙 Rest (calm, peaceful)
- 📖 Intro (session opening)
- 🎬 Outro (session closing)
- 💀 Death (somber, dramatic)
- ☕ Intermission (break time)

### 3. Sessions Table
**Field Rename:**
- `name` → `title` (for consistency with UX)

---

## Data Migration

### Existing Data Handling
The migration automatically:
1. **Backfills `campaign_id`** from each scene's session's campaign
2. **Creates `session_scenes` records** from existing scene-session relationships
3. **Preserves all existing data** (no data loss)

### Post-Migration Cleanup (Optional)
After verifying the migration works:
```sql
-- Optional: Remove session_id from scenes if no longer needed
ALTER TABLE scenes DROP COLUMN session_id;
```

---

## TypeScript Updates

### New Types
```typescript
// Junction tables
export type SessionScene = Tables<'session_scenes'>
export type PlaylistAudio = Tables<'playlist_audio'>

// Organization
export type AudioFolder = Tables<'audio_folders'>
export type AudioPlaylist = Tables<'audio_playlists'>

// Templates
export type ScenePreset = Tables<'scene_presets'>

// Relations
export interface SessionWithScenes extends Session {
  scenes: Scene[]
}

export interface SceneWithRelations extends Scene {
  preset?: ScenePreset
  audio_file?: AudioFile
  light_config?: LightConfig
}

// Config overrides
export interface AudioConfig {
  volume?: number // 0-1
  startTime?: number // seconds
  loop?: boolean
}

export interface LightingConfig {
  brightnessOverride?: number // 0-100
  transitionDuration?: number // milliseconds
}
```

---

## Service Layer Updates Needed

### New Services to Create:
1. **`sessionSceneService`** - CRUD for session-scene relationships
2. **`audioFolderService`** - Manage audio folders
3. **`audioPlaylistService`** - Manage playlists
4. **`scenePresetService`** - Fetch/manage scene presets

### Services to Update:
1. **`sceneService`** - Use `campaign_id` instead of `session_id`
2. **`sessionService`** - Rename `name` → `title`

---

## Store Updates Needed

### 1. sceneStore
**Changes:**
- `fetchScenes(campaignId)` instead of `fetchScenes(sessionId)`
- Add `fetchScenesForSession(sessionId)` (joins via `session_scenes`)
- Update `createScene()` to require `campaign_id`

### 2. sessionStore
**Changes:**
- Rename `name` → `title` in all operations
- Add `fetchSessionScenes(sessionId)` method

### 3. New Stores to Create:
- **`sessionSceneStore`** - Manage session-scene relationships
- **`audioFolderStore`** - Audio folder CRUD
- **`audioPlaylistStore`** - Playlist CRUD
- **`scenePresetStore`** - Fetch presets (read-only for system presets)

---

## Component Updates Needed

### High Priority:
1. **SessionSceneView** - Fetch scenes via `session_scenes` join
2. **SceneModal** - Require `campaign_id`, add preset selector
3. **SessionForm** - Use `title` instead of `name`

### Medium Priority:
4. **CampaignScenesLibrary** (NEW) - Show all campaign scenes
5. **AudioLibraryView** (NEW) - Full-page audio library with folders
6. **SceneListItem** - Add preset badge/icon

---

## Testing Checklist

After applying migration:
- [ ] Can create campaign
- [ ] Can create scenes under campaign
- [ ] Can create session
- [ ] Can add existing scenes to session
- [ ] Can reuse same scene across multiple sessions
- [ ] Can remove scene from session without deleting scene
- [ ] Scene presets load correctly
- [ ] Audio folders/playlists work
- [ ] All RLS policies enforce user isolation

---

## Rollback Plan

If issues occur, rollback by:
```sql
-- 1. Drop new tables
DROP TABLE IF EXISTS scene_presets CASCADE;
DROP TABLE IF EXISTS playlist_audio CASCADE;
DROP TABLE IF EXISTS audio_playlists CASCADE;
DROP TABLE IF EXISTS audio_folders CASCADE;
DROP TABLE IF EXISTS session_scenes CASCADE;

-- 2. Remove new columns
ALTER TABLE scenes DROP COLUMN IF EXISTS campaign_id;
ALTER TABLE scenes DROP COLUMN IF EXISTS preset_id;
ALTER TABLE scenes DROP COLUMN IF EXISTS audio_config;
ALTER TABLE scenes DROP COLUMN IF EXISTS lighting_config;
ALTER TABLE scenes RENAME COLUMN order_index TO scene_order;
ALTER TABLE audio_files DROP COLUMN IF EXISTS folder_id;
ALTER TABLE sessions RENAME COLUMN title TO name;

-- 3. Restore scene.session_id to NOT NULL
ALTER TABLE scenes ALTER COLUMN session_id SET NOT NULL;
```

---

## Performance Considerations

### New Indexes Created:
- `scenes_campaign_id_idx` - Fast campaign scene lookups
- `session_scenes_session_id_idx` - Fast session scene joins
- `session_scenes_scene_id_idx` - Fast reverse lookups
- Plus 8 more for audio organization

### Query Optimization:
- Use `order_index` for all ordered lists (scenes, playlist items)
- Fetch scene presets once on app load (rarely change)
- Use RLS policies instead of WHERE clauses (enforced at DB level)

---

## Next Phase: Service Layer

See `lib/services/browser/` for existing service patterns. New services will follow same architecture:
- Lazy Supabase client initialization
- Error handling with typed responses
- Optimistic updates where applicable
