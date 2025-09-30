/**
 * Centralized user-facing strings for i18n preparation
 *
 * Usage:
 * ```typescript
 * import { STRINGS } from '@/lib/constants/strings'
 *
 * <h1>{STRINGS.dashboard.title}</h1>
 * <p>{STRINGS.errors.generic}</p>
 * ```
 *
 * Future: Replace with i18n library (e.g., next-intl, react-i18next)
 */

export const STRINGS = {
  // Common UI
  common: {
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    loading: 'Loading...',
    saving: 'Saving...',
    creating: 'Creating...',
    deleting: 'Deleting...',
    noDescription: 'No description',
    back: 'Back',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    description: 'Select a campaign to begin your session',
  },

  // Campaigns
  campaigns: {
    title: 'Campaigns',
    create: 'Create Campaign',
    edit: 'Edit Campaign',
    delete: 'Delete Campaign',
    noCampaigns: 'No campaigns yet',
    noCampaignsDescription: 'Create your first campaign to get started',
    deleteConfirmTitle: 'Delete Campaign',
    deleteConfirmDescription: 'Are you sure you want to delete this campaign? This action cannot be undone.',
    namePlaceholder: 'Enter campaign name...',
    descriptionPlaceholder: 'Enter description...',
    nameLabel: 'Name',
    descriptionLabel: 'Description',
  },

  // Sessions
  sessions: {
    title: 'Sessions',
    create: 'Create Session',
    edit: 'Edit Session',
    delete: 'Delete Session',
    noSessions: 'No sessions yet',
    noSessionsDescription: 'Create your first session to start playing',
    deleteConfirmTitle: 'Delete Session',
    deleteConfirmDescription: 'Are you sure you want to delete this session? This action cannot be undone.',
    setActive: 'Set Active',
    setInactive: 'Set Inactive',
    namePlaceholder: 'Enter session name...',
    descriptionPlaceholder: 'Enter description...',
    nameLabel: 'Name',
    descriptionLabel: 'Description',
  },

  // Scenes
  scenes: {
    title: 'Scenes',
    create: 'New Scene',
    edit: 'Edit Scene',
    delete: 'Delete Scene',
    noScenes: 'No scenes yet',
    noScenesDescription: 'Create your first scene to set the atmosphere',
    deleteConfirmTitle: 'Delete Scene',
    deleteConfirmDescription: 'Are you sure you want to delete this scene? This action cannot be undone.',
    setActive: 'Activate Scene',
    setInactive: 'Deactivate Scene',
    namePlaceholder: 'Enter scene name...',
    descriptionPlaceholder: 'Enter description...',
    nameLabel: 'Name',
    descriptionLabel: 'Description',
    types: {
      Story: 'Story',
      Encounter: 'Encounter',
      Event: 'Event',
      Location: 'Location',
      Rest: 'Rest',
    },
  },

  // Audio
  audio: {
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    volume: 'Volume',
    noAudio: 'No audio files',
    upload: 'Upload Audio',
  },

  // Lighting
  lighting: {
    noConfig: 'No lighting configuration',
    configure: 'Configure Lights',
    hueConnect: 'Connect to Hue',
  },

  // Errors
  errors: {
    generic: 'An error occurred',
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    networkError: 'Network error - please check your connection',
    campaignNotFound: 'Campaign not found',
    sessionNotFound: 'Session not found',
    sceneNotFound: 'Scene not found',
    createFailed: 'Failed to create',
    updateFailed: 'Failed to update',
    deleteFailed: 'Failed to delete',
    loadFailed: 'Failed to load data',
    invalidInput: 'Invalid input',
    required: 'This field is required',
  },

  // Success messages
  success: {
    created: 'Successfully created',
    updated: 'Successfully updated',
    deleted: 'Successfully deleted',
    saved: 'Successfully saved',
  },

  // Auth
  auth: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    noAccount: 'Don&apos;t have an account?',
    hasAccount: 'Already have an account?',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    campaigns: 'Campaigns',
    sessions: 'Sessions',
    scenes: 'Scenes',
    audio: 'Audio Library',
    settings: 'Settings',
  },
} as const

// Type helper for string paths
export type StringPath =
  | `common.${keyof typeof STRINGS.common}`
  | `dashboard.${keyof typeof STRINGS.dashboard}`
  | `campaigns.${keyof typeof STRINGS.campaigns}`
  | `sessions.${keyof typeof STRINGS.sessions}`
  | `scenes.${keyof typeof STRINGS.scenes}`
  | `audio.${keyof typeof STRINGS.audio}`
  | `lighting.${keyof typeof STRINGS.lighting}`
  | `errors.${keyof typeof STRINGS.errors}`
  | `success.${keyof typeof STRINGS.success}`
  | `auth.${keyof typeof STRINGS.auth}`
  | `nav.${keyof typeof STRINGS.nav}`

// Helper function to get nested string (future i18n integration)
export function getString(path: StringPath): string {
  const parts = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = STRINGS

  for (const part of parts) {
    value = value[part]
    if (value === undefined) {
      console.warn(`String not found: ${path}`)
      return path
    }
  }

  return value as string
}