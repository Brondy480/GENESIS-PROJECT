import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, DollarSign, FolderKanban, Bookmark, ArrowUpRight, TrendingUp, Search } from "lucide-react";
import { getMyFundings, getMyWallet } from "../../api/backer";
import useAuthStore from "../../store/authStore";

const StatCard = ({ label, value, sub, Icon, color }) => (
  <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"20px 22px",position:"relative",overflow:"hidden" }}>
    <div style={{ position:"absolute",top:0,right:0,width:70,height:70,borderRadius:"0 16px 0 70px",background:color+"12" }} />
    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
      <div>
        <div style={{ color:"#666",fontSize:12,fontWeight:500,marginBottom:8 }}>{label}</div>
        <div style={{ color:"#fff",fontSize:26,fontWeight:700,letterSpacing:"-0.5px" }}>{value ?? "—"}</div>
        {sub && <div style={{ color:"#555",fontSize:11,marginTop:4 }}>{sub}</div>}
      </div>
      <div style={{ width:40,height:40,borderRadius:12,background:color+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        <Icon size={19} color={color} />
      </div>
    </div>
  </div>
);

export default function BackerHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [fundings, setFundings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [fRes, wRes] = await Promise.allSettled([
          getMyFundings(),
          getMyWallet(),
        ]);
        if (fRes.status === "fulfilled") setFundings(fRes.value.data.fundings || fRes.value.data || []);
        if (wRes.status === "fulfilled") setWallet(wRes.value.data.wallet || wRes.value.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalFunded = fundings.reduce((s, f) => s + (f.amount || 0), 0);

  const QUICK = [
    { label:"Browse Projects", desc:"Discover new projects", Icon:Search,   path:"/backer/dashboard/browse",   color:"#EC4899" },
    { label:"My Fundings",     desc:"View your contributions", Icon:Heart,  path:"/backer/dashboard/fundings", color:"#7C3AED" },
    { label:"Saved Projects",  desc:"Your watchlist",   Icon:Bookmark,       path:"/backer/dashboard/saved",    color:"#F59E0B" },
    { label:"My Wallet",       desc:"Check your balance", Icon:TrendingUp,   path:"/backer/dashboard/wallet",   color:"#10B981" },
  ];

  return (
    <div>
      {/* Banner */}
      <div style={{ background:"linear-gradient(120deg,#1a0533 0%,#2d0f5c 50%,#1a0533 100%)",border:"1px solid rgba(236,72,153,0.2)",borderRadius:18,padding:"28px 32px",marginBottom:28,position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",right:-30,top:-30,width:160,height:160,background:"rgba(236,72,153,0.08)",borderRadius:"50%" }} />
        <div style={{ position:"relative", display:"flex", alignItems:"flex-start", gap:16 }}>
          <div style={{ width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#EC4899)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden" }}>
            {user?.profileImage
              ? <img src={user.profileImage} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />
              : <span style={{ color:"white",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:20 }}>{user?.name?.[0]?.toUpperCase()||"B"}</span>}
          </div>
          <div>
          <div style={{ color:"#EC4899",fontSize:13,fontWeight:600,marginBottom:6 }}>Welcome back</div>
          <div style={{ color:"#fff",fontSize:24,fontWeight:800,marginBottom:6 }}>{user?.name}</div>
          <div style={{ color:"rgba(255,255,255,0.45)",fontSize:14,marginBottom:22 }}>Support African innovation by backing the projects you believe in</div>
          <div style={{ display:"flex",gap:12 }}>
            <button onClick={() => navigate("/backer/dashboard/browse")} style={{ background:"#EC4899",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}>Browse Projects</button>
            <button onClick={() => navigate("/backer/dashboard/fundings")} style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}>My Fundings</button>
          </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28 }}>
        <StatCard label="Total Contributed" value={`${totalFunded.toLocaleString()} FCFA`} sub="Across all projects" Icon={DollarSign} color="#EC4899" />
        <StatCard label="Projects Backed" value={fundings.length} sub="Active contributions" Icon={Heart} color="#7C3AED" />
        <StatCard label="Wallet Balance" value={wallet ? `${(wallet.balance||0).toLocaleString()} FCFA` : "—"} sub="Available funds" Icon={TrendingUp} color="#10B981" />
        <StatCard label="Projects Saved" value="—" sub="In your watchlist" Icon={Bookmark} color="#F59E0B" />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 280px",gap:20 }}>
        {/* Recent fundings */}
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden" }}>
          <div style={{ padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ color:"#fff",fontWeight:600,fontSize:14 }}>Recent Fundings</div>
            <button onClick={() => navigate("/backer/dashboard/fundings")} style={{ background:"transparent",border:"none",cursor:"pointer",color:"#EC4899",fontSize:12,display:"flex",alignItems:"center",gap:4 }}>View all <ArrowUpRight size={12} /></button>
          </div>
          {loading ? (
            <div style={{ padding:"40px 0",textAlign:"center",color:"#555",fontSize:13 }}>Loading...</div>
          ) : fundings.length === 0 ? (
            <div style={{ padding:"48px 0",textAlign:"center" }}>
              <div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}><Heart size={40} color="#333" /></div>
              <div style={{ color:"#555",fontSize:14,marginBottom:16 }}>You haven't backed any projects yet</div>
              <button onClick={() => navigate("/backer/dashboard/browse")} style={{ background:"#EC4899",border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}>Discover Projects</button>
            </div>
          ) : fundings.slice(0,6).map((f,i) => (
            <div key={f._id||i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 22px",borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:38,height:38,borderRadius:10,overflow:"hidden",background:"rgba(124,58,237,0.2)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {f.project?.coverImage ? <img src={f.project.coverImage} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} /> : <FolderKanban size={16} color="#7C3AED" />}
                </div>
                <div>
                  <div style={{ color:"#ddd",fontSize:13,fontWeight:500 }}>{f.project?.title||"Project"}</div>
                  <div style={{ color:"#555",fontSize:11,marginTop:2 }}>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}</div>
                </div>
              </div>
              <div style={{ color:"#EC4899",fontSize:14,fontWeight:700 }}>{f.amount?.toLocaleString()} FCFA</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {QUICK.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left" }}>
              <div style={{ width:40,height:40,borderRadius:11,background:a.color+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <a.Icon size={18} color={a.color} />
              </div>
              <div>
                <div style={{ color:"#ddd",fontSize:13,fontWeight:600 }}>{a.label}</div>
                <div style={{ color:"#555",fontSize:11,marginTop:2 }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}