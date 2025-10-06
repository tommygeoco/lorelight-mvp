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
- **Purple**: `#8b5cf6` / `rgb(139, 92, 246)` (Primary accent, interactive elements)
- **Pink**: `#ec4899` / `rgb(236, 72, 153)` (Secondary accent, gradient partner)
- **Purple-Pink Gradient**: `linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)` (Progress bars, sliders)
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

Provides consistent empty state messaging across the application with variant-specific typography.

**Props:**
- `title: string` - Main heading
- `description?: string` - Optional description text
- `actionLabel?: string` - Optional action button text
- `onAction?: () => void` - Action button handler
- `icon?: React.ReactNode` - Optional icon
- `variant?: 'bordered' | 'simple' | 'centered' | 'inline'` - Visual variant (default: 'bordered')
- `isLoading?: boolean` - Show loading state
- `disabled?: boolean` - Disable action button

**Variants:**

1. **Bordered** - Primary empty states with dashed border box
   - Description: `text-[1rem]` (16px)
   - Used in: Main content areas (campaigns, sessions)
   - Includes optional action button

2. **Simple** - Compact text-only for sidebars
   - Description: `text-[0.875rem]` (14px)
   - Single `<p>` tag with `<br />` for line breaks
   - Used in: Sidebar empty states
   - Example: `Your collection awaits...<br />Forge a playlist to begin`

3. **Centered** - Full-screen selection prompts
   - Description: `text-[1rem]` (16px)
   - Used in: Main content when no item selected
   - Vertically centered with max-width

4. **Inline** - Minimal single-line text
   - Used in: Small list areas

**Typography Standards:**
- Sidebar empty states: `text-[0.875rem]` (14px) with `text-white/40`
- Main content descriptions: `text-[1rem]` (16px) with `text-white/40`
- All titles: `text-lg` (18px) with `text-white`
- Use `<br />` for line breaks, not separate paragraphs

**Usage:**
```tsx
// Bordered variant (main content)
<EmptyState
  title="No sessions yet"
  description="The adventure awaits your first gathering"
  actionLabel="Create Session"
  onAction={handleCreateSession}
  variant="bordered"
/>

// Simple variant (inline sidebar text)
<EmptyState
  title="No playlists yet"
  description="Forge a playlist to begin"
  variant="simple"
/>

// Centered variant (no selection)
<EmptyState
  title="No scene chosen"
  description="The stage awaits your selection"
  variant="centered"
/>

// Custom inline sidebar empty state (recommended for sidebars)
<div className="text-center py-8">
  <p className="text-white/40 text-[0.875rem]">
    The stage is dark and empty...<br />Create a scene to begin
  </p>
</div>
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

### Audio Player Footer

#### Component Overview
Location: `/components/dashboard/AudioPlayerFooter.tsx`

The audio player footer provides persistent audio playback controls across all dashboard views with subtle Dark Fantasy Charm accents.

**Layout Structure:**
- Three-column layout: Track Info (256px) | Playback Controls (flex-1) | Volume (128px)
- Natural height with padding: `pt-5 pb-6` (20px top, 24px bottom)
- Background: `#111111` with subtle purple vignette radial gradient
- Always sits flush against bottom of viewport (no gaps)

**Visual Features:**
- **Purple-Pink Gradient**: Progress bar and volume slider use `linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)`
- **Scene-Aware Artwork**: Gradient background generated from track ID hash
- **Equalizer Bars**: Animated purple bars on artwork when playing (3 bars with staggered timing)
- **Shimmer Effect**: Subtle animated shimmer on progress bar when playing
- **Purple Glow**: Soft glow underneath progress bar when active

