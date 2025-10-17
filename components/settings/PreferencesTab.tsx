'use client'

import { useEffect, useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useAuthStore } from '@/store/authStore'

export function PreferencesTab() {
  const { user } = useAuthStore()
  const { preferences, fetchPreferences, updatePreferences, isLoading } = usePreferencesStore()
  
  const [defaultVolume, setDefaultVolume] = useState(70)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Fetch preferences on mount
  useEffect(() => {
    if (user?.id) {
      fetchPreferences(user.id)
    }
  }, [user?.id, fetchPreferences])

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setDefaultVolume(Math.round(preferences.default_volume * 100))
      setLoopEnabled(preferences.loop_enabled)
      setNotificationsEnabled(preferences.notifications_enabled)
    }
  }, [preferences])

  const handleVolumeChange = (value: number) => {
    setDefaultVolume(value)
    updatePreferences({ default_volume: value / 100 })
  }

  const handleLoopToggle = () => {
    const newValue = !loopEnabled
    setLoopEnabled(newValue)
    updatePreferences({ loop_enabled: newValue })
  }

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    updatePreferences({ notifications_enabled: newValue })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/40 text-[14px]">Loading preferences...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Audio Defaults */}
      <section>
        <SectionHeader title="Audio Defaults" />
        <div className="mt-6 space-y-6">
          {/* Default Volume */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="defaultVolume" className="text-sm font-medium text-white/70">
                Default Volume
              </label>
              <span className="text-sm font-medium text-white tabular-nums">{defaultVolume}%</span>
            </div>
            <input
              id="defaultVolume"
              type="range"
              min="0"
              max="100"
              value={defaultVolume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="slider w-full h-2"
              style={{
                '--slider-progress': `${defaultVolume}%`,
              } as React.CSSProperties}
            />
          </div>

          {/* Loop Playback */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-white/70">Loop Playback</p>
              <p className="text-xs text-white/40 mt-1">
                Enable looping by default for all tracks
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={loopEnabled}
                onChange={handleLoopToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500 transition-all relative">
                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform shadow-sm ${loopEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Theme Preferences */}
      <section>
        <SectionHeader title="Theme Preferences" />
        <div className="mt-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-white/70">Theme</p>
              <p className="text-xs text-white/40 mt-1">
                Currently using dark theme
              </p>
            </div>
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-[8px] text-xs text-white/50 font-medium">
              Dark
            </div>
          </div>
          <p className="text-xs text-white/30 mt-4 italic">
            Light theme coming soon...
          </p>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <SectionHeader title="Notifications" />
        <div className="mt-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-white/70">System Notifications</p>
              <p className="text-xs text-white/40 mt-1">
                Get notified when scenes change or audio starts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationsToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500 transition-all relative">
                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform shadow-sm ${notificationsEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>
        </div>
      </section>
    </div>
  )
}

