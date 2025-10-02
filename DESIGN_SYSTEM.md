# Lorelight Design System

## Overview

The Lorelight design system provides a consistent, reusable set of UI components built with React, TypeScript, and Tailwind CSS.

## Color Palette

### Primary Colors
- **Background**: `#111111` (Main app background)
- **Surface**: `#191919` (Cards, panels, modals)
- **Text**: `#FFFFFF` (Primary text)
- **Text Secondary**: `rgba(255, 255, 255, 0.6)` (Secondary text)
- **Text Tertiary**: `rgba(255, 255, 255, 0.4)` (Disabled/subtle text)

### Accent Colors
- **Purple**: Used in gradients and highlights
- **Pink**: Used in gradients and highlights
- **Red**: `#EF4444` / `rgb(239, 68, 68)` (Destructive actions)

### Borders & Dividers
- **Border**: `rgba(255, 255, 255, 0.1)` (Subtle borders)
- **Border Hover**: `rgba(255, 255, 255, 0.2)` (Interactive borders)

## Typography

### Font Families
- **Primary**: `PP Mondwest` (Headings, titles)
- **Secondary**: `Inter` (Body text, UI)

### Font Sizes
- **Display**: `20px` (Page titles)
- **Heading**: `16px` (Section headers)
- **Body**: `14px` (Default text)
- **Small**: `13px` (Secondary text)
- **Tiny**: `12px` (Labels, captions)

## Spacing

Using 8px base grid:
- **xs**: `2px` (0.5 × base)
- **sm**: `4px` (0.5 × base)
- **md**: `8px` (1 × base)
- **lg**: `16px` (2 × base)
- **xl**: `24px` (3 × base)
- **2xl**: `32px` (4 × base)
- **3xl**: `40px` (5 × base)

## Border Radius

- **Small**: `4px` (Badges, small buttons)
- **Medium**: `8px` (Buttons, inputs, cards)
- **Large**: `12px` (Panels, modals)
- **XLarge**: `16px` (Large cards)

## Components

### Modals

#### BaseModal
Location: `/components/ui/BaseModal.tsx`

Provides the foundation for all modals with consistent styling and behavior.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Close handler
- `title: string` - Modal title
- `children: React.ReactNode` - Modal content
- `footer?: React.ReactNode` - Optional footer content
- `width?: string` - Custom width (default: `w-[402px]`)

**Usage:**
```tsx
<BaseModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  footer={<Button onClick={handleSave}>Save</Button>}
>
  <p>Modal content here</p>
</BaseModal>
```

#### ConfirmDialog
Location: `/components/ui/ConfirmDialog.tsx`

Built on BaseModal, provides a confirmation dialog for destructive actions.

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onConfirm: () => void` - Confirm action handler
- `title: string`
- `description: string`
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `variant?: 'default' | 'destructive'` - Visual variant
- `isLoading?: boolean` - Shows loading state

**Usage:**
```tsx
<ConfirmDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure you want to delete this item? This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
  isLoading={isDeleting}
/>
```

#### InputModal
Location: `/components/ui/InputModal.tsx`

Built on BaseModal, provides a text input dialog for user input.

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onSubmit: (value: string) => void` - Submit handler with input value
- `title: string`
- `label: string` - Input field label
- `placeholder?: string` - Input placeholder
- `defaultValue?: string` - Initial input value
- `submitText?: string` - Submit button text (default: "Create")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `isLoading?: boolean` - Shows loading state

**Usage:**
```tsx
<InputModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSubmit={handleCreate}
  title="Create Playlist"
  label="Playlist Name"
  placeholder="Enter playlist name..."
  submitText="Create"
  isLoading={isCreating}
/>
```

### Buttons

#### Primary Button
```tsx
<button className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Primary Action
</button>
```

#### Ghost Button
```tsx
<button className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors">
  Secondary Action
</button>
```

#### Destructive Button
```tsx
<button className="px-4 py-2 text-[14px] font-semibold text-white bg-red-500 rounded-[8px] hover:bg-red-600 disabled:opacity-50 transition-colors">
  Delete
</button>
```

