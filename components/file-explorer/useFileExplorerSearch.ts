/**
 * Hook for search and filtering functionality
 */

import { useState, useMemo, useCallback } from 'react'
import type { FileExplorerItem, FileExplorerSort, FileExplorerFilter } from './types'

interface UseFileExplorerSearchProps<T extends FileExplorerItem> {
  items: T[]
  searchFields?: (keyof T)[]
}

export function useFileExplorerSearch<T extends FileExplorerItem>({
  items,
  searchFields = ['name' as keyof T],
}: UseFileExplorerSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FileExplorerFilter[]>([])
  const [sortBy, setSortBy] = useState<FileExplorerSort>({
    field: 'name',
    direction: 'asc',
  })

  // Filter items by search query
  const searchedItems = useMemo(() => {
    if (!searchQuery.trim()) return items

    const query = searchQuery.toLowerCase()
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query)
        }
        if (Array.isArray(value)) {
          return value.some((v) =>
            String(v).toLowerCase().includes(query)
          )
        }
        return false
      })
    )
  }, [items, searchQuery, searchFields])

  // Apply additional filters
  const filteredItems = useMemo(() => {
    if (filters.length === 0) return searchedItems

    return searchedItems.filter((item) =>
      filters.every((filter) => {
        const value = item[filter.field as keyof T]
        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
          default:
            return true
        }
      })
    )
  }, [searchedItems, filters])

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems]

    sorted.sort((a, b) => {
      // Folders first, then files (if enabled)
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }

      const aValue = a[sortBy.field as keyof T]
      const bValue = b[sortBy.field as keyof T]

      if (aValue === bValue) return 0

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortBy.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredItems, sortBy])

  const addFilter = useCallback((filter: FileExplorerFilter) => {
    setFilters((prev) => [...prev, filter])
  }, [])

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters([])
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    sortBy,
    setSortBy,
    clearSearch,
    filteredItems: sortedItems,
  }
}
