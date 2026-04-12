import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { getMyProfile, updateProfile } from "../../api/creator";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };
const inp = { width:"100%", background:"#FAFAFF", border:"1.5px solid rgba(124,58,237,0.12)", borderRadius:12, padding:"12px 16px", fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#0D0621", outline:"none", transition:"all 0.2s", boxSizing:"border-box" };
const DOCS = [
  { key:"idCard",         label:"National ID / Passport", desc:"Upload a clear photo of your ID" },
  { key:"proofOfAddress", label:"Proof of Address",       desc:"Utility bill or bank statement (last 3 months)" },
];

export default function CreatorProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bio:"", skills:"", phone:"", country:"" });
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show:false, msg:"", type:"success" });

  const showToast = (msg, type="success") => {
    setToast({ show:true, msg, type });
    setTimeout(() => setToast({ show:false }), 3000);
  };

  useEffect(() => {
    getMyProfile()
      .then(res => {
        const p = res.data?.user || res.data?.profile || res.data || {};
        setProfile(p);
        setForm({
          bio:     p.bio     || "",
          skills:  p.skills  || "",
          phone:   p.phone   || "",
          country: p.country || "",
        });
      })
      .catch(() => setFetchError("Could not load your saved profile data. You can still make changes below."))
      .finally(() => setLoading(false));
  }, []);

  const handleFile = (key, e) => {
    const f = e.target.files[0]; if (!f) return;
    setFiles(p=>({...p,[key]:f}));
    setPreviews(p=>({...p,[key]:URL.createObjectURL(f)}));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (form.bio)     fd.append("bio",     form.bio);
      if (form.skills)  fd.append("skills",  form.skills);
      if (form.phone)   fd.append("phone",   form.phone);
      if (form.country) fd.append("country", form.country);
      Object.entries(files).forEach(([k,f]) => fd.append(k, f));
      await updateProfile(fd);
      showToast("Profile updated successfully");
    } catch(err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const verStatus = profile?.verificationStatus || user?.verificationStatus;
  const verStyle = verStatus==="verified"
    ? { bg:"#ECFDF5", border:"#A7F3D0", color:"#059669", label:"Verified",       msg:"Your account is fully verified. You can post projects." }
    : verStatus==="rejected"
    ? { bg:"#FEF2F2", border:"#FECACA", color:"#DC2626", label:"Rejected",       msg: profile?.verificationReason || user?.verificationReason || "Please resubmit your documents." }
    : { bg:"#FFFBEB", border:"#FDE68A", color:"#D97706", label:"Pending Review", msg:"Your documents are being reviewed by our team." };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0" }}>
      <div style={{ width:32, height:32, border:"3px solid rgba(124,58,237,0.2)", borderTopColor:"#7C3AED", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth:640 }}>
      {toast.show && (
        <div style={{ position:"fixed", top:20, right:20, background:toast.type==="error"?"#DC2626":"#059669", color:"#fff", borderRadius:12, padding:"14px 22px", fontSize:14, fontWeight:600, zIndex:999, display:"flex", alignItems:"center", gap:8 }}>
          {toast.type==="error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:F.jakarta, fontSize:20, fontWeight:800, color:"#0D0621", margin:0 }}>My Profile</h2>
        <p style={{ fontFamily:F.dm, fontSize:13, color:"rgba(13,6,33,0.45)", margin:"4px 0 0" }}>Update your profile and verification documents</p>
      </div>

      {fetchError && (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:12, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#92400E" }}>
          <AlertCircle size={14} style={{ flexShrink:0 }} />
          {fetchError}
        </div>
      )}

      {/* Verification banner */}
      <div style={{ display:"flex", alignItems:"center", gap:14, borderRadius:16, padding:"14px 18px", border:`1px solid ${verStyle.border}`, background:verStyle.bg, marginBottom:20 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:verStyle.color+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {verStatus==="verified"
            ? <CheckCircle size={18} color={verStyle.color} />
            : <AlertCircle size={18} color={verStyle.color} />}
        </div>
        <div>
          <div style={{ fontFamily:F.jakarta, fontSize:14, fontWeight:700, color:"#0D0621", marginBottom:3 }}>Account Status: {verStyle.label}</div>
          <div style={{ fontFamily:F.dm, fontSize:12, color:"rgba(13,6,33,0.55)" }}>{verStyle.msg}</div>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        {/* Basic info */}
        <div style={{ background:"white", borderRadius:20, boxShadow:"0 2px 16px rgba(124,58,237,0.06)", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(124,58,237,0.07)" }}>
            <span style={{ fontFamily:F.jakarta, fontSize:15, fontWeight:700, color:"#0D0621" }}>Basic Info</span>
          </div>
          <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
            {/* Avatar */}
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div onClick={()=>document.getElementById("profileImg").click()} style={{ width:72, height:72, borderRadius:18, background:"linear-gradient(135deg,#7C3AED,#A78BFF)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, overflow:"hidden", boxShadow:"0 4px 16px rgba(124,58,237,0.25)" }}>
                {previews.profileImage
                  ? <img src={previews.profileImage} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="profile" />
                  : profile?.profileImage
                  ? <img src={profile.profileImage} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="profile" />
                  : <span style={{ fontFamily:F.jakarta, fontWeight:800, fontSize:28, color:"white" }}>{(profile?.name || user?.name)?.[0]?.toUpperCase()||"C"}</span>}
              </div>
              <div>
                <div style={{ fontFamily:F.jakarta, fontSize:15, fontWeight:700, color:"#0D0621", marginBottom:3 }}>{profile?.name || user?.name}</div>
                <div style={{ fontFamily:F.dm, fontSize:13, color:"rgba(13,6,33,0.45)", marginBottom:10 }}>{profile?.email || user?.email}</div>
                <button type="button" onClick={()=>document.getElementById("profileImg").click()} style={{ padding:"6px 14px", borderRadius:9, background:"#F5F3FF", border:"1px solid rgba(124,58,237,0.15)", color:"#7C3AED", fontFamily:F.jakarta, fontWeight:600, fontSize:12, cursor:"pointer" }}>Change Photo</button>
              </div>
              <input id="profileImg" type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile("profileImage",e)} />
            </div>

            <div>
              <label style={{ fontFamily:F.jakarta, fontSize:12, fontWeight:700, color:"#0D0621", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.04em" }}>Bio</label>
              <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} placeholder="Tell investors about yourself and your vision..." style={{ ...inp, resize:"vertical" }} />
            </div>

            <div>
              <label style={{ fontFamily:F.jakarta, fontSize:12, fontWeight:700, color:"#0D0621", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.04em" }}>Skills</label>
              <input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="e.g. Solar energy, Project management, Finance" style={inp} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <label style={{ fontFamily:F.jakarta, fontSize:12, fontWeight:700, color:"#0D0621", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.04em" }}>Phone</label>
                <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+1 234 567 8900" style={inp} />
              </div>
              <div>
                <label style={{ fontFamily:F.jakarta, fontSize:12, fontWeight:700, color:"#0D0621", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.04em" }}>Country</label>
                <input value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="e.g. Nigeria" style={inp} />
              </div>
            </div>
          </div>
        </div>

        {/* Verification docs */}
        <div style={{ background:"white", borderRadius:20, boxShadow:"0 2px 16px rgba(124,58,237,0.06)", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(124,58,237,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:F.jakarta, fontSize:15, fontWeight:700, color:"#0D0621" }}>Verification Documents</span>
            <span style={{ padding:"3px 10px", borderRadius:100, background:"#FEF3C7", color:"#D97706", fontFamily:F.jakarta, fontSize:10, fontWeight:700 }}>Required</span>
          </div>
          <div style={{ padding:20, display:"flex", flexDirection:"column", gap:12 }}>
            {DOCS.map(doc => (
              <div key={doc.key} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:14, border:`1px solid ${files[doc.key]?"#A7F3D0":"rgba(124,58,237,0.1)"}`, background:files[doc.key]?"#ECFDF5":"#FAFAFF", transition:"all 0.2s" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:files[doc.key]?"#D1FAE5":"#EDE9FE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {files[doc.key]
                    ? <CheckCircle size={22} color="#059669" />
                    : <AlertCircle size={22} color="#7C3AED" />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:F.jakarta, fontSize:13, fontWeight:700, color:"#0D0621", marginBottom:2 }}>{doc.label}</div>
                  <div style={{ fontFamily:F.dm, fontSize:12, color:"rgba(13,6,33,0.4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{files[doc.key]?files[doc.key].name:doc.desc}</div>
                </div>
                <button type="button" onClick={()=>document.getElementById(`cr-${doc.key}`).click()} style={{ padding:"7px 14px", borderRadius:9, background:"white", border:"1px solid rgba(124,58,237,0.2)", color:"#7C3AED", fontFamily:F.jakarta, fontWeight:600, fontSize:12, cursor:"pointer", flexShrink:0 }}>
                  {files[doc.key]?"Change":"Upload"}
                </button>
                <input id={`cr-${doc.key}`} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={e=>handleFile(doc.key,e)} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} style={{ padding:"14px", borderRadius:14, background:submitting?"rgba(124,58,237,0.4)":"linear-gradient(135deg,#7C3AED,#6D28D9)", border:"none", color:"white", fontFamily:F.jakarta, fontWeight:700, fontSize:15, cursor:submitting?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          {submitting?"Saving...":"Save Profile"}
        </button>
      </div>
    </div>
  );
}
