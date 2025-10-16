import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth/supabase-server'
import { deleteFromR2 } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Delete file from R2 storage
 * DELETE /api/delete-r2?key=user-id/file.mp3
 */
export async function DELETE(request: NextRequest) {
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

    // Get key from query params
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 })
    }

    // Verify key belongs to user (security check)
    if (!key.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'Unauthorized - key does not belong to user' },
        { status: 403 }
      )
    }

    // Delete from R2
    await deleteFromR2(key)

    return NextResponse.json({
      success: true,
      message: `Deleted ${key} from R2`,
    })
  } catch (error) {
    console.error('R2 deletion error:', error)
    return NextResponse.json(
      {
        error: 'Deletion failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

