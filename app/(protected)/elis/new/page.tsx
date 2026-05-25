"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useRole } from "@/lib/role-context"
import { Button } from "@/components/boss/Button"
import { Toast } from "@/components/boss/Toast"
import { JENIS_PERKARA } from "@/lib/constants"

function generateNomor(): string {
  const year = new Date().getFullYear()
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, "0")
  return `ELIS-${year}-${rand}`
}

interface FormState {
  judul_perkara: string
  jenis_perkara: string
  no_perkara: string
  tgl_pengajuan: string
  pihak_dftr: string
  pihak_thd: string
  deskripsi: string
}

type FormErrors = Partial<FormState>

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
        {label}
        {required && <span className="text-[--color-danger] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass =
  "w-full border border-[--color-border] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
const inputStyle = { borderRadius: "var(--radius-button)", color: "var(--color-text)" }

export default function ElisNewPage() {
  const router = useRouter()
  const { roleName } = useRole()
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const [form, setForm] = useState<FormState>({
    judul_perkara: "",
    jenis_perkara: "",
    no_perkara: "",
    tgl_pengajuan: new Date().toISOString().split("T")[0],
    pihak_dftr: "PT Bussan Auto Finance",
    pihak_thd: "",
    deskripsi: "",
  })

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!form.judul_perkara.trim()) errs.judul_perkara = "Judul perkara wajib diisi"
    if (!form.jenis_perkara) errs.jenis_perkara = "Jenis perkara wajib dipilih"
    if (!form.no_perkara.trim()) errs.no_perkara = "Nomor perkara wajib diisi"
    if (!form.pihak_thd.trim()) errs.pihak_thd = "Pihak terhadap wajib diisi"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from("elis_submissions").insert({
      nomor_pengajuan: generateNomor(),
      requester_name: roleName,
      status: "Menunggu validasi",
      judul_perkara: form.judul_perkara.trim(),
      jenis_perkara: form.jenis_perkara,
      no_perkara: form.no_perkara.trim(),
      tgl_pengajuan: form.tgl_pengajuan,
      pihak_dftr: form.pihak_dftr.trim() || null,
      pihak_thd: form.pihak_thd.trim(),
      deskripsi: form.deskripsi.trim() || null,
    })

    if (error) {
      setToast({ message: `Gagal menyimpan: ${error.message}`, type: "error" })
      setSubmitting(false)
      return
    }

    setToast({ message: "Pengajuan berhasil dibuat", type: "success" })
    setTimeout(() => router.push("/elis"), 1200)
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--color-muted)" }}>
        <button onClick={() => router.push("/elis")} className="hover:text-[--color-text]">
          ELIS
        </button>
        <span>/</span>
        <span>Buat Pengajuan Baru</span>
      </div>

      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-heading)" }}>
        Buat Pengajuan ELIS
      </h1>

      <form onSubmit={handleSubmit}>
        <div
          className="bg-white border border-[--color-border] p-5 mb-4 space-y-4"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "var(--color-heading)" }}>
            Informasi Perkara
          </h2>

          <Field label="Judul Perkara" required error={errors.judul_perkara}>
            <input
              type="text"
              value={form.judul_perkara}
              onChange={(e) => set("judul_perkara", e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="Contoh: Wanprestasi Perjanjian Pembiayaan No. 1234"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Jenis Perkara" required error={errors.jenis_perkara}>
              <select
                value={form.jenis_perkara}
                onChange={(e) => set("jenis_perkara", e.target.value)}
                className={inputClass + " bg-white"}
                style={inputStyle}
              >
                <option value="">— Pilih —</option>
                {JENIS_PERKARA.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nomor Perkara" required error={errors.no_perkara}>
              <input
                type="text"
                value={form.no_perkara}
                onChange={(e) => set("no_perkara", e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="01/Pdt.G/2026/PN.Jkt.Pst"
              />
            </Field>
          </div>

          <Field label="Tanggal Pengajuan">
            <input
              type="date"
              value={form.tgl_pengajuan}
              onChange={(e) => set("tgl_pengajuan", e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pihak Daftar">
              <input
                type="text"
                value={form.pihak_dftr}
                onChange={(e) => set("pihak_dftr", e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <Field label="Pihak Terhadap" required error={errors.pihak_thd}>
              <input
                type="text"
                value={form.pihak_thd}
                onChange={(e) => set("pihak_thd", e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="Nama debitur / tergugat"
              />
            </Field>
          </div>

          <Field label="Deskripsi / Kronologi">
            <textarea
              value={form.deskripsi}
              onChange={(e) => set("deskripsi", e.target.value)}
              rows={4}
              className={inputClass + " resize-none"}
              style={inputStyle}
              placeholder="Uraikan kronologi perkara secara singkat..."
            />
          </Field>
        </div>

        {/* Requester info — read only */}
        <div
          className="bg-white border border-[--color-border] p-4 mb-5 flex items-center gap-2 text-sm"
          style={{ borderRadius: "var(--radius-card)", color: "var(--color-muted)" }}
        >
          <span>Diajukan sebagai:</span>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            {roleName}
          </span>
          <span>&bull; Status awal: Menunggu validasi</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Pengajuan"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.push("/elis")}>
            Batal
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