**Track Info Section (Left):**
```tsx
<div className="flex items-center gap-3 min-w-0 w-64">
  {/* Artwork with gradient background */}
  <div
    className="w-14 h-14 rounded-md flex-shrink-0 relative group overflow-hidden shadow-lg"
    style={{
      background: currentTrack
        ? getSceneGradient(currentTrack.id)
        : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
    }}
  >
    {/* Equalizer bars when playing */}
    {isPlaying && currentTrack && (
      <div className="absolute -bottom-1 -right-1 bg-black/80 backdrop-blur-sm rounded-md px-1 py-0.5">
        <div className="flex items-end gap-0.5">
          <div className="w-0.5 bg-purple-500 animate-equalizer-1" style={{ height: '8px' }} />
          <div className="w-0.5 bg-purple-500 animate-equalizer-2" style={{ height: '12px' }} />
          <div className="w-0.5 bg-purple-500 animate-equalizer-3" style={{ height: '6px' }} />
        </div>
      </div>
    )}
  </div>

  {/* Track details */}
  <div className="flex flex-col min-w-0 flex-1">
    <div className="text-sm font-medium text-white truncate">
      {currentTrack?.name || 'No track loaded'}
    </div>
    <div className="text-xs text-white/40 truncate">
      <span className="flex items-center gap-1">
        <span className="text-purple-400/60">♪</span>
        Scene Audio
      </span>
    </div>
  </div>
</div>
```

**Playback Controls (Center):**
```tsx
<div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-auto">
  {/* Control buttons */}
  <div className="flex items-center gap-2">
    <button disabled className="w-8 h-8 text-white/20 cursor-not-allowed">
      <SkipBack className="w-4 h-4" fill="currentColor" />
    </button>

    {/* Play/Pause button */}
    <button
      onClick={togglePlay}
      className="w-10 h-10 rounded-full bg-white hover:bg-white/90 hover:scale-105 shadow-lg"
    >
      {isPlaying ? (
        <Pause className="w-4 h-4 text-black" fill="currentColor" />
      ) : (
        <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
      )}
    </button>

    <button disabled className="w-8 h-8 text-white/20 cursor-not-allowed">
      <SkipForward className="w-4 h-4" fill="currentColor" />
    </button>
  </div>

  {/* Progress bar */}
  <div className="flex items-center gap-2 w-full">
    <div className="text-xs text-white/50 tabular-nums w-10 text-right font-mono">
      {formatTime(currentTime)}
    </div>

    <div
      className="relative flex-1 h-1 rounded-full bg-white/10 cursor-pointer group"
      onClick={handleProgressClick}
    >
      {/* Purple glow underneath */}
      <div
        className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
        }}
      />

      {/* Filled progress with gradient */}
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
        }}
      />

      {/* Shimmer effect when playing */}
      {isPlaying && currentTrack && (
        <div className="shimmer-effect" />
      )}

      {/* Hover scrubber with purple glow */}
      <div
        className="opacity-0 group-hover:opacity-100"
        style={{ left: `calc(${progress}% - 6px)` }}
      >
        <div className="w-3 h-3 bg-white rounded-full shadow-lg relative">
          <div className="absolute inset-0 bg-purple-500/50 rounded-full blur-sm" />
        </div>
      </div>
    </div>

    <div className="text-xs text-white/50 tabular-nums w-10 font-mono">
      {formatTime(duration)}
    </div>
  </div>
</div>
```

**Volume Controls (Right):**
```tsx
<div className="flex items-center gap-2 w-32 justify-end">
  <button
    onClick={toggleMute}
    className="flex items-center justify-center text-white/70 hover:text-purple-400 transition-colors"
  >
    <VolumeIcon className="w-5 h-5" />
  </button>

  <div className="flex-1 flex items-center">
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={isMuted ? 0 : volume}
      onChange={handleVolumeChange}
      className="volume-slider w-full h-1 rounded-full appearance-none cursor-pointer"
    />
  </div>
</div>
```

