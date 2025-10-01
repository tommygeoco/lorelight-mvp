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

#### Table Row (Audio Library Style)
```tsx
<div
  className="group flex items-center gap-4 px-6 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors"
  data-audio-row
>
  {/* Row content */}
</div>
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

## Future Enhancements

- [ ] Add loading skeleton components
- [ ] Create toast notification component
- [ ] Add dropdown menu component
- [ ] Create badge/chip component
- [ ] Add tooltip component
- [ ] Create progress bar component
- [ ] Add tab navigation component
