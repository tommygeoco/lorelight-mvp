'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createClient } from '@/lib/auth/supabase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

export function ProfileTab() {
  const { user } = useAuthStore()
  const addToast = useToastStore(state => state.addToast)
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  const handleUpdateProfile = async () => {
    if (!user) return
    
    setIsUpdating(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      })

      if (error) throw error

      addToast('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update profile:', error)
      addToast('Failed to update profile', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return

    setIsSendingReset(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      addToast('Password reset email sent', 'success')
    } catch (error) {
      console.error('Failed to send password reset:', error)
      addToast('Failed to send password reset email', 'error')
    } finally {
      setIsSendingReset(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-10">
      {/* Account Information */}
      <section>
        <SectionHeader title="Account Information" />
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-sm text-white/50 cursor-not-allowed focus:outline-none"
            />
            <p className="mt-2 text-xs text-white/40">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-white/70 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[#3a3a3a] rounded-[8px] text-sm text-white placeholder:text-[#606060] focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleUpdateProfile}
              disabled={isUpdating || displayName === (user.user_metadata?.display_name || '')}
              className="px-4 py-2 bg-white text-black rounded-[8px] text-sm font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </section>

      {/* Security */}
      <section>
        <SectionHeader title="Security" />
        <div className="mt-6">
          <p className="text-sm text-white/70 mb-4">
            Change your password by requesting a password reset email
          </p>
          <button
            onClick={handlePasswordReset}
            disabled={isSendingReset}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingReset ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </div>
      </section>
    </div>
  )
}

