"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatusBadge } from "@/components/boss/StatusBadge"
import { Modal } from "@/components/boss/Modal"
import { Button } from "@/components/boss/Button"
import { Toast } from "@/components/boss/Toast"
import { FileText, ArrowRight, XCircle, CheckCircle, RotateCcw, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRole } from "@/lib/role-context"
import { ACTION_LABELS } from "@/lib/constants"
import { ElisDetail, ElisAuditLog } from "@/lib/supabase/elis"

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatWIB(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, "0")
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`
}

interface ActionButton {
  label: string
  variant: "primary" | "secondary" | "edit" | "danger"
  action: string
  icon: React.ReactNode
}

export default function ElisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("")
  const [data, setData] = useState<ElisDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<string>("")
  const [modalTitle, setModalTitle] = useState<string>("")
  const [catatan, setCatatan] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { role, roleName } = useRole()

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    async function load() {
      const supabase = createClient()
      try {
        const { data: elisData, error } = await supabase
          .from("elis_submissions")
          .select("*")
          .eq("id", id)
          .single()

        if (error || !elisData) {
          router.push("/elis")
          return
        }

        const { data: audit } = await supabase
          .from("elis_audit_log")
          .select("*")
          .eq("elis_id", id)
          .order("created_at", { ascending: true })

        setData({ ...elisData, audit_log: audit ?? [] })
      } catch (e) {
        console.error("load failed:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  function openActionModal(action: string, title: string) {
    setModalAction(action)
    setModalTitle(title)
    setCatatan("")
    setModalOpen(true)
  }

  async function handleConfirm() {
    if (!data) return
    setSubmitting(true)

    const supabase = createClient()
    const actionLabel = ACTION_LABELS[modalAction] ?? modalAction

    const { error: updateError } = await supabase
      .from("elis_submissions")
      .update({ status: modalAction, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (updateError) {
      setToast({ message: `Gagal: ${updateError.message}`, type: "error" })
      setSubmitting(false)
      return
    }

    await supabase.from("elis_audit_log").insert({
      elis_id: id,
      action: actionLabel,
      actor_name: roleName,
      catatan: catatan || null,
    })

    setModalOpen(false)
    setToast({ message: `Status berhasil diperbarui menjadi "${modalAction}"`, type: "success" })
    setSubmitting(false)

    const { data: refreshed } = await supabase.from("elis_submissions").select("*").eq("id", id).single()
    const { data: audit } = await supabase
      .from("elis_audit_log")
      .select("*")
      .eq("elis_id", id)
      .order("created_at", { ascending: true })
    if (refreshed) setData({ ...refreshed, audit_log: audit ?? [] })
  }

  if (loading) return <div className="p-6 text-[--color-muted]">Memuat...</div>
  if (!data) return null

  const status = data.status
  const actions: ActionButton[] = []

  if (role === "admin_lit") {
    if (status === "Menunggu validasi") {
      actions.push(
        { label: "Perlu Revisi", variant: "secondary", action: "Revisi", icon: <RotateCcw size={14} /> },
        { label: "Tolak", variant: "danger", action: "Ditolak", icon: <XCircle size={14} /> },
        {
          label: "Teruskan ke Approver",
          variant: "primary",
          action: "Menunggu persetujuan",
          icon: <ArrowRight size={14} />,
        }
      )
    } else if (status === "Disetujui") {
      actions.push({ label: "Mulai Proses", variant: "primary", action: "Sedang diproses", icon: <Play size={14} /> })
    } else if (status === "Sedang diproses") {
      actions.push({
        label: "Tandai Selesai",
        variant: "primary",
        action: "Selesai",
        icon: <CheckCircle size={14} />,
      })
    }
  }

  if (role === "approver" && status === "Menunggu persetujuan") {
    actions.push(
      { label: "Setujui", variant: "primary", action: "Disetujui", icon: <CheckCircle size={14} /> },
      { label: "Tolak", variant: "danger", action: "Ditolak", icon: <XCircle size={14} /> }
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[--color-muted] mb-4">
        <button onClick={() => router.push("/elis")} className="hover:text-[--color-text]">
          ELIS
        </button>
        <span>/</span>
        <span>{data.nomor_pengajuan}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
            {data.judul_perkara}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            {data.nomor_pengajuan} &bull; Diajukan oleh {data.requester_name}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Info section */}
      <section
        className="bg-white border border-[--color-border] p-5 mb-4"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
          Info Pengajuan
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {(
            [
              ["Nomor Pengajuan", data.nomor_pengajuan],
              ["Jenis Perkara", data.jenis_perkara ?? "—"],
              ["Tanggal Pengajuan", formatDate(data.tgl_pengajuan ?? "")],
              ["Nomor Perkara", data.no_perkara ?? "—"],
              ["Pihak Daftar", data.pihak_dftr ?? "—"],
              ["Pihak Terhadap", data.pihak_thd ?? "—"],
              ["Nomor SPDP", data.no_spdp ?? "—"],
              ["Tanggal SPDP", formatDate(data.tgl_spdp ?? "")],
              ["Nomor P21", data.no_p21 ?? "—"],
              ["Tanggal P21", formatDate(data.tgl_p21 ?? "")],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <span className="text-xs mb-0.5" style={{ color: "var(--color-muted)" }}>
                {label}
              </span>
              <span className="font-medium" style={{ color: "var(--color-text)" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
        {data.deskripsi && (
          <div className="mt-4 pt-4 border-t border-[--color-border]">
            <span className="text-xs block mb-1" style={{ color: "var(--color-muted)" }}>
              Deskripsi
            </span>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              {data.deskripsi}
            </p>
          </div>
        )}
        {data.catatan_revisi && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <span className="text-xs font-medium text-amber-800">Catatan Revisi:</span>
            <p className="text-amber-900 mt-1">{data.catatan_revisi}</p>
          </div>
        )}
      </section>

      {/* Lampiran section */}
      <section
        className="bg-white border border-[--color-border] p-5 mb-4"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
          Lampiran
        </h2>
        {[data.lampiran_1, data.lampiran_2, data.lampiran_3].filter(Boolean).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Tidak ada lampiran
          </p>
        ) : (
          [data.lampiran_1, data.lampiran_2, data.lampiran_3].filter(Boolean).map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-[--color-border] last:border-0">
              <FileText size={14} style={{ color: "var(--color-muted)" }} />
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                {f}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Audit log section */}
      <section
        className="bg-white border border-[--color-border] p-5 mb-4"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
          Riwayat
        </h2>
        {data.audit_log.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Belum ada riwayat
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border]">
                {["Aksi", "Aktor", "Tanggal", "Catatan"].map((h) => (
                  <th key={h} className="text-left py-2 font-medium" style={{ color: "var(--color-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.audit_log.map((log: ElisAuditLog) => (
                <tr key={log.id} className="border-b border-[--color-border] last:border-0">
                  <td className="py-2.5 font-medium" style={{ color: "var(--color-text)" }}>
                    {log.action}
                  </td>
                  <td className="py-2.5" style={{ color: "var(--color-text)" }}>
                    {log.actor_name}
                  </td>
                  <td className="py-2.5" style={{ color: "var(--color-muted)" }}>
                    {formatWIB(log.created_at)}
                  </td>
                  <td className="py-2.5" style={{ color: "var(--color-muted)" }}>
                    {log.catatan ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Action buttons */}
      {actions.length > 0 && (
        <section className="flex flex-wrap gap-3 mb-4">
          {actions.map((action) => (
            <Button
              key={action.action}
              variant={action.variant}
              onClick={() => openActionModal(action.action, action.label)}
            >
              {action.icon} {action.label}
            </Button>
          ))}
        </section>
      )}

      {status === "Ditolak" && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          Pengajuan ini telah ditolak.
        </div>
      )}

      {/* Confirmation modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Memproses..." : "Konfirmasi"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            Yakin ingin mengubah status menjadi <strong>&ldquo;{modalAction}&rdquo;</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
              Catatan (opsional)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              className="w-full border border-[--color-border] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
              placeholder="Tambahkan catatan jika perlu..."
              style={{ borderRadius: "var(--radius-button)", color: "var(--color-text)" }}
            />
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
