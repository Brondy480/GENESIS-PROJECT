import { useState, useEffect } from "react";
import { Search, X, CheckCircle, AlertCircle, FolderKanban } from "lucide-react";
import api from "../../api/axios";

const CATS = ["All", "technology", "agriculture", "health", "education", "energy", "finance"];

function ProjectCard({ project, onFund }) {
  const pct = project.targetAmount > 0
    ? Math.min(100, Math.round((project.currentAmount || 0) / project.targetAmount * 100))
    : 0;

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "all 0.2s", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,72,153,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ height: 160, background: "rgba(124,58,237,0.1)", overflow: "hidden", position: "relative" }}>
        {project.coverImage
          ? <img src={project.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><FolderKanban size={40} color="#7C3AED" /></div>}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{ background: "rgba(124,58,237,0.85)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>{project.category}</span>
        </div>
        {project.allowFunding && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <span style={{ background: "rgba(16,185,129,0.85)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>Open to Funding</span>
          </div>
        )}
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ color: "#ddd", fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{project.title}</div>
        <div style={{ color: "#555", fontSize: 12, marginBottom: 14, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{project.description}</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 5 }}>
            <span>${(project.currentAmount || 0).toLocaleString()} raised</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#EC4899,#7C3AED)", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#555" }}>Goal</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd" }}>${(project.targetAmount || 0).toLocaleString()}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#555" }}>Deadline</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd" }}>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</div>
          </div>
        </div>
        <button onClick={() => onFund(project)} disabled={!project.allowFunding}
          style={{ width: "100%", background: project.allowFunding ? "linear-gradient(135deg,#EC4899,#7C3AED)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: "10px 0", color: project.allowFunding ? "#fff" : "#444", fontSize: 13, fontWeight: 600, cursor: project.allowFunding ? "pointer" : "not-allowed" }}>
          {project.allowFunding ? "Back This Project" : "Funding Closed"}
        </button>
      </div>
    </div>
  );
}

function FundModal({ project, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const PRESETS = [10, 25, 50, 100, 250, 500];

  const handle = async () => {
    if (!amount || Number(amount) <= 0) { setError("Please enter a valid amount"); return; }
    setLoading(true); setError("");
    try {
      await onSubmit({ amount: Number(amount), paymentMethod: method });
      onClose();
    } catch (e) { setError(e.response?.data?.message || "Funding failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
      <div style={{ background: "#111120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, width: 440, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Back This Project</div>
            <div style={{ color: "#666", fontSize: 13, marginTop: 3 }}>{project.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#888", display: "flex" }}><X size={16} /></button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#EF4444", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 10 }}>Choose amount (USD)</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => setAmount(String(p))}
                style={{ padding: "9px 0", borderRadius: 8, border: "1px solid", borderColor: amount === String(p) ? "#EC4899" : "rgba(255,255,255,0.1)", background: amount === String(p) ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)", color: amount === String(p) ? "#EC4899" : "#888", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ${p}
              </button>
            ))}
          </div>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Or enter custom amount..."
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 10 }}>Payment method</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ val: "card", label: "Card" }, { val: "mobile_money", label: "Mobile Money" }, { val: "bank", label: "Bank Transfer" }].map(m => (
              <button key={m.val} onClick={() => setMethod(m.val)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid", borderColor: method === m.val ? "#7C3AED" : "rgba(255,255,255,0.1)", background: method === m.val ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)", color: method === m.val ? "#A78BFF" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: "#EC4899" }}>
          Contributing <strong>${amount || "0"}</strong> to <strong>{project.title}</strong>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handle} disabled={loading || !amount}
            style={{ flex: 2, padding: 12, borderRadius: 10, background: loading || !amount ? "rgba(236,72,153,0.3)" : "linear-gradient(135deg,#EC4899,#7C3AED)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading || !amount ? "not-allowed" : "pointer" }}>
            {loading ? "Processing..." : `Confirm $${amount || "0"} Contribution`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BackerBrowse() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    api.get("/publicProject")
      .then(r => setProjects(r.data.projects || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.title?.toLowerCase().includes(q);
    const matchCat = cat === "All" || p.category === cat;
    return matchSearch && matchCat && p.approvalStatus === "approved" && p.status === "active";
  });

  const handleFund = async ({ amount, paymentMethod }) => {
    // POST /projectsFunding/projects/:id/fund
    await api.post(`/projectsFunding/projects/${selected._id}/fund`, { amount, paymentMethod });
    showToast(`Successfully backed ${selected.title} with $${amount}!`);
  };

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "error" ? "#EF4444" : "#10B981", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 999, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Browse Projects</div>
        <div style={{ color: "#555", fontSize: 13 }}>Discover and support African innovation</div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={14} color="#555" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 38, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid", borderColor: cat === c ? "#EC4899" : "rgba(255,255,255,0.08)", background: cat === c ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)", color: cat === c ? "#EC4899" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Search size={40} color="#333" /></div>
          <div style={{ color: "#555", fontSize: 14 }}>No projects found</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {filtered.map(p => <ProjectCard key={p._id} project={p} onFund={setSelected} />)}
        </div>
      )}

      {selected && <FundModal project={selected} onClose={() => setSelected(null)} onSubmit={handleFund} />}
    </div>
  );
}