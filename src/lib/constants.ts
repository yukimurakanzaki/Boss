export const ELIS_STATUSES = [
  'Menunggu validasi',
  'Revisi',
  'Ditolak',
  'Menunggu persetujuan',
  'Disetujui',
  'Sedang diproses',
  'Selesai',
] as const

export type ElisStatus = typeof ELIS_STATUSES[number]

export const JENIS_PERKARA = ['Perdata', 'Fidusia', 'Eksekusi', 'Mediasi', 'PKPU', 'Lainnya'] as const

export const BOSS_ROLES = {
  admin: 'Admin',
  admin_lit: 'Admin Litigation',
  approver: 'Approver',
  requester: 'Requester',
  viewer: 'Viewer',
} as const

export type BossRole = keyof typeof BOSS_ROLES

export const ALLOWED_TRANSITIONS: Record<string, Record<ElisStatus, ElisStatus[]>> = {
  admin_lit: {
    'Menunggu validasi': ['Revisi', 'Ditolak', 'Menunggu persetujuan'],
    'Sedang diproses': ['Selesai'],
    'Revisi': [],
    'Ditolak': [],
    'Menunggu persetujuan': [],
    'Disetujui': ['Sedang diproses'],
    'Selesai': [],
  },
  approver: {
    'Menunggu persetujuan': ['Disetujui', 'Ditolak'],
    'Menunggu validasi': [],
    'Revisi': [],
    'Ditolak': [],
    'Disetujui': [],
    'Sedang diproses': [],
    'Selesai': [],
  },
}

export const ACTION_LABELS: Record<string, string> = {
  'Revisi': 'Revisi Diminta',
  'Ditolak': 'Ditolak',
  'Menunggu persetujuan': 'Diteruskan ke Approver',
  'Disetujui': 'Disetujui',
  'Sedang diproses': 'Mulai Diproses',
  'Selesai': 'Selesai',
  'Ajukan Ulang': 'Diajukan Ulang',
}