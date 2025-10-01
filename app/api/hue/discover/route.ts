import { NextResponse } from 'next/server'

/**
 * Hue Bridge Discovery API Route
 * Proxies the Hue discovery API to avoid CORS issues
 */
export async function GET() {
  try {
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
