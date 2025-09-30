import { CampaignList } from '@/components/campaigns/CampaignList'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-neutral-400">
            Welcome to Lorelight MVP - Manage your campaigns and sessions
          </p>
        </div>
        <CampaignList />
      </div>
    </div>
  )
}