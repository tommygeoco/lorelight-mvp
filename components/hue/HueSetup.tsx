'use client'

import { useState } from 'react'
import { X, Lightbulb, Loader2 } from 'lucide-react'
import { useHueStore } from '@/store/hueStore'
import { logger } from '@/lib/utils/logger'

interface HueSetupProps {
  isOpen: boolean
  onClose: () => void
}

export function HueSetup({ isOpen, onClose }: HueSetupProps) {
  const {
    bridgeIp,
    isConnected,
    discoverBridge,
    connectBridge,
    disconnectBridge,
  } = useHueStore()

  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleDiscover = async () => {
    setIsDiscovering(true)
    setError(null)
    try {
      await discoverBridge()
    } catch (err) {
      setError('No Hue bridge found on your network. Make sure it&apos;s connected.')
      logger.error('Bridge discovery failed', err)
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleConnect = async () => {
    if (!bridgeIp) return

    setIsConnecting(true)
    setError(null)
    try {
      await connectBridge(bridgeIp)
      onClose()
    } catch (err) {
      if (err instanceof Error && err.message.includes('link button')) {
        setError('Please press the button on your Hue bridge, then try again.')
      } else {
        setError('Failed to connect. Please try again.')
      }
      logger.error('Bridge connection failed', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnectBridge()
    setError(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--card-surface)] border border-white/10 rounded-[24px] w-[500px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-white/70" />
            <h2 className="text-[16px] font-semibold text-white">Philips Hue Setup</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-[24px] hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <X className="w-[18px] h-[18px] text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {isConnected ? (
            <>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-[8px]">
                <p className="text-sm text-green-400 font-medium">
                  ✓ Connected to Hue bridge
                </p>
                <p className="text-xs text-green-400/70 mt-1">
                  IP: {bridgeIp}
                </p>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-[14px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-[8px] transition-colors"
              >
                Disconnect Bridge
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-white/70">
                  Connect Lorelight to your Philips Hue bridge to control your lights during sessions.
                </p>

                {bridgeIp && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-[8px]">
                    <p className="text-xs text-white/50">Bridge IP</p>
                    <p className="text-sm text-white font-mono">{bridgeIp}</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[8px]">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {!bridgeIp ? (
                <button
                  onClick={handleDiscover}
                  disabled={isDiscovering}
                  className="w-full px-4 py-3 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isDiscovering && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDiscovering ? 'Searching...' : 'Find Hue Bridge'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-[8px]">
                    <p className="text-sm text-blue-400 font-medium">
                      Press the button on your Hue bridge
                    </p>
                    <p className="text-xs text-blue-400/70 mt-1">
                      Then click &quot;Connect&quot; below
                    </p>
                  </div>

                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full px-4 py-3 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isConnecting ? 'Connecting...' : 'Connect to Bridge'}
                  </button>

                  <button
                    onClick={handleDiscover}
                    disabled={isConnecting}
                    className="w-full px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors"
                  >
                    Search Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
