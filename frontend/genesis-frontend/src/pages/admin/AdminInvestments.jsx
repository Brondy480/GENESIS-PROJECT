// ── AdminInvestments ─────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { getInvestmentRequests, approveInvestment, rejectInvestment } from "../../api/admin";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };

export function AdminInvestments() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [msg, setMsg] = useState({ text:"", type:"" });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const r = await getInvestmentRequests();
      setRequests(r.data?.requests||r.data||[]);
    } catch { setRequests([]); } finally { setLoading(false); }
  };

  const notify = (text, type="success") => { setMsg({text,type}); setTimeout(()=>setMsg({text:"",type:""}),3000); };

  const handle = async (action, id) => {
    setActionLoading(action+id);
    try {
      if (action==="approve") await approveInvestment(id);
      if (action==="reject")  await rejectInvestment(id);
      notify(`Investment request ${action}d.`);
      setSelected(null);
      fetchRequests();
    } catch(e) { notify(e.response?.data?.message||"Action failed","error"); }
    finally { setActionLoading(""); }
  };

  const pending   = requests.filter(r=>r.adminStatus==="pending");
  const approved  = requests.filter(r=>r.adminStatus==="approved");
  const rejected  = requests.filter(r=>r.adminStatus==="rejected");

  const statusStyle = s => s==="approved"?{bg:"#D1FAE5",c:"#059669"}:s==="rejected"?{bg:"#FEE2E2",c:"#DC2626"}:{bg:"#FEF3C7",c:"#D97706"};

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>Investment Requests</h2>
        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>{pending.length} pending · {approved.length} approved · {rejected.length} rejected</p>
      </div>

      {msg.text && <div style={{ background:msg.type==="error"?"#FEF2F2":"#ECFDF5",border:`1px solid ${msg.type==="error"?"#FECACA":"#A7F3D0"}`,borderRadius:12,padding:"12px 16px",marginBottom:16,fontFamily:F.dm,fontSize:14,color:msg.type==="error"?"#DC2626":"#059669" }}>{msg.text}</div>}

      {loading ? <div style={{ display:"flex",justifyContent:"center",padding:80 }}><div style={{ width:28,height:28,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      : requests.length===0 ? (
        <div style={{ background:"white",borderRadius:24,padding:"80px 40px",textAlign:"center",boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <CheckCircle size={56} color="#D1FAE5" style={{ margin:"0 auto 16px",display:"block" }} />
          <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.45)" }}>No investment requests yet.</p>
        </div>
      ) : (
        <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(0,0,0,0.06)",overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto",padding:"12px 20px",background:"#FAFAFF",borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
            {["Investor","Project","Amount","Equity","Status","Actions"].map(h=>(
              <span key={h} style={{ fontFamily:F.jakarta,fontSize:11,fontWeight:700,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</span>
            ))}
          </div>
          {requests.map((req,i) => {
            const ss = statusStyle(req.adminStatus);
            return (
              <div key={i} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#FAFAFF"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:F.jakarta,fontWeight:800,fontSize:13,flexShrink:0 }}>
                    {(req.investor?.name||"I")[0].toUpperCase()}
                  </div>
                  <span style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:600,color:"#0D0621" }}>{req.investor?.name||"Investor"}</span>
                </div>
                <span style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.6)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8 }}>{req.project?.title||"Project"}</span>
                <span style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621" }}>{(req.amount||0).toLocaleString()} FCFA</span>
                <span style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#7C3AED" }}>{req.equityRequested}%</span>
                <span style={{ padding:"3px 10px",borderRadius:100,background:ss.bg,color:ss.c,fontFamily:F.jakarta,fontSize:11,fontWeight:700,width:"fit-content" }}>{req.adminStatus}</span>
                <div style={{ display:"flex",gap:6 }}>
                  {req.adminStatus==="pending" && <>
                    <button onClick={()=>handle("approve",req._id)} disabled={!!actionLoading} style={{ width:30,height:30,borderRadius:8,background:"#D1FAE5",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                      <CheckCircle size={14} color="#059669" />
                    </button>
                    <button onClick={()=>handle("reject",req._id)} disabled={!!actionLoading} style={{ width:30,height:30,borderRadius:8,background:"#FEE2E2",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                      <XCircle size={14} color="#DC2626" />
                    </button>
                  </>}
                  <button onClick={()=>setSelected(req)} style={{ width:30,height:30,borderRadius:8,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:F.jakarta,fontSize:11,color:"#7C3AED",fontWeight:700 }}>···</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"white",borderRadius:24,width:"100%",maxWidth:480,boxShadow:"0 40px 100px rgba(0,0,0,0.3)" }}>
            <div style={{ padding:"18px 22px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <h3 style={{ fontFamily:F.jakarta,fontSize:17,fontWeight:800,color:"#0D0621",margin:0 }}>Investment Request Details</h3>
              <button onClick={()=>setSelected(null)} style={{ width:30,height:30,borderRadius:8,background:"#F5F3FF",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={14} /></button>
            </div>
            <div style={{ padding:22 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
                {[{l:"Investor",v:selected.investor?.name||"—"},{l:"Project",v:selected.project?.title||"—"},{l:"Amount",v:`${(selected.amount||0).toLocaleString()} FCFA`},{l:"Equity",v:`${selected.equityRequested}%`},{l:"Admin Status",v:selected.adminStatus||"—"},{l:"Creator Status",v:selected.creatorStatus||"—"}].map(m=>(
                  <div key={m.l} style={{ background:"#F5F3FF",borderRadius:12,padding:"12px 14px" }}>
                    <div style={{ fontFamily:F.dm,fontSize:10,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{m.l}</div>
                    <div style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:600,color:"#0D0621" }}>{m.v}</div>
                  </div>
                ))}
              </div>
              {selected.message && <div style={{ background:"#F5F3FF",borderRadius:12,padding:"12px 14px",marginBottom:18 }}>
                <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>Investor Message</div>
                <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.7)",margin:0,lineHeight:1.5 }}>{selected.message}</p>
              </div>}
              {selected.adminStatus==="pending" && (
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={()=>handle("approve",selected._id)} disabled={!!actionLoading} style={{ flex:1,padding:13,borderRadius:12,background:"#D1FAE5",border:"none",color:"#059669",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    <CheckCircle size={16} />Approve
                  </button>
                  <button onClick={()=>handle("reject",selected._id)} disabled={!!actionLoading} style={{ flex:1,padding:13,borderRadius:12,background:"#FEE2E2",border:"none",color:"#DC2626",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    <XCircle size={16} />Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInvestments;