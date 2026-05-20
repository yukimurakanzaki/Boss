"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-page-bg] p-4">
      <div className="w-full max-w-sm">
        {/* Header bar */}
        <div className="bg-[--color-primary] text-white text-center py-3 rounded-t-md">
          <div className="text-xs tracking-widest uppercase opacity-80 mb-0.5">PT Bussan Auto Finance</div>
          <div className="font-semibold text-base tracking-wide">BOSS PROTOTYPE HUB</div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-b-md border border-[--color-border] p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-[--color-heading] mb-1">Masuk</h1>
          <p className="text-sm text-[--color-muted] mb-6">Gunakan akun email Anda</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[--color-text] mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
                style={{ borderRadius: 'var(--radius-button)' }}
                placeholder="email@baf.id"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[--color-text] mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
                style={{ borderRadius: 'var(--radius-button)' }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-[--color-danger] bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[--color-primary] hover:bg-[--color-primary-hover] disabled:opacity-50 text-white font-medium py-2.5 rounded transition-colors text-sm"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}