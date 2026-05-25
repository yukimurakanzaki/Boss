"use client"

import Link from "next/link"

type ModuleStatus = "ready" | "in-progress" | "planned"

const MODULE_REGISTRY = [
  {
    code: "BS-7490",
    name: "E-Litigation System (ELIS)",
    description: "Pengelolaan perkara litigasi — 3 roles, 7-state machine",
    status: "ready" as ModuleStatus,
    screens: 5,
    route: "/dashboard",
  },
  {
    code: "BS-6486",
    name: "BPKB Courier Additional Payment",
    description: "Pembayaran tambahan biaya titip BPKB via kurir",
    status: "planned" as ModuleStatus,
    screens: 0,
    route: "/bpkb-courier",
  },
  {
    code: "RFC26010002",
    name: "Reservasi BPKB via BAFCare",
    description: "Reservasi pengambilan BPKB melalui BAFCare IVR",
    status: "planned" as ModuleStatus,
    screens: 0,
    route: "/reservasi-bpkb",
  },
]

const STATUS_CFG: Record<ModuleStatus, { label: string; bg: string; color: string; border: string }> = {
  ready:       { label: "Ready",       bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "in-progress": { label: "In Progress", bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  planned:     { label: "Planned",     bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
}

export default function HubHome() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 2,
              }}
            >
              PT Bussan Auto Finance — IT Division
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e3a5f", margin: 0 }}>
              BOSS Prototype Hub
            </h1>
          </div>
          <span
            style={{
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 500,
              backgroundColor: "#fffbeb",
              color: "#b45309",
              border: "1px solid #fde68a",
              borderRadius: 999,
            }}
          >
            Dev Preview
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>
          Pilih modul untuk membuka prototype interaktif
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: 16,
          }}
        >
          {MODULE_REGISTRY.map((mod) => {
            const cfg = STATUS_CFG[mod.status]
            const isReady = mod.status !== "planned"

            return (
              <div
                key={mod.code}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "0 1px 3px rgba(0,0,0,.06)",
                  opacity: isReady ? 1 : 0.8,
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      {mod.code}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e3a5f" }}>
                      {mod.name}
                    </div>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      padding: "2px 10px",
                      fontSize: 11,
                      fontWeight: 500,
                      backgroundColor: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      borderRadius: 999,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{mod.description}</p>

                {/* Footer row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid #e2e8f0",
                    marginTop: "auto",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    {mod.screens > 0 ? `${mod.screens} screens` : "Coming soon"}
                  </span>

                  {isReady ? (
                    <Link
                      href={mod.route}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#fff",
                        backgroundColor: "#1e3a5f",
                        borderRadius: 4,
                        textDecoration: "none",
                        transition: "background-color .15s",
                      }}
                    >
                      Buka Prototype →
                    </Link>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#9ca3af",
                        backgroundColor: "#f1f5f9",
                        borderRadius: 4,
                        cursor: "not-allowed",
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
