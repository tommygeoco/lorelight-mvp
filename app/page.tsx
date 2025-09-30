import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Lorelight MVP
          </h1>
          <p className="text-xl text-neutral-400">
            Your DM command center for immersive tabletop RPG sessions
          </p>
        </div>

        <div className="space-y-4 rounded-[24px] border border-neutral-800 bg-black p-8 shadow-lg">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">
              Scene Management Made Simple
            </h2>
            <p className="text-neutral-400">
              Pre-configure audio and lighting for instant scene switching during your games
            </p>
          </div>

          <ul className="space-y-2 text-left text-neutral-300">
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span>
              Organize campaigns and sessions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span>
              Cloud-stored audio library with instant playback
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span>
              Philips Hue integration for dynamic lighting
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span>
              Lightning-fast scene switching (&lt;100ms)
            </li>
          </ul>

          <div className="flex gap-4 pt-4">
            <Link href="/signup" className="flex-1">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-neutral-500">
          Built for Dungeon Masters who want to focus on the story, not the tech
        </p>
      </div>
    </div>
  )
}