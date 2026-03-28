import { useState, useEffect } from "react";
import { getMyWallet } from "../../api/creator";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };

export default function CreatorWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyWallet().then(r=>setWallet(r.data?.wallet||r.data)).catch(()=>setWallet(null)).finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>Wallet</h2>
        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>Your earnings and transaction history</p>
      </div>

      {/* Balances */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20 }}>
        {/* Available */}
        <div style={{ background:"linear-gradient(135deg,#7C3AED,#4C1D95)",borderRadius:24,padding:"28px 28px",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.06) 1.5px,transparent 1.5px)",backgroundSize:"28px 28px",pointerEvents:"none" }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
              <div style={{ width:40,height:40,background:"rgba(255,255,255,0.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>💰</div>
              <span style={{ fontFamily:F.dm,fontSize:13,color:"rgba(255,255,255,0.6)" }}>Available Balance</span>
            </div>
            <div style={{ fontFamily:F.jakarta,fontSize:38,fontWeight:800,color:"white",letterSpacing:"-0.02em",marginBottom:6 }}>
              ${loading?"—":(wallet?.balance||0).toLocaleString()}
            </div>
            <div style={{ fontFamily:F.dm,fontSize:12,color:"rgba(255,255,255,0.4)" }}>Ready for withdrawal</div>
          </div>
        </div>

        {/* Escrow */}
        <div style={{ background:"white",borderRadius:24,padding:"28px 28px",boxShadow:"0 2px 16px rgba(124,58,237,0.06)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
            <div style={{ width:40,height:40,background:"#EDE9FE",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🔐</div>
            <span style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.5)" }}>Escrow Balance</span>
          </div>
          <div style={{ fontFamily:F.jakarta,fontSize:38,fontWeight:800,color:"#7C3AED",letterSpacing:"-0.02em",marginBottom:6 }}>
            ${loading?"—":(wallet?.escrowBalance||0).toLocaleString()}
          </div>
          <div style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.4)" }}>Held in active escrows</div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(124,58,237,0.06)",overflow:"hidden" }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(124,58,237,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Transaction History</span>
          <span style={{ padding:"3px 10px",borderRadius:100,background:"#F3F4F6",color:"#6B7280",fontFamily:F.jakarta,fontSize:11,fontWeight:700 }}>{wallet?.transactions?.length||0} transactions</span>
        </div>

        {loading ? <div style={{ display:"flex",justifyContent:"center",padding:60 }}><div style={{ width:28,height:28,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
        : !wallet?.transactions?.length ? (
          <div style={{ padding:"60px 20px",textAlign:"center" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>💳</div>
            <div style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621",marginBottom:6 }}>No transactions yet</div>
            <div style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>Transactions appear after escrow is released</div>
          </div>
        ) : wallet.transactions.map((t,i) => (
          <div key={i} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:"1px solid rgba(124,58,237,0.05)",transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#FAFAFF"}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            <div style={{ width:40,height:40,borderRadius:12,background:t.type==="credit"?"#D1FAE5":"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:t.type==="credit"?"#059669":"#DC2626",fontFamily:F.jakarta,flexShrink:0 }}>
              {t.type==="credit"?"↑":"↓"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:600,color:"#0D0621" }}>{t.description||"Transaction"}</div>
              <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)",marginTop:2 }}>
                {new Date(t.createdAt||Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
              </div>
            </div>
            <span style={{ padding:"3px 10px",borderRadius:100,background:t.type==="credit"?"#D1FAE5":"#FEE2E2",color:t.type==="credit"?"#059669":"#DC2626",fontFamily:F.jakarta,fontSize:10,fontWeight:700 }}>{t.type}</span>
            <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:800,color:t.type==="credit"?"#059669":"#DC2626" }}>
              {t.type==="credit"?"+":"−"}${(t.amount||0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}