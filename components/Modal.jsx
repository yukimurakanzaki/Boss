'use client';
// Generic Modal — used for Panduan Pengajuan and Edit Panduan

export default function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 8,
        width: 500, maxWidth: "95vw",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "#1e3a5f", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            {subtitle && (
              <p style={{ margin: 0, color: "rgba(255,255,255,.6)", fontSize: 11 }}>
                {subtitle}
              </p>
            )}
            <h3 style={{ margin: 0, color: "#fff", fontSize: 15, fontWeight: 700 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.15)", border: "none",
              color: "#fff", width: 28, height: 28,
              borderRadius: 6, cursor: "pointer", fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 8px" }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px 18px",
          display: "flex", justifyContent: "flex-end", gap: 8,
          borderTop: "1px solid #e2e8f0",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px", borderRadius: 4, fontSize: 12, fontWeight: 600,
              background: "#fff", color: "#6b7280",
              border: "1px solid #cbd5e1", cursor: "pointer",
            }}
          >
            {footer ? "Batal" : "Tutup"}
          </button>
          {footer}
        </div>
      </div>
    </div>
  );
}