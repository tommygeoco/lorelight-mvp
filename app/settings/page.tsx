'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayoutWithSidebar } from '@/components/layouts/DashboardLayoutWithSidebar'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProfileTab } from '@/components/settings/ProfileTab'
import { PreferencesTab } from '@/components/settings/PreferencesTab'
import { useAuthStore } from '@/store/authStore'
import { getSidebarButtons } from '@/lib/navigation/sidebarNavigation'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

  const sidebarButtons = getSidebarButtons({
    view: 'settings',
    router,
  })

  return (
    <DashboardLayoutWithSidebar
      navSidebar={<DashboardSidebar buttons={sidebarButtons} />}
    >
      <div className="p-6">
        <div className="w-[640px] mx-auto">
          <PageHeader
            title="Settings"
            description="Manage your account and preferences"
          />

          <div className="pt-[40px] pb-[40px]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="profile" 
                  className="flex-none px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent hover:bg-white/5"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="flex-none px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent hover:bg-white/5"
                >
                  Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-10">
                <ProfileTab />
              </TabsContent>

              <TabsContent value="preferences" className="mt-10">
                <PreferencesTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayoutWithSidebar>
  )
}

