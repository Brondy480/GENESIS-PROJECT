import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Pause, Eye, X, Trash2, Play, FileText } from "lucide-react";
import { getPendingProjects, approveProject, rejectProject, suspendProject, deleteProject } from "../../api/admin";
import api from "../../api/axios";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [msg, setMsg] = useState({ text:"", type:"" });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const r = await getPendingProjects();
      setProjects(r.data?.projects||r.data||[]);
    } catch { setProjects([]); } finally { setLoading(false); }
  };

  const notify = (text, type="success") => { setMsg({text,type}); setTimeout(()=>setMsg({text:"",type:""}),3000); };

  const handleViewBusinessPlan = async (projectId) => {
    try {
      const response = await api.get(`/project/${projectId}/business-plan`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (err) {
      console.error("Business plan error:", err);
      alert("Failed to load business plan. Please try again.");
    }
  };

  const handle = async (action, id) => {
    setActionLoading(action+id);
    try {
      if (action==="approve") await approveProject(id);
      if (action==="reject")  await rejectProject(id);
      if (action==="suspend") await suspendProject(id);
      if (action==="delete")  await deleteProject(id);
      notify(`Project ${action}d successfully.`);
      setSelected(null);
      fetchProjects();
    } catch(e) { notify(e.response?.data?.message||"Action failed","error"); }
    finally { setActionLoading(""); }
  };

  const catColor = c => {
    const m = {technology:{bg:"#EDE9FE",c:"#7C3AED"},energy:{bg:"#D1FAE5",c:"#059669"},health:{bg:"#DBEAFE",c:"#2563EB"},agritech:{bg:"#FEF3C7",c:"#D97706"},fintech:{bg:"#FCE7F3",c:"#BE185D"}};
    return m[c?.toLowerCase()]||{bg:"#F3F4F6",c:"#6B7280"};
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>Project Approvals</h2>
        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>{projects.length} project{projects.length!==1?"s":""} pending approval</p>
      </div>

      {msg.text && <div style={{ background:msg.type==="error"?"#FEF2F2":"#ECFDF5",border:`1px solid ${msg.type==="error"?"#FECACA":"#A7F3D0"}`,borderRadius:12,padding:"12px 16px",marginBottom:16,fontFamily:F.dm,fontSize:14,color:msg.type==="error"?"#DC2626":"#059669" }}>{msg.text}</div>}

      {loading ? <div style={{ display:"flex",justifyContent:"center",padding:80 }}><div style={{ width:28,height:28,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      : projects.length===0 ? (
        <div style={{ background:"white",borderRadius:24,padding:"80px 40px",textAlign:"center",boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <CheckCircle size={56} color="#D1FAE5" style={{ margin:"0 auto 16px",display:"block" }} />
          <h3 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",marginBottom:8 }}>All caught up!</h3>
          <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.45)" }}>No projects pending approval.</p>
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18 }}>
          {projects.map((p,i) => {
            const cc = catColor(p.category);
            return (
              <div key={i} style={{ background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.06)",transition:"all 0.3s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 16px rgba(0,0,0,0.06)";}}>
                {p.coverImage && (
                  <div style={{ height:140,overflow:"hidden",position:"relative" }}>
                    <img src={p.coverImage} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />
                    <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,6,33,0.4),transparent)" }} />
                  </div>
                )}
                <div style={{ padding:18 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <h3 style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621",margin:0,flex:1,paddingRight:8 }}>{p.title}</h3>
                    <span style={{ padding:"2px 9px",borderRadius:100,background:cc.bg,color:cc.c,fontFamily:F.jakarta,fontSize:10,fontWeight:700,flexShrink:0 }}>{p.category}</span>
                  </div>
                  <p style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)",marginBottom:14,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{p.description}</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
                    {[{l:"Target",v:`${(p.targetAmount||0).toLocaleString()} FCFA`},{l:"Equity",v:`${p.equityAvailable||0}%`}].map(m=>(
                      <div key={m.l} style={{ background:"#F5F3FF",borderRadius:10,padding:"8px",textAlign:"center" }}>
                        <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:800,color:"#7C3AED" }}>{m.v}</div>
                        <div style={{ fontFamily:F.dm,fontSize:9,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",marginTop:1 }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)",marginBottom:8 }}>
                    By {p.creator?.name||"Creator"} · {new Date(p.createdAt||Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                  </div>
                  {(p.demoVideoUrl || p.businessPlan) && (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                      {p.demoVideoUrl && <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:100,background:"#FEE2E2",color:"#DC2626",fontFamily:F.jakarta,fontSize:10,fontWeight:700 }}><Play size={9} color="#DC2626" />Demo</span>}
                      {p.businessPlan && <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:100,background:"#EDE9FE",color:"#7C3AED",fontFamily:F.jakarta,fontSize:10,fontWeight:700 }}><FileText size={9} color="#7C3AED" />Business Plan</span>}
                    </div>
                  )}
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>setSelected(p)} style={{ width:32,height:32,borderRadius:8,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                      <Eye size={14} color="#7C3AED" />
                    </button>
                    <button onClick={()=>handle("approve",p._id)} disabled={actionLoading!==""} style={{ flex:1,padding:"8px",borderRadius:10,background:"#D1FAE5",border:"none",color:"#059669",fontFamily:F.jakarta,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
                      <CheckCircle size={13} />Approve
                    </button>
                    <button onClick={()=>handle("reject",p._id)} disabled={actionLoading!==""} style={{ flex:1,padding:"8px",borderRadius:10,background:"#FEE2E2",border:"none",color:"#DC2626",fontFamily:F.jakarta,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
                      <XCircle size={13} />Reject
                    </button>
                    <button onClick={()=>{ if(window.confirm("Delete this project permanently?")) handle("delete",p._id); }} disabled={actionLoading!==""} title="Delete" style={{ width:32,height:32,borderRadius:8,background:"#FEE2E2",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                      <Trash2 size={13} color="#DC2626" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"white",borderRadius:24,width:"100%",maxWidth:560,boxShadow:"0 40px 100px rgba(0,0,0,0.3)",overflow:"hidden",maxHeight:"90vh",overflowY:"auto" }}>
            <div style={{ padding:"18px 22px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white",zIndex:1 }}>
              <h3 style={{ fontFamily:F.jakarta,fontSize:17,fontWeight:800,color:"#0D0621",margin:0 }}>Project Review</h3>
              <button onClick={()=>setSelected(null)} style={{ width:30,height:30,borderRadius:8,background:"#F5F3FF",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={14} /></button>
            </div>
            <div style={{ padding:22 }}>
              {selected.coverImage && <img src={selected.coverImage} style={{ width:"100%",height:180,objectFit:"cover",borderRadius:16,marginBottom:18 }} alt="" />}
              <h2 style={{ fontFamily:F.jakarta,fontSize:18,fontWeight:800,color:"#0D0621",marginBottom:8 }}>{selected.title}</h2>
              <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.6)",lineHeight:1.6,marginBottom:18 }}>{selected.description}</p>
              {selected.demoVideoUrl && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Demo Video</div>
                  <a href={selected.demoVideoUrl} target="_blank" rel="noreferrer" style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"#FEE2E2",color:"#DC2626",textDecoration:"none",fontFamily:F.jakarta,fontWeight:600,fontSize:13 }}>
                    <Play size={14} color="#DC2626" />Watch Demo Video
                  </a>
                </div>
              )}
              {selected.businessPlan && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Business Plan</div>
                  <button onClick={()=>handleViewBusinessPlan(selected._id)} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"#EDE9FE",border:"none",cursor:"pointer",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:13,width:"100%" }}>
                    <FileText size={14} color="#7C3AED" />View Business Plan PDF
                  </button>
                </div>
              )}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18 }}>
                {[{l:"Target",v:`${(selected.targetAmount||0).toLocaleString()} FCFA`},{l:"Equity",v:`${selected.equityAvailable||0}%`},{l:"Valuation",v:`${(selected.valuation||0).toLocaleString()} FCFA`}].map(m=>(
                  <div key={m.l} style={{ background:"#F5F3FF",borderRadius:12,padding:"12px",textAlign:"center" }}>
                    <div style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:800,color:"#7C3AED" }}>{m.v}</div>
                    <div style={{ fontFamily:F.dm,fontSize:10,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",marginTop:2 }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button onClick={()=>handle("approve",selected._id)} disabled={actionLoading!==""} style={{ flex:1,padding:13,borderRadius:12,background:"#D1FAE5",border:"none",color:"#059669",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <CheckCircle size={16} />Approve Project
                </button>
                <button onClick={()=>handle("reject",selected._id)} disabled={actionLoading!==""} style={{ flex:1,padding:13,borderRadius:12,background:"#FEE2E2",border:"none",color:"#DC2626",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <XCircle size={16} />Reject Project
                </button>
                <button onClick={()=>handle("suspend",selected._id)} disabled={actionLoading!==""} style={{ padding:13,borderRadius:12,background:"#FEF3C7",border:"none",color:"#D97706",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <Pause size={16} />Suspend
                </button>
                <button onClick={()=>{ if(window.confirm("Delete this project permanently?")) handle("delete",selected._id); }} disabled={actionLoading!==""} style={{ padding:13,borderRadius:12,background:"#FEE2E2",border:"none",color:"#DC2626",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <Trash2 size={16} />Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}