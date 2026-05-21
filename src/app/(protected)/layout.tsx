import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageShell } from "@/components/boss/PageShell"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return <PageShell>{children}</PageShell>
}