import { useMemo } from 'react'
import { normalizeSearchText } from '@/lib/utils/audio'
import type { AudioFile } from '@/types'

interface UseAudioFiltersProps {
  audioFiles: AudioFile[]
  searchQuery: string
  selectedTags: Set<string>
  selectedPlaylistId: string | null
  playlistAudioMap: Map<string, Set<string>>
}

export function useAudioFilters({
  audioFiles,
  searchQuery,
  selectedTags,
  selectedPlaylistId,
  playlistAudioMap,
}: UseAudioFiltersProps) {
  const filteredFiles = useMemo(() => {
    let files = audioFiles

    // Apply playlist filter
    if (selectedPlaylistId) {
      const playlistAudioIds = playlistAudioMap.get(selectedPlaylistId)
      if (playlistAudioIds) {
        files = files.filter(file => playlistAudioIds.has(file.id))
      } else {
        files = []
      }
    }

    // Apply tag filters
    if (selectedTags.size > 0) {
      files = files.filter(file => {
        if (!file.tags || file.tags.length === 0) return false
        return Array.from(selectedTags).every(tag => file.tags?.includes(tag))
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = normalizeSearchText(searchQuery)

      files = files.filter(file => {
        const normalizedName = normalizeSearchText(file.name)
        const nameMatch = normalizedName.includes(query)

        const tagMatch = file.tags?.some(tag =>
          normalizeSearchText(tag).includes(query)
        )

        return nameMatch || tagMatch
      })
    }

    return files
  }, [audioFiles, searchQuery, selectedTags, selectedPlaylistId, playlistAudioMap])

  // Get all unique tags from all audio files
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>()

    audioFiles.forEach(file => {
      if (file.tags) {
        file.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      }
    })

    return Array.from(tagCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, count]) => ({ tag, count }))
  }, [audioFiles])

  return {
    filteredFiles,
    allTags,
  }
}
