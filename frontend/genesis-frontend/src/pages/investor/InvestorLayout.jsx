import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const NAV = [
  { path: "/investor/dashboard", label: "Dashboard", icon: "grid" },
  { path: "/investor/dashboard/browse", label: "Browse Projects", icon: "compass" },
  { path: "/investor/dashboard/requests", label: "My Requests", icon: "inbox" },
  { path: "/investor/dashboard/deals", label: "My Deals", icon: "handshake" },
  { path: "/investor/dashboard/agreements", label: "Agreements", icon: "file-signature" },
  { path: "/investor/dashboard/portfolio", label: "Portfolio", icon: "pie-chart" },
  { path: "/investor/dashboard/wallet", label: "Wallet", icon: "wallet" },
  { path: "/investor/dashboard/profile", label: "Profile", icon: "user" },
];

function NavIcon({ name, size = 20, color = "currentColor" }) {
  const icons = {
    grid: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    compass: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    inbox: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
    handshake: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>,
    "file-signature": <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 19.5v.5a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h8.5L18 5.5"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 112.97 2.97L7.95 21 4 22l1-3.95z"/></svg>,
    "pie-chart": <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>,
    wallet: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>,
    user: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    bell: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    menu: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[name] || null;
}

export default function InvestorLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "IV";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F2FF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 260,
        minHeight: "100vh",
        background: "linear-gradient(160deg, #1E0B4B 0%, #2D1065 50%, #1A0A3B 100%)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s ease",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: mobileOpen ? "translateX(0)" : undefined,
        boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? "24px 16px" : "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.5px" }}>GENESIS</div>
              <div style={{ fontSize: 11, color: "#A78BFF", marginTop: 2 }}>Investor Portal</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "#A78BFF", display: "flex" }}>
            <NavIcon name={collapsed ? "menu" : "x"} size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 8px", overflowY: "auto" }}>
          {NAV.map(item => {
            const active = item.path === "/investor/dashboard" ? location.pathname === "/investor/dashboard" : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: collapsed ? "12px 0" : "11px 16px",
                  borderRadius: 10, marginBottom: 4,
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? "rgba(124,111,255,0.2)" : "transparent",
                  color: active ? "#C4B5FD" : "rgba(255,255,255,0.55)",
                  textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
                  borderLeft: active ? "3px solid #7C6FFF" : "3px solid transparent",
                  transition: "all 0.2s",
                }}>
                <NavIcon name={item.icon} size={18} color={active ? "#C4B5FD" : "rgba(255,255,255,0.5)"} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7C6FFF,#A78BFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: "#A78BFF" }}>Investor</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: 10, padding: collapsed ? "12px 0" : "10px 14px",
              background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 10,
              color: "#FCA5A5", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}>
            <NavIcon name="logout" size={16} color="#FCA5A5" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: collapsed ? 72 : 260, transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: "#fff", borderBottom: "1px solid #E8E4FF",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", position: "sticky", top: 0, zIndex: 30,
          boxShadow: "0 1px 12px rgba(124,111,255,0.06)",
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1E0B4B" }}>
            {NAV.find(n => n.path === location.pathname || (n.path !== "/investor/dashboard" && location.pathname.startsWith(n.path)))?.label || "Dashboard"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)}
                style={{ background: "#F0F2FF", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#7C6FFF", display: "flex" }}>
                <NavIcon name="bell" size={18} />
                <span style={{ position: "absolute", top: 6, right: 8, width: 7, height: 7, background: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: "#fff", borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", border: "1px solid #E8E4FF", zIndex: 100, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1E0B4B", marginBottom: 12 }}>Notifications</div>
                  <div style={{ fontSize: 13, color: "#7B7496", textAlign: "center", padding: "16px 0" }}>No new notifications</div>
                </div>
              )}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7C6FFF,#A78BFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}