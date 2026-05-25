import { PageShell } from "@/components/boss/PageShell"

// Auth check bypassed — prototype is open access

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>
}
