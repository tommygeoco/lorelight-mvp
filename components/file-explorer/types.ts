/**
 * File Explorer Component Types
 * Generic, reusable file explorer with tree view, drag-and-drop, search, and filtering
 */

export interface FileExplorerItem {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface FileExplorerSort {
  field: 'name' | 'createdAt' | 'updatedAt' | 'type'
  direction: 'asc' | 'desc'
}

export interface FileExplorerFilter {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith'
  value: unknown
}

export interface FileExplorerProps<T extends FileExplorerItem> {
  // Data
  items: T[]

  // Event handlers
  onItemClick?: (item: T) => void
  onItemSelect?: (item: T) => void
  onItemDoubleClick?: (item: T) => void
  onDragDrop?: (draggedItem: T, targetItem: T | null) => Promise<void>

  // Rendering
  renderItem?: (item: T, isExpanded: boolean) => React.ReactNode
  renderActions?: (item: T) => React.ReactNode

  // Configuration
  searchFields?: (keyof T)[]
  sortOptions?: Array<{ field: string; label: string }>
  filterOptions?: FileExplorerFilter[]

  // Features
  enableDragDrop?: boolean
  enableSearch?: boolean
  enableMultiSelect?: boolean
  enableVirtualization?: boolean

  // Styling
  rowHeight?: number
  indentSize?: number
  className?: string
}

export interface TreeNode<T extends FileExplorerItem> {
  item: T
  children: TreeNode<T>[]
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}

export interface DragState {
  isDragging: boolean
  draggedItemId: string | null
  dropTargetId: string | null
}
