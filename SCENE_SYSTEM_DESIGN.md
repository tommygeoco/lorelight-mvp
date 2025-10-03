# Scene System Design

## Overview
A **Scene** combines lighting configuration and audio into a single, one-click trigger for immersive tabletop RPG sessions. Scenes belong to campaigns and can be added to multiple sessions.

## Current State (What Exists)
✅ Database schema ready (`scenes` table with `audio_config` and `lighting_config` JSONB columns)
✅ Scene type definitions in `types/index.ts`
✅ `sceneStore` in `store/sceneStore.ts`
✅ `sessionSceneStore` for many-to-many session ↔ scene relationships
✅ Scene presets removed (migration 010)

## What We Need to Build

### 1. Scene Creation/Editing UI
**Modal: `SceneModal.tsx`**
- Name & description fields
- Audio configuration section:
  - Browse audio library
  - Select audio file
  - Set volume (0-100%)
  - Set loop on/off
  - Optional: Start time offset
- Lighting configuration section:
  - Select saved light configuration OR
  - Configure lights inline:
    - Select room(s)
    - Set brightness
    - Set color/temperature
    - Preview live on Hue lights
  - "Save as Light Config" button (saves to `light_configs` table for reuse)
- Submit creates scene with `audio_config` and `light_config` JSONB

**JSON Structure:**
```typescript
// audio_config JSONB
{
  audio_id: string,      // UUID of audio file
  volume: number,        // 0-1
  loop: boolean,
  start_time?: number    // seconds (optional)
}

// light_config JSONB (Hue API format)
{
  groups: {
    [groupId: string]: {
      on: boolean,
      bri: number,        // 0-254
      hue?: number,       // 0-65535 (optional)
      sat?: number,       // 0-254 (optional)
      ct?: number,        // 153-500 mired (optional)
      transitiontime: number  // 0-65535 (deciseconds, 10 = 1 second)
    }
  },
  lights?: {
    [lightId: string]: {
      on: boolean,
      bri: number,
      hue?: number,
      sat?: number,
      ct?: number,
      transitiontime: number
    }
  }
}
```

### 2. Scene Library View
**Page: `/campaigns/[id]/scenes`**
- Grid of scene cards (similar to campaign cards)
- Each card shows:
  - Scene name
  - Description (if any)
  - Gradient background (based on scene ID hash)
  - Audio indicator (speaker icon if has audio)
  - Light indicator (bulb icon if has lights)
  - Play button (activates scene immediately)
  - Context menu (Edit, Duplicate, Delete)
- Sidebar:
  - List of scenes
  - "Active" badge on currently playing scene
  - Click to activate

### 3. Scene Activation
**Function: `activateScene(sceneId: string)`**
1. Load scene from store
2. Parse `audio_config`:
   - Get audio file by ID
   - Load into audio player with volume/loop settings
   - Start playback (with start_time offset if set)
3. Parse `light_config`:
   - Send to Hue bridge via `applyLightConfig()`
   - Lights transition according to `transitiontime`
4. Mark scene as active (`is_active = true`)
5. Deactivate other scenes in same campaign (`is_active = false`)

### 4. Session Integration
**In SessionSceneView:**
- Show scenes added to this session (via `session_scenes` junction)
- "Add Scene" button opens modal to select from campaign scenes
- Drag to reorder scenes in session
- Play button activates scene during session
- Remove button unlinks scene from session (doesn't delete scene)

### 5. Quick Actions
**Scene Floating Action Bar (during session):**
- Small bar at top of screen (collapsible)
- Shows 3-5 most recently used scenes
- One-click buttons to activate
- Keyboard shortcuts (1-5 keys)

## Database Operations

### Create Scene
```typescript
await sceneService.create({
  campaign_id: 'uuid',
  name: 'Tavern Ambience',
  description: 'Warm tavern with crackling fire',
  audio_config: {
    audio_id: 'uuid',
    volume: 0.7,
    loop: true
  },
  light_config: {
    groups: {
      '1': { on: true, bri: 200, ct: 370, transitiontime: 10 }
    }
  },
  is_active: false,
  order_index: 0
})
```

### Activate Scene
```typescript
await sceneService.setActiveScene(campaignId, sceneId)
// Sets is_active=true for this scene, false for others in campaign
```

### Add Scene to Session
```typescript
await sessionSceneStore.actions.addSceneToSession(sessionId, sceneId)
// Creates entry in session_scenes junction table
```

## UI Components Needed

1. ✅ **SceneModal** - Create/edit scenes (already exists, needs audio/light pickers)
2. **ScenePicker** - Browse and select scenes from campaign
3. **LightConfigPicker** - Inline light configuration UI
4. **SceneCard** - Display scene in grid/list
5. **SceneActivationButton** - Quick-play button with loading state
6. **AudioFilePicker** - Browse audio library within modal

## Service Layer

**File: `lib/services/browser/sceneService.ts`**
```typescript
class SceneService {
  async create(data: SceneInsert): Promise<Scene>
  async update(id: string, data: SceneUpdate): Promise<Scene>
  async delete(id: string): Promise<void>
  async listByCampaign(campaignId: string): Promise<Scene[]>
  async setActiveScene(campaignId: string, sceneId: string): Promise<void>
  async activateScene(sceneId: string): Promise<void>  // Triggers audio + lights
}
```

## Implementation Plan

### Phase 1: Scene Modal Enhancement ⏳
- Add audio picker to SceneModal
- Add light config picker to SceneModal
- Save audio_config and light_config as JSONB

### Phase 2: Scene Activation Logic
- Build `activateScene()` function
- Integrate with audio player
- Integrate with Hue service
- Handle active state management

### Phase 3: Scene Library Page
- Create `/campaigns/[id]/scenes` route
- Build SceneCard component
- Build grid layout with sidebar
- Add context menu (Edit, Duplicate, Delete)

### Phase 4: Session Integration
- Update SessionSceneView to show linked scenes
- Add "Add Scene" button
- Add drag-to-reorder
- Add quick activation buttons

### Phase 5: Quick Actions Bar (Future)
- Floating bar with recent scenes
- Keyboard shortcuts
- Collapsible design

## Success Criteria
- ✅ User can create scene with both audio + lights
- ✅ One-click activation changes both audio and lights
- ✅ Scenes can be reused across multiple sessions
- ✅ Active scene indicator shows what's currently playing
- ✅ Smooth transitions (no lag between audio/light changes)

## Notes
- Scenes are campaign-level (not session-specific)
- The `session_scenes` junction allows adding same scene to multiple sessions
- `is_active` flag indicates currently playing scene (only one per campaign)
- Light configs can be saved separately for reuse across scenes
- Scene activation should be <100ms for optimal DM flow