#### Icon Button
```tsx
<button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
  <Icon className="w-[18px] h-[18px] text-white/70" />
</button>
```

### Headers

#### PageHeader
Location: `/components/ui/PageHeader.tsx`

**Props:**
- `title: string`
- `description?: string`

**Usage:**
```tsx
<PageHeader
  title="Scene Name"
  description="Scene description text"
/>
```

#### SectionHeader
Location: `/components/ui/SectionHeader.tsx`

**Props:**
- `title: string`
- `id?: string` - For ARIA labeling
- `variant?: 'default' | 'sidebar'`
- `action?: { icon, onClick, variant, ariaLabel }`

**Usage:**
```tsx
<SectionHeader
  title="Playlists"
  variant="sidebar"
  action={{
    icon: <Plus className="w-[18px] h-[18px]" />,
    onClick: handleCreate,
    variant: 'icon-only',
    ariaLabel: 'Create playlist'
  }}
/>
```

### Cards

#### Standard Card
```tsx
<div className="bg-[#191919] rounded-[8px] p-4 border border-white/10">
  {/* Card content */}
</div>
```

#### Interactive Card
```tsx
<div className="bg-[#191919] rounded-[8px] p-4 border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
  {/* Card content */}
</div>
```

### Inputs

#### Text Input
```tsx
<input
  type="text"
  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
  placeholder="Enter text..."
/>
```

#### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
  <input
    type="text"
    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-[8px] text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
    placeholder="Search..."
  />
