/**
 * Header with search, filters, and sort controls
 */

'use client'

import { Search, X, ArrowUpDown } from 'lucide-react'
import type { FileExplorerSort } from './types'

interface FileExplorerHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  sortBy: FileExplorerSort
  onSortChange: (sort: FileExplorerSort) => void
  sortOptions?: Array<{ field: string; label: string }>
  enableSearch?: boolean
}

export function FileExplorerHeader({
  searchQuery,
  onSearchChange,
  onClearSearch,
  sortBy,
  onSortChange,
  sortOptions = [
    { field: 'name', label: 'Name' },
    { field: 'createdAt', label: 'Date Created' },
    { field: 'updatedAt', label: 'Date Modified' },
  ],
  enableSearch = true,
}: FileExplorerHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10 bg-white/[0.02]">
      {/* Search */}
      {enableSearch && (
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files and folders..."
            className="w-full pl-10 pr-10 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[14px] text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-2">
        <select
          value={sortBy.field}
          onChange={(e) => onSortChange({ ...sortBy, field: e.target.value as FileExplorerSort['field'] })}
          className="px-3 py-2 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[6px] text-[14px] text-white focus:outline-none focus:border-white/20"
        >
          {sortOptions.map((option) => (
            <option key={option.field} value={option.field}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            onSortChange({
              ...sortBy,
              direction: sortBy.direction === 'asc' ? 'desc' : 'asc',
            })
          }
          className="w-9 h-9 flex items-center justify-center bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.12)] border border-[#3a3a3a] rounded-[6px] transition-colors"
          title={sortBy.direction === 'asc' ? 'Ascending' : 'Descending'}
        >
          <ArrowUpDown className={`w-4 h-4 text-white/70 ${sortBy.direction === 'desc' ? 'rotate-180' : ''} transition-transform`} />
        </button>
      </div>
    </div>
  )
}
