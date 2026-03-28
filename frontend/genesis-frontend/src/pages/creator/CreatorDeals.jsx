import { useState, useEffect } from "react";
import { getMyDeals } from "../../api/creator";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };
const STATUS = { created:{l:"Created",bg:"#F3F4F6",c:"#6B7280"}, awaiting_payment:{l:"Awaiting Payment",bg:"#FEF3C7",c:"#D97706"}, payment_completed:{l:"Payment Done",bg:"#DBEAFE",c:"#2563EB"}, awaiting_signatures:{l:"Awaiting Signatures",bg:"#EDE9FE",c:"#7C3AED"}, active:{l:"Active ✓",bg:"#D1FAE5",c:"#059669"}, cancelled:{l:"Cancelled",bg:"#FEE2E2",c:"#DC2626"} };

export default function CreatorDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMyDeals().then(r=>setDeals(r.data?.deals||r.data||[])).catch(()=>setDeals([])).finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>My Deals</h2>
        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>{deals.length} deal{deals.length!==1?"s":""}</p>
      </div>

      {loading ? <div style={{ display:"flex",justifyContent:"center",padding:80 }}><div style={{ width:28,height:28,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      : deals.length===0 ? (
        <div style={{ background:"white",borderRadius:24,padding:"80px 40px",textAlign:"center",boxShadow:"0 2px 16px rgba(124,58,237,0.06)" }}>
          <div style={{ fontSize:56,marginBottom:16 }}>🤝</div>
          <h3 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",marginBottom:8 }}>No deals yet</h3>
          <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.45)" }}>Deals are created when you accept an investment request.</p>
        </div>
      ) : (
        <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(124,58,237,0.06)",overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"12px 20px",background:"#FAFAFF",borderBottom:"1px solid rgba(124,58,237,0.08)" }}>
            {["Investor","Amount","Equity","Status","Action"].map(h=>(
              <span key={h} style={{ fontFamily:F.jakarta,fontSize:11,fontWeight:700,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</span>
            ))}
          </div>
          {deals.map((d,i) => {
            const s = STATUS[d.dealStatus]||{l:d.dealStatus,bg:"#F3F4F6",c:"#6B7280"};
            return (
              <div key={i} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid rgba(124,58,237,0.05)",transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#FAFAFF"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:F.jakarta,fontWeight:800,fontSize:14,flexShrink:0 }}>
                    {(d.investor?.name||"I")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:600,color:"#0D0621" }}>{d.investor?.name||"Investor"}</div>
                    <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)" }}>{d.project?.title||"Project"}</div>
                  </div>
                </div>
                <span style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621" }}>${(d.amount||0).toLocaleString()}</span>
                <span style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#7C3AED" }}>{d.equity}%</span>
                <span style={{ padding:"3px 10px",borderRadius:100,background:s.bg,color:s.c,fontFamily:F.jakarta,fontSize:10,fontWeight:700,width:"fit-content" }}>{s.l}</span>
                <button onClick={()=>setSelected(d)} style={{ padding:"7px 14px",borderRadius:9,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer",width:"fit-content" }}>Details</button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"white",borderRadius:24,width:"100%",maxWidth:520,boxShadow:"0 40px 100px rgba(0,0,0,0.3)" }}>
            <div style={{ padding:"18px 22px",borderBottom:"1px solid rgba(124,58,237,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <h3 style={{ fontFamily:F.jakarta,fontSize:17,fontWeight:800,color:"#0D0621",margin:0 }}>Deal Details</h3>
              <button onClick={()=>setSelected(null)} style={{ width:30,height:30,borderRadius:8,background:"#F5F3FF",border:"none",cursor:"pointer",fontSize:14 }}>✕</button>
            </div>
            <div style={{ padding:22 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18 }}>
                {[{l:"Amount",v:`$${(selected.amount||0).toLocaleString()}`},{l:"Equity",v:`${selected.equity}%`},{l:"Status",v:(STATUS[selected.dealStatus]?.l||selected.dealStatus)},{l:"Platform Fee",v:`${selected.platformFeePercent||5}%`},{l:"You Receive",v:`$${Math.round((selected.amount||0)*(1-(selected.platformFeePercent||5)/100)).toLocaleString()}`},{l:"Reference",v:selected.paymentReference?selected.paymentReference.slice(0,14)+"…":"—"}].map(m=>(
                  <div key={m.l} style={{ background:"#F5F3FF",borderRadius:12,padding:"12px 14px" }}>
                    <div style={{ fontFamily:F.dm,fontSize:10,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{m.l}</div>
                    <div style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#7C3AED" }}>{m.v}</div>
                  </div>
                ))}
              </div>
              {selected.escrow && <div style={{ background:"#EDE9FE",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}><span style={{ fontSize:22 }}>🔐</span><div><div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#7C3AED" }}>Escrow Active</div><div style={{ fontFamily:F.dm,fontSize:12,color:"rgba(124,58,237,0.7)" }}>Funds secured — pending signatures & admin validation</div></div></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}