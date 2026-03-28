import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, CheckCircle, AlertCircle, FolderKanban } from "lucide-react";
import { getPublicProjects, sendInvestmentRequest } from "../../api/investor";

const CATEGORIES = ["All", "technology", "agriculture", "health", "education", "energy", "finance"];

function ProjectCard({ project, onInvest }) {
  const pct = project.targetAmount > 0
    ? Math.min(100, Math.round((project.currentAmount || 0) / project.targetAmount * 100))
    : 0;

  return (
    <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #EDE9FF", boxShadow: "0 2px 16px rgba(124,111,255,0.06)", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,111,255,0.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(124,111,255,0.06)"; }}>
      <div style={{ height: 180, background: "#E8E4FF", overflow: "hidden", position: "relative" }}>
        {project.coverImage
          ? <img src={project.coverImage} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><FolderKanban size={48} color="#A78BFF" strokeWidth={1.5} /></div>}
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <span style={{ background: "rgba(124,111,255,0.9)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>{project.category}</span>
        </div>
        {project.allowInvestment && (
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <span style={{ background: "rgba(5,150,105,0.9)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>Open to Investment</span>
          </div>
        )}
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1E0B4B", marginBottom: 6, lineHeight: 1.3 }}>{project.title}</div>
        <div style={{ fontSize: 13, color: "#7B7496", marginBottom: 14, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {project.description}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#A09BBF", marginBottom: 6 }}>
            <span>${(project.currentAmount || 0).toLocaleString()} raised</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 6, background: "#F0EEFF", borderRadius: 99 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7C6FFF,#A78BFF)", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div style={{ background: "#F8F7FF", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 11, color: "#A09BBF" }}>Valuation</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1E0B4B" }}>${(project.valuation || 0).toLocaleString()}</div>
          </div>
          <div style={{ background: "#F8F7FF", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 11, color: "#A09BBF" }}>Equity Available</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#7C6FFF" }}>{project.equityAvailable || 0}%</div>
          </div>
        </div>
        <button onClick={() => onInvest(project)} disabled={!project.allowInvestment}
          style={{ width: "100%", background: project.allowInvestment ? "linear-gradient(135deg,#7C6FFF,#9B89FF)" : "#E5E7EB", border: "none", borderRadius: 10, padding: "11px 0", color: project.allowInvestment ? "#fff" : "#9CA3AF", fontSize: 13, fontWeight: 600, cursor: project.allowInvestment ? "pointer" : "not-allowed" }}>
          {project.allowInvestment ? "Send Investment Request" : "Not Open for Investment"}
        </button>
      </div>
    </div>
  );
}

function InvestModal({ project, onClose, onSubmit }) {
  const [form, setForm] = useState({ amount: "", equityRequested: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.amount || !form.equityRequested) { setError("Amount and equity are required"); return; }
    setLoading(true); setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Request failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1E0B4B" }}>Send Investment Request</div>
            <div style={{ fontSize: 13, color: "#7B7496", marginTop: 3 }}>{project.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#1E0B4B", display: "block", marginBottom: 6 }}>Investment Amount (USD)</label>
            <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} type="number"
              style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="e.g. 10000" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#1E0B4B", display: "block", marginBottom: 6 }}>Equity Requested (%)</label>
            <input value={form.equityRequested} onChange={e => setForm({ ...form, equityRequested: e.target.value })} type="number"
              style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder={`Max: ${project.equityAvailable}%`} max={project.equityAvailable} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#1E0B4B", display: "block", marginBottom: 6 }}>Message to Creator</label>
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3}
            style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }}
            placeholder="Why are you interested in this project?" />
        </div>

        <div style={{ background: "#F8F7FF", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#7B7496" }}>
          Valuation: <strong style={{ color: "#1E0B4B" }}>${(project.valuation || 0).toLocaleString()}</strong> · Available equity: <strong style={{ color: "#7C6FFF" }}>{project.equityAvailable}%</strong>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, background: "#F3F4F6", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>Cancel</button>
          <button onClick={handle} disabled={loading}
            style={{ flex: 2, background: loading ? "#C4B5FD" : "linear-gradient(135deg,#7C6FFF,#9B89FF)", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestorBrowse() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getPublicProjects()
      .then(r => setProjects(r.data.projects || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat && p.approvalStatus === "approved" && p.status === "active";
  });

  const handleSubmit = async (form) => {
    // POST /investment/projects/:projectId/invest
    await sendInvestmentRequest(selectedProject._id, {
      amount: Number(form.amount),
      equityRequested: Number(form.equityRequested),
      message: form.message,
    });
    setToast("Investment request sent successfully!");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#059669", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 999, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1E0B4B", marginBottom: 4 }}>Browse Projects</div>
        <div style={{ fontSize: 14, color: "#7B7496" }}>Discover investment opportunities across Africa</div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={16} color="#A09BBF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px 10px 40px", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }}
            placeholder="Search projects..." />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding: "9px 16px", borderRadius: 10, border: "1.5px solid", borderColor: category === c ? "#7C6FFF" : "#E8E4FF", background: category === c ? "#7C6FFF" : "#fff", color: category === c ? "#fff" : "#7B7496", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A09BBF" }}>Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Search size={48} color="#C4B5FD" strokeWidth={1.5} /></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1E0B4B", marginBottom: 6 }}>No projects found</div>
          <div style={{ fontSize: 14, color: "#A09BBF" }}>Try a different search or category</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {filtered.map(p => <ProjectCard key={p._id} project={p} onInvest={setSelectedProject} />)}
        </div>
      )}

      {selectedProject && (
        <InvestModal project={selectedProject} onClose={() => setSelectedProject(null)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}