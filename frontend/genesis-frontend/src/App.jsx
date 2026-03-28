import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatorLayout from "./pages/creator/CreatorLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import useAuthStore from "./store/authStore";

const PlaceholderDash = ({ role }) => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const icons = { investor:"📈", backer:"🤝", admin:"⚙️" };
  const colors = { investor:"#7C3AED", backer:"#5B21B6", admin:"#0D0621" };

  return (
    <div style={{
      minHeight:"100vh", background:"#FAFAFF",
      fontFamily:"'Plus Jakarta Sans',sans-serif",
      display:"flex", flexDirection:"column",
    }}>
      {/* Top bar */}
      <div style={{
        height:64, background:"white",
        borderBottom:"1px solid rgba(124,58,237,0.08)",
        padding:"0 32px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 2px 12px rgba(124,58,237,0.04)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#7C3AED,#A78BFF)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontWeight:800, fontSize:18 }}>G</span>
          </div>
          <span style={{ fontWeight:800, fontSize:17, color:"#0D0621" }}>Genesis</span>
          <span style={{ marginLeft:8, fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:100, background:"#EDE9FE", color:"#7C3AED" }}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#0D0621" }}>{user?.name}</div>
            <div style={{ fontSize:11, color:"rgba(13,6,33,0.4)" }}>{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"9px 18px", borderRadius:12,
              background:"#FEE2E2", color:"#DC2626",
              border:"1.5px solid #FECACA",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontWeight:700, fontSize:13, cursor:"pointer",
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#DC2626"; e.currentTarget.style.color="white"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.color="#DC2626"; }}
          >
            ⎋ Sign Out
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:`linear-gradient(135deg,${colors[role]||"#7C3AED"},#A78BFF)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px", fontSize:32,
            boxShadow:`0 8px 32px ${colors[role]||"#7C3AED"}40`,
          }}>
            {icons[role] || "🏠"}
          </div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"#0D0621", marginBottom:8 }}>
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>
          <p style={{ color:"rgba(13,6,33,0.45)", fontSize:15, marginBottom:32 }}>
            Coming soon — being built next
          </p>
          <button
            onClick={handleLogout}
            style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"12px 28px", borderRadius:14,
              background:"linear-gradient(135deg,#EF4444,#DC2626)",
              color:"white", border:"none",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontWeight:700, fontSize:14, cursor:"pointer",
              boxShadow:"0 4px 16px rgba(239,68,68,0.3)",
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(239,68,68,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 16px rgba(239,68,68,0.3)"; }}
          >
            ⎋ Sign Out & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

function AuthGuard({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.userType}/dashboard`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />
        <Route path="/register" element={<AuthGuard><RegisterPage /></AuthGuard>} />
        <Route path="/creator/dashboard/*" element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <CreatorLayout />
          </ProtectedRoute>
        } />
        <Route path="/investor/dashboard/*" element={
          <ProtectedRoute allowedRoles={["investor"]}>
            <PlaceholderDash role="investor" />
          </ProtectedRoute>
        } />
        <Route path="/backer/dashboard/*" element={
          <ProtectedRoute allowedRoles={["backer"]}>
            <PlaceholderDash role="backer" />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard/*" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}