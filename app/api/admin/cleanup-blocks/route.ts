import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth/supabase-server'

/**
 * DELETE /api/admin/cleanup-blocks?sceneId=xxx
 * Removes all scene blocks for a specific scene
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()

    // Get the scene ID from query params
    const { searchParams } = new URL(request.url)
    const sceneId = searchParams.get('sceneId')

    if (!sceneId) {
      return NextResponse.json({ error: 'sceneId required' }, { status: 400 })
    }

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all blocks for this scene
    const { error, count } = await supabase
      .from('scene_blocks')
      .delete()
      .eq('scene_id', sceneId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete blocks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deletedCount: count,
      message: `Deleted ${count} blocks for scene ${sceneId}`
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cleanup blocks' },
      { status: 500 }
    )
  }
}