**CSS Animations:**
```css
/* Equalizer bars - staggered timing for organic feel */
@keyframes equalizer-1 {
  0%, 100% { height: 8px; }
  50% { height: 14px; }
}
@keyframes equalizer-2 {
  0%, 100% { height: 12px; }
  50% { height: 6px; }
}
@keyframes equalizer-3 {
  0%, 100% { height: 6px; }
  50% { height: 12px; }
}

.animate-equalizer-1 {
  animation: equalizer-1 0.8s ease-in-out infinite;
}
.animate-equalizer-2 {
  animation: equalizer-2 0.9s ease-in-out infinite;
  animation-delay: 0.2s;
}
.animate-equalizer-3 {
  animation: equalizer-3 0.7s ease-in-out infinite;
  animation-delay: 0.4s;
}

/* Shimmer effect on progress bar */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
.shimmer-effect {
  animation: shimmer 3s linear infinite;
}

/* Volume slider with purple-pink gradient */
.volume-slider {
  background: linear-gradient(
    to right,
    #8b5cf6 0%,
    #ec4899 ${volume * 50}%,
    #ec4899 ${volume * 100}%,
    rgba(255, 255, 255, 0.2) ${volume * 100}%,
    rgba(255, 255, 255, 0.2) 100%
  );
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 8px 2px rgba(139, 92, 246, 0.5);
}
```

**Scene-Aware Gradient Function:**
```tsx
const getSceneGradient = (trackId: string) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ]
  const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}
```

**Interactive States:**
- **No Track**: Disabled play button (white/10), no gradient effects
- **Playing**: Equalizer bars animate, shimmer on progress bar, purple gradient active
- **Paused**: Static artwork, no animations, gradient colors remain
- **Hover (Progress Bar)**: White scrubber appears with purple glow
- **Hover (Volume)**: Slider thumb scales up with purple glow

**Design Principles:**
- Minimal and clean aesthetic with purposeful purple accents
- No excessive glows or pulsing effects (removed during refinement)
- Equalizer bars use static background container to prevent visual artifacts
- Purple ring and blur effects removed for cleaner look
- All animations are subtle and enhance rather than distract

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
**Location**: All sidebars, audio library, main content areas

Fantasy-themed microcopy for empty states that evoke D&D atmosphere through language.

**Implemented Examples:**

*Sidebar Empty States (0.875rem):*
- **Playlists Sidebar**: "Your collection awaits...<br />Forge a playlist to begin"
- **Scenes Sidebar**: "The stage is dark and empty...<br />Create a scene to begin"
- **Lights Sidebar (no bridge)**: "The lights await your command...<br />Connect your bridge via settings"
- **Lights Rooms**: "No chambers found...<br />Configure rooms in your Hue app"
- **Lights Individual**: "No lights discovered...<br />Check your Hue bridge connection"

*Main Content Empty States (1rem):*
- **Audio Library (playlist)**: "This tome is empty.<br />Add tracks to fill its pages"
- **Audio Library (all files)**: "Your arcane library awaits...<br />Upload audio to begin"
- **Campaigns Page**: "Forge a new world to begin your journey"
- **Sessions Page**: "The adventure awaits your first gathering"
- **Lights (centered)**: "Link your Hue bridge to command the lights"
- **Scenes (centered)**: "The stage awaits your selection"

**Typography Rules:**
- Sidebar: Single `<p>` tag with `text-white/40 text-[0.875rem]`, line breaks via `<br />`
- Main content: `text-white/40 text-[1rem]` for descriptions under `text-lg` titles
- No opacity variation within same empty state (all same `text-white/40`)

**Effect**: Reinforces the D&D theme through language rather than visuals. Maintains professional tone while adding personality. Consistent sizing creates clear visual hierarchy between sidebar (compact) and main content (readable).

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

**Structure:**
- `w-[320px] h-full bg-[#191919] rounded-[8px]` - Consistent with nav sidebar and main content
- No `border-r` - 2px gap in layout provides visual separation
- Header: `px-6 py-4` with h2 title + icon button (NO border)
- Scrollable area: `flex-1 overflow-y-auto scrollbar-custom px-6 py-4`

**List Item Typography (CRITICAL - MUST MATCH):**
- **Primary Text**: `text-[13px] font-medium text-white` (selected) / `text-white/70` (default)
- **Secondary Text**: `text-[11px] text-white/50`
- **List Item Padding**: `px-3 py-2`
- **Selected State**: `bg-white/10`
- **Hover State**: `hover:bg-white/5`

**Inline Edit Input (CRITICAL - MUST MATCH):**
- **Classes**: `bg-white/[0.07] border border-white/10 rounded-[8px] px-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20`
- Used for: Creating playlists, renaming rooms/lights, any inline text input
- **Never use**: `bg-white/10` or `border-white/20` (too bright)

