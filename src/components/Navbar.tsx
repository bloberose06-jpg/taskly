'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  Bell,
  User,
  Plus,
  LayoutDashboard,
} from 'lucide-react'

type Props = {
  email?: string | null
}

export default function Navbar({ email }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b10]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-black font-bold">
            ⚡
          </div>

          <span className="text-xl font-black tracking-wider text-white">
            TASKLY
          </span>
        </Link>

        {/* Navigation */}

        <nav className="hidden md:flex items-center gap-2">

          <Link
            href="/jobs"
            className={`rounded-xl px-4 py-2 transition ${
              isActive('/jobs')
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase size={17} />
              Trabajos
            </span>
          </Link>

          <Link
            href="/workspaces"
            className={`rounded-xl px-4 py-2 transition ${
              isActive('/workspaces')
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard size={17} />
              Workspaces
            </span>
          </Link>

          <Link
            href="/notifications"
            className={`rounded-xl px-4 py-2 transition ${
              isActive('/notifications')
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bell size={17} />
              Notificaciones
            </span>
          </Link>

        </nav>

        {/* Right */}

        <div className="flex items-center gap-4">

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:scale-105"
          >
            <Plus size={18} />
            Publicar
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 font-bold text-black">
              {email?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="hidden md:flex flex-col">
              <span className="text-xs text-gray-400">
                Cuenta
              </span>

              <span className="max-w-[160px] truncate text-sm text-white">
                {email}
              </span>
            </div>

            <User size={18} className="text-gray-400" />
          </Link>

        </div>

      </div>
    </header>
  )
}
