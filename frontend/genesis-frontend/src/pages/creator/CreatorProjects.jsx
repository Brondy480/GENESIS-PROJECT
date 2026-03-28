import { useState, useEffect, useRef } from "react";
import { getPublicProjects, createProject } from "../../api/creator";
import useAuthStore from "../../store/authStore";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };
const CATS = ["technology","energy","health","agritech","fintech","education","other"];

const inp = (err) => ({
  width:"100%",background:err?"#FEF2F2":"white",border:`1.5px solid ${err?"#EF4444":"rgba(124,58,237,0.15)"}`,
  borderRadius:12,padding:"12px 16px",fontSize:14,fontFamily:F.dm,color:"#0D0621",outline:"none",
});

export default function CreatorProjects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [form, setForm] = useState({ title:"",description:"",category:"technology",targetAmount:"",deadline:"",valuation:"",equityAvailable:"",allowInvestment:true,allowFunding:true,tags:"" });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await getPublicProjects({ creator: user?._id });
      const all = res.data?.projects || res.data?.data || [];
      setProjects(all.filter(p => p.creator===user?._id || p.creator?._id===user?._id));
    } catch { setProjects([]); } finally { setLoading(false); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setCoverFile(f); setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverFile) { setError("Cover image is required"); return; }
    setSubmitting(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      fd.append("coverImage", coverFile);
      await createProject(fd);
      setShowForm(false);
      setForm({ title:"",description:"",category:"technology",targetAmount:"",deadline:"",valuation:"",equityAvailable:"",allowInvestment:true,allowFunding:true,tags:"" });
      setCoverFile(null); setPreview(null);
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message||"Failed to create project"); }
    finally { setSubmitting(false); }
  };

  const statusStyle = (approval) => {
    if (approval==="approved") return { bg:"#D1FAE5",color:"#059669" };
    if (approval==="rejected") return { bg:"#FEE2E2",color:"#DC2626" };
    return { bg:"#FEF3C7",color:"#D97706" };
  };

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>My Projects</h2>
          <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>{projects.length} project{projects.length!==1?"s":""}</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(""); }} style={{
          padding:"11px 20px",borderRadius:12,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",
          border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",
        }}>+ New Project</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto" }}>
          <div style={{ background:"white",borderRadius:24,width:"100%",maxWidth:640,boxShadow:"0 40px 100px rgba(0,0,0,0.25)",maxHeight:"90vh",overflow:"auto" }}>
            <div style={{ padding:"20px 24px",borderBottom:"1px solid rgba(124,58,237,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white",zIndex:1 }}>
              <h3 style={{ fontFamily:F.jakarta,fontSize:17,fontWeight:800,color:"#0D0621",margin:0 }}>Create New Project</h3>
              <button onClick={()=>setShowForm(false)} style={{ width:32,height:32,borderRadius:9,background:"#F5F3FF",border:"none",cursor:"pointer",fontSize:16 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding:24, display:"flex",flexDirection:"column",gap:16 }}>
              {error && <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"10px 14px",color:"#DC2626",fontFamily:F.dm,fontSize:14 }}>⚠️ {error}</div>}

              {[
                { label:"Project Title *", key:"title", placeholder:"e.g. SolarGrid Africa", type:"text", required:true },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} required={f.required} placeholder={f.placeholder} type={f.type||"text"} style={inp(false)} />
                </div>
              ))}

              <div>
                <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Description *</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required rows={3} placeholder="Describe your project..." style={{ ...inp(false),resize:"vertical" }} />
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <div>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{ ...inp(false),cursor:"pointer" }}>
                    {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Tags</label>
                  <input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="solar, energy, africa" style={inp(false)} />
                </div>
                <div>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Target Amount ($) *</label>
                  <input type="number" value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})} required min="1" placeholder="500000" style={inp(false)} />
                </div>
                <div>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Deadline *</label>
                  <input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} required min={new Date().toISOString().split("T")[0]} style={inp(false)} />
                </div>
                <div>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Valuation ($)</label>
                  <input type="number" value={form.valuation} onChange={e=>setForm({...form,valuation:e.target.value})} placeholder="2000000" style={inp(false)} />
                </div>
                <div>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Equity Available (%)</label>
                  <input type="number" value={form.equityAvailable} onChange={e=>setForm({...form,equityAvailable:e.target.value})} placeholder="20" min="0" max="100" style={inp(false)} />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display:"flex",gap:24 }}>
                {[{key:"allowInvestment",label:"Allow Equity Investment"},{key:"allowFunding",label:"Allow Direct Funding"}].map(t=>(
                  <label key={t.key} style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }}>
                    <div onClick={()=>setForm({...form,[t.key]:!form[t.key]})} style={{ width:44,height:24,borderRadius:100,background:form[t.key]?"#7C3AED":"#E5E7EB",position:"relative",cursor:"pointer",transition:"all 0.2s" }}>
                      <div style={{ position:"absolute",top:2,width:20,height:20,borderRadius:"50%",background:"white",transition:"all 0.2s",left:form[t.key]?22:2,boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
                    </div>
                    <span style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.65)" }}>{t.label}</span>
                  </label>
                ))}
              </div>

              {/* Cover image */}
              <div>
                <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Cover Image *</label>
                <div onClick={()=>fileRef.current?.click()} style={{ border:"2px dashed rgba(124,58,237,0.25)",borderRadius:14,padding:"24px",textAlign:"center",cursor:"pointer",background:"#FAFAFF",transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#7C3AED";e.currentTarget.style.background="#F5F3FF";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.25)";e.currentTarget.style.background="#FAFAFF";}}>
                  {preview ? <img src={preview} style={{ maxHeight:120,borderRadius:10,objectFit:"cover" }} alt="preview" />
                  : <><div style={{ fontSize:32,marginBottom:8 }}>🖼️</div><p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.5)",margin:0 }}>Click to upload cover image</p></>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
              </div>

              <div style={{ display:"flex",gap:10,paddingTop:4,borderTop:"1px solid rgba(124,58,237,0.08)",marginTop:4 }}>
                <button type="button" onClick={()=>setShowForm(false)} style={{ flex:1,padding:13,borderRadius:12,background:"white",border:"1.5px solid rgba(124,58,237,0.2)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:2,padding:13,borderRadius:12,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:submitting?"not-allowed":"pointer",opacity:submitting?0.7:1 }}>
                  {submitting ? "Submitting..." : "Submit for Approval →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project cards */}
      {loading ? <div style={{ display:"flex",justifyContent:"center",padding:80 }}><div style={{ width:32,height:32,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      : projects.length===0 ? (
        <div style={{ background:"white",borderRadius:24,padding:"80px 40px",textAlign:"center",boxShadow:"0 2px 16px rgba(124,58,237,0.06)" }}>
          <div style={{ fontSize:56,marginBottom:16 }}>🚀</div>
          <h3 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",marginBottom:8 }}>No projects yet</h3>
          <p style={{ fontFamily:F.dm,fontSize:14,color:"rgba(13,6,33,0.45)",marginBottom:24 }}>Create your first project to start raising capital</p>
          <button onClick={()=>setShowForm(true)} style={{ padding:"12px 24px",borderRadius:14,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer" }}>+ Create Your First Project</button>
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18 }}>
          {projects.map((p,i) => {
            const ss = statusStyle(p.approvalStatus);
            const pct = Math.min(Math.round(((p.totalFunded||0)/(p.targetAmount||1))*100),100);
            return (
              <div key={i} style={{ background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 2px 16px rgba(124,58,237,0.06)",transition:"all 0.3s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(124,58,237,0.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 16px rgba(124,58,237,0.06)";}}>
                {p.coverImage && (
                  <div style={{ position:"relative",height:140,overflow:"hidden" }}>
                    <img src={p.coverImage} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />
                    <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,6,33,0.4),transparent)" }} />
                    <span style={{ position:"absolute",top:12,right:12,padding:"3px 10px",borderRadius:100,background:ss.bg,color:ss.color,fontFamily:F.jakarta,fontSize:10,fontWeight:700 }}>{p.approvalStatus}</span>
                  </div>
                )}
                <div style={{ padding:18 }}>
                  <h3 style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621",marginBottom:6 }}>{p.title}</h3>
                  <p style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)",marginBottom:14,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{p.description}</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12 }}>
                    {[{l:"Raised",v:`$${(p.totalFunded||0).toLocaleString()}`},{l:"Target",v:`$${(p.targetAmount||0).toLocaleString()}`},{l:"Equity",v:`${p.equityAvailable||0}%`}].map(m=>(
                      <div key={m.l} style={{ background:"#F5F3FF",borderRadius:10,padding:"8px",textAlign:"center" }}>
                        <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:800,color:"#7C3AED" }}>{m.v}</div>
                        <div style={{ fontFamily:F.dm,fontSize:9,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",marginTop:1 }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height:5,background:"#EDE9FE",borderRadius:100,overflow:"hidden",marginBottom:6 }}>
                    <div style={{ height:"100%",background:"linear-gradient(90deg,#7C3AED,#A78BFF)",borderRadius:100,width:`${pct}%` }} />
                  </div>
                  <div style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)",textAlign:"right" }}>{pct}% funded</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}