**Context Menu (CRITICAL - MUST MATCH):**
- **Trigger**: Right-click on sidebar items (NOT left-click)
- **Container**: `bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]`
- **Positioning**: `fixed` with `style={{ left: x, top: y }}` from click coordinates
- **Item**: `px-4 py-2 text-[13px] gap-2`
- **Icon**: `w-3.5 h-3.5`
- **Copy**: Concise ("Rename", "Delete") - NO entity type suffix
- **Divider**: `<div className="h-px bg-white/10 my-1" />` between items
- **Delete Hover**: `hover:bg-red-500/10` with `text-red-400`
- **Click Outside**: Close menu when clicking anywhere outside

**Action Button Tooltips:**
- Settings icon: `title="Configure [feature]"`
- Plus (inline): `title="Create [item]"`
- Plus (modal): `title="Create [item]..."` (ellipsis indicates complex form)

**Creation Patterns:**
- **Inline Creation** (for simple items like playlists): Click Plus → inline input appears in list → Enter to save, Escape to cancel
- **Modal Creation** (for complex items like scenes): Click Plus → modal opens with full form

**Ellipsis Menu Pattern (Main Content Cards):**
- **Location**: Top-right corner of RoomCard/LightCard/etc.
- **Trigger**: Left-click the MoreVertical (⋮) icon button
- **Component**: Use `HueContextMenu` wrapper with `triggerButton` prop
- **Button Style**: `w-8 h-8 rounded-[8px] hover:bg-white/10`
- **Menu Actions**: Rename (with `onStartEdit`), Delete (with `onDelete`)
- **Important**: Left-click opens menu; do NOT use right-click/onContextMenu for card menus

**Empty State Typography:**
- Font size: `text-[0.875rem]` (14px) - compact for sidebar
- Color: `text-white/40` - single color, no opacity variation
- Line breaks: Use `<br />` not separate `<p>` tags
- Pattern: "No [items] discovered..." for consistency
- Example: `<p className="text-white/40 text-[0.875rem]">No playlists discovered...<br />Create a playlist to begin</p>`

```tsx
<div className="w-[320px] h-full bg-[#191919] rounded-[8px] flex flex-col">
  {/* Header - No SectionHeader component */}
  <div className="px-6 py-4 flex items-center justify-between">
    <h2 className="text-base font-semibold text-white">Playlists</h2>
    <button
      onClick={handleCreate}
      className="w-8 h-8 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors"
      aria-label="Create playlist"
    >
      <Plus className="w-[18px] h-[18px] text-white/70" />
    </button>
  </div>

  {/* Scrollable List */}
  <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4">
    <ul role="list" className="space-y-2">
      {/* Empty state with Dark Fantasy Charm */}
      {items.length === 0 && !isCreatingNew && (
        <li>
          <div className="text-center py-8">
            <p className="text-white/40 text-[0.875rem]">
              Your collection awaits...<br />Forge a playlist to begin
            </p>
          </div>
        </li>
      )}

      {/* Inline creation input (when creating new) */}
      {isCreatingNew && (
        <li>
          <form onSubmit={handleCreateSubmit} className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 flex-shrink-0 text-white/70" />
              <input
                ref={inputRef}
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onBlur={handleCancelCreate}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelCreate()
                }}
                placeholder="Playlist name..."
                className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                autoFocus
              />
            </div>
          </form>
        </li>
      )}

      {/* Regular items */}
      {items.map(item => (
        <li key={item.id}>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Music className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">{item.name}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
</div>
```

**Key Features:**
- Direct header with h2 + button (no SectionHeader component in sidebars)
- Rounded corners matching nav sidebar and main content
- Plus button triggers inline creation for simple items (playlists)
- Input appears in list with icon and auto-focus
- Enter key submits, Escape key cancels
- Created item auto-selected after creation
- Modal creation used for complex items (scenes with audio + lights config)
- Empty states use Dark Fantasy Charm microcopy at 0.875rem with single `<p>` tag and `<br />`

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

### Scene Components

#### SceneHero (Editable Title)
Location: `/components/scenes/SceneHero.tsx`

