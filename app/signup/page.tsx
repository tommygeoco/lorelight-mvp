import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Lorelight MVP
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Create your DM command center account
          </p>
        </div>

        <div className="rounded-[8px] border border-neutral-800 bg-black p-8 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}