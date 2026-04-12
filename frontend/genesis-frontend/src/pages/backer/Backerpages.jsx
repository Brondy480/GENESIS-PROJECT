import { useState, useEffect, useRef } from "react";
import { Heart, FolderKanban, Bookmark, ArrowDown, ArrowUp, CheckCircle, AlertCircle, BookmarkX } from "lucide-react";
import { getMyFundings, getSavedProjects, unsaveProject, getMyWallet, getMyProfile, updateProfile } from "../../api/backer";

// ─────────────────────────────────────────────
// MY FUNDINGS
// ─────────────────────────────────────────────
export function BackerFundings() {
  const [fundings, setFundings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyFundings()
      .then(r => setFundings(r.data.fundings || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = fundings.reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>My Fundings</div>
        <div style={{ color: "#555", fontSize: 13 }}>All your contributions to African projects</div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Contributed", value: `${total.toLocaleString()} FCFA`, color: "#EC4899" },
          { label: "Projects Backed", value: fundings.length, color: "#7C3AED" },
          { label: "Avg. Contribution", value: fundings.length ? `${Math.round(total / fundings.length).toLocaleString()} FCFA` : "—", color: "#10B981" },
        ].map(c => (
          <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ color: "#555", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: 24, fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Fundings list */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#444", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
          <span>Project</span><span>Amount</span><span>Method</span><span>Date</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#555" }}>Loading...</div>
        ) : fundings.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Heart size={40} color="#333" /></div>
            <div style={{ color: "#555", fontSize: 14 }}>No fundings yet</div>
          </div>
        ) : fundings.map((f, i) => (
          <div key={f._id || i} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
            padding: "14px 20px", alignItems: "center",
            borderBottom: i < fundings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, overflow: "hidden", background: "rgba(124,58,237,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.project?.coverImage
                  ? <img src={f.project.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <FolderKanban size={15} color="#7C3AED" />}
              </div>
              <div>
                <div style={{ color: "#ddd", fontSize: 13, fontWeight: 500 }}>{f.project?.title || "Project"}</div>
                <div style={{ color: "#555", fontSize: 11, marginTop: 1 }}>{f.project?.category || "—"}</div>
              </div>
            </div>
            <div style={{ color: "#EC4899", fontWeight: 700, fontSize: 14 }}>{f.amount?.toLocaleString()} FCFA</div>
            <div style={{ color: "#888", fontSize: 12, textTransform: "capitalize" }}>{f.paymentMethod?.replace("_", " ") || "Card"}</div>
            <div style={{ color: "#555", fontSize: 12 }}>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SAVED PROJECTS
// ─────────────────────────────────────────────
export function BackerSaved() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    getSavedProjects()
      .then(r => setSaved(r.data.saved || r.data || []))
      .catch(() => setSaved([]))
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (projectId) => {
    try {
      await unsaveProject(projectId);
      setSaved(prev => prev.filter(p => p._id !== projectId));
      showToast("Project removed from saved");
    } catch (e) { showToast("Failed to remove", "error"); }
  };

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "error" ? "#EF4444" : "#10B981", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Saved Projects</div>
        <div style={{ color: "#555", fontSize: 13 }}>Projects you've bookmarked for later</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>Loading...</div>
      ) : saved.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Bookmark size={48} color="#333" strokeWidth={1.5} /></div>
          <div style={{ color: "#555", fontSize: 14, marginBottom: 6 }}>No saved projects yet</div>
          <div style={{ color: "#444", fontSize: 12 }}>Browse projects and click the bookmark icon to save them here</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {saved.map(p => (
            <div key={p._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ height: 140, background: "rgba(124,58,237,0.1)", overflow: "hidden", position: "relative" }}>
                {p.coverImage
                  ? <img src={p.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><FolderKanban size={36} color="#7C3AED" /></div>}
                <button onClick={() => unsave(p._id)}
                  style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookmarkX size={14} color="#EF4444" />
                </button>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ color: "#ddd", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                <div style={{ color: "#555", fontSize: 12, marginBottom: 12, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFF", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>{p.category}</span>
                  <span style={{ color: "#EC4899", fontSize: 12, fontWeight: 600 }}>{p.equityAvailable ? `${p.equityAvailable}% equity` : "Crowdfunding"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────────
export function BackerWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyWallet().then(r => setWallet(r.data.wallet || r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>My Wallet</div>
        <div style={{ color: "#555", fontSize: 13 }}>Your balance and contribution history</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>Loading...</div>
      ) : !wallet ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>Wallet not found</div>
      ) : (
        <>
          {/* Balance cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div style={{ background: "linear-gradient(135deg,#1a0533,#2d0f5c)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 18, padding: "26px 28px" }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8 }}>Available Balance</div>
              <div style={{ color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>{(wallet.balance || 0).toLocaleString()} FCFA</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>XAF</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "26px 28px" }}>
              <div style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>Total Contributed</div>
              <div style={{ color: "#EC4899", fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>
                {(wallet.transactions?.filter(t => t.type === "debit").reduce((s, t) => s + (t.amount || 0), 0) || 0).toLocaleString()} FCFA
              </div>
              <div style={{ color: "#444", fontSize: 12, marginTop: 6 }}>Lifetime giving</div>
            </div>
          </div>

          {/* Transactions */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#fff", fontWeight: 600, fontSize: 14 }}>Transaction History</div>
            {!wallet.transactions?.length ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#555", fontSize: 13 }}>No transactions yet</div>
            ) : wallet.transactions.slice().reverse().map((tx, i) => {
              const isCredit = tx.type === "credit";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: isCredit ? "rgba(16,185,129,0.15)" : "rgba(236,72,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isCredit ? <ArrowDown size={17} color="#10B981" strokeWidth={2.5} /> : <ArrowUp size={17} color="#EC4899" strokeWidth={2.5} />}
                    </div>
                    <div>
                      <div style={{ color: "#ddd", fontSize: 13, fontWeight: 500 }}>{tx.description || "Transaction"}</div>
                      <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—"}</div>
                    </div>
                  </div>
                  <div style={{ color: isCredit ? "#10B981" : "#EC4899", fontSize: 15, fontWeight: 700 }}>
                    {isCredit ? "+" : "-"}{tx.amount?.toLocaleString()} FCFA
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────
export function BackerProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    getMyProfile().then(r => {
      const p = r.data.user || r.data;
      setProfile(p);
      setForm({ bio: p.bio || "" });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (form.bio) fd.append("bio", form.bio);
      await updateProfile(fd);
      showToast("Profile updated successfully");
    } catch (e) { showToast(e.response?.data?.message || "Failed to update", "error"); }
    finally { setSaving(false); }
  };

  const VS = {
    verified: { bg: "rgba(16,185,129,0.15)", color: "#10B981", label: "Verified" },
    pending: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "Pending Review" },
    rejected: { bg: "rgba(239,68,68,0.15)", color: "#EF4444", label: "Rejected" },
    unverified: { bg: "rgba(100,100,100,0.15)", color: "#888", label: "Not Verified" },
  };
  const vs = VS[profile?.verificationStatus || "unverified"];

  if (loading) return <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>Loading...</div>;

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "error" ? "#EF4444" : "#10B981", color: "#fff", borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 600, zIndex: 999, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>My Profile</div>
        <div style={{ color: "#555", fontSize: 13 }}>Manage your backer profile</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Avatar card */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 24, textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", overflow: "hidden" }}>
            {profile?.profileImage
              ? <img src={profile.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>{(profile?.name?.[0] || "B").toUpperCase()}</span>}
          </div>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{profile?.name}</div>
          <div style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>{profile?.email}</div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: vs.bg, color: vs.color }}>{vs.label}</span>

          {profile?.verificationStatus !== "verified" && (
            <div style={{ marginTop: 16, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#F59E0B", textAlign: "left", display: "flex", gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              Complete your profile to get verified and access all features.
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 28 }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Profile Information</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 8 }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4}
                placeholder="Tell projects why you want to support them..."
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 14px", fontSize: 13, resize: "none", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
            </div>

            <div>
              <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 8 }}>Profile Photo</label>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("profileImage", file);
                try {
                  await updateProfile(fd);
                  showToast("Photo updated");
                  window.location.reload();
                } catch { showToast("Failed to upload photo", "error"); }
              }} />
              <button onClick={() => fileRef.current?.click()}
                style={{ padding: "10px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#ddd", fontSize: 13, cursor: "pointer" }}>
                Upload New Photo
              </button>
            </div>

            <button onClick={save} disabled={saving}
              style={{ background: saving ? "rgba(236,72,153,0.4)" : "linear-gradient(135deg,#EC4899,#7C3AED)", border: "none", borderRadius: 10, padding: "12px 0", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", marginTop: 6 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}