Editable scene title with gradient background and play/pause controls.

**Props:**
- `scene: Scene` - Scene object
- `sessionId?: string` - Optional session ID for optimistic updates

**Features:**
- **Editable title**: Click title to edit, Enter to save, Escape to cancel
- **Gradient background**: Purple-pink radial gradients matching PageHeader
- **Play/Pause button**: Activate/deactivate scene
- **Auto-select**: Text automatically selected when entering edit mode
- **Zero layout shift**: Input and h1 have identical spacing (m-0 p-0 block)

**Title Edit Pattern:**
```tsx
// Both h1 and input share identical spacing classes
{isEditingTitle ? (
  <input
    className="w-full m-0 p-0 block bg-transparent border-none outline-none font-['PP_Mondwest'] text-[60px] leading-[72px] tracking-[-1.2px] text-white"
  />
) : (
  <h1
    className="m-0 p-0 block font-['PP_Mondwest'] text-[60px] leading-[72px] tracking-[-1.2px] text-white cursor-text"
  >
    {scene.name}
  </h1>
)}
```

**Critical Spacing Rule:**
- **MUST use**: `m-0 p-0 block` on both h1 and input
- **Why**: Prevents any margin/padding differences that cause layout shift
- **Effect**: Entering/exiting edit mode has zero visual jump

**Usage:**
```tsx
import { SceneHero } from '@/components/scenes/SceneHero'

<SceneHero scene={scene} sessionId={sessionId} />
```

**Visual Design:**
- Title: PP Mondwest 60px with -1.2px tracking
- Gradient: Matching purple-pink radial gradients from PageHeader
- Button: Play/Pause with icon and label
- Layout: Centered 760px max-width container

---

#### SceneNotesSection (Inline Text Editor)
Location: `/components/scenes/SceneNotesSection.tsx`

Clean inline text editor for scene notes with rich text formatting and cross-block text selection.

**Props:**
- `scene: Scene` - Scene object

**Features:**
- **Inline editing**: Click anywhere to start typing (creates first block if empty)
- **Cross-block text selection**: Text is selectable across all blocks like a normal document
- **Text selection toolbar**: Selecting text shows floating RichTextToolbar with formatting options
- **Right-click context menu**: BlockMenu for inserting different block types
- **No section header**: Seamless integration into scene content flow
- **Clean design**: No padding, background, or hover effects on container

**Usage:**
```tsx
import { SceneNotesSection } from '@/components/scenes/SceneNotesSection'

<SceneNotesSection scene={scene} />
```

**Visual Design:**
- Container: `min-h-[200px] select-text` (clean, no styling)
- Empty state: `text-white/30` placeholder "Click to start writing..."
- Text selection: `select-text` allows natural text highlighting across blocks

**Interaction Pattern:**
1. **Empty state**: Click anywhere → creates first text block → focuses it
2. **With content**: Click block → edit it
3. **Text selection**: Highlight text → RichTextToolbar appears above selection
4. **Enter key**: Creates new block below current
5. **Backspace on empty**: Deletes block (unless only one)
6. **Grip interactions**: See SceneBlockEditor below

**Context7 Note:** This replaces the previous card-based notes section and the scene description field. Notes are now the primary freeform content area for scenes.

#### SceneBlockEditor
Location: `/components/scenes/SceneBlockEditor.tsx`

Individual contenteditable block with grip interaction and slash commands.

**Props:**
- `block: SceneBlock` - Block data
- `sceneId: string` - Parent scene ID

**Features:**
- **Contenteditable**: Direct text editing with HTML support
- **Auto-save**: 500ms debounced save to database
- **Rich text formatting**: Bold, italic, underline, strikethrough, links (via text selection)
- **Grip interaction**: Drag to reorder, left-click to open menu
- **Slash commands**: Type `/` in text blocks to open block type menu
- **Smart placeholders**: Shows block type or command hint
- **Block types**: Text, H1, H2, H3, Lists, Images
- **Instant cursor movement**: Seamless focus transitions between blocks

