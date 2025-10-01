import { formatTime } from './time'

/**
 * Format audio duration in seconds to MM:SS format
 * @param seconds Duration in seconds
 * @returns Formatted duration string (e.g., "03:45") or "--:--" if null
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  return formatTime(seconds)
}

/**
 * Format file size in bytes to MB
 * @param bytes File size in bytes
 * @returns Formatted file size string (e.g., "3.5 MB") or "--" if null
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '--'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

/**
 * Get audio file duration using the Web Audio API
 * @param file The audio file to analyze
 * @returns Promise resolving to duration in seconds
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })
    audio.addEventListener('error', () => {
      reject(new Error('Failed to load audio metadata'))
    })
    audio.src = URL.createObjectURL(file)
  })
}

/**
 * Normalize text for search by handling curly quotes and apostrophes
 * @param text Text to normalize
 * @returns Normalized text with straight quotes
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'") // Replace curly single quotes with straight quotes
    .replace(/[\u201C\u201D]/g, '"') // Replace curly double quotes with straight quotes
}
