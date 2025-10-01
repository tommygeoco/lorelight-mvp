/**
 * Hook for managing tree expansion state
 * Persists expansion state to localStorage
 */

import { useState, useEffect, useCallback } from 'react'

interface UseTreeExpansionProps {
  storageKey?: string
  defaultExpanded?: Set<string>
}

export function useTreeExpansion({
  storageKey = 'file-explorer-expanded',
  defaultExpanded = new Set<string>(),
}: UseTreeExpansionProps = {}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(defaultExpanded)

  // Load expansion state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        setExpandedIds(new Set(parsed))
      }
    } catch (error) {
      console.error('Failed to load expansion state:', error)
    }
  }, [storageKey])

  // Save expansion state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(expandedIds)))
    } catch (error) {
      console.error('Failed to save expansion state:', error)
    }
  }, [expandedIds, storageKey])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const expandAll = useCallback((ids: string[]) => {
    setExpandedIds(new Set(ids))
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  )

  return {
    expandedIds,
    isExpanded,
    toggleExpanded,
    expandAll,
    collapseAll,
  }
}