**Grip Icon Behavior:**
- **Position**: Absolutely positioned in left margin (`left-[-32px]`), vertically centered
- **Alignment**: Text aligns with page title and other sections (no offset from grip)
- **Tooltip**: "**Drag** to move, **Click** to open menu" (emphasis on Drag and Click)
- **Drag**: Click and drag to reorder blocks
- **Left-click**: Opens BlockMenu positioned below grip

**Slash Commands:**
- **Text blocks only**: Typing `/` in empty or text-only blocks opens BlockMenu
- **Position**: Menu appears below cursor/content area
- **Auto-clear**: Selecting a block type clears the `/` character
- **Not available**: Headers, lists, and other block types do NOT trigger on `/`

**Keyboard Behavior:**
- **Enter**: Always creates new TEXT block below
  - Works even if current block is empty (allows multiple empty lines)
  - Cursor automatically moves to new block (instant, no delay)
  - Positioned at start of new block
  - Always creates TEXT type, regardless of current block type
- **Shift+Enter**: Creates line break within same element (browser default)
- **Backspace on empty**: Deletes block (unless it's the only one)
  - Cursor automatically moves to previous block (instant, no delay)
  - Positioned at end of previous block
- **Delete on empty**: Same behavior as Backspace

**Text Selection Toolbar:**
- **Text blocks only**: RichTextToolbar appears when selecting text in `text` blocks
- **Headers excluded**: Selecting text in H1/H2/H3 blocks does NOT show toolbar
- **Conditional logic**: `if (block.type !== 'text')` prevents toolbar on headers

**Delete Behavior:**
1. User deletes all text → placeholder shows ("Heading 1", "Type / for commands", etc.)
2. User backspaces on empty block → block deleted, cursor moves to previous
3. User clicks grip → opens menu → "Delete Block" option

**Placeholders by Block Type:**
- `text`: "Type / for commands" (hints at slash command feature)
- `heading_1`: "Heading 1"
- `heading_2`: "Heading 2"
- `heading_3`: "Heading 3"

**Styling by Block Type:**
- `text`: `text-[14px] leading-[20px] mb-2`
- `heading_1`: `text-[24px] font-bold leading-[32px] mt-6 mb-2`
- `heading_2`: `text-[20px] font-bold leading-[28px] mt-4 mb-2`
- `heading_3`: `text-[16px] font-bold leading-[24px] mt-3 mb-1`

**Usage:**
```tsx
import { SceneBlockEditor } from '@/components/scenes/SceneBlockEditor'

<SceneBlockEditor block={block} sceneId={scene.id} />
```

**Visual States:**
- **Default**: Grip hidden in left margin, text visible and aligned
- **Hover**: Grip shows at `opacity-40`, increases to `opacity-100` on grip hover
- **Grip hover**: Tooltip appears with emphasized text
- **Empty**: Placeholder text shows in `text-white/30`
- **No row hover highlight**: Clean, minimal appearance
- **Grip positioning**: Absolutely positioned at `left-[-32px]` outside normal flow
- **Text alignment**: Full width (`w-full`), aligns with page title and sections

**Performance Optimizations:**
- **Optimistic updates**: All operations (add, update, delete) update UI immediately
- **Background sync**: Database writes happen asynchronously without blocking
- **Instant cursor movement**: `setTimeout(..., 0)` for immediate focus after React render
- **No awaits**: All DB operations fire-and-forget with error handling
- **Temporary IDs**: New blocks get `temp-${uuid}` IDs immediately, replaced when DB responds
- **Result**: Blazing fast, zero-lag editing experience

---

#### RichTextToolbar
Location: `/components/ui/RichTextToolbar.tsx`

Floating toolbar that appears above text selection with formatting options.

**Props:**
- `selection: Range` - Browser Range object for selected text
- `onFormat: (format) => void` - Format handler
- `onLink: () => void` - Link handler
- `onClose: () => void` - Close handler

**Features:**
- **Auto-position**: Centers above selection, 48px offset
- **Keyboard shortcuts**: Cmd+B (bold), Cmd+I (italic), Cmd+U (underline), Cmd+Shift+X (strikethrough)
- **Close on click outside**: Auto-closes when clicking elsewhere
- **Format buttons**: Bold, Italic, Underline, Strikethrough, Link

**Usage:**
```tsx
import { RichTextToolbar } from '@/components/ui/RichTextToolbar'

{showToolbar && selection && (
  <RichTextToolbar
    selection={selection}
    onFormat={handleFormat}
    onLink={handleLink}
    onClose={() => setShowToolbar(false)}
  />
)}
```

**Styling:**
- Container: `bg-[#191919] border border-white/10 rounded-[8px] shadow-xl px-2 py-2`
- Buttons: `w-8 h-8 rounded-[6px] hover:bg-white/10`
- Icons: `w-4 h-4 text-white/70`
- Divider: `w-px h-6 bg-white/10 mx-1` (between format and link)

---

#### BlockMenu
Location: `/components/ui/BlockMenu.tsx`

Block type selector with delete option, triggered from grip icon.

**Props:**
- `anchorPoint: { x: number; y: number }` - Menu position
- `currentType?: BlockType` - Currently selected type (shows checkmark)
- `onInsert: (type: BlockType) => void` - Type change handler
- `onDelete?: () => void` - Delete handler (optional, shows delete option)
- `onClose: () => void` - Close handler

**Block Types Available:**
- Text (Type icon)
- Heading 1 (Heading1 icon)
- Heading 2 (Heading2 icon)
- Heading 3 (Heading3 icon)
- Bulleted List (List icon)
- Numbered List (ListOrdered icon)
- Checkbox List (CheckSquare icon)
- Image / Media (Image icon)

**Usage:**
```tsx
import { BlockMenu } from '@/components/ui/BlockMenu'

// From grip right-click
{showBlockMenu && (
  <BlockMenu
    anchorPoint={blockMenuPosition}
    currentType={block.type}
    onInsert={handleBlockTypeChange}
    onDelete={handleDeleteFromMenu}
    onClose={() => setShowBlockMenu(false)}
  />
)}
```

**Styling:**
- Standard context menu pattern: `bg-[#191919] border border-white/10 rounded-[8px]`
- Item padding: `px-4 py-2` with `gap-2`
- Icons: `w-3.5 h-3.5`
- Checkmark: Shows on current type (right side, `text-white/60`)
- Divider: `h-px bg-white/10 my-1` before delete
- Delete: `text-red-400 hover:bg-red-500/10`

**Interaction:**
- Clicking a type changes the block type and closes menu
- Clicking delete removes the block (if not the only one) and closes menu
- Escape or click outside closes menu

---

#### SceneSectionHeader
Location: `/components/ui/SceneSectionHeader.tsx`

Standardized section header for scene editor with consistent padding and typography.

**Props:**
- `title: string` - Section title

**Usage:**
```tsx
import { SceneSectionHeader } from '@/components/ui/SceneSectionHeader'

<SceneSectionHeader title="Ambience" />
<SceneSectionHeader title="Notes" />
<SceneSectionHeader title="Enemies" />
```

**Styling:**
- Padding: `pb-0 pt-[24px]` (24px top spacing, flush bottom)
- Typography: `text-[16px] font-semibold leading-[24px]` in Inter
- Color: `text-white`

**Context7 Note:** All section headers in scene editor use this component for consistency.

---

#### AmbienceCard
Location: `/components/scenes/AmbienceCard.tsx`

Clickable card for audio/lighting configuration with gradient backgrounds and icon overlays.

**Props:**
- `variant: 'lighting' | 'audio'` - Card type (determines gradient)
- `title: string` - Card title (e.g., "Lighting", audio file name)
- `subtitle: string` - Card subtitle (e.g., "Custom preset", duration)
- `hasConfig: boolean` - Whether configuration exists (affects audio gradient)
- `onClick: () => void` - Click handler
- `icon?: LucideIcon` - Optional custom icon (defaults based on variant)

**Usage:**
```tsx
import { AmbienceCard } from '@/components/scenes/AmbienceCard'

<AmbienceCard
  variant="lighting"
  title="Lighting"
  subtitle="Custom preset"
  hasConfig={true}
  onClick={() => setIsLightConfigOpen(true)}
/>

<AmbienceCard
  variant="audio"
  title="Tavern Ambience"
  subtitle="3 min"
  hasConfig={true}
  onClick={() => setIsAudioLibraryOpen(true)}
/>
```

**Visual Features:**
- **Lighting**: Purple gradient blur (top-right)
- **Audio**: Orange-amber gradient (when hasConfig=true)
- **Layout**: 64px icon placeholder, title/subtitle, floating icon indicator
- **Hover**: `bg-[#252525]` (subtle lift effect)

**Styling:**
- Base: `bg-[#222222] rounded-[12px] p-[16px]`
- Responsive: `basis-0 grow min-w-px` (equal width in flex layout)
- Text: Title in 16px bold, subtitle in 14px medium

---

#### ScenesSidebar
Location: `/components/scenes/ScenesSidebar.tsx`

Reusable scenes list sidebar used in both campaign-level and session-level views.

**Props:**
- `scenes: Scene[]` - Array of scenes to display
- `selectedSceneId: string | null` - Currently selected scene ID
- `onSceneClick: (scene: Scene) => void` - Scene click handler
- `onSceneContextMenu: (e: React.MouseEvent, scene: Scene) => void` - Right-click handler
- `onEmptySpaceContextMenu: (e: React.MouseEvent) => void` - Empty space right-click
- `onCreate: () => void` - Create new scene handler
- `onDelete?: (scene: Scene, e: React.MouseEvent) => void` - Optional delete handler
- `renderSceneItem?: (scene: Scene, isSelected: boolean) => React.ReactNode` - Custom renderer

**Usage:**
```tsx
import { ScenesSidebar } from '@/components/scenes/ScenesSidebar'

<ScenesSidebar
  scenes={sortedScenes}
  selectedSceneId={selectedSceneId}
  onSceneClick={handleSceneClick}
  onSceneContextMenu={handleContextMenu}
  onEmptySpaceContextMenu={handleEmptySpaceContextMenu}
  onCreate={() => setIsSceneModalOpen(true)}
  onDelete={handleDeleteClick}
/>
```

**Features:**
- Header with title + plus button
- Empty state with Dark Fantasy Charm copy
- Scene list with:
  - Audio/Lights indicators (icons + text)
  - Active/selected states
  - Hover delete button (if onDelete provided)
- Support for custom item rendering

**States:**
- Selected: `bg-white/10`
- Active (not selected): `bg-white/[0.05]`
- Hover: `hover:bg-white/5`

---

#### SceneContextMenu
Location: `/components/scenes/SceneContextMenu.tsx`

Right-click context menu for scenes with standard actions.

**Props:**
- `x: number` - Menu X position
- `y: number` - Menu Y position
- `scene?: Scene` - Scene being acted upon (undefined = empty space click)
- `onNew: () => void` - New scene handler
- `onRename: (scene: Scene) => void` - Rename handler
- `onDuplicate: (scene: Scene) => void` - Duplicate handler
- `onDelete: (scene: Scene) => void` - Delete handler

**Usage:**
```tsx
import { SceneContextMenu } from '@/components/scenes/SceneContextMenu'

{contextMenu && (
  <SceneContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    scene={contextMenu.scene}
    onNew={() => {
      setIsSceneModalOpen(true)
      setContextMenu(null)
    }}
    onRename={(scene) => {
      setEditingSceneId(scene.id)
      setContextMenu(null)
    }}
    onDuplicate={handleDuplicate}
    onDelete={handleDeleteClick}
  />
)}
```

**Menu Items:**
- **Empty space**: "New Scene" only
- **On scene**:
  - "Rename" (Edit2 icon)
  - "Duplicate" (Copy icon)
  - [Divider]
  - "Delete" (Trash2 icon, red styling)

**Styling:** Follows standard context menu pattern (Design System > Context Menus)

---

## Future Enhancements

- [x] Dropdown menu component
- [x] Tag/badge component
- [x] Tooltip pattern
- [x] Context menu pattern
- [x] Scene editor components (Section Header, Ambience Card, Sidebar, Context Menu)
- [ ] Add loading skeleton components
- [ ] Create toast notification component
- [ ] Create progress bar component
- [ ] Add tab navigation component
