import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Globe, Inbox, Handshake, FileText,
  Wallet, TrendingUp, User, LogOut, Bell, Menu, X, Lock,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

const NAV = [
  { path: "/investor/dashboard",            label: "Dashboard",       Icon: LayoutDashboard },
  { path: "/feed",                           label: "Discover Projects", Icon: Globe, highlight: true, alwaysVisible: true },
  { path: "/investor/dashboard/browse",      label: "Browse Projects", Icon: Globe },
  { path: "/investor/dashboard/requests",    label: "My Requests",     Icon: Inbox },
  { path: "/investor/dashboard/deals",       label: "My Deals",        Icon: Handshake },
  { path: "/investor/dashboard/agreements",  label: "Agreements",      Icon: FileText },
  { path: "/investor/dashboard/portfolio",   label: "Portfolio",       Icon: TrendingUp },
  { path: "/investor/dashboard/wallet",      label: "Wallet",          Icon: Wallet },
  { path: "/investor/dashboard/profile",     label: "Profile",         Icon: User },
];

export default function InvestorLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "IV";

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
            {collapsed ? <Menu size={16} color="#A78BFF" /> : <X size={16} color="#A78BFF" />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 8px", overflowY: "auto" }}>
          {NAV.map(item => {
            const active = item.path === "/investor/dashboard"
              ? location.pathname === "/investor/dashboard"
              : location.pathname.startsWith(item.path);
            const isHighlighted = item.highlight;
            const showLabel = !collapsed || item.alwaysVisible;
            const iconColor = isHighlighted ? "#E9D5FF" : active ? "#C4B5FD" : "rgba(255,255,255,0.5)";

            return (
              <Link key={item.path} to={item.path} title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: collapsed ? "12px 0" : "11px 16px",
                  borderRadius: 10, marginBottom: 4,
                  justifyContent: collapsed && !item.alwaysVisible ? "center" : "flex-start",
                  background: isHighlighted
                    ? "linear-gradient(135deg, rgba(124,111,255,0.3), rgba(167,139,255,0.2))"
                    : active ? "rgba(124,111,255,0.2)" : "transparent",
                  border: isHighlighted ? "1px solid rgba(124,111,255,0.3)" : "1px solid transparent",
                  color: isHighlighted ? "#E9D5FF" : active ? "#C4B5FD" : "rgba(255,255,255,0.55)",
                  textDecoration: "none", fontSize: 14, fontWeight: isHighlighted ? 600 : active ? 600 : 400,
                  borderLeft: isHighlighted ? "3px solid #A78BFF" : active ? "3px solid #7C6FFF" : "3px solid transparent",
                  transition: "all 0.2s",
                }}>
                <item.Icon size={18} color={iconColor} />
                {showLabel && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7C6FFF,#A78BFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
                {user?.profileImage ? <img src={user.profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials}
              </div>
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
            <LogOut size={16} color="#FCA5A5" />
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
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7C6FFF,#A78BFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden" }}>
              {user?.profileImage ? <img src={user.profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials}
            </div>
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
