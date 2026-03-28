import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  LayoutDashboard, Search, Heart, Bookmark,
  Wallet, User, LogOut, Menu, X, Bell, ChevronRight
} from "lucide-react";

const NAV = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/backer/dashboard" },
  { label: "Browse Projects", icon: Search,          path: "/backer/dashboard/browse" },
  { label: "My Fundings",     icon: Heart,           path: "/backer/dashboard/fundings" },
  { label: "Saved Projects",  icon: Bookmark,        path: "/backer/dashboard/saved" },
  { label: "Wallet",          icon: Wallet,          path: "/backer/dashboard/wallet" },
  { label: "Profile",         icon: User,            path: "/backer/dashboard/profile" },
];

export default function BackerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "BK";
  const isActive = (path) =>
    path === "/backer/dashboard"
      ? location.pathname === "/backer/dashboard"
      : location.pathname.startsWith(path);

  const SidebarInner = ({ mobile = false }) => (
    <div style={{
      width: mobile ? 260 : collapsed ? 72 : 240,
      height: "100vh", background: "#0A0A14",
      display: "flex", flexDirection: "column",
      transition: "width 0.25s ease",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: (collapsed && !mobile) ? "24px 0" : "20px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 10,
        justifyContent: (collapsed && !mobile) ? "center" : "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Heart size={17} color="#fff" fill="#fff" />
          </div>
          {(!collapsed || mobile) && (
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>GENESIS</div>
              <div style={{ color: "#EC4899", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Backer Portal</div>
            </div>
          )}
        </div>
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#888", display: "flex" }}>
            {collapsed ? <ChevronRight size={14} /> : <X size={14} />}
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "14px 0", overflowY: "auto" }}>
        {NAV.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: (collapsed && !mobile) ? "12px 0" : "11px 18px",
              justifyContent: (collapsed && !mobile) ? "center" : "flex-start",
              textDecoration: "none",
              color: active ? "#fff" : "#555",
              background: active ? "rgba(236,72,153,0.12)" : "transparent",
              borderLeft: active ? "3px solid #EC4899" : "3px solid transparent",
              transition: "all 0.15s",
            }}>
              <Icon size={18} color={active ? "#EC4899" : "#555"} style={{ flexShrink: 0 }} />
              {(!collapsed || mobile) && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: (collapsed && !mobile) ? "14px 0" : "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {(!collapsed || mobile) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#eee", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ color: "#EC4899", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Backer</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: (collapsed && !mobile) ? 0 : 8,
          justifyContent: (collapsed && !mobile) ? "center" : "flex-start",
          padding: (collapsed && !mobile) ? "10px 0" : "10px 12px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 8, cursor: "pointer", color: "#EF4444", fontSize: 13, fontWeight: 500,
        }}>
          <LogOut size={15} />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0D0D1A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Fixed desktop sidebar */}
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <SidebarInner />
      </div>
      <div style={{ width: collapsed ? 72 : 240, flexShrink: 0, transition: "width 0.25s ease" }} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: "relative", zIndex: 101 }}>
            <SidebarInner mobile />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{
          height: 60, background: "rgba(13,13,26,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
          backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 40,
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#888", display: "flex" }}>
            <Menu size={20} />
          </button>
          <div style={{ flex: 1, color: "#fff", fontWeight: 600, fontSize: 15 }}>
            {NAV.find(n => isActive(n.path))?.label || "Dashboard"}
          </div>
          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: "#888", display: "flex", position: "relative" }}>
              <Bell size={17} />
              <span style={{ position: "absolute", top: 6, right: 8, width: 6, height: 6, background: "#EC4899", borderRadius: "50%", border: "2px solid #0D0D1A" }} />
            </button>
            {notifOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 280, background: "#111120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, zIndex: 100 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Notifications</div>
                <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "12px 0" }}>No new notifications</div>
              </div>
            )}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{initials}</div>
        </div>

        {/* Route output */}
        <div style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}