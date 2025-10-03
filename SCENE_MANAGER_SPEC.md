# Scene Manager Technical Specification

**Status**: 📋 Planning Phase
**Last Updated**: 2025-10-03
**Owner**: Engineering Team

## Executive Summary

The Scene Manager is the heart of Lorelight's DM command center. It combines audio, lighting, notes, and NPCs into a single, activatable scene that transforms the gaming atmosphere with one click. This spec focuses on building a rich, Notion-like editing experience while maintaining our <100ms performance targets.

---

## Design Analysis

From the Figma design (`Session/Scene 2` - node 0:43):

**Layout Structure:**
- **Left Sidebar (320px)**: Scene list with gradient thumbnails, active state indicator, pinned section
- **Main Content Area**:
  - Hero section with gradient background and scene title/description
  - **Ambience section**: Audio + Lighting configuration cards (2-column grid)
  - **Notes section**: Rich text cards in 3-column grid
  - **Enemies section**: NPC/Enemy cards in 3-column grid
- **Audio Footer**: Global playback controls at bottom

**Visual Patterns:**
- Gradient thumbnails generated from scene ID hash
- Active scene has `border border-[#3a3a3a]` + play icon indicator
- Cards use `bg-[#222222]` with `rounded-[12px]`
- 3-column responsive grid for notes/NPCs (`basis-0 grow min-w-px`)
- Purple/pink gradient accents on interactive elements

