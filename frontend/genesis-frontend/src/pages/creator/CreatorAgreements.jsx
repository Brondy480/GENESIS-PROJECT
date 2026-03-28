import { useState, useEffect } from "react";
import { getMyDeals, downloadAgreement, creatorSign } from "../../api/creator";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };
const STEPS = [
  { n:"01", icon:"💰", label:"Payment",  desc:"Investor pays into escrow" },
  { n:"02", icon:"📥", label:"Download", desc:"Download agreement PDF" },
  { n:"03", icon:"✍️", label:"Sign",     desc:"Sign the document" },
  { n:"04", icon:"📤", label:"Upload",   desc:"Upload signed copy" },
];

export default function CreatorAgreements() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedEscrow, setSelectedEscrow] = useState(null);

  useEffect(() => { fetchDeals(); }, []);

  const fetchDeals = async () => {
    try {
      const r = await getMyDeals();
      const all = r.data?.deals||r.data||[];
      setDeals(all.filter(d=>d.escrow&&d.dealStatus!=="cancelled"));
    } catch { setDeals([]); } finally { setLoading(false); }
  };

  const download = async (escrowId) => {
    try {
      const r = await downloadAgreement(escrowId);
      const url = r.data?.documentUrl;
      if (url) window.open(url,"_blank");
      else alert("Agreement not available yet");
    } catch { alert("Failed to get download link"); }
  };

  const upload = async () => {
    if (!file||!selectedEscrow) return;
    setUploading(selectedEscrow);
    try {
      const fd = new FormData(); fd.append("agreementDoc",file);
      await creatorSign(selectedEscrow,fd);
      alert("Agreement signed successfully!");
      setFile(null); setSelectedEscrow(null); fetchDeals();
    } catch(e) { alert(e.response?.data?.message||"Failed"); }
    finally { setUploading(null); }
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>Agreement Signing</h2>
        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>Download, sign, and upload your investment agreements</p>
      </div>

      {/* Steps */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{ background:"white",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 12px rgba(124,58,237,0.06)",display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:40,height:40,borderRadius:12,background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:F.jakarta,fontSize:10,fontWeight:700,color:"#A78BFF",letterSpacing:"0.08em",marginBottom:2 }}>STEP {s.n}</div>
              <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621" }}>{s.label}</div>
              <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? <div style={{ display:"flex",justifyContent:"center",padding:80 }}><div style={{ width:28,height:28,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      : deals.length===0 ? (
        <div style={{ background:"white",borderRadius:24,padding:"80px 40px",textAlign:"center",boxShadow:"0 2px 16px rgba(124,58,237,0.06)" }}>
          <div style={{ fontSize:56,marginBottom:16 }}>📋</div>
          <h3 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",marginBottom:8 }}>No agreements yet</h3>
          <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.45)" }}>Agreements appear after an investor pays for their deal.</p>
        </div>
      ) : (
        <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(124,58,237,0.06)",overflow:"hidden" }}>
          {deals.map((d,i)=>{
            const escrow=d.escrow;
            const escrowId=typeof escrow==="object"?escrow._id:escrow;
            const creatorSigned=typeof escrow==="object"?escrow.agreement?.creatorSigned:false;
            const investorSigned=typeof escrow==="object"?escrow.agreement?.investorSigned:false;
            return (
              <div key={i} style={{ padding:"18px 22px",borderBottom:"1px solid rgba(124,58,237,0.06)",display:"flex",alignItems:"center",gap:16 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:creatorSigned?"#D1FAE5":"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>
                  {creatorSigned?"✅":"📋"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621",marginBottom:6 }}>Deal with {d.investor?.name||"Investor"}</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <span style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)" }}>${(d.amount||0).toLocaleString()} · {d.equity}% equity</span>
                    <span style={{ padding:"2px 8px",borderRadius:100,background:investorSigned?"#D1FAE5":"#FEF3C7",color:investorSigned?"#059669":"#D97706",fontFamily:F.jakarta,fontSize:10,fontWeight:700 }}>Investor: {investorSigned?"Signed ✓":"Pending"}</span>
                    <span style={{ padding:"2px 8px",borderRadius:100,background:creatorSigned?"#D1FAE5":"#FEF3C7",color:creatorSigned?"#059669":"#D97706",fontFamily:F.jakarta,fontSize:10,fontWeight:700 }}>You: {creatorSigned?"Signed ✓":"Pending"}</span>
                  </div>
                </div>
                <div style={{ display:"flex",gap:10,flexShrink:0 }}>
                  <button onClick={()=>download(escrowId)} style={{ padding:"8px 16px",borderRadius:10,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>📥 Download</button>
                  {!creatorSigned && <button onClick={()=>setSelectedEscrow(escrowId)} style={{ padding:"8px 16px",borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>📤 Upload Signed</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      {selectedEscrow && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"white",borderRadius:24,padding:32,width:"100%",maxWidth:420,boxShadow:"0 40px 100px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontFamily:F.jakarta,fontSize:18,fontWeight:800,color:"#0D0621",marginBottom:8 }}>Upload Signed Agreement</h3>
            <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.5)",marginBottom:22 }}>Upload your signed copy of the investment agreement</p>
            <div onClick={()=>document.getElementById("signedDocInput").click()} style={{ border:"2px dashed rgba(124,58,237,0.25)",borderRadius:16,padding:"32px",textAlign:"center",cursor:"pointer",background:"#FAFAFF",marginBottom:20,transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#7C3AED";e.currentTarget.style.background="#F5F3FF";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.25)";e.currentTarget.style.background="#FAFAFF";}}>
              {file ? <>
                <div style={{ fontSize:32,marginBottom:8 }}>📄</div>
                <div style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621" }}>{file.name}</div>
                <div style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.4)",marginTop:4 }}>{(file.size/1024).toFixed(0)} KB</div>
              </> : <>
                <div style={{ fontSize:32,marginBottom:8 }}>📤</div>
                <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.5)",margin:0 }}>Click to select your signed document</p>
              </>}
            </div>
            <input id="signedDocInput" type="file" accept=".pdf,image/*" style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])} />
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>{setSelectedEscrow(null);setFile(null);}} style={{ flex:1,padding:13,borderRadius:12,background:"white",border:"1.5px solid rgba(124,58,237,0.2)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer" }}>Cancel</button>
              <button onClick={upload} disabled={!file||!!uploading} style={{ flex:2,padding:13,borderRadius:12,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:!file||!!uploading?"not-allowed":"pointer",opacity:!file||!!uploading?0.6:1 }}>
                {uploading?"Uploading...":"Upload & Sign →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}