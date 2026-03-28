import { useState } from "react";
import useAuthStore from "../../store/authStore";
import { updateProfile } from "../../api/creator";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };
const inp = { width:"100%",background:"#FAFAFF",border:"1.5px solid rgba(124,58,237,0.12)",borderRadius:12,padding:"12px 16px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:"#0D0621",outline:"none",transition:"all 0.2s" };
const DOCS = [
  { key:"idCard",         label:"National ID / Passport", desc:"Upload a clear photo of your ID",               icon:"🪪" },
  { key:"proofOfAddress", label:"Proof of Address",       desc:"Utility bill or bank statement (last 3 months)", icon:"🏠" },
];

export default function CreatorProfile() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ bio:"", skills:"" });
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleFile = (key, e) => {
    const f = e.target.files[0]; if (!f) return;
    setFiles(p=>({...p,[key]:f}));
    setPreviews(p=>({...p,[key]:URL.createObjectURL(f)}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();
      if (form.bio) fd.append("bio",form.bio);
      if (form.skills) fd.append("skills",form.skills);
      Object.entries(files).forEach(([k,f])=>fd.append(k,f));
      await updateProfile(fd);
      setSuccess("Profile updated successfully!");
    } catch(err) { setError(err.response?.data?.message||"Failed to update profile"); }
    finally { setSubmitting(false); }
  };

  const verStatus = user?.verificationStatus;
  const verStyle = verStatus==="verified" ? {bg:"#ECFDF5",border:"#A7F3D0",icon:"✅",label:"Verified",msg:"Your account is fully verified. You can post projects."}
    : verStatus==="rejected" ? {bg:"#FEF2F2",border:"#FECACA",icon:"❌",label:"Rejected",msg:user?.verificationReason||"Please resubmit your documents."}
    : {bg:"#FFFBEB",border:"#FDE68A",icon:"⏳",label:"Pending Review",msg:"Your documents are being reviewed by our team."};

  return (
    <div style={{ maxWidth:640 }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta,fontSize:20,fontWeight:800,color:"#0D0621",margin:0 }}>My Profile</h2>
        <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",margin:"4px 0 0" }}>Update your profile and verification documents</p>
      </div>

      {/* Verification banner */}
      <div style={{ display:"flex",alignItems:"center",gap:14,borderRadius:16,padding:"14px 18px",border:`1px solid ${verStyle.border}`,background:verStyle.bg,marginBottom:20 }}>
        <span style={{ fontSize:24 }}>{verStyle.icon}</span>
        <div>
          <div style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621",marginBottom:3 }}>Account Status: {verStyle.label}</div>
          <div style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.55)" }}>{verStyle.msg}</div>
        </div>
      </div>

      {success && <div style={{ background:"#ECFDF5",border:"1px solid #A7F3D0",borderRadius:12,padding:"12px 16px",marginBottom:16,fontFamily:F.dm,fontSize:14,color:"#059669" }}>✅ {success}</div>}
      {error && <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"12px 16px",marginBottom:16,fontFamily:F.dm,fontSize:14,color:"#DC2626" }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:16 }}>

        {/* Basic info */}
        <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(124,58,237,0.06)",overflow:"hidden" }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(124,58,237,0.07)" }}>
            <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Basic Info</span>
          </div>
          <div style={{ padding:20,display:"flex",flexDirection:"column",gap:16 }}>
            {/* Avatar */}
            <div style={{ display:"flex",alignItems:"center",gap:18 }}>
              <div onClick={()=>document.getElementById("profileImg").click()} style={{ width:72,height:72,borderRadius:18,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,overflow:"hidden",boxShadow:"0 4px 16px rgba(124,58,237,0.25)" }}>
                {previews.profileImage ? <img src={previews.profileImage} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="profile" />
                : <span style={{ fontFamily:F.jakarta,fontWeight:800,fontSize:28,color:"white" }}>{user?.name?.[0]?.toUpperCase()||"C"}</span>}
              </div>
              <div>
                <div style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621",marginBottom:3 }}>{user?.name}</div>
                <div style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.45)",marginBottom:10 }}>{user?.email}</div>
                <button type="button" onClick={()=>document.getElementById("profileImg").click()} style={{ padding:"6px 14px",borderRadius:9,background:"#F5F3FF",border:"1px solid rgba(124,58,237,0.15)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer" }}>Change Photo</button>
              </div>
              <input id="profileImg" type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile("profileImage",e)} />
            </div>

            <div>
              <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Bio</label>
              <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} placeholder="Tell investors about yourself and your vision..." style={{ ...inp,resize:"vertical" }} />
            </div>

            <div>
              <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Skills</label>
              <input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="e.g. Solar energy, Project management, Finance" style={inp} />
            </div>
          </div>
        </div>

        {/* Verification docs */}
        <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(124,58,237,0.06)",overflow:"hidden" }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(124,58,237,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Verification Documents</span>
            <span style={{ padding:"3px 10px",borderRadius:100,background:"#FEF3C7",color:"#D97706",fontFamily:F.jakarta,fontSize:10,fontWeight:700 }}>Required</span>
          </div>
          <div style={{ padding:20,display:"flex",flexDirection:"column",gap:12 }}>
            {DOCS.map(doc=>(
              <div key={doc.key} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,border:`1px solid ${files[doc.key]?"#A7F3D0":"rgba(124,58,237,0.1)"}`,background:files[doc.key]?"#ECFDF5":"#FAFAFF",transition:"all 0.2s" }}>
                <div style={{ width:44,height:44,borderRadius:12,background:files[doc.key]?"#D1FAE5":"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>
                  {files[doc.key]?"✅":doc.icon}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621",marginBottom:2 }}>{doc.label}</div>
                  <div style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{files[doc.key]?files[doc.key].name:doc.desc}</div>
                </div>
                <button type="button" onClick={()=>document.getElementById(doc.key).click()} style={{ padding:"7px 14px",borderRadius:9,background:"white",border:"1px solid rgba(124,58,237,0.2)",color:"#7C3AED",fontFamily:F.jakarta,fontWeight:600,fontSize:12,cursor:"pointer",flexShrink:0 }}>
                  {files[doc.key]?"Change":"Upload"}
                </button>
                <input id={doc.key} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={e=>handleFile(doc.key,e)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting} style={{ padding:"14px",borderRadius:14,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:15,cursor:submitting?"not-allowed":"pointer",opacity:submitting?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
          {submitting?"Saving...":"Save Profile →"}
        </button>
      </form>
    </div>
  );
}