import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCreatorDashboard } from "../../api/creator";
import useAuthStore from "../../store/authStore";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };
const card = { background:"white", borderRadius:20, boxShadow:"0 2px 16px rgba(124,58,237,0.06)", padding:24 };

const MOCK = {
  totalFundsRaised:480000, totalProjects:3, activeDeals:2, pendingRequests:4, walletBalance:9500,
  recentProjects:[
    { _id:"1", title:"SolarGrid Africa", approvalStatus:"approved", totalFunded:480000, targetAmount:500000 },
    { _id:"2", title:"CleanWater Initiative", approvalStatus:"pending", totalFunded:0, targetAmount:200000 },
  ],
  recentRequests:[
    { _id:"1", investor:{name:"James Okafor"}, amount:50000, equityRequested:10 },
    { _id:"2", investor:{name:"Aisha Kamara"}, amount:30000, equityRequested:8 },
  ],
};

export default function CreatorHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreatorDashboard().then(r=>setData(r.data)).catch(()=>setData(MOCK)).finally(()=>setLoading(false));
  }, []);

  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:400 }}>
      <div style={{ width:32,height:32,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const stats = [
    { label:"Total Raised",     value:`$${(data?.totalFundsRaised||0).toLocaleString()}`, icon:"💰", tag:"+12%",  tagBg:"#D1FAE5", tagColor:"#059669" },
    { label:"Active Projects",  value:data?.totalProjects||0,                              icon:"🚀", tag:"+1",    tagBg:"#D1FAE5", tagColor:"#059669" },
    { label:"Active Deals",     value:data?.activeDeals||0,                               icon:"🤝", tag:"Live",  tagBg:"#DBEAFE", tagColor:"#2563EB" },
    { label:"Pending Requests", value:data?.pendingRequests||0,                           icon:"📥", tag:"Review",tagBg:"#FEF3C7", tagColor:"#D97706" },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>

      {/* Welcome banner */}
      <div style={{ background:"linear-gradient(135deg,#7C3AED,#4C1D95)",borderRadius:24,padding:"28px 32px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.06) 1.5px,transparent 1.5px)",backgroundSize:"28px 28px",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"-20%",right:"-5%",width:260,height:260,background:"radial-gradient(circle,rgba(196,181,253,0.2),transparent 65%)",pointerEvents:"none" }} />
        <div style={{ position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16 }}>
          <div>
            <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(255,255,255,0.6)",margin:"0 0 4px" }}>Good {greeting} 👋</p>
            <h2 style={{ fontFamily:F.jakarta,fontSize:28,fontWeight:800,color:"white",margin:"0 0 8px",letterSpacing:"-0.02em" }}>
              {user?.name?.split(" ")[0] || "Creator"}
            </h2>
            <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(255,255,255,0.55)",margin:0 }}>
              You have <strong style={{ color:"#C4B5FD" }}>{data?.pendingRequests||0} investment requests</strong> waiting for review.
            </p>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={() => navigate("/creator/dashboard/projects")} style={{
              padding:"10px 20px",borderRadius:12,background:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,0.2)",color:"white",fontFamily:F.jakarta,
              fontWeight:700,fontSize:13,cursor:"pointer",backdropFilter:"blur(8px)",
            }}>+ New Project</button>
            <button onClick={() => navigate("/creator/dashboard/requests")} style={{
              padding:"10px 20px",borderRadius:12,background:"white",border:"none",
              color:"#7C3AED",fontFamily:F.jakarta,fontWeight:700,fontSize:13,cursor:"pointer",
            }}>Review Requests</button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16 }}>
        {stats.map((s,i) => (
          <div key={i} style={{ ...card, transition:"all 0.3s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(124,58,237,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 16px rgba(124,58,237,0.06)";}}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
              <div style={{ width:44,height:44,borderRadius:12,background:"#F5F3FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{s.icon}</div>
              <span style={{ padding:"3px 10px",borderRadius:100,background:s.tagBg,color:s.tagColor,fontFamily:F.jakarta,fontSize:11,fontWeight:700 }}>{s.tag}</span>
            </div>
            <div style={{ fontFamily:F.jakarta,fontSize:28,fontWeight:800,color:"#7C3AED",marginBottom:4,letterSpacing:"-0.02em" }}>{s.value}</div>
            <div style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display:"grid",gridTemplateColumns:"3fr 2fr",gap:16 }}>

        {/* Recent projects */}
        <div style={{ ...card, padding:0 }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(124,58,237,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>My Projects</span>
            <button onClick={() => navigate("/creator/dashboard/projects")} style={{ padding:"6px 14px",borderRadius:9,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>View All</button>
          </div>
          {(data?.recentProjects||[]).length === 0 ? (
            <div style={{ padding:"48px 20px",textAlign:"center" }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🚀</div>
              <p style={{ fontFamily:F.jakarta,fontWeight:700,color:"#0D0621",marginBottom:6 }}>No projects yet</p>
              <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>Create your first project to start raising</p>
            </div>
          ) : (data?.recentProjects||[]).map((p,i) => {
            const pct = Math.round(((p.totalFunded||0)/(p.targetAmount||1))*100);
            const statusColor = p.approvalStatus==="approved" ? {bg:"#D1FAE5",color:"#059669"} : p.approvalStatus==="rejected" ? {bg:"#FEE2E2",color:"#DC2626"} : {bg:"#FEF3C7",color:"#D97706"};
            return (
              <div key={i} style={{ padding:"14px 20px",borderBottom:"1px solid rgba(124,58,237,0.05)",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#EDE9FE,#DDD6FE)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🚀</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                    <span style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:600,color:"#0D0621",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.title}</span>
                    <span style={{ padding:"2px 9px",borderRadius:100,background:statusColor.bg,color:statusColor.color,fontFamily:F.jakarta,fontSize:10,fontWeight:700,flexShrink:0,marginLeft:8 }}>{p.approvalStatus}</span>
                  </div>
                  <div style={{ height:5,background:"#EDE9FE",borderRadius:100,overflow:"hidden",marginBottom:4 }}>
                    <div style={{ height:"100%",background:"linear-gradient(90deg,#7C3AED,#A78BFF)",borderRadius:100,width:`${Math.min(pct,100)}%` }} />
                  </div>
                  <span style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)" }}>${(p.totalFunded||0).toLocaleString()} raised · {pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent requests */}
        <div style={{ ...card, padding:0 }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(124,58,237,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Investment Requests</span>
            <button onClick={() => navigate("/creator/dashboard/requests")} style={{ padding:"6px 14px",borderRadius:9,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>View All</button>
          </div>
          {(data?.recentRequests||[]).length === 0 ? (
            <div style={{ padding:"48px 20px",textAlign:"center" }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📥</div>
              <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>No requests yet</p>
            </div>
          ) : (data?.recentRequests||[]).map((r,i) => (
            <div key={i} style={{ padding:"14px 20px",borderBottom:"1px solid rgba(124,58,237,0.05)" }}>
              <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:F.jakarta,fontWeight:800,fontSize:14,flexShrink:0 }}>
                  {r.investor?.name?.[0]||"I"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621",marginBottom:3 }}>{r.investor?.name}</div>
                  <div style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)",marginBottom:8 }}>${(r.amount||0).toLocaleString()} · {r.equityRequested}% equity</div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={() => navigate("/creator/dashboard/requests")} style={{ padding:"5px 12px",borderRadius:8,background:"#D1FAE5",border:"none",color:"#059669",fontFamily:F.jakarta,fontWeight:700,fontSize:11,cursor:"pointer" }}>Accept</button>
                    <button onClick={() => navigate("/creator/dashboard/requests")} style={{ padding:"5px 12px",borderRadius:8,background:"#FEE2E2",border:"none",color:"#DC2626",fontFamily:F.jakarta,fontWeight:700,fontSize:11,cursor:"pointer" }}>Decline</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
        {[
          { icon:"🚀", label:"Post New Project",  desc:"Start raising capital",          bg:"#EDE9FE", color:"#7C3AED", action:()=>navigate("/creator/dashboard/projects") },
          { icon:"📥", label:"Review Requests",   desc:`${data?.pendingRequests||0} pending`, bg:"#FEF3C7", color:"#D97706", action:()=>navigate("/creator/dashboard/requests") },
          { icon:"📋", label:"Sign Agreements",   desc:"Complete your deals",             bg:"#DBEAFE", color:"#2563EB", action:()=>navigate("/creator/dashboard/agreements") },
          { icon:"💰", label:"View Wallet",        desc:`$${(data?.walletBalance||0).toLocaleString()} balance`, bg:"#D1FAE5", color:"#059669", action:()=>navigate("/creator/dashboard/wallet") },
        ].map((a,i) => (
          <button key={i} onClick={a.action} style={{
            ...card, display:"flex", alignItems:"center", gap:14,
            border:"none", cursor:"pointer", textAlign:"left",
            transition:"all 0.3s", padding:"18px 20px",
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(124,58,237,0.12)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 16px rgba(124,58,237,0.06)";}}>
            <div style={{ width:44,height:44,borderRadius:12,background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{a.icon}</div>
            <div>
              <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621",marginBottom:2 }}>{a.label}</div>
              <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.45)" }}>{a.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}