</div>
```

### Context Menus

Standard context menu pattern:

```tsx
{contextMenu && (
  <div
    className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
    style={{
      left: `${contextMenu.x}px`,
      top: `${contextMenu.y}px`,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
      <Icon className="w-3.5 h-3.5" />
      Menu Item
    </button>
  </div>
)}
```

### Empty States

#### EmptyState Component
Location: `/components/ui/EmptyState.tsx`

**Props:**
- `title: string`
- `description: string`
- `variant?: 'simple' | 'centered'`

**Usage:**
```tsx
<EmptyState
  title="No items yet"
  description="Click + to create your first item"
  variant="simple"
/>
```

### Tables

#### Table Pattern
Standard table structure used in audio library and data views.

```tsx
<div className="flex flex-col">
  {/* Table Header */}
  <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 text-[13px] text-white/60 font-medium">
    <div className="flex-1">Name</div>
    <div className="w-24">Duration</div>
    <div className="w-32">Type</div>
    <div className="w-12"></div>
  </div>

  {/* Table Rows */}
  {items.map((item) => (
    <div
      key={item.id}
      className="group flex items-center gap-4 px-6 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors"
      data-table-row
    >
      <div className="flex-1 flex items-center gap-3">
        <Music className="w-4 h-4 text-white/40" />
        <span className="text-[14px] text-white truncate">{item.name}</span>
      </div>
      <div className="w-24 text-[13px] text-white/60">{item.duration}</div>
      <div className="w-32 text-[13px] text-white/60">{item.type}</div>
      <div className="w-12">
        <button className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-all">
          <MoreVertical className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  ))}
</div>
```

#### Sortable Table Headers
Add sorting functionality to table columns with visual indicators.

```tsx
import { ChevronUp, ChevronDown } from 'lucide-react'

const [sortField, setSortField] = useState<'name' | 'duration' | 'size'>('name')
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

const handleSort = (field: 'name' | 'duration' | 'size') => {
  if (sortField === field) {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    setSortField(field)
    setSortDirection('asc')
  }
}

// Sortable header buttons
<button
  onClick={() => handleSort('name')}
  className="flex items-center gap-1.5 hover:text-white/60 transition-colors text-[11px] font-semibold text-white/40 uppercase tracking-wider"
>
  Name
  {sortField === 'name' && (
    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  )}
</button>

// Apply sorting to data
const sortedItems = [...items].sort((a, b) => {
  let comparison = 0
  if (sortField === 'name') {
    comparison = a.name.localeCompare(b.name)
  } else if (sortField === 'duration') {
    comparison = (a.duration || 0) - (b.duration || 0)
  } else if (sortField === 'size') {
    comparison = (a.size || 0) - (b.size || 0)
  }
  return sortDirection === 'asc' ? comparison : -comparison
})
```

**Features:**
- Click header to sort by that column
- Click again to toggle between ascending/descending
- Chevron icon shows current sort direction
- Fixed width headers (`w-16`, `w-20`) align with data columns
- Use `<span>` wrapper for text + icon to keep them grouped

### Lists

#### Sidebar List
```tsx
<ul role="list" className="space-y-2">
  {items.map((item) => (
    <li key={item.id} data-list-item>
      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm transition-colors hover:bg-white/5">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 truncate">{item.name}</span>
      </button>
    </li>
  ))}
</ul>
```

## Layouts

### DashboardLayoutWithSidebar
Location: `/components/layouts/DashboardLayoutWithSidebar.tsx`

Main application layout with navigation sidebar, optional content sidebar, and main content area.

**Props:**
- `navSidebar: ReactNode` - Left navigation sidebar (56px wide)
- `contentSidebar?: ReactNode` - Optional content sidebar (320px wide)
- `children: ReactNode` - Main content area

**Usage:**
```tsx
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={sidebarButtons} />}
  contentSidebar={<PlaylistsSidebar />}
>
  <div>{/* Main content */}</div>
</DashboardLayoutWithSidebar>
```

### Layout Combinations

#### Two Sidebar Layout (Audio Library Pattern)
```tsx
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
  contentSidebar={<PlaylistsSidebar />}
>
  <div className="p-6">
    {/* Main content with table */}
  </div>
</DashboardLayoutWithSidebar>
```

#### Single Sidebar Layout (Dashboard Pattern)
```tsx
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
>
  <div className="p-6">
    {/* Main content with campaign cards */}
  </div>
</DashboardLayoutWithSidebar>
```

#### Three Column Layout (Session View Pattern)
```tsx
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
  contentSidebar={<ScenesList />}
>
  <div className="p-6">
    <div className="grid grid-cols-2 gap-4">
      {/* Two column content */}
    </div>
  </div>
</DashboardLayoutWithSidebar>
```

## Interactive States

### Hover States
- Cards/Buttons: `hover:bg-white/5`
- Text: `hover:text-white` (from `text-white/60`)
- Borders: `focus:border-white/20` (from `border-white/10`)

### Active/Selected States
- Background: `bg-white/10`
- Text: `text-white`

### Disabled States
- Opacity: `opacity-50`
- Cursor: `cursor-not-allowed`

### Loading States
- Button text: Show "Loading..." or spinner
- Disable interactions: `disabled={isLoading}`

## Accessibility

### ARIA Labels
- Always provide `aria-label` for icon-only buttons
- Use `role="list"` and `role="listitem"` for custom lists
- Use semantic HTML (`<button>`, `<input>`, etc.)

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use `onKeyDown` for Escape key handling in modals
- Support Enter key for form submission

### Focus Management
- Auto-focus first input in modals: `autoFocus`
- Visible focus states: `focus:outline-none focus:border-white/20`
- Return focus after modal close

### Context Menus

Standard right-click menu pattern used throughout the application.

**Pattern:**
```tsx
const [contextMenu, setContextMenu] = useState<{
  x: number
  y: number
  item?: ItemType
} | null>(null)

// Close on click outside
useEffect(() => {
  const handleClick = () => setContextMenu(null)
  if (contextMenu) {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }
}, [contextMenu])

// Handler for item context menu
const handleContextMenu = (e: React.MouseEvent, item?: ItemType) => {
  e.preventDefault()
  setContextMenu({ x: e.clientX, y: e.clientY, item })
}

// Context menu JSX
{contextMenu && (
  <div
    className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
    style={{
      left: `${contextMenu.x}px`,
      top: `${contextMenu.y}px`,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
      <Icon className="w-3.5 h-3.5" />
      Menu Item
    </button>
    <div className="h-px bg-white/10 my-1" />
    <button className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  </div>
)}
```

### Tooltips

Simple tooltip pattern using CSS and data attributes.

**Pattern:**
```tsx
// Component with tooltip
<button
  data-tooltip="This is a tooltip"
  className="relative group"
>
  <Info className="w-4 h-4" />
  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#191919] border border-white/10 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
    This is a tooltip
  </span>
</button>
```

## Animation & Transitions

### Standard Transitions
- Duration: `transition-colors` (150ms)
- Hover effects: `transition-all` for multiple properties
- Group hover: `group-hover:opacity-100` for reveal effects

### Common Patterns
```tsx
// Fade in on hover
className="opacity-0 group-hover:opacity-100 transition-opacity"

// Smooth background change
className="hover:bg-white/5 transition-colors"

// Transform on hover
className="hover:scale-105 transition-transform"
```

### Playing Track Animation
Multi-layered visual effects for currently playing audio tracks.

```tsx
<div
  className={`group ${
    isCurrentlyPlaying
      ? 'playing-track-gradient active'
      : 'hover:bg-white/5'
  }`}
>
  {/* Visualizer Bars - visible when playing, hidden on hover */}
  {isCurrentlyPlaying && (
    <div className="flex items-center gap-0.5 h-4 group-hover:opacity-0 transition-opacity duration-200">
      <div className="visualizer-bar active" />
      <div className="visualizer-bar active" />
      <div className="visualizer-bar active" />
    </div>
  )}

  {/* Pause Button - hidden, visible on hover */}
  <button
    className={`absolute w-4 h-4 ${
      isCurrentlyPlaying
        ? 'opacity-0 group-hover:opacity-100'
        : 'opacity-0 group-hover:opacity-100'
    }`}
  >
    <Pause className="w-4 h-4 fill-current icon-playing-glow" />
  </button>
</div>
```

**Visual Effects** (defined in globals.css):

1. **Pulsing Gradient Background** (`.playing-track-gradient`):
   - Animated horizontal gradient sweep with multiple purple tones
   - Color stops: `rgba(147, 51, 234, 0)` → `rgba(168, 85, 247, 0.12)` → `rgba(192, 132, 252, 0.1)` → fade out
   - 5-second smooth continuous pulse
   - 400ms smooth fade-in when track starts (using opacity transition, not animation)
   - 300% background size for smoother gradient movement
   - Uses `.active` class to trigger fade-in

2. **Left Edge Glow** (`::before` pseudo-element):
   - 3px wide vertical purple gradient bar
   - Pulses at 2.5s intervals
   - 400ms fade-in with 100ms stagger delay
   - Color: `rgba(147, 51, 234, 0.6)` → `rgba(168, 85, 247, 0.8)`

3. **Wave Pattern Overlay** (`::after` pseudo-element):
   - Subtle horizontal wave animation (8s duration)
   - 600ms fade-in with 200ms stagger delay
   - Adds depth without being distracting

4. **Audio Visualizer Bars** (`.visualizer-bar`):
   - Three 2px wide animated bars
   - Pulsing height animation at different speeds (0.6s, 0.8s, 0.7s)
   - Staggered animation delays (0s, 0.1s, 0.2s)
   - Purple gradient: `rgba(147, 51, 234, 0.8)` → `rgba(168, 85, 247, 0.6)`
   - Hidden on row hover (swapped with pause button)

5. **Icon Glow** (`.icon-playing-glow`):
   - Subtle drop-shadow pulse on pause icon
   - 2s smooth animation
   - Only visible on hover

**Interaction Pattern**:
- Visualizer bars show by default when track is playing
- On row hover, bars fade out and pause button fades in (200ms transition)
- Creates clean, interactive experience without visual clutter
- All effects use GPU-accelerated CSS animations (60fps performance)

## Dark Fantasy Charm

Lorelight is a tool for Dungeon Masters, and we embrace that identity through subtle thematic touches that add personality without being tacky or on-the-nose. These "Dark Fantasy Charm" elements create a sense of magic and adventure while maintaining a professional, premium aesthetic.

### Philosophy

**DO:**
- ✅ Use subtle, sophisticated touches that reward attention
- ✅ Embrace D&D/fantasy themes in copy, not visuals
- ✅ Add interactive delights that feel magical
- ✅ Use animation to create atmosphere
- ✅ Let users discover easter eggs naturally

**DON'T:**
- ❌ Use fantasy-themed icons (swords, shields, dragons)
- ❌ Add medieval/gothic fonts beyond our brand typeface
- ❌ Use literal D&D imagery (dice, character sheets)
- ❌ Make the UI feel like a game interface
- ❌ Force theme on users who want a clean tool

### Implemented Charm Elements

#### 1. D&D Loading Messages
**Location**: `/lib/constants/loadingMessages.ts`

Random phrases during file uploads that reference D&D mechanics and flavor:

```tsx
"Rolling for initiative..."
"Consulting the ancient tomes..."
"Gathering the party..."
"Casting Detect Magic..."
"The dice are rolling..."
"Preparing your spell slots..."
"Checking for traps..."
"Your DM is preparing something..."
"The tavern grows quiet..."
"A mysterious figure approaches..."
```

**Effect**: Makes waiting feel like part of the adventure. Users smile when they see references to their hobby.

#### 2. Playing Track Visualizer
**Location**: Audio Library table rows

Animated purple gradient with pulsing visualizer bars that swap with pause button on hover.

**Effect**: Makes the currently playing track feel alive and magical, like a spell being cast. The smooth animations and purple glow evoke arcane energy without being literal.

#### 3. Gradient Hero Backgrounds
**Location**: Dashboard and Audio Library headers

Pink and purple radial gradients with blur effects at the top of pages.

**Effect**: Creates depth and atmosphere, like looking into a portal or magical mist. The colors suggest twilight, magic hour, or ethereal energy.

#### 4. Arcane Drop Zone
**Location**: Audio Library drag-and-drop upload area

Pulsing purple border and background animation when dragging files over the audio library.

```css
@keyframes arcane-pulse {
  0%, 100% {
    border-color: rgba(147, 51, 234, 0.6);
    background-color: rgba(147, 51, 234, 0.05);
  }
  50% {
    border-color: rgba(168, 85, 247, 0.8);
    background-color: rgba(168, 85, 247, 0.08);
  }
}

.arcane-drop-zone {
  animation: arcane-pulse 1.5s ease-in-out infinite;
}
```

**Effect**: Makes file uploads feel like summoning new items into your magical library. The pulsing animation creates anticipation without being distracting.

**Usage:**
```tsx
{isDraggingOver && (
  <div className="absolute inset-4 z-50 flex items-center justify-center border-2 border-dashed rounded-lg pointer-events-none arcane-drop-zone">
    <div className="text-center">
      <Upload className="w-12 h-12 text-purple-400 mx-auto mb-2" />
      <p className="text-lg text-white font-semibold">Release to add to your collection</p>
      <p className="text-sm text-white/60">Files will be added to the upload queue</p>
    </div>
  </div>
)}
```

#### 5. Volume Slider Arcane Glow
**Location**: Audio controls volume slider

When adjusting volume, the slider thumb glows with purple arcane energy.

```css
input[type="range"].slider:active::-webkit-slider-thumb {
  box-shadow: 0 0 12px rgba(147, 51, 234, 0.6);
}

input[type="range"].slider:active::-moz-range-thumb {
  box-shadow: 0 0 12px rgba(147, 51, 234, 0.6);
}
```

**Effect**: Interactive feedback that makes audio controls feel enchanted. Only visible during interaction to avoid visual clutter.

#### 6. Thematic Empty States
**Location**: Audio library, playlists

Fantasy-themed microcopy for empty states with line breaks between sentences.

**Examples:**
- "This tome is empty.\nAdd tracks to fill its pages."
- "Your arcane library awaits..."
- "No scenes set.\nThe stage is dark and empty..."

**Effect**: Reinforces the D&D theme through language rather than visuals. Maintains professional tone while adding personality.

### Future Dark Fantasy Charm Ideas

**Copy & Microcopy:**
- Empty state for audio library: "Your arcane library awaits..."
- Empty state for scenes: "No scenes set. The stage is dark and empty..."
- Delete confirmation: "Banish this item to the void?" (or keep standard for clarity)
- Error messages: "A wild magic surge occurred..." (technical error below)

**Subtle Visual Touches:**
- Audio waveforms could have subtle purple glow
- Drag-and-drop could show "arcane circle" animation
- Volume sliders could have subtle mist/glow effect
- Scene transitions could have brief "fade through darkness" effect

**Interactive Easter Eggs:**
- Critical hit (20) or critical fail (1) in random dice rolls trigger special animations
- Typing "roll" in search triggers a d20 animation
- Konami code unlocks DM screen mode (fullscreen, minimal chrome)
- Long-press on campaign card shows "quick notes" like a DM screen

**Seasonal/Contextual:**
- Spooky ambient effects during October
- Special loading messages for late-night sessions (11pm-3am)
- "The party rests..." after 2+ hours of continuous playback

### Implementation Guidelines

1. **Restraint is Key**: One charm element per view maximum
2. **Make it Optional**: Never block functionality with charm
3. **Performance First**: Charm should never impact speed (use GPU-accelerated CSS animations)
4. **Accessibility**: Ensure charm doesn't confuse screen readers or navigation
5. **Localization**: Keep D&D references English-only or easily translatable
6. **User Control**: Consider settings to disable "fun mode" for serious DMs
7. **Subtlety Over Spectacle**: Effects should enhance, not distract from core functionality
8. **Test on Removal**: If removing a charm element improves UX, it was too much

### Attempted Features (Removed for UX)

During development, we experimented with several Dark Fantasy Charm elements that were ultimately removed for being too distracting or tacky:

1. **Checkbox Shimmer on Select All** ❌
   - Animated shimmer effect that pulsed across checkboxes when "Select All" was clicked
   - **Why Removed**: Only pulsed once, animation was too fast and jarring, added unnecessary complexity
   - **Lesson**: One-time animations on user actions should be instant feedback, not delayed visual effects

2. **Playhead Particle Effect** ❌
   - Purple particle pseudo-element that followed the audio progress bar playhead
   - **Why Removed**: Not visible due to overflow constraints, added visual clutter when working
   - **Lesson**: Effects in constrained UI elements (progress bars, small containers) rarely work well

3. **Playlist Hover Flicker** ❌
   - Flickering/glowing effect on playlist items when hovering
   - **Why Removed**: Too exaggerated, unclear when it should trigger (always? only when playing?)
   - **Lesson**: Hover effects should be consistent, predictable, and purposeful

### What Works (Lessons Learned)

**✅ Successful Dark Fantasy Charm:**
- **Copy-based charm** (loading messages, empty states): Low risk, high reward
- **Interaction feedback** (volume glow, arcane drop zone): Reinforces user actions
- **Passive ambiance** (gradient backgrounds, playing track visualization): Sets mood without demanding attention
- **Progressive enhancement**: Works perfectly without the charm, better with it

**❌ Unsuccessful Dark Fantasy Charm:**
- **One-off animation triggers**: Hard to time, easy to miss, adds complexity
- **Particles and physics**: Performance concerns, positioning challenges
- **Excessive hover effects**: Confusing, inconsistent, feels unstable
- **Literal fantasy imagery**: On-the-nose, limits professional use cases

## Best Practices

1. **Consistent Spacing**: Use Tailwind's spacing scale (4px increments)
2. **Color Opacity**: Use `/10`, `/20`, `/40`, `/60`, `/70` for white opacity variants
3. **Border Radius**: Stick to `4px`, `8px`, `12px`, `16px`
4. **Z-Index**: Use `z-50` for modals, `z-40` for dropdowns, `z-30` for overlays
5. **Truncate Text**: Use `truncate` class with `min-w-0` on flex children
6. **Icon Sizes**: `w-4 h-4` (16px) for inline, `w-[18px] h-[18px]` for buttons
7. **Form Validation**: Provide visual feedback and clear error messages
8. **Loading States**: Always show loading indicators for async operations
9. **Error Handling**: Display user-friendly error messages via toast notifications
10. **Responsive**: Design mobile-first, use responsive utilities as needed

## File Organization

```
/components
├── ui/                    # Reusable UI components
│   ├── BaseModal.tsx
│   ├── ConfirmDialog.tsx
│   ├── InputModal.tsx
│   ├── PageHeader.tsx
│   ├── SectionHeader.tsx
│   ├── EmptyState.tsx
│   └── button.tsx
├── layouts/               # Layout components
│   ├── DashboardLayoutWithSidebar.tsx
│   └── DashboardSidebar.tsx
├── dashboard/             # Dashboard-specific components
├── audio/                 # Audio-specific components
├── scenes/                # Scene-specific components
└── sessions/              # Session-specific components
```

### Dropdowns

#### Dropdown Menu Pattern
Dropdown menus for filters, actions, and selections. Positioned relative to trigger button.

**Pattern:**
```tsx
const [isOpen, setIsOpen] = useState(false)
const dropdownRef = useRef<HTMLDivElement>(null)

// Close on click outside
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

// Dropdown JSX
<div className="relative" ref={dropdownRef}>
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] transition-colors flex items-center gap-1.5"
  >
    <FilterIcon className="w-3.5 h-3.5" />
    Filter
    <ChevronDown className="w-3 h-3" />
  </button>

  {isOpen && (
    <div className="absolute top-full right-0 mt-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[200px] py-2 z-50">
      <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors">
        Option 1
      </button>
      <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors">
        Option 2
      </button>
    </div>
  )}
</div>
```

### Sidebars

#### Content Sidebar Pattern
320px wide sidebar for playlists, scenes, or navigation.

```tsx
<div className="w-[320px] h-full bg-[#191919] border-r border-white/10 flex flex-col">
  {/* Header */}
  <div className="px-6 py-4 border-b border-white/10">
    <SectionHeader
      title="Playlists"
      variant="sidebar"
      action={{
        icon: <Plus className="w-[18px] h-[18px]" />,
        onClick: handleCreate,
        variant: 'icon-only',
        ariaLabel: 'Create playlist'
      }}
    />
  </div>

  {/* Scrollable List */}
  <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4">
    <ul role="list" className="space-y-2">
      {items.map(item => (
        <li key={item.id}>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[14px] text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Music className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">{item.name}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
</div>
```

### Tags

#### Tag Display & Selection
Pills with optional close/remove button.

```tsx
// Display Tags
<div className="flex flex-wrap gap-1.5">
  {tags.map(tag => (
    <div
      key={tag}
      className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-[6px] text-[12px] text-white flex items-center gap-1.5"
    >
      {tag}
      <button onClick={() => handleRemove(tag)} className="text-white/50 hover:text-white">
        <X className="w-3 h-3" />
      </button>
    </div>
  ))}
</div>

// Clickable Filter Tags
<div className="flex flex-wrap gap-1.5">
  {tags.map(tag => (
    <button
      key={tag}
      onClick={() => handleTagClick(tag)}
      className={`px-2 py-1 rounded-[6px] text-[12px] transition-colors ${
        isActive
          ? 'bg-purple-500/30 border border-purple-500/50 text-white'
          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      {tag}
    </button>
  ))}
</div>
```

#### Tag Management with Ellipsis Menu
Tags in dropdowns with hover-revealed ellipsis menu for rename/delete.

```tsx
<div className="group flex items-center hover:bg-white/5 transition-colors relative">
  <button className="flex-1 px-3 py-2 text-left text-[13px] text-white">
    {tag}
  </button>
  <div className="relative mr-2">
    <button
      onClick={(e) => {
        e.stopPropagation()
        setTagMenuOpen(tag)
      }}
      className="opacity-0 group-hover:opacity-100 px-3 py-2.5 text-white/40 hover:text-white transition-all"
      title="Tag options"
    >
      <MoreVertical className="w-3.5 h-3.5" />
    </button>
    {tagMenuOpen === tag && (
      <div className="absolute right-0 top-full mt-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-lg min-w-[120px] py-1 z-50">
        <button className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2">
          <Edit2 className="w-3.5 h-3.5" />
          Rename
        </button>
        <div className="h-px bg-white/10 my-1" />
        <button className="w-full px-3 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    )}
  </div>
</div>
```

**Features**:
- Ellipsis (⋮) appears on row hover
- Larger hitbox for easier clicking (px-3 py-2.5)
- Right margin spacing (mr-2) from edge
- Dropdown positioned relative to button
- Rename option switches to inline editing
- Delete option shows confirmation dialog

### Checkboxes

#### Custom Checkbox Styling
Checkboxes with purple gradient when checked.

```tsx
<input
  type="checkbox"
  checked={isChecked}
  onChange={handleChange}
  className="w-3.5 h-3.5 cursor-pointer"
/>
```

**Styling** (in globals.css):
- Unchecked: Transparent with white border
- Hover: Subtle white background
- Checked: Purple gradient background with white checkmark
- Gradient: `linear-gradient(135deg, #9333ea 0%, #a855f7 100%)`

### Bulk Actions

#### Selection & Bulk Operations
Checkbox-based selection with bulk action toolbar.

```tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

// Selection toolbar (appears when items selected)
{selectedIds.size > 0 && (
  <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10 bg-white/5">
    <span className="text-[14px] text-white font-medium">
      {selectedIds.size} selected
    </span>
    <button className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px]">
      <Tag className="w-3.5 h-3.5" />
      Add Tag
    </button>
    <button className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px]">
      <Plus className="w-3.5 h-3.5" />
      Add to Playlist
    </button>
    <button className="px-3 py-1.5 text-[13px] text-red-400 hover:text-white hover:bg-red-500/10 rounded-[6px]">
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  </div>
)}

// Checkbox in table row
<input
  type="checkbox"
  checked={selectedIds.has(item.id)}
  onChange={(e) => {
    e.stopPropagation()
    const newSet = new Set(selectedIds)
    if (newSet.has(item.id)) {
      newSet.delete(item.id)
    } else {
      newSet.add(item.id)
    }
    setSelectedIds(newSet)
  }}
  onClick={(e) => e.stopPropagation()}
  className="w-3.5 h-3.5 cursor-pointer"
/>
```

**UX Pattern**:
- Bulk action dropdowns (tags, playlists) stay open after selection
- Allows adding multiple items without reopening dropdown
- Close manually by clicking outside or pressing Escape
- Clear input filters after each selection for easy searching

### Inline Editing

#### Editable Table Cells
Click to edit, Enter to save, Escape to cancel.

```tsx
const [editingId, setEditingId] = useState<string | null>(null)
const inputRef = useRef<HTMLInputElement>(null)

// Auto-focus when editing starts
useEffect(() => {
  if (editingId && inputRef.current) {
    inputRef.current.focus()
    inputRef.current.select()
  }
}, [editingId])

// Editable cell
{editingId === item.id ? (
  <form
    onSubmit={(e) => {
      e.preventDefault()
      handleSave()
    }}
    className="w-full py-1"
  >
    <input
      ref={inputRef}
      type="text"
      defaultValue={item.name}
      onClick={(e) => e.stopPropagation()}
      onBlur={() => setTimeout(handleSave, 100)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          setEditingId(null)
        }
      }}
      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-[13px] text-white focus:outline-none focus:border-white/40"
    />
  </form>
) : (
  <div
    onDoubleClick={() => setEditingId(item.id)}
    className="py-1 text-[14px] text-white truncate"
  >
    {item.name}
  </div>
)}
```

### Scrollable Containers

#### Custom Scrollbar Styling
Consistent scrollbar appearance across the app.

```css
/* In globals.css */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
```

**Usage:**
```tsx
<div className="h-64 overflow-y-auto scrollbar-custom">
  {/* Scrollable content */}
</div>
```

## Future Enhancements

- [x] Dropdown menu component
- [x] Tag/badge component
- [x] Tooltip pattern
- [x] Context menu pattern
- [ ] Add loading skeleton components
- [ ] Create toast notification component
- [ ] Create progress bar component
- [ ] Add tab navigation component
