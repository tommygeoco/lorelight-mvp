'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Music, Trash2, Edit2, Play, Volume2, AlertCircle, MoreVertical, Info, X, Tag, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { BaseModal } from '@/components/ui/BaseModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { InputModal } from '@/components/ui/InputModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'

export default function DesignSystemPage() {
  const [showBaseModal, setShowBaseModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showInputModal, setShowInputModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    item?: { id: string; name: string }
  } | null>(null)
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
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
    { id: '1', name: 'Tavern Ambience', duration: '3:45', type: 'Ambience' },
    { id: '2', name: 'Battle Theme', duration: '2:30', type: 'Music' },
    { id: '3', name: 'Forest Sounds', duration: '5:12', type: 'Ambience' },
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
    <div className="min-h-screen bg-[#111111] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[32px] font-bold text-white mb-2">Lorelight Design System</h1>
          <p className="text-[16px] text-white/60">
            Interactive documentation of reusable UI components, patterns, and guidelines.
          </p>
        </div>

        {/* Navigation */}
        <nav className="sticky top-8 float-right w-64 ml-8 mb-8">
          <div className="bg-[#191919] border border-white/10 rounded-[8px] p-4">
            <h3 className="text-[14px] font-semibold text-white mb-3">On This Page</h3>
            <ul className="space-y-2 text-[13px]">
              <li><a href="#colors" className="text-white/60 hover:text-white transition-colors">Colors</a></li>
              <li><a href="#typography" className="text-white/60 hover:text-white transition-colors">Typography</a></li>
              <li><a href="#spacing" className="text-white/60 hover:text-white transition-colors">Spacing</a></li>
              <li><a href="#buttons" className="text-white/60 hover:text-white transition-colors">Buttons</a></li>
              <li><a href="#modals" className="text-white/60 hover:text-white transition-colors">Modals</a></li>
              <li><a href="#headers" className="text-white/60 hover:text-white transition-colors">Headers</a></li>
              <li><a href="#inputs" className="text-white/60 hover:text-white transition-colors">Inputs</a></li>
              <li><a href="#cards" className="text-white/60 hover:text-white transition-colors">Cards</a></li>
              <li><a href="#tables" className="text-white/60 hover:text-white transition-colors">Tables</a></li>
              <li><a href="#dropdowns" className="text-white/60 hover:text-white transition-colors">Dropdowns</a></li>
              <li><a href="#sidebars" className="text-white/60 hover:text-white transition-colors">Sidebars</a></li>
              <li><a href="#tags" className="text-white/60 hover:text-white transition-colors">Tags</a></li>
              <li><a href="#bulk-actions" className="text-white/60 hover:text-white transition-colors">Bulk Actions</a></li>
              <li><a href="#inline-editing" className="text-white/60 hover:text-white transition-colors">Inline Editing</a></li>
              <li><a href="#scrollable-containers" className="text-white/60 hover:text-white transition-colors">Scrollable Containers</a></li>
              <li><a href="#context-menus" className="text-white/60 hover:text-white transition-colors">Context Menus</a></li>
              <li><a href="#tooltips" className="text-white/60 hover:text-white transition-colors">Tooltips</a></li>
              <li><a href="#empty-states" className="text-white/60 hover:text-white transition-colors">Empty States</a></li>
              <li><a href="#layouts" className="text-white/60 hover:text-white transition-colors">Layouts</a></li>
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
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
                />
              </Example>

              <CodeBlock
                id="input-text"
                code={`<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
/>`}
              />
            </div>
          </Section>

          {/* Cards */}
          <Section title="Cards">
            <div id="cards" className="space-y-6">
              <Example title="Standard Card">
                <div className="bg-[#191919] rounded-[8px] p-4 border border-white/10">
                  <h3 className="text-[14px] font-semibold text-white mb-2">Card Title</h3>
                  <p className="text-[13px] text-white/60">Card content goes here</p>
                </div>
              </Example>

              <Example title="Interactive Card">
                <div className="bg-[#191919] rounded-[8px] p-4 border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-white/60" />
                    <div>
                      <h3 className="text-[14px] font-semibold text-white">Interactive Card</h3>
                      <p className="text-[13px] text-white/60">Hover to see effect</p>
                    </div>
                  </div>
                </div>
              </Example>

              <CodeBlock
                id="card-standard"
                code={`<div className="bg-[#191919] rounded-[8px] p-4 border border-white/10">
  {/* Card content */}
</div>

// Interactive variant
<div className="bg-[#191919] rounded-[8px] p-4 border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
  {/* Card content */}
</div>`}
              />
            </div>
          </Section>

          {/* Tables */}
          <Section title="Tables">
            <div id="tables" className="space-y-6">
              <Example title="Data Table" description="Standard table structure with hover states and actions">
                <div className="flex flex-col">
                  {/* Table Header */}
                  <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 text-[13px] text-white/60 font-medium">
                    <div className="flex-1">Name</div>
                    <div className="w-24">Duration</div>
                    <div className="w-32">Type</div>
                    <div className="w-12"></div>
                  </div>

                  {/* Table Rows */}
                  {sampleTableData.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 px-6 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors"
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          item: { id: item.id, name: item.name }
                        })
                      }}
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

          {/* Sidebars */}
          <Section title="Sidebars">
            <div id="sidebars" className="space-y-6">
              <Example title="Content Sidebar" description="320px wide sidebar pattern for playlists/scenes">
                <div className="w-full h-[400px] bg-[#111111] rounded-[8px] overflow-hidden flex">
                  <div className="w-[320px] h-full bg-[#191919] border-r border-white/10 flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
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
              <Example title="Hover Tooltip" description="Hover over the info icon to see tooltip">
                <div className="flex gap-6 p-8">
                  <button className="relative group">
                    <Info className="w-5 h-5 text-white/60" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#191919] border border-white/10 rounded-[6px] text-[13px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      This is a tooltip
                    </span>
                  </button>

                  <button className="relative group">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#191919] border border-white/10 rounded-[6px] text-[13px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Warning: This action is irreversible
                    </span>
                  </button>

                  <button className="relative group">
                    <Play className="w-5 h-5 text-white/60" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#191919] border border-white/10 rounded-[6px] text-[13px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Play audio track
                    </span>
                  </button>
                </div>
              </Example>

              <CodeBlock
                id="tooltip-pattern"
                code={`<button className="relative group">
  <Info className="w-5 h-5 text-white/60" />
  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#191919] border border-white/10 rounded-[6px] text-[13px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
    This is a tooltip
  </span>
</button>`}
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
        onSubmit={(value) => {
          console.log('Created:', value)
          setShowInputModal(false)
        }}
        title="Create Playlist"
        label="Playlist Name"
        placeholder="Enter playlist name..."
        submitText="Create"
      />
    </div>
  )
}
