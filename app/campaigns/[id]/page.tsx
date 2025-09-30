'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect to sessions page
 * This ensures /campaigns/[id] goes to /campaigns/[id]/sessions
 */
export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()

  useEffect(() => {
    router.replace(`/campaigns/${resolvedParams.id}/sessions`)
  }, [resolvedParams.id, router])

  return null
}