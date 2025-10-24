'use client'

import { useState, useEffect } from 'react'
import { X, Lightbulb, Eye } from 'lucide-react'
import { useHueStore } from '@/store/hueStore'
import { useLightConfigState } from './light-config/useLightConfigState'
import { RoomSection } from './light-config/RoomSection'

interface LightConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: unknown) => void
  initialConfig?: unknown
}

/**
 * LightConfigModal - Configure lights for scenes
 * Context7: Refactored into sub-components (<200 lines)
 * 
 * Extracted Components:
 * - useLightConfigState: State management hook
 * - RoomSection: Room header and light list
 * - LightControls: Individual light configuration
 */
export function LightConfigModal({ isOpen, onClose, onSave, initialConfig }: LightConfigModalProps) {
  const { rooms, lights, isConnected, error, fetchLightsAndRooms, applyLightConfig, clearError } = useHueStore()
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    roomStates,
    totalLightsConfigured,
    handleToggleRoom,
    handleToggleExpanded,
    handleLightBrightness,
    handleLightColor,
    handleLightEffect,
    buildFinalConfig,
  } = useLightConfigState(isOpen, initialConfig, rooms)

  // Fetch rooms/lights when modal opens
  useEffect(() => {
    if (isOpen && isConnected) {
      fetchLightsAndRooms()
    }
  }, [isOpen, isConnected, fetchLightsAndRooms])

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearError()
    }
  }, [isOpen, clearError])

  if (!isOpen) return null

  const handlePreview = async () => {
    if (!isConnected) return

    setIsPreviewing(true)
    try {
      const finalConfig = buildFinalConfig()
      const lightsConfig = finalConfig.lights as Record<string, unknown>
      await applyLightConfig({ lights: lightsConfig })
    } catch (error) {
      console.error('Failed to preview lights:', error)
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const finalConfig = buildFinalConfig()
      await onSave(finalConfig)
      onClose()
    } catch (error) {
      console.error('Failed to save light configuration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const roomsArray = Array.from(rooms.values())

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#191919] rounded-[16px] w-[680px] max-h-[85vh] flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Configure Lights</h2>
              {totalLightsConfigured > 0 && (
                <p className="text-[12px] text-white/50">
                  {totalLightsConfigured} light{totalLightsConfigured !== 1 ? 's' : ''} configured
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-custom">
          {!isConnected ? (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-[14px]">
                Connect to Hue bridge to configure lights
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-red-400/20 mx-auto mb-3" />
              <p className="text-red-400 text-[14px]">Error loading lights: {error}</p>
            </div>
          ) : roomsArray.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-[14px]">
                No rooms found. Configure rooms in your Hue app.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {roomsArray.map(room => (
                <RoomSection
                  key={room.id}
                  room={room}
                  roomState={roomStates.get(room.id)}
                  allLights={lights}
                  isConfigured={roomStates.has(room.id)}
                  onToggleRoom={() => handleToggleRoom(room.id, room)}
                  onToggleExpanded={() => handleToggleExpanded(room.id)}
                  onLightBrightness={(lightId, bri) => handleLightBrightness(room.id, lightId, bri)}
                  onLightColor={(lightId, preset) => handleLightColor(room.id, lightId, preset)}
                  onLightEffect={(lightId, effect) => handleLightEffect(room.id, lightId, effect)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handlePreview}
            disabled={!isConnected || totalLightsConfigured === 0 || isPreviewing}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreviewing ? 'Previewing...' : 'Preview'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-[8px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : initialConfig ? 'Save Lights' : 'Add Lights'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
