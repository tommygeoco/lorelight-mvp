import { useMemo } from 'react'
import { useAudioFileStore } from '@/store/audioFileStore'
import type { AudioFile } from '@/types'

/**
 * Hook to safely get audioFiles as a Map
 * Handles the Zustand persist middleware conversion
 */
export function useAudioFileMap(): Map<string, AudioFile> {
  const { audioFiles } = useAudioFileStore()

  return useMemo(
    () => audioFiles instanceof Map ? audioFiles : new Map(),
    [audioFiles]
  )
}
