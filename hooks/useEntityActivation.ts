import { useState } from 'react'

interface UseEntityActivationOptions<T> {
  entityId: string
  campaignId: string
  isActive: boolean
  setActiveFn: (id: string, campaignId: string) => Promise<void>
  updateFn: (id: string, updates: Partial<T>) => Promise<void>
  activeKey: keyof T
}

export function useEntityActivation<T extends Record<string, unknown>>({
  entityId,
  campaignId,
  isActive,
  setActiveFn,
  updateFn,
  activeKey
}: UseEntityActivationOptions<T>) {
  const [isActivating, setIsActivating] = useState(false)

  const handleSetActive = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsActivating(true)
    try {
      await setActiveFn(entityId, campaignId)
    } catch (error) {
      console.error('Failed to activate:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const handleSetInactive = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsActivating(true)
    try {
      await updateFn(entityId, { [activeKey]: false } as Partial<T>)
    } catch (error) {
      console.error('Failed to deactivate:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const handleToggle = async (e?: React.MouseEvent) => {
    if (isActive) {
      await handleSetInactive(e)
    } else {
      await handleSetActive(e)
    }
  }

  return {
    isActivating,
    handleSetActive,
    handleSetInactive,
    handleToggle
  }
}