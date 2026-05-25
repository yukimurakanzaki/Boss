"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface StatCardData {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCardData[]>([
    { label: "Total ELIS", value: "-", icon: <FileText size={20} />, color: "var(--color-primary)" },
    { label: "Menunggu Tindakan", value: "-", icon: <Clock size={20} />, color: "var(--color-warning)" },
    { label: "Selesai Bulan Ini", value: "-", icon: <CheckCircle size={20} />, color: "var(--color-success)" },
    { label: "Ditolak", value: "-", icon: <XCircle size={20} />, color: "var(--color-danger)" },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [{ count: total }, { count: menunggu }, { count: selesaiBulanIni }, { count: ditolak }] =
        await Promise.all([
          supabase.from("elis_submissions").select("*", { count: "exact", head: true }),
          supabase
            .from("elis_submissions")
            .select("*", { count: "exact", head: true })
            .in("status", ["Menunggu validasi", "Menunggu persetujuan"]),
          supabase
            .from("elis_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "Selesai")
            .gte("updated_at", startOfMonth),
          supabase
            .from("elis_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "Ditolak"),
        ])

      setStats([
        {
          label: "Total ELIS",
          value: total ?? 0,
          icon: <FileText size={20} />,
          color: "var(--color-primary)",
        },
        {
          label: "Menunggu Tindakan",
          value: menunggu ?? 0,
          icon: <Clock size={20} />,
          color: "var(--color-warning)",
        },
        {
          label: "Selesai Bulan Ini",
          value: selesaiBulanIni ?? 0,
          icon: <CheckCircle size={20} />,
          color: "var(--color-success)",
        },
        { label: "Ditolak", value: ditolak ?? 0, icon: <XCircle size={20} />, color: "var(--color-danger)" },
      ])
      setLoading(false)
    }
    loadStats()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Ringkasan data ELIS
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-[--color-border] p-5 shadow-sm"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div
                  className="text-xs font-medium uppercase tracking-wide mb-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  {stat.label}
                </div>
                <div className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>
                  {loading ? "—" : stat.value}
                </div>
              </div>
              <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/elis"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{
            backgroundColor: "var(--color-primary)",
            borderRadius: "var(--radius-button)",
          }}
        >
          Lihat Daftar ELIS →
        </Link>
      </div>
    </div>
  )
}
