'use client';
// Sidebar component — rendered client-side for role state

export default function Sidebar({ role, currentPage = 'task-list' }) {
  const DS = {
    sidebarBg: "#1a2e5a",
    sidebarAccent: "#f59e0b",
    sidebarActive: "#2563eb",
    sidebarHover: "rgba(255,255,255,0.08)",
    sidebarText: "rgba(255,255,255,0.90)",
    sidebarMuted: "rgba(255,255,255,0.50)",
  };

  const PROFILES = {
    requester: { name: "Sari Dewi", role: "Requester" },
    admin:     { name: "Andi Pratama", role: "Admin Litigation" },
    approver:  { name: "Drs. Wahyu Nugroho", role: "Approver" },
  };

  const p = PROFILES[role] || PROFILES.requester;

  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',  icon: '⊞' },
    { id: 'task-list',  label: 'Task List',   icon: '📋' },
  ];

  if (role === 'admin') {
    navItems.push({ id: 'settings', label: 'Pengaturan', icon: '⚙' });
  }

  return (
    <div style={{
      width: 220,
      background: DS.sidebarBg,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100dvh',
    }}>
      {/* Logo bar */}
      <div style={{
        borderLeft: `4px solid ${DS.sidebarAccent}`,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 56,
      }}>
        <span style={{ color: '#fff', fontSize: 14 }}>☰</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.02em' }}>
          E-LITIGATION SYSTEM
        </span>
      </div>

      {/* User profile */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, flexShrink: 0,
          }}>👤</div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>Login As</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{p.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 1 }}>{p.role}</div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ color: DS.sidebarMuted, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', padding: '10px 16px 4px' }}>
        General
      </div>

      {/* Nav items */}
      {navItems.map(item => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: currentPage === item.id ? DS.sidebarActive : 'transparent',
          cursor: 'pointer',
          color: '#fff',
          fontSize: 13,
          fontWeight: currentPage === item.id ? 600 : 400,
        }}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}