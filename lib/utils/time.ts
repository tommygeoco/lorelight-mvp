/**
 * Format seconds to MM:SS time string
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "3:45")
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
