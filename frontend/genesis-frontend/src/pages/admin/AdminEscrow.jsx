import { useState, useEffect } from "react";
import { CheckCircle, Clock, Lock, X, FileText } from "lucide-react";
import { getAllEscrows, validateEscrow, releaseEscrow } from "../../api/admin";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };

export default function AdminEscrows() {
  const [escrows, setEscrows]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [msg, setMsg] = useState({ text:"", type:"" });
  const [filter, setFilter]     = useState("all");

  useEffect(() => { fetchEscrows(); }, []);

  const fetchEscrows = async () => {
    try {
      const r = await getAllEscrows();
      setEscrows(r.data?.escrows||r.data||[]);
    } catch { setEscrows([]); } finally { setLoading(false); }
  };

  const notify = (text, type="success") => { setMsg({text,type}); setTimeout(()=>setMsg({text:"",type:""}),3000); };

  const handle = async (action, id) => {
    setActionLoading(action+id);
    try {
      if (action==="validate") await validateEscrow(id);
      if (action==="release")  await releaseEscrow(id);
      notify(`Escrow ${action}d successfully.`);
      setSelected(null);
      fetchEscrows();
    } catch(e) { notify(e.response?.data?.message||"Action failed","error"); }
    finally { setActionLoading(""); }
  };

  const statusStyle = s => {
    if (s==="released") return {bg:"#D1FAE5",c:"#059669",label:"Released"};
    if (s==="validated") return {bg:"#DBEAFE",c:"#2563EB",label:"Validated"};
    if (s==="awaiting_validation") return {bg:"#EDE9FE",c:"#7C3AED",label:"Awaiting Validation"};
    if (s==="awaiting_signatures") return {bg:"#FEF3C7",c:"#D97706",label:"Awaiting Signatures"};
    return {bg:"#F3F4F6",c:"#6B7280",label:s};
  };

  const filtered = escrows.filter(e => {
    if (filter==="pending")   return e.status==="awaiting_validation"||e.status==="awaiting_signatures";
    if (filter==="validated") return e.status==="validated";
    if (filter==="released")  return e.status==="released";
    return true;
  });

  const canValidate = e => e.status==="awaiting_validation" && e.agreement?.creatorSigned && e.agreement?.investorSigned;
  const canRelease  = e => e.status==="validated";

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>Escrow Management</h2>
        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>{escrows.length} escrow{escrows.length!==1?"s":""} total</p>
      </div>

      {msg.text && <div style={{ background:msg.type==="error"?"#FEF2F2":"#ECFDF5",border:`1px solid ${msg.type==="error"?"#FECACA":"#A7F3D0"}`,borderRadius:12,padding:"12px 16px",marginBottom:16,fontFamily:F.dm,fontSize:14,color:msg.type==="error"?"#DC2626":"#059669" }}>{msg.text}</div>}

      {/* Filter tabs */}
      <div style={{ display:"flex",gap:4,background:"white",borderRadius:14,padding:6,width:"fit-content",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:20 }}>
        {["all","pending","validated","released"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:F.jakarta,fontSize:12,fontWeight:700,background:filter===f?"#7C3AED":"transparent",color:filter===f?"white":"rgba(13,6,33,0.5)",transition:"all 0.2s" }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={{ display:"flex",justifyContent:"center",padding:80 }}><div style={{ width:28,height:28,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      : filtered.length===0 ? (
        <div style={{ background:"white",borderRadius:24,padding:"80px 40px",textAlign:"center",boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <Lock size={56} color="#DDD6FE" style={{ margin:"0 auto 16px",display:"block" }} />
          <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.45)" }}>No escrows in this category.</p>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {filtered.map((e,i) => {
            const ss = statusStyle(e.status);
            const creatorSigned  = e.agreement?.creatorSigned;
            const investorSigned = e.agreement?.investorSigned;
            const validate = canValidate(e);
            const release  = canRelease(e);
            return (
              <div key={i} style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(0,0,0,0.06)",padding:"20px 24px",display:"flex",alignItems:"center",gap:16,transition:"all 0.3s" }}
                onMouseEnter={e2=>{e2.currentTarget.style.transform="translateY(-2px)";e2.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.1)";}}
                onMouseLeave={e2=>{e2.currentTarget.style.transform="none";e2.currentTarget.style.boxShadow="0 2px 16px rgba(0,0,0,0.06)";}}>
                {/* Icon */}
                <div style={{ width:50,height:50,borderRadius:14,background:e.status==="released"?"#D1FAE5":e.status==="validated"?"#DBEAFE":"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <Lock size={22} color={e.status==="released"?"#059669":e.status==="validated"?"#2563EB":"#7C3AED"} />
                </div>

                {/* Info */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
                    <span style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621" }}>Escrow #{(e._id||"").slice(-8)}</span>
                    <span style={{ padding:"2px 9px",borderRadius:100,background:ss.bg,color:ss.c,fontFamily:F.jakarta,fontSize:11,fontWeight:700 }}>{ss.label}</span>
                  </div>
                  <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
                    <span style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)" }}>Amount: <strong style={{ color:"#0D0621" }}>${(e.amount||0).toLocaleString()}</strong></span>
                    <span style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)" }}>Fee: <strong style={{ color:"#0D0621" }}>{e.platformFeePercent||5}%</strong></span>
                    <span style={{ fontFamily:F.dm,fontSize:12,display:"flex",alignItems:"center",gap:4 }}>
                      {creatorSigned ? <CheckCircle size={12} color="#059669" /> : <Clock size={12} color="#D97706" />}
                      <span style={{ color:"rgba(13,6,33,0.5)" }}>Creator signed</span>
                    </span>
                    <span style={{ fontFamily:F.dm,fontSize:12,display:"flex",alignItems:"center",gap:4 }}>
                      {investorSigned ? <CheckCircle size={12} color="#059669" /> : <Clock size={12} color="#D97706" />}
                      <span style={{ color:"rgba(13,6,33,0.5)" }}>Investor signed</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex",gap:8,flexShrink:0 }}>
                  <button onClick={()=>setSelected(e)} style={{ padding:"8px 16px",borderRadius:10,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                    <FileText size={13} />Details
                  </button>
                  {validate && (
                    <button onClick={()=>handle("validate",e._id)} disabled={!!actionLoading} style={{ padding:"8px 16px",borderRadius:10,background:"#EDE9FE",border:"none",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:!!actionLoading?0.6:1 }}>
                      <CheckCircle size={13} />Validate
                    </button>
                  )}
                  {release && (
                    <button onClick={()=>handle("release",e._id)} disabled={!!actionLoading} style={{ padding:"8px 16px",borderRadius:10,background:"linear-gradient(135deg,#059669,#047857)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:!!actionLoading?0.6:1 }}>
                      <CheckCircle size={13} />Release Funds
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"white",borderRadius:24,width:"100%",maxWidth:520,boxShadow:"0 40px 100px rgba(0,0,0,0.3)" }}>
            <div style={{ padding:"18px 22px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <h3 style={{ fontFamily:F.jakarta,fontSize:17,fontWeight:800,color:"#0D0621",margin:0 }}>Escrow Details</h3>
              <button onClick={()=>setSelected(null)} style={{ width:30,height:30,borderRadius:8,background:"#F5F3FF",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={14} /></button>
            </div>
            <div style={{ padding:22 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
                {[
                  {l:"Escrow ID",v:(selected._id||"").slice(-12)},
                  {l:"Amount",v:`$${(selected.amount||0).toLocaleString()}`},
                  {l:"Platform Fee",v:`${selected.platformFeePercent||5}%`},
                  {l:"Creator Receives",v:`$${Math.round((selected.amount||0)*(1-(selected.platformFeePercent||5)/100)).toLocaleString()}`},
                  {l:"Status",v:statusStyle(selected.status).label},
                  {l:"Creator Signed",v:selected.agreement?.creatorSigned?"Yes ✓":"Pending"},
                  {l:"Investor Signed",v:selected.agreement?.investorSigned?"Yes ✓":"Pending"},
                  {l:"Payment Ref",v:selected.paymentReference?selected.paymentReference.slice(0,16)+"…":"—"},
                ].map(m=>(
                  <div key={m.l} style={{ background:"#F5F3FF",borderRadius:12,padding:"12px 14px" }}>
                    <div style={{ fontFamily:F.dm,fontSize:10,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{m.l}</div>
                    <div style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:600,color:"#0D0621" }}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",gap:10 }}>
                {canValidate(selected) && (
                  <button onClick={()=>handle("validate",selected._id)} disabled={!!actionLoading} style={{ flex:1,padding:13,borderRadius:12,background:"#EDE9FE",border:"none",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    <CheckCircle size={16} />{actionLoading?"Working...":"Validate Agreement"}
                  </button>
                )}
                {canRelease(selected) && (
                  <button onClick={()=>handle("release",selected._id)} disabled={!!actionLoading} style={{ flex:1,padding:13,borderRadius:12,background:"linear-gradient(135deg,#059669,#047857)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    <CheckCircle size={16} />{actionLoading?"Working...":"Release Funds →"}
                  </button>
                )}
                {!canValidate(selected) && !canRelease(selected) && (
                  <div style={{ flex:1,padding:13,borderRadius:12,background:"#F5F3FF",textAlign:"center",fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.5)" }}>
                    {selected.status==="released" ? "Funds already released." : "Waiting for both parties to sign."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}