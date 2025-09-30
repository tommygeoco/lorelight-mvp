import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Lorelight MVP
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in to your DM command center
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-black p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}