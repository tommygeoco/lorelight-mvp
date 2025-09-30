'use client'

import { use } from 'react'
import { SessionSceneView } from '@/components/sessions/SessionSceneView'

export default function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <SessionSceneView campaignId={resolvedParams.id} />
    </div>
  )
}