import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";
import {
  LayoutDashboard, Search, Heart, Bookmark,
  Wallet, User, LogOut, Menu, X, Bell, ChevronRight, Globe,
  TrendingUp, Handshake, FileText, Lock,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/backer/dashboard" },
  { label: "Discover Projects", icon: Globe, path: "/feed", highlight: true, alwaysVisible: true },
  { label: "Browse Projects", icon: Search, path: "/backer/dashboard/browse" },
  { label: "My Fundings", icon: Heart, path: "/backer/dashboard/fundings" },
  { label: "Saved Projects", icon: Bookmark, path: "/backer/dashboard/saved" },
  { label: "Wallet", icon: Wallet, path: "/backer/dashboard/wallet" },
  { label: "Profile", icon: User, path: "/backer/dashboard/profile" },
];

export default function BackerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/notifications");
        const notifs = res.data?.notifications || res.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const notifIcon = (type) => {
    if (type === "investment") return <TrendingUp size={14} color="#7C3AED" />;
    if (type === "deal") return <Handshake size={14} color="#059669" />;
    if (type === "agreement") return <FileText size={14} color="#2563EB" />;
    if (type === "escrow") return <Lock size={14} color="#D97706" />;
    return <Bell size={14} color="#7C3AED" />;
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "BK";
  const isActive = (path) =>
    path === "/backer/dashboard"
      ? location.pathname === "/backer/dashboard"
      : location.pathname.startsWith(path);

  const SidebarInner = ({ mobile = false }) => (
    <div style={{
      width: mobile ? 260 : collapsed ? 72 : 240,
      height: "100vh", background: "linear-gradient(180deg,#065f46,#022c22)",
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
        {NAV.map(({ label, icon: Icon, path, highlight, alwaysVisible }) => {
          const active = isActive(path);
          const showLabel = (!collapsed || mobile || alwaysVisible);
          return (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: (collapsed && !mobile && !alwaysVisible) ? "12px 0" : "11px 18px",
              justifyContent: (collapsed && !mobile && !alwaysVisible) ? "center" : "flex-start",
              textDecoration: "none",
              color: highlight ? "#FBCFE8" : active ? "#fff" : "#555",
              background: highlight
                ? "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(167,139,250,0.1))"
                : active ? "rgba(236,72,153,0.12)" : "transparent",
              border: highlight ? "1px solid rgba(236,72,153,0.2)" : "1px solid transparent",
              borderLeft: highlight ? "3px solid #F472B6" : active ? "3px solid #EC4899" : "3px solid transparent",
              transition: "all 0.15s",
            }}>
              <Icon size={18} color={highlight ? "#F9A8D4" : active ? "#EC4899" : "#555"} style={{ flexShrink: 0 }} />
              {showLabel && <span style={{ fontSize: 13, fontWeight: highlight ? 600 : active ? 600 : 400 }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: (collapsed && !mobile) ? "14px 0" : "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {(!collapsed || mobile) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
              {user?.profileImage ? <img src={user.profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials}
            </div>
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
            <button onClick={() => setNotifOpen(!notifOpen)}
              style={{ position: "relative", background: "#F5F3FF", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} color="#7C3AED" />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#EF4444", borderRadius: "50%", border: "2px solid white" }} />
              )}
            </button>
            {notifOpen && (
              <>
                <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "white", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", border: "1px solid rgba(124,58,237,0.08)", zIndex: 100 }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: "#0D0621" }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "#7C3AED" }}>Mark all read</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "32px 16px", textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(13,6,33,0.4)" }}>No new notifications</div>
                    ) : notifications.map((n, i) => (
                      <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.04)", background: n.isRead ? "white" : "#FAFAFF", display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {notifIcon(n.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#0D0621", margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(13,6,33,0.4)", margin: "4px 0 0" }}>
                            {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C3AED", flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden" }}>
            {user?.profileImage ? <img src={user.profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials}
          </div>
        </div>

        {/* Route output */}
        <div style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}