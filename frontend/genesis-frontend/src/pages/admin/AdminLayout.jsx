import { useState } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FolderOpen, TrendingUp, Lock, LogOut, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import useAuthStore from "../../store/authStore";
import AdminHome from "./AdminHome";
import AdminUsers from "./AdminUsers";
import AdminProjects from "./AdminProjects";
import AdminInvestments from "./AdminInvestments";
import AdminEscrows from "./AdminEscrow";

const NAV = [
  { path: "",            label: "Dashboard",    Icon: LayoutDashboard },
  { path: "users",       label: "Users",        Icon: Users },
  { path: "projects",    label: "Projects",     Icon: FolderOpen },
  { path: "investments", label: "Investments",  Icon: TrendingUp },
  { path: "escrows",     label: "Escrows",      Icon: Lock },
];

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

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
        background:"linear-gradient(180deg,#0D0621 0%,#1a0a3d 100%)",
        display:"flex", flexDirection:"column",
        padding:"20px 12px", transition:"width 0.3s ease",
        boxShadow:"4px 0 24px rgba(0,0,0,0.3)",
        position:"sticky", top:0, overflow:"hidden",
      }}>
        {/* Logo */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          display:"flex", alignItems:"center", gap:10, marginBottom:24,
          background:"none", border:"none", cursor:"pointer", padding:"4px",
        }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Shield size={18} color="white" />
          </div>
          {!collapsed && <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-start" }}>
            <span style={{ fontFamily:F.jakarta,fontWeight:800,fontSize:15,color:"white",whiteSpace:"nowrap",lineHeight:1.2 }}>Genesis</span>
            <span style={{ fontFamily:F.dm,fontSize:10,color:"rgba(167,139,255,0.7)",whiteSpace:"nowrap" }}>Admin Panel</span>
          </div>}
        </button>

        {/* Admin badge */}
        {!collapsed && (
          <div style={{ background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:12,padding:"10px 12px",marginBottom:20 }}>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>Signed in as</div>
            <div style={{ fontSize:13,fontWeight:700,color:"white",fontFamily:F.jakarta,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.name}</div>
            <div style={{ marginTop:6,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(124,58,237,0.3)",padding:"2px 8px",borderRadius:100 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"#A78BFF" }} />
              <span style={{ fontSize:10,color:"#A78BFF",fontWeight:700,fontFamily:F.jakarta }}>Administrator</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path === "" ? "/admin/dashboard" : `/admin/dashboard/${item.path}`}
              end={item.path === ""}
              style={({ isActive }) => ({
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 12px", borderRadius:12,
                textDecoration:"none", transition:"all 0.2s",
                background: isActive ? "rgba(124,58,237,0.3)" : "transparent",
                color: isActive ? "white" : "rgba(255,255,255,0.45)",
                fontFamily:F.jakarta, fontWeight: isActive ? 700 : 500, fontSize:14,
                border: isActive ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
              })}
            >
              {({ isActive }) => (<>
                <span style={{
                  width:32,height:32,borderRadius:9,flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background: isActive ? "#7C3AED" : "rgba(255,255,255,0.06)",
                  transition:"all 0.2s",
                }}>
                  <item.Icon size={16} color={isActive ? "white" : "rgba(255,255,255,0.5)"} />
                </span>
                {!collapsed && <span style={{ whiteSpace:"nowrap" }}>{item.label}</span>}
              </>)}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12,marginTop:8 }}>
          <button onClick={() => { logout(); navigate("/login"); }} style={{
            width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            borderRadius:12,border:"none",cursor:"pointer",background:"transparent",
            color:"rgba(255,255,255,0.3)",fontFamily:F.jakarta,fontSize:14,transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.15)";e.currentTarget.style.color="#FCA5A5";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.3)";}}>
            <span style={{ width:32,height:32,borderRadius:9,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <LogOut size={16} color="currentColor" />
            </span>
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
          boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
          position:"sticky", top:0, zIndex:50,
        }}>
          <div>
            <h1 style={{ fontFamily:F.jakarta,fontSize:18,fontWeight:700,color:"#0D0621",margin:0 }}>{pageTitle()}</h1>
            <p style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.4)",margin:0,marginTop:2 }}>
              {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:100,padding:"6px 14px" }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"#D97706" }} />
              <span style={{ fontFamily:F.jakarta,fontSize:11,fontWeight:700,color:"#D97706" }}>ADMIN MODE</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#0D0621,#1a0a3d)",
                display:"flex",alignItems:"center",justifyContent:"center",color:"white",
                fontFamily:F.jakarta,fontWeight:800,fontSize:16 }}>
                {user?.name?.[0]?.toUpperCase()||"A"}
              </div>
              <div>
                <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621" }}>{user?.name}</div>
                <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)" }}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, padding:28, overflowY:"auto" }}>
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="investments" element={<AdminInvestments />} />
            <Route path="escrows" element={<AdminEscrows />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}