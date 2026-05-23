'use client';
// Filter bar for Task List
// role: 'requester' | 'admin' | 'approver'

const FILTERS = {
  requester: [
    { label: "Nomor Pengajuan", type: "text", placeholder: "Cari nomor..." },
    { label: "Jenis Perkara", type: "select", opts: ["-- Semua --", "Perdata", "Pidana", "PKPU"] },
    { label: "Status", type: "select", opts: ["-- Semua Status --", "Menunggu validasi", "Revisi", "Menunggu persetujuan"] },
  ],
  admin: [
    { label: "Nomor Pengajuan", type: "text", placeholder: "Cari nomor..." },
    { label: "Nama Requester", type: "text", placeholder: "Cari requester..." },
    { label: "Jenis Perkara", type: "select", opts: ["-- Semua --", "Perdata", "Pidana", "PKPU"] },
    { label: "Status", type: "select", opts: ["-- Semua Status --", "Menunggu validasi", "Revisi", "Menunggu persetujuan"] },
    { label: "Tanggal Dari", type: "text", placeholder: "DD/MM/YYYY" },
    { label: "Tanggal Sampai", type: "text", placeholder: "DD/MM/YYYY" },
  ],
  approver: [
    { label: "Nomor Pengajuan", type: "text", placeholder: "Cari nomor..." },
    { label: "Jenis Perkara", type: "select", opts: ["-- Semua --", "Perdata", "Pidana", "PKPU"] },
    { label: "Tanggal Dari", type: "text", placeholder: "DD/MM/YYYY" },
  ],
};

export default function FilterBar({ role, onReset, onSearch }) {
  const filters = FILTERS[role] || FILTERS.requester;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 6,
      padding: "16px 20px",
      marginBottom: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: role === "admin" ? "1fr 1fr 1fr" : "1fr 1fr 1fr",
        gap: "10px 20px",
        marginBottom: 14,
      }}>
        {filters.map((f, i) => (
          <div key={i}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 600,
              color: "#374151", marginBottom: 4,
            }}>{f.label}</label>
            {f.type === "select" ? (
              <select style={{
                width: "100%", padding: "7px 10px",
                border: "1px solid #cbd5e1", borderRadius: 4,
                fontSize: 12, fontFamily: "inherit", color: "#374151",
                background: "#fff", cursor: "pointer",
              }}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "7px 10px",
                  border: "1px solid #cbd5e1", borderRadius: 4,
                  fontSize: 12, fontFamily: "inherit", color: "#374151",
                  outline: "none",
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={onReset}
          style={{
            padding: "7px 16px", borderRadius: 4, fontSize: 12, fontWeight: 600,
            background: "#fff", color: "#6b7280",
            border: "1px solid #cbd5e1", cursor: "pointer",
          }}
        >
          Reset
        </button>
        <button
          onClick={onSearch}
          style={{
            padding: "7px 16px", borderRadius: 4, fontSize: 12, fontWeight: 600,
            background: "#1e3a5f", color: "#fff",
            border: "1px solid #1e3a5f", cursor: "pointer",
          }}
        >
          🔍 Cari
        </button>
      </div>
    </div>
  );
}