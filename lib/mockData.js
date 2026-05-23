// Mock data for ELIS Task List
// Realistic names, no John Doe, no fake percentages

export const MOCK_DATA = {
  requester: {
    name: "Sari Dewi",
    role: "Requester",
    info: "Anda hanya dapat melihat pengajuan milik Anda sendiri.",
    rows: [
      { no: 1, nomor: "ELIS-2026-0042", req: null, jenis: "Perdata",    tgl: "12 Mei 2026",  status: "Menunggu validasi"   },
      { no: 2, nomor: "ELIS-2026-0038", req: null, jenis: "Pidana",     tgl: "09 Mei 2026",  status: "Revisi"             },
      { no: 3, nomor: "ELIS-2026-0031", req: null, jenis: "PKPU",        tgl: "04 Mei 2026",  status: "Menunggu persetujuan"},
      { no: 4, nomor: "ELIS-2026-0027", req: null, jenis: "Perdata",     tgl: "28 Apr 2026",  status: "Menunggu validasi"   },
      { no: 5, nomor: "ELIS-2026-0021", req: null, jenis: "Pidana",      tgl: "22 Apr 2026",  status: "Revisi"             },
      { no: 6, nomor: "ELIS-2026-0018", req: null, jenis: "PKPU",        tgl: "15 Apr 2026",  status: "Disetujui"          },
      { no: 7, nomor: "ELIS-2026-0012", req: null, jenis: "Perdata",     tgl: "08 Apr 2026",  status: "Selesai"            },
    ],
  },

  admin: {
    name: "Andi Pratama",
    role: "Admin Litigation",
    info: "Anda dapat melihat seluruh pengajuan dari semua requester.",
    rows: [
      { no: 1, nomor: "ELIS-2026-0042", req: "Sari Dewi",    jenis: "Perdata", tgl: "12 Mei 2026", status: "Menunggu validasi"   },
      { no: 2, nomor: "ELIS-2026-0041", req: "Budi Santoso", jenis: "PKPU",    tgl: "11 Mei 2026", status: "Revisi"             },
      { no: 3, nomor: "ELIS-2026-0039", req: "Rina Marlina", jenis: "Pidana",  tgl: "10 Mei 2026", status: "Menunggu validasi"   },
      { no: 4, nomor: "ELIS-2026-0038", req: "Sari Dewi",    jenis: "Pidana",  tgl: "09 Mei 2026", status: "Revisi"             },
      { no: 5, nomor: "ELIS-2026-0035", req: "Hendra Wijaya",jenis: "Perdata", tgl: "07 Mei 2026", status: "Menunggu persetujuan"},
      { no: 6, nomor: "ELIS-2026-0033", req: "Lestari Putri",jenis: "PKPU",   tgl: "06 Mei 2026", status: "Menunggu validasi"   },
      { no: 7, nomor: "ELIS-2026-0030", req: "Agus Salim",   jenis: "Pidana",  tgl: "03 Mei 2026", status: "Disetujui"          },
      { no: 8, nomor: "ELIS-2026-0028", req: "Rina Marlina", jenis: "PKPU",   tgl: "01 Mei 2026", status: "Sedang diproses"     },
      { no: 9, nomor: "ELIS-2026-0025", req: "Budi Santoso", jenis: "Perdata",tgl: "28 Apr 2026", status: "Selesai"            },
    ],
  },

  approver: {
    name: "Drs. Wahyu Nugroho",
    role: "Approver",
    info: "Anda hanya dapat melihat pengajuan yang ditugaskan kepada Anda.",
    rows: [
      { no: 1, nomor: "ELIS-2026-0035", req: "Hendra Wijaya", jenis: "Perdata", tgl: "07 Mei 2026", status: "Menunggu persetujuan" },
      { no: 2, nomor: "ELIS-2026-0031", req: "Sari Dewi",     jenis: "PKPU",    tgl: "04 Mei 2026", status: "Menunggu persetujuan" },
      { no: 3, nomor: "ELIS-2026-0028", req: "Rina Marlina",  jenis: "Pidana",  tgl: "01 Mei 2026", status: "Menunggu persetujuan" },
      { no: 4, nomor: "ELIS-2026-0022", req: "Agus Salim",    jenis: "PKPU",    tgl: "25 Apr 2026", status: "Disetujui"           },
    ],
  },
};

// Dashboard chart mock data (by Tipe Perkara, filterable by Status + Tahun)
export const CHART_DATA = {
  labels: ["Perdata", "Pidana", "PKPU"],
  approved:    [47, 23, 8],
  inProgress:  [12, 5, 3],
  rejected:    [5,  7, 2],
  revision:    [8,  3, 1],
};