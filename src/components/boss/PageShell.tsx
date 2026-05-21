"use client"

import { Sidebar } from "./Sidebar"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface PageShellProps {
  children: React.ReactNode
}

export function PageShell({ children }: PageShellProps) {
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, boss_role")
        .eq("id", user.id)
        .single()

      if (profile) {
        setUserName(profile.full_name)
        setUserRole(profile.boss_role)
      }
    }
    loadUser()
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} userRole={userRole} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}