'use client';
import { MOCK_DATA } from '../lib/mockData';

const STATUS_CFG = {
  "Menunggu validasi":    { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  "Revisi":               { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  "Menunggu persetujuan": { bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  "Disetujui":            { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  "Ditolak":              { bg: "#fff1f2", color: "#b91c1c", dot: "#ef4444" },
  "Sedang diproses":      { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  "Selesai":              { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};

export default function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { bg: "#f1f5f9", color: "#6b7280", dot: "#9ca3af" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.color, padding: "3px 10px",
      borderRadius: 99, fontSize: 11, fontWeight: 600,
      border: `1px solid ${c.dot}40`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {status}
    </span>
  );
}