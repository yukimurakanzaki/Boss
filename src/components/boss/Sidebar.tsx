"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/elis", label: "ELIS", icon: FileText },
]

interface SidebarProps {
  userName?: string
  userRole?: string
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 min-h-screen flex flex-col flex-shrink-0"
      style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
    >
      {/* App Title */}
      <div
        className="px-4 py-5 text-white border-l-4"
        style={{ borderLeftColor: 'var(--color-sidebar-accent)' }}
      >
        <div className="text-xs tracking-widest opacity-70 mb-0.5">PT BUSSAN AUTO FINANCE</div>
        <div className="font-semibold text-sm tracking-wide">BOSS PROTOTYPE HUB</div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pt-6 pb-2">
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Menu</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors",
                isActive
                  ? "bg-[--color-sidebar-active] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/10">
        {userName && (
          <div className="mb-2">
            <div className="text-sm text-white font-medium truncate">{userName}</div>
            {userRole && (
              <div className="text-xs text-white/50 capitalize">{userRole.replace('_', ' ')}</div>
            )}
          </div>
        )}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}