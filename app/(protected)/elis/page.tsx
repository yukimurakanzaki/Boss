"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatusBadge } from "@/components/boss/StatusBadge"
import { FilterSection } from "@/components/boss/FilterSection"
import { Button } from "@/components/boss/Button"
import { useRouter } from "next/navigation"
import { useRole } from "@/lib/role-context"
import { ELIS_STATUSES, JENIS_PERKARA } from "@/lib/constants"
import { ChevronRight, Plus } from "lucide-react"

interface ElisRow {
  id: string
  nomor_pengajuan: string
  requester_name: string
  judul_perkara: string
  jenis_perkara: string
  tgl_pengajuan: string
  status: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function ElisListPage() {
  const [rows, setRows] = useState<ElisRow[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { role } = useRole()

  const [filters, setFilters] = useState({
    nomor_pengajuan: "",
    status: "",
    jenis_perkara: "",
    tgl_dari: "",
    tgl_sampai: "",
  })

  async function fetchElis() {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from("elis_submissions")
        .select("id, nomor_pengajuan, requester_name, judul_perkara, jenis_perkara, tgl_pengajuan, status")
        .order("created_at", { ascending: false })

      // Approver only sees records that reached their queue or beyond
      if (role === "approver") {
        query = query.in("status", [
          "Menunggu persetujuan",
          "Disetujui",
          "Ditolak",
          "Sedang diproses",
          "Selesai",
        ])
      }

      if (filters.nomor_pengajuan) query = query.ilike("nomor_pengajuan", `%${filters.nomor_pengajuan}%`)
      if (filters.status) query = query.eq("status", filters.status)
      if (filters.jenis_perkara) query = query.eq("jenis_perkara", filters.jenis_perkara)
      if (filters.tgl_dari) query = query.gte("tgl_pengajuan", filters.tgl_dari)
      if (filters.tgl_sampai) query = query.lte("tgl_pengajuan", filters.tgl_sampai)

      const { data, error } = await query
      if (error) {
        console.error("ELIS fetch error:", error.message)
        setRows([])
      } else {
        setRows(data ?? [])
      }
    } catch (e) {
      console.error("fetchElis exception:", e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchElis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const statusOptions = ELIS_STATUSES.map((s) => ({ value: s, label: s }))
  const jenisOptions = JENIS_PERKARA.map((j) => ({ value: j, label: j }))
  const canCreate = role === "requester" || role === "admin_lit"

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
            Daftar Pengajuan ELIS
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Kelola pengajuan Elektronik Informasi Litigasi
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/elis/new")}>
            <Plus size={14} /> Buat Pengajuan
          </Button>
        )}
      </div>

      <FilterSection
        filters={[
          { key: "nomor_pengajuan", label: "Nomor Pengajuan", type: "text", placeholder: "Cari nomor..." },
          { key: "status", label: "Status", type: "select", options: statusOptions },
          { key: "jenis_perkara", label: "Jenis Perkara", type: "select", options: jenisOptions },
          { key: "tgl_dari", label: "Tanggal Dari", type: "text" },
          { key: "tgl_sampai", label: "Tanggal Sampai", type: "text" },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onSearch={fetchElis}
        onReset={() => {
          setFilters({ nomor_pengajuan: "", status: "", jenis_perkara: "", tgl_dari: "", tgl_sampai: "" })
          setTimeout(fetchElis, 50)
        }}
      />

      <div
        className="bg-white border border-[--color-border] overflow-hidden"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-[--color-border]">
                {["Nomor Pengajuan", "Requester", "Judul Perkara", "Jenis Perkara", "Tanggal Pengajuan", "Status", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-medium text-[--color-text]"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[--color-muted]">
                    Memuat...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[--color-muted]">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-[--color-border] hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-[--color-primary]">{row.nomor_pengajuan}</td>
                    <td className="px-4 py-3 text-[--color-text]">{row.requester_name}</td>
                    <td className="px-4 py-3 text-[--color-text]">{row.judul_perkara}</td>
                    <td className="px-4 py-3 text-[--color-text]">{row.jenis_perkara ?? "—"}</td>
                    <td className="px-4 py-3 text-[--color-muted]">{formatDate(row.tgl_pengajuan)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="edit" size="sm" onClick={() => router.push(`/elis/${row.id}`)}>
                        Lihat <ChevronRight size={12} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
