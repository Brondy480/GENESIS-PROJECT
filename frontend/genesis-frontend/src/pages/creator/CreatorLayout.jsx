import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getNotifications, markAllNotificationsRead } from "../../api/creator";
import CreatorHome from "./CreatorHome";
import CreatorProjects from "./CreatorProjects";
import CreatorRequests from "./CreatorRequests";
import CreatorDeals from "./CreatorDeals";
import CreatorAgreements from "./CreatorAgreements";
import CreatorWallet from "./CreatorWallet";
import CreatorProfile from "./CreatorProfile";

const NAV = [
  { path: "",           label: "Dashboard",  icon: "⊞" },
  { path: "projects",   label: "Projects",   icon: "🚀" },
  { path: "requests",   label: "Requests",   icon: "📥" },
  { path: "deals",      label: "Deals",      icon: "🤝" },
  { path: "agreements", label: "Agreements", icon: "📋" },
  { path: "wallet",     label: "Wallet",     icon: "💰" },
  { path: "profile",    label: "Profile",    icon: "👤" },
];

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };

export default function CreatorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [collapsed, setCollapsed]       = useState(false);

  useEffect(() => {
    getNotifications()
      .then(r => { setNotifications(r.data.notifications || []); setUnreadCount(r.data.unreadCount || 0); })
      .catch(() => {});
  }, []);

  const markAllRead = async () => {
    try { await markAllNotificationsRead(); setUnreadCount(0); setNotifications(p => p.map(n => ({...n,isRead:true}))); } catch {}
  };

  const pageTitle = () => {
    const seg = location.pathname.split("/").pop();
    return NAV.find(n => n.path === seg || (seg === "dashboard" && n.path === ""))?.label || "Dashboard";
  };

  const SW = collapsed ? 68 : 240;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F5F3FF", fontFamily:F.dm }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width:SW, minHeight:"100vh", flexShrink:0,
        background:"linear-gradient(180deg,#7C3AED 0%,#4C1D95 100%)",
        display:"flex", flexDirection:"column",
        padding:"20px 12px", transition:"width 0.3s ease",
        boxShadow:"4px 0 24px rgba(76,29,149,0.2)",
        position:"sticky", top:0, overflow:"hidden",
      }}>
        {/* Logo */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          display:"flex", alignItems:"center", gap:10, marginBottom:24,
          background:"none", border:"none", cursor:"pointer", padding:"4px 4px",
        }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",
            border:"1px solid rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <span style={{ fontFamily:F.jakarta,fontWeight:800,fontSize:18,color:"white" }}>G</span>
          </div>
          {!collapsed && <span style={{ fontFamily:F.jakarta,fontWeight:800,fontSize:17,color:"white",whiteSpace:"nowrap" }}>Genesis</span>}
        </button>

        {/* User badge */}
        {!collapsed && (
          <div style={{ background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"10px 12px",marginBottom:20,border:"1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4,fontFamily:F.dm }}>Logged in as</div>
            <div style={{ fontSize:13,fontWeight:700,color:"white",fontFamily:F.jakarta,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.name}</div>
            <div style={{ marginTop:6,display:"inline-flex",alignItems:"center",background:"rgba(196,181,253,0.2)",padding:"2px 8px",borderRadius:100 }}>
              <span style={{ fontSize:10,color:"#C4B5FD",fontWeight:700,fontFamily:F.jakarta }}>🚀 Creator</span>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path === "" ? "/creator/dashboard" : `/creator/dashboard/${item.path}`}
              end={item.path === ""}
              style={({ isActive }) => ({
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 12px", borderRadius:12,
                textDecoration:"none", transition:"all 0.2s",
                background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                color: isActive ? "white" : "rgba(255,255,255,0.55)",
                fontFamily: F.jakarta, fontWeight: isActive ? 700 : 500, fontSize:14,
              })}
            >
              {({ isActive }) => (<>
                <span style={{
                  width:32,height:32,borderRadius:9,flexShrink:0,fontSize:16,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background: isActive ? "white" : "rgba(255,255,255,0.1)",
                  transition:"all 0.2s",
                }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace:"nowrap" }}>{item.label}</span>}
              </>)}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:12,marginTop:8 }}>
          <button onClick={() => { logout(); navigate("/login"); }} style={{
            width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            borderRadius:12,border:"none",cursor:"pointer",background:"transparent",
            color:"rgba(255,255,255,0.4)",fontFamily:F.jakarta,fontSize:14,transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="white";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.4)";}}>
            <span style={{ width:32,height:32,borderRadius:9,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>⎋</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* Topbar */}
        <header style={{
          height:64, background:"white", padding:"0 28px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom:"1px solid rgba(124,58,237,0.08)",
          boxShadow:"0 2px 12px rgba(124,58,237,0.04)",
          position:"sticky", top:0, zIndex:50,
        }}>
          <div>
            <h1 style={{ fontFamily:F.jakarta,fontSize:18,fontWeight:700,color:"#0D0621",margin:0 }}>{pageTitle()}</h1>
            <p style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.4)",margin:0,marginTop:2 }}>
              {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>

          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            {/* Bell */}
            <div style={{ position:"relative" }}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{
                width:40,height:40,borderRadius:12,background:"#F5F3FF",
                border:"1.5px solid rgba(124,58,237,0.12)",display:"flex",
                alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,
              }}>🔔</button>
              {unreadCount > 0 && (
                <div style={{ position:"absolute",top:-4,right:-4,background:"#EF4444",color:"white",
                  width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:10,fontWeight:800,border:"2px solid white",fontFamily:F.jakarta }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
              {showNotifs && (
                <div style={{ position:"absolute",right:0,top:48,width:340,background:"white",
                  borderRadius:18,boxShadow:"0 20px 60px rgba(0,0,0,0.12)",
                  border:"1px solid rgba(124,58,237,0.1)",zIndex:200,overflow:"hidden" }}>
                  <div style={{ padding:"14px 18px",borderBottom:"1px solid rgba(124,58,237,0.07)",
                    display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621" }}>Notifications</span>
                    {unreadCount > 0 && <span onClick={markAllRead} style={{ fontFamily:F.dm,fontSize:12,color:"#7C3AED",cursor:"pointer",fontWeight:600 }}>Mark all read</span>}
                  </div>
                  <div style={{ maxHeight:300,overflowY:"auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding:"32px",textAlign:"center" }}>
                        <div style={{ fontSize:32,marginBottom:8 }}>🔔</div>
                        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>No notifications yet</p>
                      </div>
                    ) : notifications.map((n,i) => (
                      <div key={i} style={{ padding:"12px 18px",borderBottom:"1px solid rgba(124,58,237,0.05)",
                        background:n.isRead?"white":"#FAF9FF",cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#F5F3FF"}
                        onMouseLeave={e=>e.currentTarget.style.background=n.isRead?"white":"#FAF9FF"}>
                        <div style={{ width:34,height:34,borderRadius:9,background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15 }}>
                          {n.type==="agreement_signing_required"?"📋":n.type==="escrow_released"?"💰":"🔔"}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <p style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:600,color:"#0D0621",margin:"0 0 2px" }}>{n.title}</p>
                          <p style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)",margin:0,lineHeight:1.5 }}>{n.message}</p>
                        </div>
                        {!n.isRead && <div style={{ width:7,height:7,background:"#7C3AED",borderRadius:"50%",marginTop:4,flexShrink:0 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <button onClick={() => navigate("/creator/dashboard/profile")} style={{
              display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",padding:0,
            }}>
              <div style={{ width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",
                display:"flex",alignItems:"center",justifyContent:"center",color:"white",
                fontFamily:F.jakarta,fontWeight:800,fontSize:16 }}>
                {user?.name?.[0]?.toUpperCase()||"C"}
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621" }}>{user?.name}</div>
                <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)" }}>Creator</div>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:28, overflowY:"auto" }}>
          <Routes>
            <Route index element={<CreatorHome />} />
            <Route path="projects/*" element={<CreatorProjects />} />
            <Route path="requests" element={<CreatorRequests />} />
            <Route path="deals" element={<CreatorDeals />} />
            <Route path="agreements" element={<CreatorAgreements />} />
            <Route path="wallet" element={<CreatorWallet />} />
            <Route path="profile" element={<CreatorProfile />} />
          </Routes>
        </main>
      </div>

      {showNotifs && <div style={{ position:"fixed",inset:0,zIndex:40 }} onClick={() => setShowNotifs(false)} />}
    </div>
  );
}