/**
 * Main File Explorer Component
 * Reusable tree view with drag-and-drop, search, filtering, and expansion
 */

'use client'

import { useMemo } from 'react'
import { FileExplorerRow } from './FileExplorerRow'
import { FileExplorerHeader } from './FileExplorerHeader'
import { useTreeExpansion } from './useTreeExpansion'
import { useFileExplorerSearch } from './useFileExplorerSearch'
import { useDragDrop } from './useDragDrop'
import type { FileExplorerItem, FileExplorerProps, TreeNode } from './types'

export function FileExplorer<T extends FileExplorerItem>({
  items,
  onItemClick,
  onItemDoubleClick,
  onDragDrop,
  renderItem,
  renderActions,
  searchFields = ['name' as keyof T],
  sortOptions,
  enableDragDrop = true,
  enableSearch = true,
  rowHeight = 48,
  indentSize = 24,
  className = '',
}: FileExplorerProps<T>) {
  // Search and filtering
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    clearSearch,
    filteredItems,
  } = useFileExplorerSearch({ items, searchFields })

  // Expansion state
  const { isExpanded, toggleExpanded } = useTreeExpansion({
    storageKey: 'file-explorer-expanded',
  })

  // Drag and drop
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragDrop({ onDragDrop, items: filteredItems })

  // Build tree structure
  const tree = useMemo(() => {
    const buildTree = (
      items: T[],
      parentId: string | null,
      depth: number = 0
    ): TreeNode<T>[] => {
      const nodes: TreeNode<T>[] = []

      // Get items at this level
      const itemsAtLevel = items.filter((item) => item.parentId === parentId)

      for (const item of itemsAtLevel) {
        const hasChildren = items.some((i) => i.parentId === item.id)
        const expanded = isExpanded(item.id)

        const node: TreeNode<T> = {
          item,
          children: [],
          depth,
          hasChildren,
          isExpanded: expanded,
        }

        // Recursively build children if expanded
        if (expanded && hasChildren) {
          node.children = buildTree(items, item.id, depth + 1)
        }

        nodes.push(node)
      }

      return nodes
    }

    return buildTree(filteredItems, null)
  }, [filteredItems, isExpanded])

  // Flatten tree for rendering
  const flattenedTree = useMemo(() => {
    const flatten = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
      const result: TreeNode<T>[] = []
      for (const node of nodes) {
        result.push(node)
        if (node.isExpanded && node.children.length > 0) {
          result.push(...flatten(node.children))
        }
      }
      return result
    }
    return flatten(tree)
  }, [tree])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      {enableSearch && (
        <FileExplorerHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={clearSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={sortOptions}
          enableSearch={enableSearch}
        />
      )}

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {flattenedTree.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-white/40 text-sm">
            {searchQuery ? 'No results found' : 'No items'}
          </div>
        ) : (
          <div className="space-y-0.5">
            {flattenedTree.map((node) => (
              <FileExplorerRow
              key={node.item.id}
              item={node.item}
              depth={node.depth}
              isExpanded={node.isExpanded}
              hasChildren={node.hasChildren}
              onToggleExpand={() => toggleExpanded(node.item.id)}
              onClick={() => onItemClick?.(node.item)}
              onDoubleClick={() => onItemDoubleClick?.(node.item)}
              isDragging={
                enableDragDrop && dragState.draggedItemId === node.item.id
              }
              isDropTarget={
                enableDragDrop && dragState.dropTargetId === node.item.id
              }
              onDragStart={
                enableDragDrop
                  ? (e) => handleDragStart(node.item.id, e)
                  : () => {}
              }
              onDragOver={
                enableDragDrop
                  ? (e) => handleDragOver(node.item.id, e)
                  : () => {}
              }
              onDragLeave={enableDragDrop ? handleDragLeave : () => {}}
              onDrop={
                enableDragDrop
                  ? (e) => handleDrop(node.item.id, e)
                  : () => {}
              }
              onDragEnd={enableDragDrop ? handleDragEnd : () => {}}
              renderContent={renderItem}
              renderActions={renderActions}
              rowHeight={rowHeight}
              indentSize={indentSize}
            />
            ))}
          </div>
        )}
      </div>

      {/* Drop zone for root level */}
      {enableDragDrop && dragState.isDragging && (
        <div
          onDragOver={(e) => handleDragOver(null, e)}
          onDrop={(e) => handleDrop(null, e)}
          className={`h-12 border-t border-white/10 flex items-center justify-center text-sm text-white/40 transition-colors ${
            dragState.dropTargetId === null ? 'bg-white/10' : ''
          }`}
        >
          Drop here to move to root
        </div>
      )}
    </div>
  )
}
