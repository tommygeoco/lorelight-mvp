/**
 * Hook to access audio playlists as a Map
 * Provides O(1) lookup by playlist ID
 */

import { useAudioPlaylistStore } from '@/store/audioPlaylistStore'

export function useAudioPlaylistMap() {
  return useAudioPlaylistStore((state) => state.playlists)
}
