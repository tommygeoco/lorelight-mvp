/**
 * Gradient utility functions for campaigns and scenes
 */

// Campaign gradient colors
const campaignGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
]

/**
 * Get consistent gradient for a campaign based on its ID
 */
export function getCampaignGradient(campaignId: string): string {
  const hash = campaignId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return campaignGradients[hash % campaignGradients.length]
}

// Scene gradient colors by type
type SceneType = 'Story' | 'Encounter' | 'Event' | 'Location' | 'Rest' | string

interface SceneGradientColors {
  primary: string
  secondary: string
  tertiary?: string
}

const sceneGradientsByType: Record<string, SceneGradientColors> = {
  Story: { primary: '#8B5CF6', secondary: '#EC4899' },
  Encounter: { primary: '#EF4444', secondary: '#F59E0B', tertiary: '#10B981' },
  Event: { primary: '#F59E0B', secondary: '#8B5CF6' },
  Location: { primary: '#6366F1', secondary: '#EC4899' },
  Rest: { primary: '#F59E0B', secondary: '#EF4444' },
  default: { primary: '#6B7280', secondary: '#9CA3AF' }
}

/**
 * Get gradient colors for a scene based on its type
 */
export function getSceneGradientColors(sceneType: SceneType): SceneGradientColors {
  return sceneGradientsByType[sceneType] || sceneGradientsByType.default
}