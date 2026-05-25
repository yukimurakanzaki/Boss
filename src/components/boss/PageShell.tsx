"use client"

import { Sidebar } from "./Sidebar"
import { RoleProvider } from "@/lib/role-context"

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto" style={{ backgroundColor: "var(--color-page-bg)" }}>
          {children}
        </main>
      </div>
    </RoleProvider>
  )
}
