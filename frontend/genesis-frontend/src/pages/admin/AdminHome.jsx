import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderOpen, TrendingUp, Lock, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { getPendingUsers, getPendingProjects, getInvestmentRequests, getAllEscrows } from "../../api/admin";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };
const card = { background:"white", borderRadius:20, boxShadow:"0 2px 16px rgba(0,0,0,0.06)", padding:24 };

export default function AdminHome() {
  const navigate = useNavigate();
  const [data, setData] = useState({ users:[], projects:[], investments:[], escrows:[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getPendingUsers(),
      getPendingProjects(),
      getInvestmentRequests(),
      getAllEscrows(),
    ]).then(([u,p,i,e]) => {
      setData({
        users:       u.status==="fulfilled" ? (u.value.data?.users||u.value.data||[]) : [],
        projects:    p.status==="fulfilled" ? (p.value.data?.projects||p.value.data||[]) : [],
        investments: i.status==="fulfilled" ? (i.value.data?.requests||i.value.data||[]) : [],
        escrows:     e.status==="fulfilled" ? (e.value.data?.escrows||e.value.data||[]) : [],
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:400 }}>
      <div style={{ width:32,height:32,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const pendingInvestments = data.investments.filter(i => i.adminStatus==="pending").length;
  const pendingEscrows     = data.escrows.filter(e => e.status==="awaiting_validation"||e.status==="awaiting_signatures").length;

  const stats = [
    { label:"Pending Users",       value:data.users.length,    Icon:Users,      iconBg:"#FEF3C7", iconColor:"#D97706", tag:"Need review",  path:"users" },
    { label:"Pending Projects",    value:data.projects.length, Icon:FolderOpen, iconBg:"#DBEAFE", iconColor:"#2563EB", tag:"Need review",  path:"projects" },
    { label:"Pending Investments", value:pendingInvestments,   Icon:TrendingUp, iconBg:"#EDE9FE", iconColor:"#7C3AED", tag:"Need review",  path:"investments" },
    { label:"Active Escrows",      value:pendingEscrows,       Icon:Lock,       iconBg:"#D1FAE5", iconColor:"#059669", tag:"In progress",  path:"escrows" },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>

      {/* Welcome banner */}
      <div style={{ background:"linear-gradient(135deg,#0D0621,#1a0a3d)",borderRadius:24,padding:"28px 32px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(124,58,237,0.15) 1.5px,transparent 1.5px)",backgroundSize:"28px 28px",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"-20%",right:"-5%",width:260,height:260,background:"radial-gradient(circle,rgba(124,58,237,0.2),transparent 65%)",pointerEvents:"none" }} />
        <div style={{ position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16 }}>
          <div>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:100,padding:"4px 14px",marginBottom:14 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"#A78BFF" }} />
              <span style={{ fontFamily:F.jakarta,fontSize:11,fontWeight:700,color:"#A78BFF",letterSpacing:"0.06em" }}>ADMIN CONTROL CENTER</span>
            </div>
            <h2 style={{ fontFamily:F.jakarta,fontSize:26,fontWeight:800,color:"white",margin:"0 0 8px",letterSpacing:"-0.02em" }}>Platform Overview</h2>
            <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(255,255,255,0.5)",margin:0 }}>
              {data.users.length + data.projects.length + pendingInvestments} items require your attention today.
            </p>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={() => navigate("/admin/dashboard/users")} style={{ padding:"10px 20px",borderRadius:12,background:"rgba(124,58,237,0.25)",border:"1px solid rgba(124,58,237,0.4)",color:"#C4B5FD",fontFamily:F.jakarta,fontWeight:700,fontSize:13,cursor:"pointer" }}>
              Review Users
            </button>
            <button onClick={() => navigate("/admin/dashboard/escrows")} style={{ padding:"10px 20px",borderRadius:12,background:"#7C3AED",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:13,cursor:"pointer" }}>
              Manage Escrows
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16 }}>
        {stats.map((s,i) => (
          <div key={i} onClick={() => navigate(`/admin/dashboard/${s.path}`)} style={{ ...card,cursor:"pointer",transition:"all 0.3s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.1)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 16px rgba(0,0,0,0.06)";}}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
              <div style={{ width:44,height:44,borderRadius:12,background:s.iconBg,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <s.Icon size={20} color={s.iconColor} />
              </div>
              <span style={{ padding:"3px 10px",borderRadius:100,background:"#FEF3C7",color:"#D97706",fontFamily:F.jakarta,fontSize:11,fontWeight:700 }}>{s.tag}</span>
            </div>
            <div style={{ fontFamily:F.jakarta,fontSize:32,fontWeight:800,color:"#0D0621",marginBottom:4,letterSpacing:"-0.02em" }}>{s.value}</div>
            <div style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>

        {/* Pending Users */}
        <div style={{ ...card,padding:0 }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Pending User Verifications</span>
            <button onClick={() => navigate("/admin/dashboard/users")} style={{ padding:"6px 14px",borderRadius:9,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>View All</button>
          </div>
          {data.users.length === 0 ? (
            <div style={{ padding:"48px 20px",textAlign:"center" }}>
              <CheckCircle size={40} color="#D1FAE5" style={{ margin:"0 auto 12px" }} />
              <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>All caught up! No pending verifications.</p>
            </div>
          ) : data.users.slice(0,4).map((u,i) => (
            <div key={i} style={{ padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:F.jakarta,fontWeight:800,fontSize:14,flexShrink:0 }}>
                {(u.name||u.fullName||"U")[0].toUpperCase()}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:600,color:"#0D0621",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.name||u.fullName||"User"}</div>
                <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)" }}>{u.email} · {u.userType}</div>
              </div>
              <span style={{ padding:"2px 8px",borderRadius:100,background:"#FEF3C7",color:"#D97706",fontFamily:F.jakarta,fontSize:10,fontWeight:700,flexShrink:0 }}>Pending</span>
            </div>
          ))}
        </div>

        {/* Pending Projects */}
        <div style={{ ...card,padding:0 }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Pending Project Approvals</span>
            <button onClick={() => navigate("/admin/dashboard/projects")} style={{ padding:"6px 14px",borderRadius:9,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>View All</button>
          </div>
          {data.projects.length === 0 ? (
            <div style={{ padding:"48px 20px",textAlign:"center" }}>
              <CheckCircle size={40} color="#D1FAE5" style={{ margin:"0 auto 12px" }} />
              <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>All caught up! No pending projects.</p>
            </div>
          ) : data.projects.slice(0,4).map((p,i) => (
            <div key={i} style={{ padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <FolderOpen size={16} color="#7C3AED" />
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:600,color:"#0D0621",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.title}</div>
                <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)" }}>{p.category} · ${(p.targetAmount||0).toLocaleString()}</div>
              </div>
              <span style={{ padding:"2px 8px",borderRadius:100,background:"#DBEAFE",color:"#2563EB",fontFamily:F.jakarta,fontSize:10,fontWeight:700,flexShrink:0 }}>Review</span>
            </div>
          ))}
        </div>
      </div>

      {/* Escrow Summary */}
      <div style={{ ...card,padding:0 }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Recent Escrow Activity</span>
          <button onClick={() => navigate("/admin/dashboard/escrows")} style={{ padding:"6px 14px",borderRadius:9,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>Manage All</button>
        </div>
        {data.escrows.length === 0 ? (
          <div style={{ padding:"48px 20px",textAlign:"center" }}>
            <Lock size={40} color="#DDD6FE" style={{ margin:"0 auto 12px" }} />
            <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>No escrows yet.</p>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",padding:"0" }}>
            {["escrowId","Amount","Status","Creator Signed","Investor Signed"].map(h=>(
              <div key={h} style={{ padding:"10px 20px",background:"#FAFAFF",fontFamily:F.jakarta,fontSize:11,fontWeight:700,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</div>
            ))}
            {data.escrows.slice(0,5).map((e,i) => {
              const statusColor = e.status==="released" ? {bg:"#D1FAE5",c:"#059669"} : e.status==="validated" ? {bg:"#DBEAFE",c:"#2563EB"} : {bg:"#FEF3C7",c:"#D97706"};
              return [
                <div key={`id-${i}`} style={{ padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)" }}>{(e._id||"").slice(-8)}…</div>,
                <div key={`amt-${i}`} style={{ padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621" }}>${(e.amount||0).toLocaleString()}</div>,
                <div key={`st-${i}`} style={{ padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)" }}><span style={{ padding:"3px 10px",borderRadius:100,background:statusColor.bg,color:statusColor.c,fontFamily:F.jakarta,fontSize:11,fontWeight:700 }}>{e.status}</span></div>,
                <div key={`cs-${i}`} style={{ padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",display:"flex",alignItems:"center" }}>{e.agreement?.creatorSigned ? <CheckCircle size={16} color="#059669" /> : <Clock size={16} color="#D97706" />}</div>,
                <div key={`is-${i}`} style={{ padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",display:"flex",alignItems:"center" }}>{e.agreement?.investorSigned ? <CheckCircle size={16} color="#059669" /> : <Clock size={16} color="#D97706" />}</div>,
              ];
            })}
          </div>
        )}
      </div>
    </div>
  );
}