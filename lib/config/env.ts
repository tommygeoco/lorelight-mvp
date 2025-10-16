/**
 * Environment Variable Validation
 * Validates all required environment variables on application startup
 */

interface EnvConfig {
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string

  // Cloudflare R2 (Required for audio uploads)
  R2_ACCOUNT_ID: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_BUCKET_NAME: string

  // R2 Public Domain (Optional)
  R2_PUBLIC_DOMAIN?: string
  NEXT_PUBLIC_R2_PUBLIC_URL?: string

  // Philips Hue (Optional)
  HUE_CLIENT_ID?: string
  HUE_CLIENT_SECRET?: string
  HUE_APP_ID?: string
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

/**
 * Validate required environment variables
 * Throws if any required variables are missing
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = []

  // Required: Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
  }

  // Required: Cloudflare R2
  if (!process.env.R2_ACCOUNT_ID) {
    errors.push('R2_ACCOUNT_ID is required for audio uploads')
  }
  if (!process.env.R2_ACCESS_KEY_ID) {
    errors.push('R2_ACCESS_KEY_ID is required for audio uploads')
  }
  if (!process.env.R2_SECRET_ACCESS_KEY) {
    errors.push('R2_SECRET_ACCESS_KEY is required for audio uploads')
  }
  if (!process.env.R2_BUCKET_NAME) {
    errors.push('R2_BUCKET_NAME is required for audio uploads')
  }

  if (errors.length > 0) {
    throw new EnvValidationError(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.\n` +
      `See SETUP.md for detailed instructions.`
    )
  }

  // Warnings for optional variables
  const warnings: string[] = []
  
  if (!process.env.R2_PUBLIC_DOMAIN && !process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
    warnings.push('R2_PUBLIC_DOMAIN not set - audio playback URLs may not work')
  }

  if (!process.env.HUE_CLIENT_ID || !process.env.HUE_CLIENT_SECRET || !process.env.HUE_APP_ID) {
    warnings.push('Philips Hue credentials not set - smart lighting features disabled')
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('\n⚠️  Environment warnings:')
    warnings.forEach(w => console.warn(`  - ${w}`))
    console.warn('')
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID!,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME!,
    R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    HUE_CLIENT_ID: process.env.HUE_CLIENT_ID,
    HUE_CLIENT_SECRET: process.env.HUE_CLIENT_SECRET,
    HUE_APP_ID: process.env.HUE_APP_ID,
  }
}

/**
 * Get validated environment config
 * Safe to call multiple times - validation runs once
 */
let cachedConfig: EnvConfig | null = null

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnv()
  }
  return cachedConfig
}

/**
 * Type-safe environment variable access
 */
export const env = {
  get supabase() {
    const config = getEnvConfig()
    return {
      url: config.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
    }
  },

  get r2() {
    const config = getEnvConfig()
    return {
      accountId: config.R2_ACCOUNT_ID,
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      bucketName: config.R2_BUCKET_NAME,
      publicDomain: config.R2_PUBLIC_DOMAIN || config.NEXT_PUBLIC_R2_PUBLIC_URL,
    }
  },

  get hue() {
    const config = getEnvConfig()
    return {
      clientId: config.HUE_CLIENT_ID,
      clientSecret: config.HUE_CLIENT_SECRET,
      appId: config.HUE_APP_ID,
      isConfigured: !!(config.HUE_CLIENT_ID && config.HUE_CLIENT_SECRET && config.HUE_APP_ID),
    }
  },
}

