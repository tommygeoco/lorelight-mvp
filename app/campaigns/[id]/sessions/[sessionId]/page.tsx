'use client'

import { use } from 'react'
import { SessionSceneView } from '@/components/sessions/SessionSceneView'

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>
}) {
  const resolvedParams = use(params)

  return (
    <div className="h-screen bg-black overflow-hidden">
      <SessionSceneView
        campaignId={resolvedParams.id}
        sessionId={resolvedParams.sessionId}
      />
    </div>
  )
}