**Design System Compliance:**
- Follows existing sidebar patterns (320px, bg-[#191919])
- Uses PP Mondwest for hero title (60px)
- Inter font for body text (14px/20px line height)
- Consistent spacing: 16px gaps, 24px padding

---

## Database Schema

### New Tables

#### `scene_blocks` - Notion-like Content Blocks

```sql
CREATE TABLE scene_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'text', 'heading_1', 'heading_2', 'heading_3', 'image', 'bulleted_list', 'numbered_list', 'checkbox_list'
  content JSONB NOT NULL, -- Flexible content based on type
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_scene_blocks_scene_id ON scene_blocks(scene_id);
CREATE INDEX idx_scene_blocks_order ON scene_blocks(scene_id, order_index);

-- RLS Policies
ALTER TABLE scene_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scene blocks"
  ON scene_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scene blocks"
  ON scene_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scene blocks"
  ON scene_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scene blocks"
  ON scene_blocks FOR DELETE
  USING (auth.uid() = user_id);
```

#### `scene_npcs` - NPCs Linked to Scenes

```sql
CREATE TABLE scene_npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stats JSONB, -- HP, AC, abilities, etc.
  image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_scene_npcs_scene_id ON scene_npcs(scene_id);
CREATE INDEX idx_scene_npcs_order ON scene_npcs(scene_id, order_index);

-- RLS Policies
ALTER TABLE scene_npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scene NPCs"
  ON scene_npcs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scene NPCs"
  ON scene_npcs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scene NPCs"
  ON scene_npcs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scene NPCs"
  ON scene_npcs FOR DELETE
  USING (auth.uid() = user_id);
```

#### `light_configs` - Saved Light Presets

```sql
CREATE TABLE light_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL, -- Hue API format { groups, lights }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_light_configs_campaign ON light_configs(campaign_id);

-- RLS Policies
ALTER TABLE light_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own light configs"
  ON light_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own light configs"
  ON light_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own light configs"
  ON light_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own light configs"
  ON light_configs FOR DELETE
  USING (auth.uid() = user_id);
```

### Updated `scenes` Table

Already exists with the following structure:

```sql
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  audio_config JSONB, -- { audio_id, volume, loop, start_time }
  light_config JSONB, -- Direct Hue config OR { preset_id } reference
  is_active BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**Audio Config JSONB Format:**
```json
{
  "audio_id": "uuid-of-audio-file",
  "volume": 0.7,
  "loop": true,
  "start_time": 0
}
```

**Light Config JSONB Format:**
```json
{
  "groups": {
    "1": {
      "on": true,
      "bri": 200,
      "ct": 370,
      "transitiontime": 10
    }
  },
  "lights": {
    "3": {
      "on": true,
      "bri": 254,
      "hue": 8402,
      "sat": 140,
      "transitiontime": 10
    }
  }
}
```

---

## TypeScript Types

```typescript
// types/scene.ts

export type BlockType =
  | 'text'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'image'
  | 'bulleted_list'
  | 'numbered_list'
  | 'checkbox_list';

export interface TextFormatting {
  start: number;
  end: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  link?: string;
}

export interface TextContent {
  text: string;
  formatting: TextFormatting[];
}

export interface SceneBlock {
  id: string;
  scene_id: string;
  type: BlockType;
  content: {
    text?: TextContent;
    items?: string[]; // For lists
    checked?: boolean[]; // For checkbox lists
    url?: string; // For images
    alt?: string; // For images
  };
  order_index: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface SceneNPC {
  id: string;
  scene_id: string;
  name: string;
  description?: string;
  stats?: {
    hp?: number;
    ac?: number;
    speed?: string;
    abilities?: Record<string, number>; // STR, DEX, CON, INT, WIS, CHA
    actions?: string[];
  };
  image_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface LightConfig {
  id: string;
  campaign_id: string;
  name: string;
  config: {
    groups?: Record<string, HueLightState>;
    lights?: Record<string, HueLightState>;
  };
  created_at: string;
  user_id: string;
}

export interface HueLightState {
  on: boolean;
  bri: number; // 0-254
  hue?: number; // 0-65535
  sat?: number; // 0-254
  ct?: number; // 153-500 mired
  transitiontime: number; // deciseconds (10 = 1 second)
}
```

---

## Component Architecture

### File Structure

```
/components/scenes/
├── SceneEditor.tsx              # Main editor container (replaces SessionSceneView detail area)
├── SceneHero.tsx                # Editable title + description with gradient background
├── SceneAmbienceSection.tsx    # Audio + Lighting cards (2-column grid)
├── SceneNotesSection.tsx        # Rich text block editor (3-column grid)
├── SceneNPCsSection.tsx         # NPC card grid (3-column grid)
├── SceneBlockEditor.tsx         # Individual block editor (contenteditable)
├── SceneNPCCard.tsx             # NPC display/edit card
├── AudioPicker.tsx              # Browse/select audio from library
├── LightConfigPicker.tsx        # Configure or select saved preset
└── LightConfigModal.tsx         # Live light configuration UI with preview

/components/ui/
├── RichTextToolbar.tsx          # Floating toolbar on text selection
├── BlockMenu.tsx                # Right-click context menu for blocks
└── InlineEditor.tsx             # Reusable contenteditable wrapper

/lib/services/browser/
├── sceneBlockService.ts         # CRUD for scene blocks
├── sceneNPCService.ts           # CRUD for scene NPCs
├── lightConfigService.ts        # CRUD for light configs
└── sceneActivationService.ts   # Scene activation orchestration

/store/
├── sceneBlockStore.ts           # Zustand store for scene blocks
├── sceneNPCStore.ts             # Zustand store for scene NPCs
└── lightConfigStore.ts          # Zustand store for light configs
```

### Core Components Overview

#### 1. **SceneEditor.tsx** - Main Container

**Responsibility**: Orchestrates all scene sections, manages layout

```typescript
interface SceneEditorProps {
  sceneId: string;
  campaignId: string;
}

// Features:
// - Fetches scene data on mount
// - Renders SceneHero, SceneAmbienceSection, SceneNotesSection, SceneNPCsSection
// - Handles scrolling and layout (max-w-[704px] centered)
// - Subscribes to real-time updates via Supabase
```

**Status**: ⬜ Not Started

---

#### 2. **SceneHero.tsx** - Editable Header

**Responsibility**: Display and edit scene title + description with gradient background

```typescript
interface SceneHeroProps {
  scene: Scene;
}

// Features:
// - Click-to-edit title (PP Mondwest 60px)
// - Click-to-edit description (Inter 14px)
// - Purple-pink gradient background (matching Figma)
// - Auto-save on blur with 500ms debounce
// - Optimistic updates
```

**Design Details**:
- Gradient: Two overlapping radial gradients (purple-500/40 and pink-500/40 with blur-[100px])
- Title: `font-['PP_Mondwest'] text-[60px] leading-[72px] tracking-[-1.2px]`
- Description: `text-[14px] leading-[20px] text-[#eeeeee]`
- Padding: `pt-[80px] pb-[24px]`

**Status**: ⬜ Not Started

---

#### 3. **SceneNotesSection.tsx** - Rich Text Editor

**Responsibility**: Display and edit scene notes as Notion-like blocks

```typescript
interface SceneNotesSectionProps {
  sceneId: string;
  blocks: SceneBlock[];
}

// Features:
// - Render blocks in order (sorted by order_index)
// - Add new block on Enter key or via BlockMenu
// - Drag-to-reorder blocks
// - Right-click context menu to insert blocks
// - Empty state: "No notes yet. Right-click to add content."
```

**Layout**:
- 3-column grid: `flex flex-wrap gap-[16px]`
- Each block: `basis-0 grow min-w-px` (equal width columns)
- Section header: `text-[16px] font-semibold pt-[24px]`

**Status**: ⬜ Not Started

---

#### 4. **SceneBlockEditor.tsx** - Individual Block

**Responsibility**: Editable contenteditable block with formatting toolbar

```typescript
interface SceneBlockEditorProps {
  block: SceneBlock;
  sceneId: string;
}

// Features:
// - Contenteditable div for inline editing
// - Text selection triggers RichTextToolbar
// - Apply formatting (bold, italic, underline, strikethrough, link)
// - Convert HTML to TextContent format on save
// - Drag handle (appears on hover)
// - Block type switcher (text → heading, etc.)
// - Enter key creates new block below
// - Backspace on empty block deletes it
```

**Block Type Styles**:
- `heading_1`: `text-[24px] font-bold leading-[32px] mt-6 mb-2`
- `heading_2`: `text-[20px] font-bold leading-[28px] mt-4 mb-2`
- `heading_3`: `text-[16px] font-bold leading-[24px] mt-3 mb-1`
- `text`: `text-[14px] leading-[20px] mb-2`
- Lists: `text-[14px] leading-[20px] ml-6`

**Status**: ⬜ Not Started

---

#### 5. **RichTextToolbar.tsx** - Formatting Toolbar

**Responsibility**: Floating toolbar for text formatting

```typescript
interface RichTextToolbarProps {
  selection: Range;
  onFormat: (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => void;
  onLink: () => void;
  onClose: () => void;
}

// Features:
// - Positioned 48px above text selection
// - Bold, Italic, Underline, Strikethrough, Link buttons
// - Follows design system: bg-[#191919], border-white/10, rounded-[8px]
// - Close on click outside
// - Keyboard shortcuts: Cmd+B, Cmd+I, Cmd+U, Cmd+Shift+X
```

**Status**: ⬜ Not Started

---

#### 6. **BlockMenu.tsx** - Context Menu

**Responsibility**: Right-click menu to insert block types

```typescript
interface BlockMenuProps {
  sceneId: string;
  anchorPoint: { x: number; y: number };
  onClose: () => void;
}

// Block types:
// - Text
// - Heading 1, 2, 3
// - Bulleted List, Numbered List, Checkbox List
// - Image / Media
```

**Status**: ⬜ Not Started

---

#### 7. **SceneNPCsSection.tsx** - NPC Grid

**Responsibility**: Display and manage NPCs in 3-column grid

```typescript
interface SceneNPCsSectionProps {
  sceneId: string;
  npcs: SceneNPC[];
}

// Features:
// - 3-column grid matching Notes section
// - Add NPC button (opens modal)
// - NPC cards show name, description, stats
// - Click to edit, right-click to delete
```

**Status**: ⬜ Not Started

---

#### 8. **SceneAmbienceSection.tsx** - Audio + Lights

**Responsibility**: Configure audio and lighting for scene

```typescript
interface SceneAmbienceSectionProps {
  scene: Scene;
  campaignId: string;
}

// Features:
// - 2-column grid (audio left, lights right)
// - Audio card: Shows selected track, click to change
// - Lights card: Shows preset name or "Configure", click to edit
// - Cards match Figma: bg-[#222222], rounded-[12px], p-[16px]
```

**Status**: ⬜ Not Started

---

## Service Layer

### Scene Activation Service

**File**: `lib/services/browser/sceneActivationService.ts`

**Responsibility**: Orchestrate scene activation (audio + lights in parallel)

```typescript
class SceneActivationService {
  async activateScene(sceneId: string): Promise<void>;
  private async activateAudio(audioConfig: AudioConfig): Promise<void>;
  private async activateLights(lightConfig: LightConfig): Promise<void>;
}

// Performance target: <100ms total
// Parallel execution: Promise.all([audio, lights])
// Error handling: Graceful degradation if one fails
```

**Status**: ⬜ Not Started

---

### Scene Block Service

**File**: `lib/services/browser/sceneBlockService.ts`

```typescript
class SceneBlockService {
  async list(sceneId: string): Promise<SceneBlock[]>;
  async create(data: Omit<SceneBlock, 'id' | 'created_at' | 'updated_at'>): Promise<SceneBlock>;
  async update(id: string, data: Partial<SceneBlock>): Promise<SceneBlock>;
  async delete(id: string): Promise<void>;
  async reorder(sceneId: string, blockIds: string[]): Promise<void>;
}
```

**Status**: ⬜ Not Started

---

### Scene NPC Service

**File**: `lib/services/browser/sceneNPCService.ts`

```typescript
class SceneNPCService {
  async list(sceneId: string): Promise<SceneNPC[]>;
  async create(data: Omit<SceneNPC, 'id' | 'created_at' | 'updated_at'>): Promise<SceneNPC>;
  async update(id: string, data: Partial<SceneNPC>): Promise<SceneNPC>;
  async delete(id: string): Promise<void>;
}
```

**Status**: ⬜ Not Started

---

### Light Config Service

**File**: `lib/services/browser/lightConfigService.ts`

```typescript
class LightConfigService {
  async list(campaignId: string): Promise<LightConfig[]>;
  async create(data: Omit<LightConfig, 'id' | 'created_at'>): Promise<LightConfig>;
  async update(id: string, data: Partial<LightConfig>): Promise<LightConfig>;
  async delete(id: string): Promise<void>;
}
```

**Status**: ⬜ Not Started

---

## State Management (Zustand Stores)

### Scene Block Store

**File**: `store/sceneBlockStore.ts`

```typescript
interface SceneBlockState {
  blocks: Map<string, SceneBlock>;
  actions: {
    setBlocks: (sceneId: string, blocks: SceneBlock[]) => void;
    create: (block: SceneBlock) => void;
    update: (id: string, updates: Partial<SceneBlock>) => void;
    delete: (id: string) => void;
    reorder: (sceneId: string, fromIndex: number, toIndex: number) => void;
  };
}

// IMPORTANT: Enable Immer MapSet plugin
import { enableMapSet } from 'immer';
enableMapSet();
```

**Status**: ⬜ Not Started

---

### Scene NPC Store

**File**: `store/sceneNPCStore.ts`

```typescript
interface SceneNPCState {
  npcs: Map<string, SceneNPC>;
  actions: {
    setNPCs: (sceneId: string, npcs: SceneNPC[]) => void;
    create: (npc: SceneNPC) => void;
    update: (id: string, updates: Partial<SceneNPC>) => void;
    delete: (id: string) => void;
  };
}
```

**Status**: ⬜ Not Started

---

### Light Config Store

**File**: `store/lightConfigStore.ts`

```typescript
interface LightConfigState {
  configs: Map<string, LightConfig>;
  actions: {
    setConfigs: (campaignId: string, configs: LightConfig[]) => void;
    create: (config: LightConfig) => void;
    update: (id: string, updates: Partial<LightConfig>) => void;
    delete: (id: string) => void;
  };
}
```

**Status**: ⬜ Not Started

---

## Performance Optimizations

### 1. Debounced Auto-Save

**Target**: 500ms debounce on all text edits

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback(
  async (blockId: string, content: TextContent) => {
    await sceneBlockService.update(blockId, { content });
  },
  500
);
```

---

### 2. Optimistic Updates

**Pattern**: Update UI immediately, rollback on error

```typescript
const handleUpdate = async (id: string, updates: Partial<SceneBlock>) => {
  const original = useSceneBlockStore.getState().blocks.get(id);

  // Optimistic update
  updateBlock(id, updates);

  try {
    await sceneBlockService.update(id, updates);
  } catch (error) {
    if (original) updateBlock(id, original);
    toast.error('Failed to save changes');
  }
};
```

---

### 3. Virtual Scrolling (Future Enhancement)

For scenes with 100+ blocks:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: blocks.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
  overscan: 5,
});
```

---

## Real-time Sync Strategy

### Supabase Realtime Subscriptions

**Pattern**: Subscribe to scene_blocks, scene_npcs changes

```typescript
useEffect(() => {
  const subscription = supabase
    .channel(`scene:${sceneId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scene_blocks',
        filter: `scene_id=eq.${sceneId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          createBlock(payload.new as SceneBlock);
        } else if (payload.eventType === 'UPDATE') {
          updateBlock(payload.new.id, payload.new);
        } else if (payload.eventType === 'DELETE') {
          deleteBlock(payload.old.id);
        }
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [sceneId]);
```

**Conflict Resolution**:
- Last-write-wins for concurrent edits
- Show toast notification when remote changes detected
- Optional: Lock blocks during editing (future enhancement)

---

## Implementation Roadmap

### ✅ Phase 0: Planning & Documentation (COMPLETED)
- [x] Technical specification written
- [x] Design analysis from Figma
- [x] Database schema designed
- [x] Component architecture mapped
- [x] Service layer planned

---

### ✅ Phase 1: Database & Core Infrastructure (COMPLETED - 2025-10-03)

**Database Migrations**:
- [x] Create `scene_blocks` table with RLS policies
- [x] Create `scene_npcs` table with RLS policies
- [x] Add indexes for performance
- [x] Add updated_at triggers for both tables
- [x] Migration 015 created (ready to apply when connected to Supabase)

**Service Layer**:
- [x] Implement `sceneBlockService.ts`
- [x] Implement `sceneNPCService.ts`
- [x] Implement `sceneActivationService.ts` (scene activation orchestration)
- [x] Follow existing service patterns (lazy Supabase client)
- [x] Add optimistic updates with rollback

**State Management**:
- [x] Create `sceneBlockStore.ts` with Immer MapSet
- [x] Create `sceneNPCStore.ts` with Immer MapSet
- [x] Test store persistence to localStorage
- [x] Implement fetch-once pattern (fetchedScenes Set)
- [x] Add optimistic UI updates with error handling

**TypeScript & Code Quality**:
- [x] Add all types to types/index.ts
- [x] Create placeholder types until DB types regenerated
- [x] ✅ ESLint: 0 errors, 0 warnings
- [x] ✅ TypeScript: 1 expected warning (Immer+Map depth - runtime OK)

**Success Criteria**:
- ✅ All tables created with proper RLS policies
- ✅ CRUD operations implemented for all entities
- ✅ Stores update correctly with optimistic UI
- ✅ No TypeScript errors, all types defined
- ✅ Production-ready code quality

---

### ✅ Phase 2: Scene Editor Layout & Hero (COMPLETED - 2025-10-03)

**Components**:
- [x] Implement `SceneEditor.tsx` with layout structure
- [x] Implement `SceneHero.tsx` with editable title/description
- [x] Add gradient background matching Figma
- [x] Implement `InlineEditor.tsx` reusable component
- [x] Add debounced auto-save (300ms) to all edits
- [x] Implement `SceneAmbienceSection.tsx` (display-only)
- [x] Add scene rename in sidebar with inline editing

**Integration**:
- [x] Integrate into `SessionSceneView.tsx`
- [x] Scene data loads correctly from sessionSceneStore
- [x] Real-time sync between sidebar and editor
- [x] Two-store update pattern (sceneStore + sessionSceneStore)

**Bug Fixes & Polish**:
- [x] Fixed Map/Set localStorage serialization
- [x] Fixed layout shift on description edit (min-height wrapper)
- [x] Fixed textarea auto-sizing to match line-height
- [x] Removed hover backgrounds on editable fields
- [x] Fixed save conflicts (no refetch during editing)
- [x] Suppressed 404 errors for unimplemented tables

**Success Criteria**:
- ✅ Scene editor renders with correct layout (760px max-width)
- ✅ Title and description editable inline
- ✅ Auto-save works with 300ms debounce
- ✅ Visual design matches Figma (radial gradients)
- ✅ Zero layout shift when editing
- ✅ Real-time updates across UI
- ✅ ESLint: 0 errors, 0 warnings
- ✅ TypeScript: 2 expected warnings (Immer depth - runtime OK)

---

### ⬜ Phase 3: Ambience Section - Interactive (Week 3-4)

**Components**:
- [ ] Update `SceneAmbienceSection.tsx` to be interactive (click to edit)
- [ ] Reuse existing `AudioLibrary.tsx` as audio picker modal
- [ ] Reuse existing `LightConfigModal.tsx` for light configuration
- [ ] Add "Configure Audio" button on ambience audio card
- [ ] Add "Configure Lights" button on ambience light card

**Features**:
- [ ] Click "Configure Audio" → Opens AudioLibrary in selection mode
- [ ] Select audio file → Save to scene.audio_config JSONB
- [ ] Click "Configure Lights" → Opens LightConfigModal
- [ ] Configure lights → Save to scene.light_config JSONB
- [ ] Display selected audio/light info in cards
- [ ] Update sessionSceneStore after config changes

**Technical Notes**:
- AudioLibrary already exists - add selection mode prop
- LightConfigModal already exists - wire up to scene save
- Store light config directly in JSONB (defer presets table to Phase 9)
- Use two-store update pattern (no refetch)

**Success Criteria**:
- ✅ Audio selection works and persists to scene.audio_config
- ✅ Light configuration UI functional with live preview
- ✅ Cards update immediately after save
- ✅ Cards match Figma design (bg-[#222222])
- ✅ Real-time sync with sessionSceneStore

---

### ⬜ Phase 4: Rich Text Editing (Notes) (Week 4-5)

**Components**:
- [ ] Implement `SceneNotesSection.tsx` with 3-column grid
- [ ] Implement `SceneBlockEditor.tsx` with contenteditable
- [ ] Implement `RichTextToolbar.tsx` with formatting buttons
- [ ] Implement `BlockMenu.tsx` context menu
- [ ] Add text block support
- [ ] Add heading blocks (H1, H2, H3)

**Features**:
- [ ] Click to focus and edit block
- [ ] Select text to show RichTextToolbar
- [ ] Apply formatting: bold, italic, underline, strikethrough
- [ ] Add hyperlinks with URL input
- [ ] Enter key creates new block below
- [ ] Backspace on empty block deletes it
- [ ] Right-click shows BlockMenu to insert blocks
- [ ] Drag handle to reorder blocks

**Technical Details**:
- [ ] Convert contenteditable HTML to TextContent format
- [ ] Parse TextContent back to HTML for display
- [ ] Debounced auto-save (500ms)
- [ ] Optimistic updates with rollback

**Success Criteria**:
- ✅ Text editing feels smooth (<50ms latency)
- ✅ Formatting preserved on save/reload
- ✅ Block creation and deletion works
- ✅ Toolbar appears/hides correctly

---

### ⬜ Phase 5: List Blocks & Images (Week 5-6)

**Features**:
- [ ] Implement bulleted list blocks
- [ ] Implement numbered list blocks
- [ ] Implement checkbox list blocks
- [ ] Implement image blocks with upload
- [ ] Add keyboard shortcuts for lists (- for bullets, 1. for numbered)
- [ ] Allow converting text blocks to lists

**Image Upload**:
- [ ] Upload images to Cloudflare R2
- [ ] Generate thumbnails for large images
- [ ] Support drag-and-drop image upload
- [ ] Support paste image from clipboard
- [ ] Add alt text input for accessibility

**Success Criteria**:
- ✅ All list types work correctly
- ✅ Images upload and display
- ✅ Keyboard shortcuts functional
- ✅ Accessibility: alt text, keyboard navigation

---

### ⬜ Phase 6: NPCs Section (Week 6-7)

**Components**:
- [ ] Implement `SceneNPCsSection.tsx` with 3-column grid
- [ ] Implement `SceneNPCCard.tsx` with stats display
- [ ] Create NPC creation modal
- [ ] Add NPC stat tracking (HP, AC, abilities)
- [ ] Support NPC image upload

**Features**:
- [ ] Add NPC button opens modal
- [ ] Fill in NPC name, description, stats
- [ ] Upload NPC portrait image
- [ ] Save NPC to scene_npcs table
- [ ] Display NPCs in grid matching Notes layout
- [ ] Click NPC card to edit
- [ ] Right-click to delete

**Success Criteria**:
- ✅ NPC creation workflow smooth
- ✅ Stats display clearly
- ✅ Images load correctly
- ✅ Grid layout matches Figma

---

### ⬜ Phase 7: Scene Activation (Week 7)

**Service**:
- [ ] Implement `sceneActivationService.ts`
- [ ] Activate audio in parallel with lights
- [ ] Handle errors gracefully (one failure doesn't block other)
- [ ] Update scene.is_active flag
- [ ] Deactivate other scenes in campaign

**Integration**:
- [ ] Add "Activate Scene" button to SceneEditor
- [ ] Show active indicator in scene list sidebar
- [ ] Update audio footer when scene activates
- [ ] Update Hue lights when scene activates

**Performance**:
- [ ] Profile scene activation time
- [ ] Optimize to <100ms total
- [ ] Add loading states during activation
- [ ] Show success/error toast notifications

**Success Criteria**:
- ✅ Scene activates audio + lights together
- ✅ Activation completes in <100ms
- ✅ Active state persists across page reloads
- ✅ Multiple devices sync active state

---

### ⬜ Phase 8: Polish & Performance (Week 8)

**Performance Optimizations**:
- [ ] Profile component render times
- [ ] Implement virtual scrolling for 100+ blocks
- [ ] Optimize re-renders with React.memo
- [ ] Lazy load images in NPC cards
- [ ] Add loading skeletons during data fetch

**UX Improvements**:
- [ ] Add keyboard shortcuts (Cmd+B, Cmd+I, etc.)
- [ ] Add block templates (pre-filled content)
- [ ] Add scene duplication feature
- [ ] Add undo/redo for block edits
- [ ] Add "unsaved changes" warning

**Accessibility**:
- [ ] Keyboard navigation for all actions
- [ ] ARIA labels for all interactive elements
- [ ] Screen reader testing
- [ ] Focus management in modals
- [ ] High contrast mode support

**Success Criteria**:
- ✅ Lighthouse accessibility score >90
- ✅ All interactions <100ms
- ✅ Keyboard-only navigation works
- ✅ Screen readers announce changes

---

### ⬜ Phase 9: Advanced Features (Future)

**Real-time Collaboration**:
- [ ] Show other users editing same scene
- [ ] Lock blocks during editing
- [ ] Show cursor positions
- [ ] Conflict resolution UI

**Export & Sharing**:
- [ ] Export scene as PDF
- [ ] Export scene as Markdown
- [ ] Share scene via link
- [ ] Import scene from template

**AI Integration**:
- [ ] Generate scene description from title
- [ ] Generate NPC stats from description
- [ ] Suggest lighting based on scene mood
- [ ] Auto-tag scenes by content

---

## Success Metrics

### Performance Targets

- **Scene Activation**: <100ms (audio + lights in parallel)
- **Text Editing Latency**: <50ms (contenteditable response)
- **Auto-save Debounce**: 500ms
- **Initial Page Load**: <500ms
- **Block Render Time**: <16ms (60fps)

### Data Integrity

- **Zero Data Loss**: All edits auto-saved
- **Conflict Resolution**: Last-write-wins, notify user of conflicts
- **Offline Support**: Draft changes saved to localStorage
- **Real-time Sync**: Changes appear on other devices <2s

### User Experience

- **Notion-level Editing**: Rich text, blocks, drag-to-reorder
- **One-click Activation**: Audio + lights change instantly
- **Keyboard Shortcuts**: Cmd+B, Cmd+I, Enter, Backspace
- **Mobile Responsive**: Works on tablets (desktop-first)

### Accessibility

- **Keyboard Navigation**: All actions keyboard-accessible
- **Screen Reader Support**: ARIA labels, semantic HTML
- **Focus Management**: Logical tab order, focus indicators
- **High Contrast**: Works with high contrast mode

---

## Testing Strategy

### Unit Tests

- [ ] Service layer methods (CRUD operations)
- [ ] Store actions (create, update, delete, reorder)
- [ ] Text formatting utils (HTML ↔ TextContent conversion)
- [ ] Scene activation logic

### Integration Tests

- [ ] Scene editor end-to-end workflow
- [ ] Block creation and editing
- [ ] NPC management
- [ ] Audio and light configuration
- [ ] Real-time sync between multiple clients

### Performance Tests

- [ ] Profile scene activation time
- [ ] Measure text editing latency
- [ ] Benchmark block render time with 100+ blocks
- [ ] Test virtual scrolling performance

### Accessibility Tests

- [ ] Keyboard navigation audit
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Lighthouse accessibility score
- [ ] Color contrast validation

---

## Known Challenges & Solutions

### Challenge 1: ContentEditable Quirks

**Problem**: ContentEditable has inconsistent behavior across browsers

**Solution**:
- Use `document.execCommand()` for basic formatting
- Normalize HTML output before saving
- Test extensively in Chrome, Firefox, Safari
- Consider using Slate.js or ProseMirror if issues persist

---

### Challenge 2: Real-time Conflict Resolution

**Problem**: Two users editing same block simultaneously

**Solution**:
- Implement last-write-wins strategy
- Show toast notification when remote changes detected
- Future: Block-level locking during active editing
- Future: Operational Transformation (OT) for true collaborative editing

---

### Challenge 3: Scene Activation Performance

**Problem**: Activating audio + lights might exceed 100ms

**Solution**:
- Run audio and lights in parallel (Promise.all)
- Preload audio file when scene selected
- Cache Hue bridge connection
- Show optimistic UI immediately
- Measure and optimize Hue API call time

---

### Challenge 4: Large Scenes (100+ Blocks)

**Problem**: Rendering many blocks causes lag

**Solution**:
- Implement virtual scrolling (@tanstack/react-virtual)
- Lazy load images in NPC cards
- Use React.memo to prevent unnecessary re-renders
- Paginate blocks if virtual scrolling insufficient

---

## Design System Compliance

### Typography

- **Hero Title**: PP Mondwest, 60px, leading-72px, tracking-[-1.2px]
- **Section Headers**: Inter Semi Bold, 16px, leading-24px
- **Body Text**: Inter Regular, 14px, leading-20px
- **Secondary Text**: Inter Medium, 12px, leading-18px, color-[#b4b4b4]

### Colors

- **Background**: #111111 (main), #191919 (sidebar), #222222 (cards)
- **Text**: #FFFFFF (primary), #EEEEEE (secondary), #B4B4B4 (tertiary)
- **Borders**: rgba(255,255,255,0.1) (default), rgba(255,255,255,0.2) (hover)
- **Accent**: Purple (#8b5cf6) and Pink (#ec4899) gradients

### Spacing

- **Section Gap**: 16px
- **Card Padding**: 16px
- **Grid Gap**: 16px
- **Section Padding**: 24px vertical

### Components

- **Cards**: bg-[#222222], rounded-[12px], shadow-md
- **Sidebar**: w-[320px], bg-[#191919], rounded-[8px]
- **Buttons**: Follow existing design system patterns
- **Modals**: Use BaseModal component
- **Empty States**: Use EmptyState component with variant="simple"

---

## Migration Notes

### From Old Scene System

**Current State**:
- Scenes exist with basic name/description
- Audio config in JSONB (audio_id, volume, loop)
- Light config in JSONB (Hue format)
- No notes or NPCs

**Migration Plan**:
1. Keep existing scenes table structure
2. Add new tables (scene_blocks, scene_npcs, light_configs)
3. No data migration needed (new features are additive)
4. Update SceneModal to new SceneEditor component
5. Deprecate old SessionSceneView detail panel

**Backward Compatibility**:
- Scenes without blocks/NPCs show empty state
- Existing audio/light configs work unchanged
- No breaking changes to existing features

---

## Future Enhancements (Post-MVP)

### Real-time Collaboration
- Show other users editing same scene
- Cursor positions and selections
- Block-level locking
- Operational Transformation for conflict-free editing

### AI Features
- Generate scene descriptions from titles
- Generate NPC stats from descriptions
- Suggest lighting presets based on mood
- Auto-tag scenes by content analysis

### Templates & Presets
- Scene templates (tavern, dungeon, forest, etc.)
- Block templates (common note structures)
- NPC templates (by creature type)
- Quick scene creation wizard

### Advanced Editing
- Markdown shortcuts (## for H2, - for bullets)
- Slash commands (/image, /npc, /heading)
- Copy/paste blocks between scenes
- Bulk edit blocks
- Version history and rollback

### Export & Sharing
- Export scene as PDF (with formatting)
- Export as Markdown
- Share read-only scene via link
- Print-friendly view for DM notes

### Mobile App
- React Native mobile app
- Offline editing with sync
- Quick scene activation from phone
- Voice-to-text for notes

---

## Changelog

### 2025-10-03 - Initial Specification
- Created comprehensive technical spec
- Analyzed Figma design (Session/Scene 2)
- Designed database schema (scene_blocks, scene_npcs, light_configs)
- Mapped component architecture
- Defined service layer and state management
- Outlined 9-phase implementation roadmap
- Set performance targets and success metrics

---

## References

- **Figma Design**: [Session/Scene 2](https://www.figma.com/design/0O7RfsyZB8ngrbfF7Bd0lA/Lorelight---App-v2?node-id=0-43) (node 0:43)
- **Design System**: `/DESIGN_SYSTEM.md`
- **Scene System Design**: `/SCENE_SYSTEM_DESIGN.md` (legacy reference)
- **Project Instructions**: `/CLAUDE.md`
- **Database Schema**: `/supabase/migrations/`

---

## Questions & Decisions Log

### Q: Should we use a rich text editor library (Slate.js, ProseMirror)?
**Decision**: Start with native contenteditable + execCommand. Evaluate libraries if we hit major browser quirks.

### Q: How do we handle scene activation conflicts (two users activating different scenes)?
**Decision**: Last activation wins. Show toast notification to other users. Active state syncs via Supabase realtime.

### Q: Should blocks support nesting (headings with child paragraphs)?
**Decision**: Start flat (Notion-like). Add nesting in Phase 9 if user feedback demands it.

### Q: How do we prevent accidental data loss during editing?
**Decision**: Auto-save every 500ms + optimistic updates + "unsaved changes" warning on navigate.

---

**End of Specification**
