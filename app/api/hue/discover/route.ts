import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth/supabase-server'

/**
 * Hue Bridge Discovery API Route
 * Proxies the Hue discovery API to avoid CORS issues
 * Requires authentication to prevent abuse
 */
export async function GET() {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch('https://discovery.meethue.com/', {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Bridge discovery failed' },
        { status: response.status }
      )
    }

    const bridges = await response.json()
    return NextResponse.json(bridges)
  } catch (error) {
    console.error('Hue discovery error:', error)
    return NextResponse.json(
      { error: 'Failed to discover bridges' },
      { status: 500 }
    )
  }
}
