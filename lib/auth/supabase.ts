import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for browser-side operations
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Get current user from Supabase
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return user
}