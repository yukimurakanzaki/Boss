// BOSS Design Tokens — use these, not hardcoded values
export const DS = {
  sidebarBg: "#1a2e5a",
  sidebarAccent: "#f59e0b",
  sidebarActive: "#2563eb",
  sidebarHover: "rgba(255,255,255,0.08)",
  sidebarText: "rgba(255,255,255,0.90)",
  sidebarMuted: "rgba(255,255,255,0.50)",

  pageBg: "#f1f5f9",
  cardBg: "#ffffff",

  border: "#e2e8f0",
  borderStrong: "#cbd5e1",

  titleColor: "#1e3a5f",
  textPrimary: "#374151",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",

  navy: "#1e3a5f",
  navyDark: "#152d4a",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  blue500: "#3b82f6",

  green: "#15803d",
  greenLight: "#f0fdf4",
  red: "#ef4444",
  redLight: "#fff1f2",
  orange: "#f97316",
  orangeLight: "#fff7ed",
  amber: "#d97706",
  amberLight: "#fffbeb",

  shadowCard: "0 1px 3px rgba(0,0,0,0.08)",
  shadowModal: "0 8px 40px rgba(0,0,0,0.18)",
};

// Status badge colors
export const STATUS_CFG = {
  "Menunggu validasi":    { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  "Revisi":               { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  "Menunggu persetujuan": { bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  "Disetujui":            { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  "Ditolak":              { bg: "#fff1f2", color: "#b91c1c", dot: "#ef4444" },
  "Sedang diproses":      { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  "Selesai":              { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};

// 7 ELIS statuses
export const ALL_STATUSES = [
  "Menunggu validasi",
  "Revisi",
  "Menunggu persetujuan",
  "Disetujui",
  "Ditolak",
  "Sedang diproses",
  "Selesai",
];

// 3 case types
export const CASE_TYPES = ["Perdata", "Pidana", "PKPU"];