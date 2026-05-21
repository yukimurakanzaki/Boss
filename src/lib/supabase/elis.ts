import { createClient } from "./client"
import { ALLOWED_TRANSITIONS, ACTION_LABELS } from "@/lib/constants"
import type { ElisStatus } from "@/lib/constants"

export interface ElisSubmission {
  id: string
  nomor_pengajuan: string
  requester_id?: string
  requester_name: string
  judul_perkara: string
  jenis_perkara?: string
  tgl_pengajuan?: string
  status: string
  approver_id?: string
  no_perkara?: string
  pihak_dftr?: string
  pihak_thd?: string
  no_spdp?: string
  tgl_spdp?: string
  no_p21?: string
  tgl_p21?: string
  deskripsi?: string
  lampiran_1?: string
  lampiran_2?: string
  lampiran_3?: string
  catatan_revisi?: string
  created_at: string
  updated_at: string
}

export interface ElisAuditLog {
  id: string
  elis_id: string
  action: string
  actor_id?: string
  actor_name: string
  catatan?: string
  created_at: string
}

export interface ElisDetail extends ElisSubmission {
  audit_log: ElisAuditLog[]
}

function validateTransition(role: string, currentStatus: string, newStatus: string): void {
  const allowed = ALLOWED_TRANSITIONS[role]
  if (!allowed) throw new Error(`Unknown role: ${role}`)
  const allowedFrom = allowed[currentStatus as ElisStatus]
  if (!allowedFrom || !allowedFrom.includes(newStatus as ElisStatus)) {
    throw new Error(`Transition dari "${currentStatus}" ke "${newStatus}" tidak diizinkan untuk role ${role}`)
  }
}

export async function getUserRole(userId: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from("profiles")
    .select("boss_role")
    .eq("id", userId)
    .single()
  return data?.boss_role ?? "viewer"
}

export async function getElisSubmissions(userId: string): Promise<ElisSubmission[]> {
  const supabase = createClient()
  const role = await getUserRole(userId)

  let query = supabase
    .from("elis_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  if (role === 'requester') {
    query = query.eq("requester_id", userId)
  } else if (role === 'approver') {
    query = query.or(`approver_id.eq.${userId},status.eq.Menunggu persetujuan`)
  }

  const { data } = await query
  return data ?? []
}

export async function getElisById(id: string): Promise<ElisDetail | null> {
  const supabase = createClient()

  const { data: submission } = await supabase
    .from("elis_submissions")
    .select("*")
    .eq("id", id)
    .single()

  if (!submission) return null

  const { data: audit } = await supabase
    .from("elis_audit_log")
    .select("*")
    .eq("elis_id", id)
    .order("created_at", { ascending: true })

  return { ...submission, audit_log: audit ?? [] }
}

export async function updateElisStatus(
  id: string,
  newStatus: string,
  actorId: string,
  actorName: string,
  catatan?: string
): Promise<void> {
  const supabase = createClient()

  const { data: submission } = await supabase
    .from("elis_submissions")
    .select("id, status")
    .eq("id", id)
    .single()

  if (!submission) throw new Error("Pengajuan tidak ditemukan")

  const role = await getUserRole(actorId)
  validateTransition(role, submission.status, newStatus)

  const actionLabel = ACTION_LABELS[newStatus] ?? newStatus

  const { error: updateError } = await supabase
    .from("elis_submissions")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (updateError) throw new Error(`Gagal update status: ${updateError.message}`)

  const { error: auditError } = await supabase
    .from("elis_audit_log")
    .insert({
      elis_id: id,
      action: actionLabel,
      actor_id: actorId,
      actor_name: actorName,
      catatan: catatan ?? null,
    })

  if (auditError) throw new Error(`Gagal catat audit: ${auditError.message}`)
}

export async function getElisCounts(): Promise<{
  total: number
  menunggu: number
  selesaiBulanIni: number
  ditolak: number
}> {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ count: total }, { count: menunggu }, { count: selesaiBulanIni }, { count: ditolak }] = await Promise.all([
    supabase.from("elis_submissions").select("*", { count: "exact", head: true }),
    supabase.from("elis_submissions").select("*", { count: "exact", head: true })
      .in("status", ["Menunggu validasi", "Menunggu persetujuan"]),
    supabase.from("elis_submissions").select("*", { count: "exact", head: true })
      .eq("status", "Selesai").gte("updated_at", startOfMonth),
    supabase.from("elis_submissions").select("*", { count: "exact", head: true })
      .eq("status", "Ditolak"),
  ])

  return {
    total: total ?? 0,
    menunggu: menunggu ?? 0,
    selesaiBulanIni: selesaiBulanIni ?? 0,
    ditolak: ditolak ?? 0,
  }
}