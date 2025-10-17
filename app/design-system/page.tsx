'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Music, Trash2, Edit2, Play, Pause, MoreVertical, X, Tag, ChevronDown, SlidersHorizontal, ChevronUp, Search, Settings, Folder, FileAudio, Volume2, Sparkles } from 'lucide-react'
import { BaseModal } from '@/components/ui/BaseModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { InputModal } from '@/components/ui/InputModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'

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
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>('demo-track-2')
  const [sortField, setSortField] = useState<'name' | 'duration'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [activeSection, setActiveSection] = useState('overview')
  const editInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null)
    }
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-context-menu-trigger]')) {
        setContextMenu(null)
      }
    }
    
    if (contextMenu) {
      setTimeout(() => {
        document.addEventListener('click', handleClick)
        document.addEventListener('contextmenu', handleContextMenu)
      }, 0)
      
      return () => {
        document.removeEventListener('click', handleClick)
        document.removeEventListener('contextmenu', handleContextMenu)
      }
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

  // Scroll tracking to update sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio > 0)
        
        if (intersectingEntries.length === 0) return
        
        intersectingEntries.sort((a, b) => {
          const aRect = a.boundingClientRect
          const bRect = b.boundingClientRect
          
          if (aRect.top >= 0 && bRect.top >= 0) {
            return aRect.top - bRect.top
          }
          
          return b.intersectionRatio - a.intersectionRatio
        })
        
        const topEntry = intersectingEntries[0]
        if (topEntry && topEntry.target.id) {
          setActiveSection(topEntry.target.id)
        }
      },
      { 
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], 
        rootMargin: '-100px 0px -60% 0px'
      }
    )

    const sections = document.querySelectorAll('[id]')
    const validSections = Array.from(sections).filter(section => {
      const id = section.id
      return id && (
        id === 'overview' || 
        id === 'foundation' || id === 'colors' || id === 'typography' || id === 'spacing' ||
        id === 'components' || id === 'buttons' || id === 'modals' || id === 'inputs' || id === 'cards' || id === 'empty-states' ||
        id === 'patterns' || id === 'tables' || id === 'sidebars' || id === 'context-menus' || id === 'dropdowns' || id === 'tags' || id === 'inline-editing' ||
        id === 'layouts' ||
        id === 'animations' || id === 'playing-track' || id === 'audio-player' ||
        id === 'dark-fantasy-charm'
      )
    })
    
    validSections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

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
      <pre className="bg-black/40 border border-white/10 rounded-[8px] p-4 overflow-x-auto text-sm text-white/90 font-mono scrollbar-custom">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyCode(code, id)}
        className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-[6px] text-xs text-white/70 hover:text-white transition-colors"
      >
        {copiedCode === id ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  )

  const Section = ({ title, id, children }: { title: string; id: string; children: React.ReactNode }) => (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-[24px] font-semibold text-white mb-6 pb-3 border-b border-white/10">{title}</h2>
      {children}
    </section>
  )

  const Example = ({ title, description, children, fullWidth }: { title: string; description?: string; children: React.ReactNode; fullWidth?: boolean }) => (
    <div className="mb-8">
      <h3 className="text-[16px] font-medium text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-white/60 mb-4">{description}</p>}
      <div className={`bg-[#191919] border border-white/10 rounded-[8px] ${fullWidth ? 'p-0' : 'p-6'}`}>
        {children}
      </div>
    </div>
  )

  const ColorSwatch = ({ color, name, description }: { color: string; name: string; description: string }) => (
    <div>
      <div className={`h-20 rounded-[8px] mb-2 border border-white/10`} style={{ backgroundColor: color }}></div>
      <p className="text-sm text-white/90 font-mono">{name}</p>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  )

  const navigationSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'foundation', label: 'Foundation', subsections: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
    ]},
    { id: 'components', label: 'Components', subsections: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'modals', label: 'Modals' },
      { id: 'inputs', label: 'Inputs' },
      { id: 'cards', label: 'Cards' },
      { id: 'empty-states', label: 'Empty States' },
    ]},
    { id: 'patterns', label: 'Patterns', subsections: [
      { id: 'tables', label: 'Tables' },
      { id: 'sidebars', label: 'Sidebars' },
      { id: 'context-menus', label: 'Context Menus' },
      { id: 'dropdowns', label: 'Dropdowns' },
      { id: 'tags', label: 'Tags' },
      { id: 'inline-editing', label: 'Inline Editing' },
    ]},
    { id: 'layouts', label: 'Layouts' },
    { id: 'animations', label: 'Animations', subsections: [
      { id: 'playing-track', label: 'Playing Track' },
      { id: 'audio-player', label: 'Audio Player' },
    ]},
    { id: 'dark-fantasy-charm', label: 'Dark Fantasy Charm' },
  ]

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Hero Section */}
      <div className="border-b border-white/10 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-[40px] font-bold text-white">Lorelight Design System</h1>
          </div>
          <p className="text-lg text-white/60 max-w-3xl">
            A comprehensive design system for building immersive D&D campaign management tools.
            Consistent components, patterns, and guidelines with subtle Dark Fantasy charm.
          </p>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => document.getElementById('components')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Components
            </Button>
            <Button variant="ghost" onClick={() => window.open('https://github.com', '_blank')}>
              View on GitHub
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-8">
        {/* Sticky Navigation Sidebar */}
        <nav className="w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-[#191919] border border-white/10 rounded-[8px] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Navigation</h3>
              <ul className="space-y-1 text-sm">
                {navigationSections.map((section) => {
                  const isParentActive = activeSection === section.id || 
                    (section.subsections?.some(sub => sub.id === activeSection))
                  
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                          setActiveSection(section.id)
                        }}
                        className={`block px-3 py-1.5 rounded-[6px] transition-colors ${
                          activeSection === section.id
                            ? 'bg-purple-500/20 text-purple-300 font-medium'
                            : isParentActive
                            ? 'text-purple-400/70 hover:text-purple-300'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {section.label}
                      </a>
                      {section.subsections && (
                        <ul className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                          {section.subsections.map((sub) => (
                            <li key={sub.id}>
                              <a
                                href={`#${sub.id}`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  document.getElementById(sub.id)?.scrollIntoView({ behavior: 'smooth' })
                                  setActiveSection(sub.id)
                                }}
                                className={`block px-2 py-1 rounded-[4px] text-xs transition-colors ${
                                  activeSection === sub.id
                                    ? 'text-purple-300 font-medium bg-purple-500/10'
                                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                                }`}
                              >
                                {sub.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          {/* Overview */}
          <Section title="Overview" id="overview">
            <div className="prose prose-invert max-w-none">
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                The Lorelight design system provides a consistent, reusable set of UI components built with React, TypeScript, and Tailwind CSS.
                It embraces D&D themes through subtle touches that add personality without being tacky or on-the-nose.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-[8px] p-4 border border-purple-500/20">
                  <div className="text-sm font-medium text-purple-300 mb-1">Foundation</div>
                  <div className="text-xs text-white/60">Colors, Typography, Spacing</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-[8px] p-4 border border-purple-500/20">
                  <div className="text-sm font-medium text-purple-300 mb-1">Components</div>
                  <div className="text-xs text-white/60">Buttons, Modals, Inputs, Cards</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-[8px] p-4 border border-purple-500/20">
                  <div className="text-sm font-medium text-purple-300 mb-1">Patterns</div>
                  <div className="text-xs text-white/60">Tables, Sidebars, Menus</div>
                </div>
              </div>
            </div>
          </Section>

          {/* Foundation Section */}
          <Section title="Foundation" id="foundation">
            <div className="space-y-12">
              {/* Colors */}
              <div id="colors" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Colors</h3>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white/80 mb-3">Background Colors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorSwatch color="#111111" name="#111111" description="Main Background" />
                    <ColorSwatch color="#191919" name="#191919" description="Surface (Cards, Panels)" />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white/80 mb-3">Text Colors</h4>
                  <div className="space-y-2 bg-black/20 rounded-[8px] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Primary Text</span>
                      <code className="text-sm text-white/60 font-mono">text-white</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Secondary Text</span>
                      <code className="text-sm text-white/60 font-mono">text-white/60</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Tertiary Text</span>
                      <code className="text-sm text-white/60 font-mono">text-white/40</code>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white/80 mb-3">Accent Colors</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="h-16 bg-red-500 rounded-[8px] mb-2"></div>
                      <p className="text-sm text-white/90 font-mono">bg-red-500</p>
                      <p className="text-xs text-white/60">Destructive</p>
                    </div>
                    <div>
                      <div className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[8px] mb-2"></div>
                      <p className="text-sm text-white/90 font-mono">purple-pink</p>
                      <p className="text-xs text-white/60">Gradients</p>
                    </div>
                    <div>
                      <div className="h-16 bg-white rounded-[8px] mb-2"></div>
                      <p className="text-sm text-white/90 font-mono">bg-white</p>
                      <p className="text-xs text-white/60">Primary Action</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div id="typography" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Typography</h3>
                
                <div className="space-y-4 bg-[#191919] border border-white/10 rounded-[8px] p-6">
                  <div>
                    <p className="text-[20px] text-white mb-1">Display (20px)</p>
                    <p className="text-sm text-white/60 font-mono">text-[20px] - Page titles</p>
                  </div>
                  <div>
                    <p className="text-[16px] text-white mb-1">Heading (16px)</p>
                    <p className="text-sm text-white/60 font-mono">text-[16px] - Section headers</p>
                  </div>
                  <div>
                    <p className="text-sm text-white mb-1">Body (14px)</p>
                    <p className="text-sm text-white/60 font-mono">text-sm - Default text</p>
                  </div>
                  <div>
                    <p className="text-xs text-white mb-1">Small (12px)</p>
                    <p className="text-sm text-white/60 font-mono">text-xs - Labels, captions</p>
                  </div>
                </div>
              </div>

              {/* Spacing */}
              <div id="spacing" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Spacing</h3>
                <p className="text-sm text-white/60 mb-4">8px base grid system</p>
                
                <div className="space-y-3 bg-[#191919] border border-white/10 rounded-[8px] p-6">
                  {[
                    { size: '2px', class: 'p-0.5', name: 'xs' },
                    { size: '4px', class: 'p-1', name: 'sm' },
                    { size: '8px', class: 'p-2', name: 'md' },
                    { size: '16px', class: 'p-4', name: 'lg' },
                    { size: '24px', class: 'p-6', name: 'xl' },
                    { size: '32px', class: 'p-8', name: '2xl' },
                  ].map(({ size, class: className, name }) => (
                    <div key={size} className="flex items-center gap-4">
                      <div className="w-20">
                        <span className="text-sm text-white/90">{name}</span>
                        <span className="text-sm text-white/60 ml-2">({size})</span>
                      </div>
                      <div className="flex-1 bg-white/5 rounded-[4px]">
                        <div className={`${className} bg-white/20 rounded-[4px]`}>
                          <div className="h-6 bg-white/40 rounded-[4px]"></div>
                        </div>
                      </div>
                      <code className="text-sm text-white/60 font-mono w-16">{className}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Components Section */}
          <Section title="Components" id="components">
            <div className="space-y-12">
              {/* Buttons */}
              <div id="buttons" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Buttons</h3>
                
                <Example title="Button Variants" description="Primary, Ghost, Destructive, and Disabled states">
                  <div className="flex flex-wrap gap-4">
                    <Button variant="default">Primary Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="default" disabled>Disabled</Button>
                  </div>
                </Example>

                <Example title="Icon Buttons" description="Icon-only buttons with hover states">
                  <div className="flex gap-4">
                    <button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
                      <Play className="w-[18px] h-[18px] text-white/70" />
                    </button>
                    <button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
                      <Plus className="w-[18px] h-[18px] text-white/70" />
                    </button>
                    <button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
                      <Settings className="w-[18px] h-[18px] text-white/70" />
                    </button>
                    <button className="w-10 h-10 rounded-[8px] hover:bg-red-500/10 flex items-center justify-center transition-colors text-red-400">
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </Example>

                <CodeBlock
                  id="button-code"
                  code={`import { Button } from '@/components/ui/button'

// Primary button
<Button variant="default">Primary Button</Button>

// Ghost button
<Button variant="ghost">Ghost Button</Button>

// Icon button
<button className="w-10 h-10 rounded-[8px] hover:bg-white/5 flex items-center justify-center transition-colors">
  <Play className="w-[18px] h-[18px] text-white/70" />
</button>`}
                />
              </div>

              {/* Modals */}
              <div id="modals" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Modals</h3>
                
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
                  id="modal-code"
                  code={`import { BaseModal } from '@/components/ui/BaseModal'

<BaseModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  footer={<Button onClick={handleSave}>Save</Button>}
>
  <p>Modal content here</p>
</BaseModal>

// ConfirmDialog for destructive actions
<ConfirmDialog
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure? This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
  isLoading={isDeleting}
/>

// InputModal for text input
<InputModal
  isOpen={isOpen}
  onClose={handleClose}
  onSubmit={handleCreate}
  title="Create Playlist"
  label="Playlist Name"
  placeholder="Enter playlist name..."
  submitText="Create"
/>`}
                />
              </div>

              {/* Inputs */}
              <div id="inputs" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Inputs</h3>
                
                <Example title="Text Input" description="Standard text input with focus states">
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-sm text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
                  />
                </Example>

                <Example title="Search Input" description="Input with search icon">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-[8px] text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Search..."
                    />
                  </div>
                </Example>
              </div>

              {/* Cards */}
              <div id="cards" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Cards</h3>
                
                <Example title="Standard Card">
                  <div className="bg-[#191919] rounded-[8px] p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-2">Card Title</h3>
                    <p className="text-xs text-white/60">Card content goes here. Cards are used for grouping related content.</p>
                  </div>
                </Example>

                <Example title="Interactive Card" description="Hover to see the effect">
                  <div className="bg-[#191919] rounded-[8px] p-4 border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-white/60" />
                      <div>
                        <h3 className="text-sm font-semibold text-white">Interactive Card</h3>
                        <p className="text-xs text-white/60">Hover to see the subtle background change</p>
                      </div>
                    </div>
                  </div>
                </Example>
              </div>

              {/* Empty States */}
              <div id="empty-states" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Empty States</h3>
                
                <Example title="Bordered Variant" description="Primary empty state with dashed border">
                  <EmptyState
                    title="No sessions yet"
                    description="The adventure awaits your first gathering"
                    actionLabel="Create Session"
                    onAction={() => {}}
                    variant="bordered"
                  />
                </Example>

                <Example title="Simple Variant" description="Compact text-only for sidebars">
                  <EmptyState
                    title="No playlists yet"
                    description="Forge a playlist to begin"
                    variant="simple"
                  />
                </Example>

                <Example title="Centered Variant" description="Full-screen selection prompt">
                  <div className="h-64">
                    <EmptyState
                      title="No scene chosen"
                      description="The stage awaits your selection"
                      variant="centered"
                    />
                  </div>
                </Example>
              </div>
            </div>
          </Section>

          {/* Patterns Section */}
          <Section title="Patterns" id="patterns">
            <div className="space-y-12">
              {/* Tables */}
              <div id="tables" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Tables</h3>
                
                <Example title="Data Table" description="Standard table with hover states and context menu (right-click rows)" fullWidth>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 text-sm text-white/60 font-medium">
                      <div className="flex-1">Name</div>
                      <div className="w-24">Duration</div>
                      <div className="w-32">Type</div>
                      <div className="w-12"></div>
                    </div>

                    {sampleTableData.map((item) => (
                      <div
                        key={item.id}
                        data-context-menu-trigger
                        className="group flex items-center gap-4 px-6 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors"
                        onContextMenu={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            item: { id: item.id, name: item.name }
                          })
                        }}
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <Music className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white truncate">{item.name}</span>
                        </div>
                        <div className="w-24 text-sm text-white/60">{item.duration}</div>
                        <div className="w-32 text-sm text-white/60">{item.type}</div>
                        <div className="w-12">
                          <button className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-all">
                            <MoreVertical className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Example>

                <Example title="Sortable Table" description="Click column headers to sort" fullWidth>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex-1 flex items-center gap-1.5 hover:text-white/60 transition-colors text-left text-xs font-semibold text-white/40 uppercase tracking-wider"
                      >
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSort('duration')}
                        className="w-24 flex items-center justify-end gap-1.5 hover:text-white/60 transition-colors text-xs font-semibold text-white/40 uppercase tracking-wider"
                      >
                        <span className="flex items-center gap-1.5">
                          Duration
                          {sortField === 'duration' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </span>
                      </button>
                      <div className="w-32 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</div>
                      <div className="w-12"></div>
                    </div>

                    {sortedTableData.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-4 px-6 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <Music className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white truncate">{item.name}</span>
                        </div>
                        <div className="w-24 text-sm text-white/60 text-right">{item.duration}</div>
                        <div className="w-32 text-sm text-white/60">{item.type}</div>
                        <div className="w-12"></div>
                      </div>
                    ))}
                  </div>
                </Example>
              </div>

              {/* Sidebars */}
              <div id="sidebars" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Sidebars</h3>
                
                <Example title="Content Sidebar" description="320px wide sidebar for playlists/scenes" fullWidth>
                  <div className="w-full h-[400px] bg-[#111111] rounded-[8px] overflow-hidden flex">
                    <div className="w-[320px] h-full bg-[#191919] border-r border-white/10 flex flex-col">
                      <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                        <h3 className="text-base font-semibold text-white">Playlists</h3>
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-[8px] transition-colors">
                          <Plus className="w-[18px] h-[18px] text-white/70" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-4">
                        <ul role="list" className="space-y-2">
                          {[
                            { name: 'All Files', count: 12 },
                            { name: 'Battle Music', count: 8 },
                            { name: 'Tavern Ambience', count: 5 },
                            { name: 'Forest Sounds', count: 3 },
                            { name: 'Epic Themes', count: 7 }
                          ].map((item, i) => (
                            <li key={i}>
                              <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors ${i === 0 ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                                <Music className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 truncate text-left">{item.name}</span>
                                <span className="text-xs text-white/50">{item.count}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
                      Main content area
                    </div>
                  </div>
                </Example>
              </div>

              {/* Context Menus */}
              <div id="context-menus" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Context Menus</h3>
                
                <Example title="Right-Click Demo" description="Right-click on any of the demo items below to see the context menu">
                  <div className="space-y-2">
                    {[
                      { id: 'demo-1', name: 'Scene: Tavern Brawl', icon: <Folder className="w-4 h-4 text-white/40" /> },
                      { id: 'demo-2', name: 'Audio: Battle Theme', icon: <FileAudio className="w-4 h-4 text-white/40" /> },
                      { id: 'demo-3', name: 'Light: Chandelier', icon: <Volume2 className="w-4 h-4 text-white/40" /> },
                    ].map((item) => (
                      <div
                        key={item.id}
                        data-context-menu-trigger
                        className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-[8px] cursor-pointer transition-colors"
                        onContextMenu={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            item: { id: item.id, name: item.name }
                          })
                        }}
                      >
                        {item.icon}
                        <span className="text-sm text-white">{item.name}</span>
                        <span className="ml-auto text-xs text-white/40">Right-click me</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-white/60 mt-4">
                    💡 Tip: The context menu shows Edit and Delete options with proper styling and hover states
                  </p>
                </Example>
              </div>

              {/* Dropdowns */}
              <div id="dropdowns" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Dropdowns</h3>
                
                <Example title="Filter Dropdown" description="Click-outside handling with positioning">
                  <div className="flex justify-center p-8">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-[6px] transition-colors flex items-center gap-1.5 border border-white/10"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filter
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {showDropdown && (
                        <div className="absolute top-full right-0 mt-1 bg-[#191919] border border-white/10 rounded-[8px] shadow-2xl min-w-[200px] py-2 z-50">
                          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors">
                            All Files
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors">
                            Music Only
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors">
                            Ambience Only
                          </button>
                          <div className="h-px bg-white/10 my-1" />
                          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors">
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Example>
              </div>

              {/* Tags */}
              <div id="tags" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Tags</h3>
                
                <Example title="Display Tags" description="Pills with remove buttons">
                  <div className="flex flex-wrap gap-1.5">
                    {['ambient', 'battle', 'tavern'].map(tag => (
                      <div
                        key={tag}
                        className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-[6px] text-xs text-white flex items-center gap-1.5"
                      >
                        {tag}
                        <button className="text-white/50 hover:text-white transition-colors">
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
                        className={`px-2 py-1 rounded-[6px] text-xs transition-colors ${
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
              </div>

              {/* Inline Editing */}
              <div id="inline-editing" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Inline Editing</h3>
                
                <Example title="Editable Cells" description="Click on track names to edit (Enter to save, Escape to cancel)">
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
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:border-white/40"
                              />
                            </form>
                          ) : (
                            <div
                              onClick={() => setEditingId(item.id)}
                              className="py-1 text-sm text-white truncate cursor-pointer hover:text-purple-300 transition-colors"
                            >
                              {item.name}
                            </div>
                          )}
                        </div>
                        <div className="w-24 text-sm text-white/60">{item.duration}</div>
                      </div>
                    ))}
                  </div>
                </Example>
              </div>
            </div>
          </Section>

          {/* Layouts Section */}
          <Section title="Layouts" id="layouts">
            <Example title="Two Sidebar Layout" description="Navigation sidebar + content sidebar + main content (Audio Library pattern)">
              <div className="h-64 bg-black/20 rounded-[8px] p-2 flex gap-2">
                <div className="w-12 bg-[#191919] rounded-[4px] flex flex-col items-center gap-2 p-2">
                  <div className="w-8 h-8 bg-white/10 rounded-[4px] flex items-center justify-center">
                    <Music className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-[4px] flex items-center justify-center">
                    <Folder className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-[4px] flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="w-48 bg-[#191919] rounded-[4px] p-2 border-r border-white/10">
                  <div className="text-xs text-white/60 mb-2 font-medium">Playlists</div>
                  <div className="space-y-1">
                    <div className="h-6 bg-white/10 rounded-[4px]"></div>
                    <div className="h-6 bg-white/5 rounded-[4px]"></div>
                    <div className="h-6 bg-white/5 rounded-[4px]"></div>
                  </div>
                </div>
                <div className="flex-1 bg-[#191919] rounded-[4px] p-2">
                  <div className="text-xs text-white/60 mb-2 font-medium">Main Content</div>
                  <div className="space-y-1">
                    <div className="h-6 bg-white/5 rounded-[4px]"></div>
                    <div className="h-6 bg-white/5 rounded-[4px]"></div>
                    <div className="h-6 bg-white/5 rounded-[4px]"></div>
                  </div>
                </div>
              </div>
            </Example>

            <CodeBlock
              id="layout-code"
              code={`import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'

// Two Sidebar Layout (Audio Library)
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
  contentSidebar={<PlaylistsSidebar />}
>
  <div className="p-6">
    {/* Main content with table */}
  </div>
</DashboardLayoutWithSidebar>

// Single Sidebar Layout (Dashboard)
<DashboardLayoutWithSidebar
  navSidebar={<DashboardSidebar buttons={[...]} />}
>
  <div className="p-6">
    {/* Main content with campaign cards */}
  </div>
</DashboardLayoutWithSidebar>`}
            />
          </Section>

          {/* Animations Section */}
          <Section title="Animations" id="animations">
            <div className="space-y-12">
              {/* Playing Track */}
              <div id="playing-track" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Playing Track Animation</h3>
                
                <Example title="Interactive Demo" description="Click a row to see the playing track effects. Hover to see visualizer/pause button swap." fullWidth>
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
                            <div className="flex items-center w-[24px] justify-center mr-4">
                              {isPlaying && (
                                <div className="flex items-center gap-0.5 h-4 group-hover:opacity-0 transition-opacity duration-200">
                                  <div className="visualizer-bar active" />
                                  <div className="visualizer-bar active" />
                                  <div className="visualizer-bar active" />
                                </div>
                              )}

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
                              <div className="text-sm text-white">{track.name}</div>
                            </div>
                            <div className="text-sm text-white/60 w-16 text-right tabular-nums">{track.duration}</div>
                            <div className="text-sm text-white/60 w-24 text-right">{track.type}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Example>

                <Example title="Visual Effects Breakdown">
                  <div className="space-y-3 text-sm">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-[6px] p-3">
                      <p className="text-white font-medium mb-1">1. Pulsing Gradient Background</p>
                      <p className="text-white/60 text-xs">Animated horizontal gradient sweep with multiple purple tones (5s duration, 400ms fade-in)</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-[6px] p-3">
                      <p className="text-white font-medium mb-1">2. Left Edge Glow</p>
                      <p className="text-white/60 text-xs">3px vertical purple gradient bar that pulses (2.5s intervals)</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-[6px] p-3">
                      <p className="text-white font-medium mb-1">3. Audio Visualizer Bars</p>
                      <p className="text-white/60 text-xs">Three animated bars with staggered timing (0.6s, 0.8s, 0.7s) that swap with pause button on hover</p>
                    </div>
                  </div>
                </Example>
              </div>

              {/* Audio Player */}
              <div id="audio-player" className="scroll-mt-24">
                <h3 className="text-lg font-medium text-white mb-4">Audio Player Footer</h3>
                
                <Example title="Component Overview" description="Persistent audio playback controls with Dark Fantasy Charm accents">
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-[6px] p-3">
                        <p className="text-white font-medium mb-1">Layout Structure</p>
                        <ul className="space-y-1 text-white/60 text-xs">
                          <li>• Three-column layout</li>
                          <li>• Natural height (pt-5 pb-6)</li>
                          <li>• Background: #111111</li>
                        </ul>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-[6px] p-3">
                        <p className="text-white font-medium mb-1">Visual Features</p>
                        <ul className="space-y-1 text-white/60 text-xs">
                          <li>• Purple-Pink Gradient</li>
                          <li>• Equalizer bars</li>
                          <li>• Shimmer effects</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Example>
              </div>
            </div>
          </Section>

          {/* Dark Fantasy Charm Section */}
          <Section title="Dark Fantasy Charm" id="dark-fantasy-charm">
            <div className="prose prose-invert max-w-none">
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Lorelight embraces its D&D identity through subtle thematic touches that add personality without being tacky or on-the-nose.
                These elements create a sense of magic and adventure while maintaining a professional, premium aesthetic.
              </p>

              <Example title="Philosophy">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <div>
                        <p className="text-white font-medium text-sm">DO:</p>
                        <ul className="space-y-1.5 mt-2 text-white/60 text-sm">
                          <li>• Use subtle, sophisticated touches</li>
                          <li>• Embrace D&D themes in copy, not visuals</li>
                          <li>• Add interactive delights that feel magical</li>
                          <li>• Use animation to create atmosphere</li>
                          <li>• Let users discover easter eggs naturally</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✗</span>
                      <div>
                        <p className="text-white font-medium text-sm">DON&apos;T:</p>
                        <ul className="space-y-1.5 mt-2 text-white/60 text-sm">
                          <li>• Use fantasy-themed icons (swords, shields)</li>
                          <li>• Add medieval/gothic fonts</li>
                          <li>• Use literal D&D imagery (dice, sheets)</li>
                          <li>• Make the UI feel like a game interface</li>
                          <li>• Force theme on users who want a clean tool</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Example>

              <Example title="Implemented Elements">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-[8px] p-4">
                    <p className="text-white font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      D&D Loading Messages
                    </p>
                    <div className="bg-black/20 rounded-[6px] p-3 space-y-1 text-white/60 text-xs font-mono">
                      <p>&quot;Rolling for initiative...&quot;</p>
                      <p>&quot;Consulting the ancient tomes...&quot;</p>
                      <p>&quot;Gathering the party...&quot;</p>
                      <p>&quot;The tavern grows quiet...&quot;</p>
                    </div>
                    <p className="text-white/60 mt-2 text-sm">Random phrases during file uploads that reference D&D mechanics and flavor</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-[8px] p-4">
                    <p className="text-white font-medium mb-2">Playing Track Visualizer</p>
                    <p className="text-white/60 text-sm">Animated purple gradient with pulsing visualizer bars. Makes the currently playing track feel alive and magical, like a spell being cast.</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-[8px] p-4">
                    <p className="text-white font-medium mb-2">Arcane Drop Zone</p>
                    <p className="text-white/60 text-sm">Pulsing purple border and background animation when dragging files. Makes file uploads feel like summoning items into your magical library.</p>
                  </div>
                </div>
              </Example>

              <Example title="Implementation Guidelines">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 flex-shrink-0 mt-0.5">1.</span>
                    <p className="text-white/70"><strong className="text-white">Restraint is Key:</strong> One charm element per view maximum</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 flex-shrink-0 mt-0.5">2.</span>
                    <p className="text-white/70"><strong className="text-white">Make it Optional:</strong> Never block functionality with charm</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 flex-shrink-0 mt-0.5">3.</span>
                    <p className="text-white/70"><strong className="text-white">Performance First:</strong> Charm should never impact speed (use GPU-accelerated CSS)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 flex-shrink-0 mt-0.5">4.</span>
                    <p className="text-white/70"><strong className="text-white">Accessibility:</strong> Ensure charm doesn&apos;t confuse screen readers or navigation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 flex-shrink-0 mt-0.5">5.</span>
                    <p className="text-white/70"><strong className="text-white">Subtlety Over Spectacle:</strong> Effects should enhance, not distract from core functionality</p>
                  </div>
                </div>
              </Example>
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
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
            <Play className="w-3.5 h-3.5" />
            Play
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
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
        <p className="text-sm text-white/80">
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
    </div>
  )
}
