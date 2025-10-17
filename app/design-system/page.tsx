'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Music, Trash2, Edit2, Play, Pause, AlertCircle, MoreVertical, Info, X, Tag, ChevronDown, SlidersHorizontal, ChevronUp } from 'lucide-react'
import { BaseModal } from '@/components/ui/BaseModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { InputModal } from '@/components/ui/InputModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tooltip } from '@/components/ui/Tooltip'

export default function DesignSystemPage() {
  const [showBaseModal, setShowBaseModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showInputModal, setShowInputModal] = useState(false)
  const [uiDialogOpen, setUiDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    item?: { id: string; name: string }
  } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>('demo-track-2')
  const [sortField, setSortField] = useState<'name' | 'duration'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const editInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-focus input when editing
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const sampleTableData = [
    { id: 'demo-track-1', name: 'Tavern Ambience', duration: '3:45', type: 'Ambience' },
    { id: 'demo-track-2', name: 'Battle Theme', duration: '2:30', type: 'Music' },
    { id: 'demo-track-3', name: 'Forest Sounds', duration: '5:12', type: 'Ambience' },
  ]

  const sampleTags = ['ambient', 'battle', 'tavern', 'forest', 'epic']

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  const handleSort = (field: 'name' | 'duration') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTableData = [...sampleTableData].sort((a, b) => {
    let comparison = 0
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === 'duration') {
      const aDuration = parseInt(a.duration.replace(':', ''))
      const bDuration = parseInt(b.duration.replace(':', ''))
      comparison = aDuration - bDuration
    }
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-black/40 border border-white/10 rounded-[8px] p-4 overflow-x-auto text-[13px] text-white/90">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyCode(code, id)}
        className="absolute top-2 right-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white/70 hover:text-white transition-colors"
      >
        {copiedCode === id ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-12">
      <h2 className="text-[20px] font-semibold text-white mb-4">{title}</h2>
      {children}
    </section>
  )

  const Example = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 className="text-[16px] font-medium text-white mb-2">{title}</h3>
      {description && <p className="text-[14px] text-white/60 mb-4">{description}</p>}
      <div className="bg-[#191919] border border-white/10 rounded-[8px] p-6">
        {children}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <PageHeader
            title="Lorelight Design System"
            description={
              'Reusable UI components, tokens, and patterns.\nBuilt with React, TypeScript, and Tailwind.'
            }
          />
        </div>

        {/* Navigation */}
        <nav className="sticky top-8 float-right w-64 ml-8 mb-8">
          <div className="bg-[#191919] border border-white/10 rounded-[8px] p-4">
            <h3 className="text-[14px] font-semibold text-white mb-3">On This Page</h3>
            <ul className="space-y-2 text-[13px]">
              <li><a href="#colors" className="text-white/60 hover:text-white transition-colors">Colors</a></li>
              <li><a href="#typography" className="text-white/60 hover:text-white transition-colors">Typography</a></li>
              <li><a href="#spacing" className="text-white/60 hover:text-white transition-colors">Spacing</a></li>
              <li><a href="#radii" className="text-white/60 hover:text-white transition-colors">Radii</a></li>
              <li><a href="#shadows" className="text-white/60 hover:text-white transition-colors">Shadows</a></li>
              <li><a href="#buttons" className="text-white/60 hover:text-white transition-colors">Buttons</a></li>
              <li><a href="#inputs" className="text-white/60 hover:text-white transition-colors">Inputs</a></li>
              <li><a href="#cards" className="text-white/60 hover:text-white transition-colors">Cards</a></li>
              <li><a href="#tabs" className="text-white/60 hover:text-white transition-colors">Tabs</a></li>
              <li><a href="#tables" className="text-white/60 hover:text-white transition-colors">Tables</a></li>
              <li><a href="#modals" className="text-white/60 hover:text-white transition-colors">Modals</a></li>
              <li><a href="#dialog" className="text-white/60 hover:text-white transition-colors">Dialog</a></li>
              <li><a href="#headers" className="text-white/60 hover:text-white transition-colors">Headers</a></li>
              <li><a href="#dropdowns" className="text-white/60 hover:text-white transition-colors">Dropdowns</a></li>
              <li><a href="#sidebars" className="text-white/60 hover:text-white transition-colors">Sidebars</a></li>
              <li><a href="#tags" className="text-white/60 hover:text-white transition-colors">Tags</a></li>
              <li><a href="#bulk-actions" className="text-white/60 hover:text-white transition-colors">Bulk Actions</a></li>
              <li><a href="#inline-editing" className="text-white/60 hover:text-white transition-colors">Inline Editing</a></li>
              <li><a href="#scrollable-containers" className="text-white/60 hover:text-white transition-colors">Scrollable Containers</a></li>
              <li><a href="#context-menus" className="text-white/60 hover:text-white transition-colors">Context Menus</a></li>
              <li><a href="#tooltips" className="text-white/60 hover:text-white transition-colors">Tooltips</a></li>
              <li><a href="#empty-states" className="text-white/60 hover:text-white transition-colors">Empty States</a></li>
              <li><a href="#sidebar-consistency" className="text-white/60 hover:text-white transition-colors">Sidebar Consistency</a></li>
              <li><a href="#layouts" className="text-white/60 hover:text-white transition-colors">Layouts</a></li>
              <li><a href="#playing-track-animation" className="text-white/60 hover:text-white transition-colors">Playing Track Animation</a></li>
              <li><a href="#audio-player-footer" className="text-white/60 hover:text-white transition-colors">Audio Player Footer</a></li>
              <li><a href="#dark-fantasy-charm" className="text-white/60 hover:text-white transition-colors">Dark Fantasy Charm</a></li>
            </ul>
          </div>
        </nav>

        <div className="max-w-3xl">
          {/* Colors */}
          <Section title="Colors">
            <div id="colors" className="space-y-6">
              <Example title="Background Colors">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-24 bg-[#111111] border border-white/10 rounded-[8px] mb-2"></div>
                    <p className="text-[13px] text-white/90 font-mono">#111111</p>
                    <p className="text-[12px] text-white/60">Main Background</p>
                  </div>
                  <div>
                    <div className="h-24 bg-[#191919] border border-white/10 rounded-[8px] mb-2"></div>
                    <p className="text-[13px] text-white/90 font-mono">#191919</p>
                    <p className="text-[12px] text-white/60">Surface (Cards, Panels)</p>
                  </div>
                </div>
              </Example>

              <Example title="Text Colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Primary Text</span>
                    <span className="text-[13px] text-white/60 font-mono">text-white</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Secondary Text</span>
                    <span className="text-[13px] text-white/60 font-mono">text-white/60</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Tertiary Text</span>
                    <span className="text-[13px] text-white/60 font-mono">text-white/40</span>
                  </div>
                </div>
              </Example>

              <Example title="Accent Colors">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="h-16 bg-red-500 rounded-[8px] mb-2"></div>
                    <p className="text-[13px] text-white/90 font-mono">bg-red-500</p>
                    <p className="text-[12px] text-white/60">Destructive</p>
                  </div>
                  <div>
                    <div className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[8px] mb-2"></div>
                    <p className="text-[13px] text-white/90 font-mono">purple-pink</p>
                    <p className="text-[12px] text-white/60">Gradients</p>
                  </div>
                  <div>
                    <div className="h-16 bg-white rounded-[8px] mb-2"></div>
                    <p className="text-[13px] text-white/90 font-mono">bg-white</p>
                    <p className="text-[12px] text-white/60">Primary Action</p>
                  </div>
                </div>
              </Example>
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography">
            <div id="typography" className="space-y-6">
              <Example title="Font Sizes">
                <div className="space-y-4">
                  <div>
                    <p className="text-[20px] text-white mb-1">Display (20px)</p>
                    <p className="text-[13px] text-white/60 font-mono">text-[20px]</p>
                  </div>
                  <div>
                    <p className="text-[16px] text-white mb-1">Heading (16px)</p>
                    <p className="text-[13px] text-white/60 font-mono">text-[16px]</p>
                  </div>
                  <div>
                    <p className="text-[14px] text-white mb-1">Body (14px)</p>
                    <p className="text-[13px] text-white/60 font-mono">text-[14px]</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-white mb-1">Small (13px)</p>
                    <p className="text-[13px] text-white/60 font-mono">text-[13px]</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-white mb-1">Tiny (12px)</p>
                    <p className="text-[13px] text-white/60 font-mono">text-[12px]</p>
                  </div>
                </div>
              </Example>
              <Example title="Font Families">
                <div className="space-y-3">
                  <p className="text-white" style={{ fontFamily: 'PP Mondwest, system-ui, sans-serif' }}>PP Mondwest (Headings)</p>
                  <p className="text-white/80" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>Inter (Body)</p>
                </div>
              </Example>
            </div>
          </Section>

          {/* Spacing */}
          <Section title="Spacing">
            <div id="spacing" className="space-y-6">
              <Example title="8px Base Grid">
                <div className="space-y-3">
                  {[
                    { size: '2px', class: 'p-0.5', name: 'xs' },
                    { size: '4px', class: 'p-1', name: 'sm' },
                    { size: '8px', class: 'p-2', name: 'md' },
                    { size: '16px', class: 'p-4', name: 'lg' },
                    { size: '24px', class: 'p-6', name: 'xl' },
                    { size: '32px', class: 'p-8', name: '2xl' },
                  ].map(({ size, class: className, name }) => (
                    <div key={size} className="flex items-center gap-4">
                      <div className="w-32">
                        <span className="text-[13px] text-white/90">{name}</span>
                        <span className="text-[13px] text-white/60 ml-2">({size})</span>
                      </div>
                      <div className="flex-1 bg-white/5 rounded">
                        <div className={`${className} bg-white/20 rounded`}>
                          <div className="h-8 bg-white/40 rounded"></div>
                        </div>
                      </div>
                      <span className="text-[13px] text-white/60 font-mono w-16">{className}</span>
                    </div>
                  ))}
                </div>
              </Example>
            </div>
          </Section>

          {/* Radii */}
          <Section title="Radii">
            <div id="radii" className="space-y-6">
              <Example title="Border Radius Scale" description="4px, 8px, 12px, 16px per guidelines">
                <div className="grid grid-cols-4 gap-4">
                  {[4, 8, 12, 16].map((r) => (
                    <div key={r} className="text-center">
                      <div className="h-16 bg-[#191919] border border-white/10 mb-2" style={{ borderRadius: r }} />
                      <div className="text-[12px] text-white/60 font-mono">rounded-[{r}px]</div>
                    </div>
                  ))}
                </div>
              </Example>
            </div>
          </Section>

          {/* Shadows */}
          <Section title="Shadows">
            <div id="shadows" className="space-y-6">
              <Example title="Subtle Elevations">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="h-20 bg-[#191919] border border-white/10 rounded-[8px] shadow-sm" />
                    <p className="mt-2 text-[12px] text-white/60 font-mono">shadow-sm</p>
                  </div>
                  <div>
                    <div className="h-20 bg-[#191919] border border-white/10 rounded-[8px] shadow-lg" />
                    <p className="mt-2 text-[12px] text-white/60 font-mono">shadow-lg</p>
                  </div>
                  <div>
                    <div className="h-20 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl" />
                    <p className="mt-2 text-[12px] text-white/60 font-mono">shadow-2xl</p>
                  </div>
                </div>
              </Example>
            </div>
          </Section>

          {/* Buttons */}
          <Section title="Buttons">
            <div id="buttons" className="space-y-6">
              <Example title="Button Variants" description="Primary, Ghost, Destructive, and Icon buttons">
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Primary Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="default" disabled>Disabled</Button>
                </div>
              </Example>

              <Example title="Icon Buttons">
                <div className="flex gap-4">
                  <button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
                    <Play className="w-[18px] h-[18px] text-white/70" />
                  </button>
                  <button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
                    <Plus className="w-[18px] h-[18px] text-white/70" />
                  </button>
                  <button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
                    <Edit2 className="w-[18px] h-[18px] text-white/70" />
                  </button>
                  <button className="w-10 h-10 rounded-[8px] hover:bg-red-500/10 flex items-center justify-center transition-colors text-red-400">
                    <Trash2 className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </Example>

              <CodeBlock
                id="button-primary"
                code={`<Button variant="default">Primary Button</Button>

// Or custom styling
<button className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 transition-colors">
  Primary Action
</button>`}
              />
            </div>
          </Section>

          {/* Modals */}
          <Section title="Modals">
            <div id="modals" className="space-y-6">
              <Example title="Modal Components" description="BaseModal, ConfirmDialog, and InputModal">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => setShowBaseModal(true)}>Open BaseModal</Button>
                  <Button variant="destructive" onClick={() => setShowConfirmDialog(true)}>
                    Open ConfirmDialog
                  </Button>
                  <Button onClick={() => setShowInputModal(true)}>Open InputModal</Button>
                </div>
              </Example>

              <CodeBlock
                id="modal-base"
                code={`import { BaseModal } from '@/components/ui/BaseModal'

<BaseModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  footer={<Button onClick={handleSave}>Save</Button>}
>
  <p>Modal content here</p>
</BaseModal>`}
              />

              <CodeBlock
                id="modal-confirm"
                code={`import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

<ConfirmDialog
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure? This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
  isLoading={isDeleting}
/>`}
              />

              <CodeBlock
                id="modal-input"
                code={`import { InputModal } from '@/components/ui/InputModal'

<InputModal
  isOpen={isOpen}
  onClose={handleClose}
  onSubmit={handleCreate}
  title="Create Playlist"
  label="Playlist Name"
  placeholder="Enter playlist name..."
  submitText="Create"
  isLoading={isCreating}
/>`}
              />
            </div>
          </Section>

          {/* Dialog (UI primitives) */}
          <Section title="Dialog">
            <div id="dialog" className="space-y-6">
              <Example title="Dialog Primitives" description="Lightweight dialog with escape/overlay close">
                <div className="flex items-center gap-3">
                  <Button onClick={() => setUiDialogOpen(true)}>Open Dialog</Button>
                </div>
              </Example>
              <CodeBlock
                id="dialog-primitive"
                code={`import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Optional helper text</DialogDescription>
    </DialogHeader>
    <div className=\"mt-4\">Dialog body</div>
    <DialogFooter className=\"mt-6\">
      <button className=\"px-3 py-1.5 rounded-[8px] hover:bg-white/5\" onClick={() => setOpen(false)}>Close</button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
              />
            </div>
          </Section>

          {/* Headers */}
          <Section title="Headers">
            <div id="headers" className="space-y-6">
              <Example title="PageHeader">
                <PageHeader title="Scene Name" description="Scene description text" />
              </Example>

              <Example title="SectionHeader">
                <SectionHeader
                  title="Playlists"
                  variant="sidebar"
                  action={{
                    icon: <Plus className="w-[18px] h-[18px]" />,
                    onClick: () => {},
                    variant: 'icon-only',
                    ariaLabel: 'Create playlist'
                  }}
                />
              </Example>

              <CodeBlock
                id="header-page"
                code={`import { PageHeader } from '@/components/ui/PageHeader'

<PageHeader
  title="Scene Name"
  description="Scene description text"
/>`}
              />

              <CodeBlock
                id="header-section"
                code={`import { SectionHeader } from '@/components/ui/SectionHeader'

<SectionHeader
  title="Playlists"
  variant="sidebar"
  action={{
    icon: <Plus className="w-[18px] h-[18px]" />,
    onClick: handleCreate,
    variant: 'icon-only',
    ariaLabel: 'Create playlist'
  }}
/>`}
              />
            </div>
          </Section>

          {/* Inputs */}
          <Section title="Inputs">
            <div id="inputs" className="space-y-6">
              <Example title="Text Input">
                <div className="space-y-3">
                  <Input placeholder="Enter text..." />
                  <Input placeholder="Disabled input" disabled />
                </div>
              </Example>

              <CodeBlock
                id="input-text"
                code={`import { Input } from '@/components/ui/input'

<Input placeholder="Enter text..." />
<Input placeholder="Disabled input" disabled />`}
              />
            </div>
          </Section>

          {/* Cards */}
          <Section title="Cards">
            <div id="cards" className="space-y-6">
              <Example title="Standard Card">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-white text-[16px]">Card Title</CardTitle>
                    <CardDescription>Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[13px] text-white/80">Body content with our neutral borders and backgrounds.</p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>
              </Example>

              <Example title="Interactive Card">
                <Card className="hover:bg-white/5 cursor-pointer transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-white/60" />
                      <div>
                        <h3 className="text-[14px] font-semibold text-white">Interactive Card</h3>
                        <p className="text-[13px] text-white/60">Hover to see effect</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Example>

              <CodeBlock
                id="card-standard"
                code={`import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Body content</CardContent>
  <CardFooter>
    <button className="px-3 py-1.5 rounded-[8px] hover:bg-white/5">Action</button>
  </CardFooter>
</Card>`}
              />
            </div>
          </Section>

          {/* Tables */}
          <Section title="Tables">
            <div id="tables" className="space-y-6">
              <Example title="Data Table" description="Standard table structure with hover states and actions">
                <div className="flex flex-col">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Name</TableHead>
                        <TableHead className="w-24">Duration</TableHead>
                        <TableHead className="w-32">Type</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleTableData.map((item) => (
                        <TableRow
                          key={item.id}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              item: { id: item.id, name: item.name }
                            })
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Music className="w-4 h-4 text-white/40" />
                              <span className="text-[14px] text-white truncate">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/60">{item.duration}</TableCell>
                          <TableCell className="text-white/60">{item.type}</TableCell>
                          <TableCell>
                            <button className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-all">
                              <MoreVertical className="w-4 h-4 text-white/60" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-white/60">{sampleTableData.length} items</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
                <p className="text-[13px] text-white/60 mt-4">Try right-clicking on a row to see context menu</p>
              </Example>

              <CodeBlock
                id="table-pattern"
                code={`<div className="flex flex-col">
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
</div>`}
              />

              <Example title="Sortable Table" description="Click column headers to sort ascending/descending">
                <div className="flex flex-col">
                  {/* Table Header */}
                  <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex-1 flex items-center gap-1.5 hover:text-white/60 transition-colors text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider"
                    >
                      Name
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSort('duration')}
                      className="w-24 flex items-center justify-end gap-1.5 hover:text-white/60 transition-colors text-[11px] font-semibold text-white/40 uppercase tracking-wider"
                    >
                      <span className="flex items-center gap-1.5">
                        Duration
                        {sortField === 'duration' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </span>
                    </button>
                    <div className="w-32 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Type</div>
                    <div className="w-12"></div>
                  </div>

                  {/* Table Rows */}
                  {sortedTableData.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 px-6 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <Music className="w-4 h-4 text-white/40" />
                        <span className="text-[14px] text-white truncate">{item.name}</span>
                      </div>
                      <div className="w-24 text-[13px] text-white/60">{item.duration}</div>
                      <div className="w-32 text-[13px] text-white/60">{item.type}</div>
                      <div className="w-12"></div>
                    </div>
                  ))}
                </div>
              </Example>

              <CodeBlock
                id="sortable-table"
                code={`const [sortField, setSortField] = useState<'name' | 'duration'>('name')
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

const handleSort = (field: 'name' | 'duration') => {
  if (sortField === field) {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    setSortField(field)
    setSortDirection('asc')
  }
}

// Sortable header
<button
  onClick={() => handleSort('name')}
  className="flex items-center gap-1.5 hover:text-white/60 transition-colors text-[11px] font-semibold text-white/40 uppercase tracking-wider"
>
  Name
  {sortField === 'name' && (
    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  )}
</button>`}
              />
            </div>
          </Section>

          {/* Dropdowns */}
          <Section title="Dropdowns">
            <div id="dropdowns" className="space-y-6">
              <Example title="Filter Dropdown" description="Click-outside handling with positioning">
                <div className="flex justify-center p-8">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] transition-colors flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Filter
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showDropdown && (
                      <div className="absolute top-full right-0 mt-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[200px] py-2 z-50">
                        <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors">
                          All Files
                        </button>
                        <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors">
                          Music Only
                        </button>
                        <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors">
                          Ambience Only
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 transition-colors">
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="dropdown-pattern"
                code={`const [isOpen, setIsOpen] = useState(false)
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
</div>`}
              />
            </div>
          </Section>

          {/* Tabs */}
          <Section title="Tabs">
            <div id="tabs" className="space-y-6">
              <Example title="Tab Navigation" description="Radix-based tabs styled to our theme">
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <div className="mt-4 rounded-[8px] border border-white/10 p-4">
                      <p className="text-[13px] text-white/80">Account tab content</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="password">
                    <div className="mt-4 rounded-[8px] border border-white/10 p-4">
                      <p className="text-[13px] text-white/80">Password tab content</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </Example>
              <CodeBlock
                id="tabs-usage"
                code={`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
  <TabsContent value="password">...</TabsContent>
</Tabs>`}
              />
            </div>
          </Section>

          {/* Sidebars */}
          <Section title="Sidebars">
            <div id="sidebars" className="space-y-6">
              <Example title="Content Sidebar" description="320px wide sidebar pattern for playlists/scenes">
                <div className="w-full h-[400px] bg-[#111111] rounded-[8px] overflow-hidden flex">
                  <div className="w-[320px] h-full bg-[#191919] border-r border-white/10 flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between">
                      <h3 className="text-[16px] font-semibold text-white">Playlists</h3>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-colors">
                        <Plus className="w-[18px] h-[18px] text-white/70" />
                      </button>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4">
                      <ul role="list" className="space-y-2">
                        {['All Files', 'Battle Music', 'Tavern Ambience', 'Forest Sounds', 'Epic Themes'].map((item, i) => (
                          <li key={i}>
                            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[14px] text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                              <Music className="w-4 h-4 flex-shrink-0" />
                              <span className="flex-1 truncate text-left">{item}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-white/40">
                    Main content area
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="sidebar-pattern"
                code={`<div className="w-[320px] h-full bg-[#191919] border-r border-white/10 flex flex-col">
  {/* Header */}
  <div className="px-6 py-4">
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
</div>`}
              />
            </div>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <div id="tags" className="space-y-6">
              <Example title="Display Tags" description="Pills with remove buttons">
                <div className="flex flex-wrap gap-1.5">
                  {['ambient', 'battle', 'tavern'].map(tag => (
                    <div
                      key={tag}
                      className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-[6px] text-[12px] text-white flex items-center gap-1.5"
                    >
                      {tag}
                      <button className="text-white/50 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </Example>

              <Example title="Clickable Filter Tags" description="Toggle tags for filtering">
                <div className="flex flex-wrap gap-1.5">
                  {sampleTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-2 py-1 rounded-[6px] text-[12px] transition-colors ${
                        selectedTags.has(tag)
                          ? 'bg-purple-500/30 border border-purple-500/50 text-white'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </Example>

              <CodeBlock
                id="tags-pattern"
                code={`// Display Tags
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
      className={\`px-2 py-1 rounded-[6px] text-[12px] transition-colors \${
        isActive
          ? 'bg-purple-500/30 border border-purple-500/50 text-white'
          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
      }\`}
    >
      {tag}
    </button>
  ))}
</div>`}
              />
            </div>
          </Section>

          {/* Bulk Actions */}
          <Section title="Bulk Actions">
            <div id="bulk-actions" className="space-y-6">
              <Example title="Selection & Bulk Operations" description="Checkbox-based selection with action toolbar">
                <div className="flex flex-col bg-[#111111] rounded-[8px] overflow-hidden">
                  {/* Selection toolbar (appears when items selected) */}
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10 bg-white/5">
                      <span className="text-[14px] text-white font-medium">
                        {selectedIds.size} selected
                      </span>
                      <button className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Add Tag
                      </button>
                      <button className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Add to Playlist
                      </button>
                      <button className="px-3 py-1.5 text-[13px] text-red-400 hover:text-white hover:bg-red-500/10 rounded-[6px] flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="ml-auto text-[13px] text-white/60 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Items with checkboxes */}
                  <div className="p-4 space-y-2">
                    {sampleTableData.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-[8px] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => {
                            const newSet = new Set(selectedIds)
                            if (newSet.has(item.id)) {
                              newSet.delete(item.id)
                            } else {
                              newSet.add(item.id)
                            }
                            setSelectedIds(newSet)
                          }}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                        <Music className="w-4 h-4 text-white/40" />
                        <span className="text-[14px] text-white">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="bulk-actions-pattern"
                code={`const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
/>`}
              />
            </div>
          </Section>

          {/* Inline Editing */}
          <Section title="Inline Editing">
            <div id="inline-editing" className="space-y-6">
              <Example title="Editable Table Cells" description="Click to edit, Enter to save, Escape to cancel">
                <div className="space-y-2">
                  {sampleTableData.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-[8px] transition-colors"
                    >
                      <Music className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <div className="flex-1">
                        {editingId === item.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              setEditingId(null)
                            }}
                            className="w-full py-1"
                          >
                            <input
                              ref={editInputRef}
                              type="text"
                              defaultValue={item.name}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={() => setTimeout(() => setEditingId(null), 100)}
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
                            onClick={() => setEditingId(item.id)}
                            className="py-1 text-[14px] text-white truncate cursor-pointer"
                          >
                            {item.name}
                          </div>
                        )}
                      </div>
                      <div className="w-24 text-[13px] text-white/60">{item.duration}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-white/60 mt-4">Click on any track name to edit it</p>
              </Example>

              <CodeBlock
                id="inline-editing-pattern"
                code={`const [editingId, setEditingId] = useState<string | null>(null)
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
)}`}
              />
            </div>
          </Section>

          {/* Scrollable Containers */}
          <Section title="Scrollable Containers">
            <div id="scrollable-containers" className="space-y-6">
              <Example title="Custom Scrollbar Styling" description="Consistent scrollbar appearance">
                <div className="h-64 overflow-y-auto scrollbar-custom bg-[#111111] rounded-[8px] p-4">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i} className="py-2 px-3 mb-2 bg-white/5 rounded-[6px] text-[14px] text-white">
                      Scrollable item {i + 1}
                    </div>
                  ))}
                </div>
              </Example>

              <CodeBlock
                id="scrollbar-pattern"
                code={`/* In globals.css */
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

/* Usage */
<div className="h-64 overflow-y-auto scrollbar-custom">
  {/* Scrollable content */}
</div>`}
              />
            </div>
          </Section>

          {/* Context Menus */}
          <Section title="Context Menus">
            <div id="context-menus" className="space-y-6">
              <Example title="Right-Click Menu" description="Right-click on items in the table above to see this in action">
                <div className="p-12 bg-black/20 rounded-[8px] flex items-center justify-center">
                  <p className="text-[14px] text-white/60">Right-click on table rows above to trigger context menu</p>
                </div>
              </Example>

              <CodeBlock
                id="context-menu-pattern"
                code={`const [contextMenu, setContextMenu] = useState<{
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

// Context menu JSX
{contextMenu && (
  <div
    className="fixed bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 min-w-[140px]"
    style={{
      left: \`\${contextMenu.x}px\`,
      top: \`\${contextMenu.y}px\`,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2">
      <Edit2 className="w-3.5 h-3.5" />
      Edit
    </button>
    <div className="h-px bg-white/10 my-1" />
    <button className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2">
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  </div>
)}`}
              />
            </div>
          </Section>

          {/* Tooltips */}
          <Section title="Tooltips">
            <div id="tooltips" className="space-y-6">
              <Example title="Hover Tooltip" description="Hover or focus the icons">
                <div className="flex gap-6 p-8">
                  <Tooltip content="This is a tooltip" position="top">
                    <button>
                      <Info className="w-5 h-5 text-white/60" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Warning: This action is irreversible" position="top">
                    <button>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Play audio track" position="top">
                    <button>
                      <Play className="w-5 h-5 text-white/60" />
                    </button>
                  </Tooltip>
                </div>
              </Example>

              <CodeBlock
                id="tooltip-pattern"
                code={`import { Tooltip } from '@/components/ui/Tooltip'

<Tooltip content="This is a tooltip" position="top">
  <button>
    <Info className="w-5 h-5" />
  </button>
</Tooltip>`}
              />
            </div>
          </Section>

          {/* Empty States */}
          <Section title="Empty States">
            <div id="empty-states" className="space-y-6">
              <Example title="Empty State Component">
                <EmptyState
                  title="No items yet"
                  description="Click + to create your first item"
                  variant="simple"
                />
              </Example>

              <CodeBlock
                id="empty-state"
                code={`import { EmptyState } from '@/components/ui/EmptyState'

<EmptyState
  title="No items yet"
  description="Click + to create your first item"
  variant="simple"
/>`}
              />
            </div>
          </Section>

          {/* Sidebar Consistency */}
          <Section title="Sidebar Consistency">
            <div id="sidebar-consistency" className="space-y-6">
              <Example title="Standardized Patterns" description="Critical consistency patterns for all sidebars (lights, playlists, scenes, sessions)">
                <div className="space-y-4 text-[13px]">
                  <div>
                    <p className="text-white font-medium mb-2">List Item Typography (CRITICAL)</p>
                    <ul className="space-y-1 text-white/60 text-[12px]">
                      <li>• Primary text: <code className="text-purple-400">text-[13px] font-medium</code></li>
                      <li>• Secondary text: <code className="text-purple-400">text-[11px] text-white/50</code></li>
                      <li>• List item padding: <code className="text-purple-400">px-3 py-2</code></li>
                      <li>• Selected state: <code className="text-purple-400">bg-white/10</code></li>
                      <li>• Hover state: <code className="text-purple-400">hover:bg-white/5</code></li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-white font-medium mb-2">Inline Edit Input (CRITICAL)</p>
                    <p className="text-white/60 text-[12px] mb-1">Standard classes for all inline editing:</p>
                    <code className="block bg-black/40 rounded px-2 py-1 text-[11px] text-purple-400">
                      bg-white/[0.07] border border-white/10 rounded-[8px] px-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/20
                    </code>
                  </div>

                  <div>
                    <p className="text-white font-medium mb-2">Context Menu (CRITICAL)</p>
                    <ul className="space-y-1 text-white/60 text-[12px]">
                      <li>• Container: <code className="text-purple-400">bg-[#191919] border border-white/10 rounded-[8px] py-1</code></li>
                      <li>• Item padding: <code className="text-purple-400">px-4 py-2</code> with <code className="text-purple-400">gap-2</code></li>
                      <li>• Icon size: <code className="text-purple-400">w-3.5 h-3.5</code></li>
                      <li>• Typography: <code className="text-purple-400">text-[13px]</code></li>
                      <li>• Copy: Concise (&quot;Rename&quot;, &quot;Delete&quot;) - NO entity type suffixes</li>
                      <li>• Divider: <code className="text-purple-400">h-px bg-white/10 my-1</code> before destructive actions</li>
                      <li>• Delete hover: <code className="text-purple-400">hover:bg-red-500/10</code> with <code className="text-purple-400">text-red-400</code></li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-white font-medium mb-2">Empty States</p>
                    <ul className="space-y-1 text-white/60 text-[12px]">
                      <li>• Pattern: &quot;No [items] discovered...&quot;</li>
                      <li>• Typography: <code className="text-purple-400">text-[0.875rem] text-white/40</code></li>
                      <li>• Examples: &quot;No scenes discovered...\nCreate a scene to begin&quot;</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-white font-medium mb-2">Action Button Tooltips</p>
                    <ul className="space-y-1 text-white/60 text-[12px]">
                      <li>• Plus button: <code className="text-purple-400">title=&quot;Create [entity]&quot;</code> or with ellipsis for modals</li>
                      <li>• Settings button: <code className="text-purple-400">title=&quot;Configure [system]&quot;</code></li>
                      <li>• Always include <code className="text-purple-400">aria-label</code> for accessibility</li>
                    </ul>
                  </div>
                </div>
              </Example>

              <Example title="Visual Comparison" description="Context menu before and after standardization">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[12px] text-red-400 font-medium">❌ Before (Inconsistent)</p>
                    <div className="bg-[#222222] border border-white/20 rounded-[12px] py-2 p-2">
                      <div className="px-4 py-3 text-sm flex items-center gap-3">
                        <Edit2 className="w-4 h-4" />
                        <span>Rename room</span>
                      </div>
                      <div className="px-4 py-3 text-sm flex items-center gap-3 text-red-400">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete room</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[12px] text-green-400 font-medium">✅ After (Standardized)</p>
                    <div className="bg-[#191919] border border-white/10 rounded-[8px] py-1 p-2">
                      <div className="px-4 py-2 text-[13px] flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-white">Rename</span>
                      </div>
                      <div className="h-px bg-white/10 my-1" />
                      <div className="px-4 py-2 text-[13px] flex items-center gap-2 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-red-400">Delete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="sidebar-consistency"
                code={`// HueContextMenu.tsx - Standardized Pattern
interface HueContextMenuProps {
  entityName: string
  onDelete?: () => Promise<void>
  triggerButton: React.ReactNode
  onStartEdit?: () => void
}

{isOpen && (
  <div className="absolute right-0 top-full mt-1 min-w-[140px] bg-[#191919] border border-white/10 rounded-[8px] py-1 shadow-lg z-50 overflow-hidden">
    <button
      onClick={handleStartRename}
      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors text-left"
    >
      <Edit2 className="w-3.5 h-3.5 text-white/70" />
      <span className="text-[13px] text-white">Rename</span>
    </button>

    {onDelete && (
      <>
        <div className="h-px bg-white/10 my-1" />
        <button
          onClick={handleDelete}
          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 transition-colors text-left"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[13px] text-red-400">Delete</span>
        </button>
      </>
    )}
  </div>
)}

// Inline edit input - Standardized
<input
  type="text"
  value={editingName}
  onChange={(e) => setEditingName(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }}
  onBlur={handleSave}
  className="w-full px-3 py-1.5 bg-white/[0.07] border border-white/10 rounded-[8px] text-[13px] text-white focus:outline-none focus:border-white/20"
  autoFocus
/>

// List item - Standardized
<button className="w-full text-left px-3 py-2 rounded-[8px] transition-colors bg-white/10 text-white">
  <div className="font-medium text-[13px]">{item.name}</div>
  <div className="text-[11px] text-white/50 mt-0.5">{item.subtitle}</div>
</button>`}
              />
            </div>
          </Section>

          {/* Layouts */}
          <Section title="Layouts">
            <div id="layouts" className="space-y-6">
              <Example title="Two Sidebar Layout" description="Navigation sidebar + content sidebar + main content (Audio Library pattern)">
                <div className="h-64 bg-black/20 rounded-[8px] p-2 flex gap-2">
                  <div className="w-12 bg-[#191919] rounded-[4px] flex flex-col items-center gap-2 p-2">
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                  </div>
                  <div className="w-48 bg-[#191919] rounded-[4px] p-2">
                    <div className="text-[11px] text-white/60 mb-2">Playlists</div>
                    <div className="space-y-1">
                      <div className="h-6 bg-white/10 rounded"></div>
                      <div className="h-6 bg-white/5 rounded"></div>
                      <div className="h-6 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#191919] rounded-[4px] p-2">
                    <div className="text-[11px] text-white/60 mb-2">Main Content</div>
                    <div className="space-y-1">
                      <div className="h-6 bg-white/5 rounded"></div>
                      <div className="h-6 bg-white/5 rounded"></div>
                      <div className="h-6 bg-white/5 rounded"></div>
                    </div>
                  </div>
                </div>
              </Example>

              <Example title="Single Sidebar Layout" description="Navigation sidebar + main content (Dashboard pattern)">
                <div className="h-64 bg-black/20 rounded-[8px] p-2 flex gap-2">
                  <div className="w-12 bg-[#191919] rounded-[4px] flex flex-col items-center gap-2 p-2">
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                  </div>
                  <div className="flex-1 bg-[#191919] rounded-[4px] p-4">
                    <div className="text-[11px] text-white/60 mb-3">Dashboard</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-20 bg-white/5 rounded"></div>
                      <div className="h-20 bg-white/5 rounded"></div>
                      <div className="h-20 bg-white/5 rounded"></div>
                    </div>
                  </div>
                </div>
              </Example>

              <Example title="Three Column Layout" description="Navigation + sidebar + two-column content (Session View pattern)">
                <div className="h-64 bg-black/20 rounded-[8px] p-2 flex gap-2">
                  <div className="w-12 bg-[#191919] rounded-[4px] flex flex-col items-center gap-2 p-2">
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                    <div className="w-8 h-8 bg-white/10 rounded"></div>
                  </div>
                  <div className="w-48 bg-[#191919] rounded-[4px] p-2">
                    <div className="text-[11px] text-white/60 mb-2">Scenes</div>
                    <div className="space-y-1">
                      <div className="h-6 bg-white/10 rounded"></div>
                      <div className="h-6 bg-white/5 rounded"></div>
                      <div className="h-6 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#191919] rounded-[4px] p-2">
                    <div className="text-[11px] text-white/60 mb-2">Session View</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="h-12 bg-white/5 rounded"></div>
                        <div className="h-12 bg-white/5 rounded"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-12 bg-white/5 rounded"></div>
                        <div className="h-12 bg-white/5 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="layout-combinations"
                code={`import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'

// Two Sidebar Layout
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
  contentSidebar={<PlaylistsSidebar />}
>
  <div className="p-6">
    {/* Main content with table */}
  </div>
</DashboardLayoutWithSidebar>

// Single Sidebar Layout
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
>
  <div className="p-6">
    {/* Main content with campaign cards */}
  </div>
</DashboardLayoutWithSidebar>

// Three Column Layout
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
  contentSidebar={<ScenesList />}
>
  <div className="p-6">
    <div className="grid grid-cols-2 gap-4">
      {/* Two column content */}
    </div>
  </div>
</DashboardLayoutWithSidebar>`}
              />
            </div>
          </Section>

          {/* Playing Track Animation */}
          <Section title="Playing Track Animation">
            <div id="playing-track-animation" className="space-y-6">
              <Example title="Interactive Demo" description="Click a row to see the playing track effects. Hover to see visualizer/pause button swap.">
                <div className="space-y-0">
                  {sampleTableData.map((track) => {
                    const isPlaying = playingTrackId === track.id
                    return (
                      <div
                        key={track.id}
                        className={`group cursor-pointer border-b border-white/5 ${
                          isPlaying
                            ? 'playing-track-gradient active'
                            : 'hover:bg-white/5'
                        } transition-colors`}
                        onClick={() => setPlayingTrackId(isPlaying ? null : track.id)}
                      >
                        <div className="flex items-center px-6 py-3">
                          {/* Play/Pause Button with Visualizer */}
                          <div className="flex items-center w-[24px] justify-center mr-4">
                            {/* Visualizer Bars - visible when playing and NOT hovering */}
                            {isPlaying && (
                              <div className="flex items-center gap-0.5 h-4 group-hover:opacity-0 transition-opacity duration-200">
                                <div className="visualizer-bar active" />
                                <div className="visualizer-bar active" />
                                <div className="visualizer-bar active" />
                              </div>
                            )}

                            {/* Play/Pause Button - visible on hover or when not playing */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setPlayingTrackId(isPlaying ? null : track.id)
                              }}
                              className={`absolute w-4 h-4 text-white/50 hover:text-white transition-all ${
                                isPlaying
                                  ? 'opacity-0 group-hover:opacity-100'
                                  : 'opacity-100'
                              }`}
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 fill-current icon-playing-glow" />
                              ) : (
                                <Play className="w-4 h-4 fill-current" />
                              )}
                            </button>
                          </div>

                          <div className="flex-1">
                            <div className="text-[14px] text-white">{track.name}</div>
                          </div>
                          <div className="text-[13px] text-white/60 w-16 text-right tabular-nums">{track.duration}</div>
                          <div className="text-[13px] text-white/60 w-24 text-right">{track.type}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Example>

              <Example title="Visual Effects Breakdown">
                <div className="space-y-3 text-[13px]">
                  <div>
                    <p className="text-white font-medium mb-1">1. Pulsing Gradient Background</p>
                    <p className="text-white/60">Animated horizontal gradient sweep with multiple purple tones (5s duration, 400ms fade-in)</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">2. Left Edge Glow</p>
                    <p className="text-white/60">3px vertical purple gradient bar that pulses (2.5s intervals)</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">3. Wave Pattern Overlay</p>
                    <p className="text-white/60">Subtle horizontal wave animation (8s duration)</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">4. Audio Visualizer Bars</p>
                    <p className="text-white/60">Three animated bars with staggered timing (0.6s, 0.8s, 0.7s)</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">5. Icon Glow</p>
                    <p className="text-white/60">Subtle drop-shadow pulse on pause icon (2s animation)</p>
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="playing-track-code"
                code={`<div
  className={\`group \${
    isCurrentlyPlaying
      ? 'playing-track-gradient active'
      : 'hover:bg-white/5'
  }\`}
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
    className={\`absolute w-4 h-4 \${
      isCurrentlyPlaying
        ? 'opacity-0 group-hover:opacity-100'
        : 'opacity-0 group-hover:opacity-100'
    }\`}
  >
    <Pause className="w-4 h-4 fill-current icon-playing-glow" />
  </button>
</div>

/* All animation classes defined in globals.css */
/* See DESIGN_SYSTEM.md for complete CSS implementation */`}
              />
            </div>
          </Section>

          {/* Audio Player Footer */}
          <Section title="Audio Player Footer">
            <div id="audio-player-footer" className="space-y-6">
              <Example title="Component Overview" description="Persistent audio playback controls with Dark Fantasy Charm accents">
                <div className="space-y-4 text-[13px]">
                  <div>
                    <p className="text-white font-medium mb-2">Layout Structure</p>
                    <ul className="space-y-1 text-white/60">
                      <li>• Three-column: Track Info (256px) | Playback Controls (flex-1) | Volume (128px)</li>
                      <li>• Natural height with padding: pt-5 pb-6 (20px top, 24px bottom)</li>
                      <li>• Background: #111111 with subtle purple vignette</li>
                      <li>• Always flush against viewport bottom (no gaps)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-2">Visual Features</p>
                    <ul className="space-y-1 text-white/60">
                      <li>• Purple-Pink Gradient on progress bar and volume slider</li>
                      <li>• Scene-aware artwork with gradient from track ID hash</li>
                      <li>• Animated equalizer bars (3 bars, staggered timing)</li>
                      <li>• Shimmer effect on progress bar when playing</li>
                      <li>• Purple glow underneath active progress bar</li>
                    </ul>
                  </div>
                </div>
              </Example>

              <Example title="Key Animations">
                <div className="space-y-3 text-[13px]">
                  <div className="bg-black/20 rounded-[6px] p-3">
                    <p className="text-white font-medium mb-1">Equalizer Bars</p>
                    <p className="text-white/60 text-[12px]">Three bars with staggered animations (0.8s, 0.9s, 0.7s) and delays (0s, 0.2s, 0.4s)</p>
                  </div>
                  <div className="bg-black/20 rounded-[6px] p-3">
                    <p className="text-white font-medium mb-1">Shimmer Effect</p>
                    <p className="text-white/60 text-[12px]">3s linear infinite animation translating gradient overlay across progress bar</p>
                  </div>
                  <div className="bg-black/20 rounded-[6px] p-3">
                    <p className="text-white font-medium mb-1">Volume Slider</p>
                    <p className="text-white/60 text-[12px]">Gradient thumb with scale(1.2) and purple glow on hover</p>
                  </div>
                </div>
              </Example>

              <Example title="Interactive States">
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div className="bg-black/20 rounded-[6px] p-3">
                    <p className="text-white font-medium mb-1">No Track</p>
                    <p className="text-white/60 text-[12px]">Disabled play button, no gradient effects, neutral gray artwork</p>
                  </div>
                  <div className="bg-black/20 rounded-[6px] p-3">
                    <p className="text-white font-medium mb-1">Playing</p>
                    <p className="text-white/60 text-[12px]">Equalizer bars animate, shimmer on progress, purple gradient active</p>
                  </div>
                  <div className="bg-black/20 rounded-[6px] p-3">
                    <p className="text-white font-medium mb-1">Paused</p>
                    <p className="text-white/60 text-[12px]">Static artwork, no animations, gradient colors remain</p>
                  </div>
                  <div className="bg-black/20 rounded-[6px] p-3">
                    <p className="text-white font-medium mb-1">Hover</p>
                    <p className="text-white/60 text-[12px]">White scrubber with purple glow, volume thumb scales up</p>
                  </div>
                </div>
              </Example>

              <Example title="Design Principles">
                <div className="space-y-2 text-[13px]">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <p className="text-white/60">Minimal and clean aesthetic with purposeful purple accents</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <p className="text-white/60">No excessive glows or pulsing effects (removed during refinement)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <p className="text-white/60">Equalizer bars use static background to prevent visual artifacts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <p className="text-white/60">All animations are subtle and enhance rather than distract</p>
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="audio-player-usage"
                code={`import { AudioPlayerFooter } from '@/components/dashboard/AudioPlayerFooter'

// In layout component
<div className="h-screen w-full flex flex-col overflow-hidden">
  {/* Main content */}
  <div className="flex-1 overflow-hidden">
    {children}
  </div>

  {/* Audio footer - always at bottom */}
  <div className="flex-shrink-0">
    <AudioPlayerFooter />
  </div>
</div>

// Purple-pink gradient pattern
const gradient = 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)'

// Scene-aware gradient function
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
}`}
              />
            </div>
          </Section>

          {/* Dark Fantasy Charm */}
          <Section title="Dark Fantasy Charm">
            <div id="dark-fantasy-charm" className="space-y-6">
              <Example title="Philosophy">
                <div className="space-y-4 text-[13px]">
                  <div>
                    <p className="text-white/90 mb-2">Lorelight embraces its D&D identity through subtle thematic touches that add personality without being tacky or on-the-nose.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-green-400 font-medium">✅ DO:</p>
                      <ul className="space-y-1 text-white/60 text-[12px]">
                        <li>• Use subtle, sophisticated touches</li>
                        <li>• Embrace D&D themes in copy, not visuals</li>
                        <li>• Add interactive delights that feel magical</li>
                        <li>• Use animation to create atmosphere</li>
                        <li>• Let users discover easter eggs naturally</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-red-400 font-medium">❌ DON&apos;T:</p>
                      <ul className="space-y-1 text-white/60 text-[12px]">
                        <li>• Use fantasy-themed icons (swords, shields)</li>
                        <li>• Add medieval/gothic fonts</li>
                        <li>• Use literal D&D imagery (dice, sheets)</li>
                        <li>• Make the UI feel like a game interface</li>
                        <li>• Force theme on users who want a clean tool</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Example>

              <Example title="Implemented Elements">
                <div className="space-y-4 text-[13px]">
                  <div>
                    <p className="text-white font-medium mb-2">1. D&D Loading Messages</p>
                    <div className="bg-black/20 rounded-[6px] p-3 space-y-1 text-white/60 text-[12px] font-mono">
                      <p>&quot;Rolling for initiative...&quot;</p>
                      <p>&quot;Consulting the ancient tomes...&quot;</p>
                      <p>&quot;Gathering the party...&quot;</p>
                      <p>&quot;Casting Detect Magic...&quot;</p>
                      <p>&quot;The tavern grows quiet...&quot;</p>
                    </div>
                    <p className="text-white/60 mt-2">Random phrases during file uploads that reference D&D mechanics and flavor</p>
                  </div>

                  <div>
                    <p className="text-white font-medium mb-2">2. Playing Track Visualizer</p>
                    <p className="text-white/60">Animated purple gradient with pulsing visualizer bars. Makes the currently playing track feel alive and magical, like a spell being cast.</p>
                  </div>

                  <div>
                    <p className="text-white font-medium mb-2">3. Gradient Hero Backgrounds</p>
                    <p className="text-white/60">Pink and purple radial gradients with blur effects at the top of pages. Creates depth and atmosphere, like looking into a portal or magical mist.</p>
                  </div>
                </div>
              </Example>

              <Example title="Future Ideas">
                <div className="space-y-3 text-[13px] text-white/60">
                  <div>
                    <p className="text-white font-medium mb-1">Copy & Microcopy:</p>
                    <p>Empty states with thematic flavor, critical hit animations on random events</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Subtle Visual Touches:</p>
                    <p>Audio waveforms with purple glow, arcane circle drag-and-drop animations</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Interactive Easter Eggs:</p>
                    <p>Konami code unlocks DM screen mode, typing &quot;roll&quot; triggers d20 animation</p>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Seasonal/Contextual:</p>
                    <p>Special loading messages for late-night sessions, &quot;The party rests...&quot; after 2+ hours</p>
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="charm-guidelines"
                code={`// Dark Fantasy Charm Guidelines

1. Restraint is Key: One charm element per view maximum
2. Make it Optional: Never block functionality with charm
3. Performance First: Charm should never impact speed
4. Accessibility: Ensure charm doesn't confuse screen readers
5. Localization: Keep D&D references English-only or easily translatable
6. User Control: Consider settings to disable "fun mode" for serious DMs`}
              />
            </div>
          </Section>
        </div>
      </div>

      {/* Context Menu */}
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
            <Play className="w-3.5 h-3.5" />
            Play
          </button>
          <button className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button className="w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}

      {/* Modal Examples */}
      <BaseModal
        isOpen={showBaseModal}
        onClose={() => setShowBaseModal(false)}
        title="Base Modal Example"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBaseModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowBaseModal(false)}>
              Save
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-white/80">
          This is a BaseModal example. It provides the foundation for all modals with consistent styling and behavior.
        </p>
      </BaseModal>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          setIsLoading(true)
          setTimeout(() => {
            setIsLoading(false)
            setShowConfirmDialog(false)
          }, 1500)
        }}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isLoading}
      />

      <InputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSubmit={() => {
          setShowInputModal(false)
        }}
        title="Create Playlist"
        label="Playlist Name"
        placeholder="Enter playlist name..."
        submitText="Create"
      />

      {/* UI Dialog Example */}
      <Dialog open={uiDialogOpen} onOpenChange={setUiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Optional helper text</DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-white/80 text-sm">Dialog body content matching theme tokens.</div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setUiDialogOpen(false)}>Close</Button>
            <Button onClick={() => setUiDialogOpen(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
