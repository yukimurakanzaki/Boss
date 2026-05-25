"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRole, ROLES, BossRole } from "@/lib/role-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/elis", label: "ELIS", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role, setRole } = useRole()

  return (
    <aside
      className="w-56 min-h-screen flex flex-col flex-shrink-0"
      style={{ backgroundColor: "var(--color-sidebar-bg)" }}
    >
      {/* App title */}
      <div
        className="px-4 py-5 text-white border-l-4"
        style={{ borderLeftColor: "var(--color-sidebar-accent)" }}
      >
        <div className="text-xs tracking-widest opacity-70 mb-0.5">PT BUSSAN AUTO FINANCE</div>
        <div className="font-semibold text-sm tracking-wide">BOSS PROTOTYPE HUB</div>
      </div>

      {/* Nav label */}
      <div className="px-4 pt-6 pb-2">
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Menu</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
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

      {/* Footer: role switcher + hub link */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1.5">Role Preview</div>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as BossRole)}
              className="w-full appearance-none bg-white/10 text-white text-xs px-3 py-2 rounded pr-6 focus:outline-none focus:bg-white/20 cursor-pointer"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              {(Object.entries(ROLES) as [BossRole, string][]).map(([k, v]) => (
                <option key={k} value={k} className="bg-[#1a2e5a] text-white">
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
            />
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          ← Kembali ke Hub
        </Link>
      </div>
    </aside>
  )
}
