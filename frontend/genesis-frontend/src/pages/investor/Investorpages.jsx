import { useState, useEffect } from "react";
import { Rocket, DollarSign, TrendingUp, PieChart, ArrowDown, ArrowUp, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../api/axios";

// ─────────────────────────────────────────────
// PORTFOLIO
// ─────────────────────────────────────────────
const DEAL_STATUS_LABEL = {
  created:              { label: "Created",             bg: "#F3F4F6", color: "#6B7280" },
  awaiting_payment:     { label: "Awaiting Payment",    bg: "#FEF3C7", color: "#D97706" },
  payment_completed:    { label: "Payment Done",        bg: "#DBEAFE", color: "#2563EB" },
  awaiting_signatures:  { label: "Awaiting Signatures", bg: "#EDE9FE", color: "#7C3AED" },
  active:               { label: "Active",              bg: "#D1FAE5", color: "#059669" },
  cancelled:            { label: "Cancelled",           bg: "#FEE2E2", color: "#DC2626" },
};

export function InvestorPortfolio() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Correct endpoint: mounted at /api/v1/payment/deal (not /payment)
    api.get("/payment/deal")
      .then(r => {
        const all = r.data.deals || r.data || [];
        // Show all non-cancelled deals in the portfolio table
        setDeals(all.filter(d => d.dealStatus !== "cancelled"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Total invested = sum across all non-cancelled deals (payment was or will be made)
  const totalInvested  = deals.reduce((s, d) => s + (d.amount || 0), 0);
  // Active = deals where equity is officially live (admin released funds)
  const activeDeals    = deals.filter(d => d.dealStatus === "active");
  const totalEquity    = activeDeals.reduce((s, d) => s + (d.equity || 0), 0);

  const STATS = [
    { label: "Total Invested",    value: `${totalInvested.toLocaleString()} FCFA`, Icon: DollarSign, color: "#7C6FFF" },
    { label: "Active Investments", value: activeDeals.length,                  Icon: TrendingUp, color: "#059669" },
    { label: "Total Equity Owned", value: `${totalEquity}%`,                   Icon: PieChart,   color: "#D97706" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1E0B4B", marginBottom: 4 }}>My Portfolio</div>
        <div style={{ fontSize: 14, color: "#7B7496" }}>Your equity ownership across all investments</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {STATS.map(c => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #EDE9FF", boxShadow: "0 2px 12px rgba(124,111,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#7B7496" }}>{c.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: c.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <c.Icon size={17} color={c.color} strokeWidth={2} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A09BBF" }}>Loading portfolio...</div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 20, border: "1px solid #EDE9FF" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <PieChart size={56} color="#C4B5FD" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1E0B4B", marginBottom: 6 }}>No investments yet</div>
          <div style={{ fontSize: 14, color: "#A09BBF" }}>Complete a deal to see your portfolio</div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #EDE9FF", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F0FF", fontSize: 15, fontWeight: 700, color: "#1E0B4B" }}>Shareholdings</div>
          {deals.map(deal => (
            <div key={deal._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #F8F6FF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", background: "#E8E4FF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {deal.project?.coverImage ? (
                    <img src={deal.project.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Rocket size={20} color="#A78BFF" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1E0B4B" }}>{deal.project?.title || "Project"}</div>
                  <div style={{ fontSize: 12, color: "#A09BBF", marginTop: 2 }}>{deal.project?.category || "—"}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#A09BBF" }}>Invested</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1E0B4B" }}>{deal.amount?.toLocaleString()} FCFA</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#A09BBF" }}>Equity</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#7C6FFF" }}>{deal.equity}%</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#A09BBF" }}>Valuation</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#059669" }}>{(deal.project?.valuation || 0).toLocaleString()} FCFA</div>
                </div>
                <div>
                  {(() => {
                    const s = DEAL_STATUS_LABEL[deal.dealStatus] || { label: deal.dealStatus, bg: "#F3F4F6", color: "#6B7280" };
                    return (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    );
                  })()}
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
export function InvestorWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/wallet/my").then(r => setWallet(r.data.wallet || r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1E0B4B", marginBottom: 4 }}>My Wallet</div>
        <div style={{ fontSize: 14, color: "#7B7496" }}>Your available balance and transaction history</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A09BBF" }}>Loading wallet...</div>
      ) : !wallet ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A09BBF" }}>Wallet not found</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div style={{ background: "linear-gradient(135deg,#1E0B4B,#3B1A8A)", borderRadius: 18, padding: "28px 28px", color: "#fff" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Available Balance</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>{(wallet.balance || 0).toLocaleString()} FCFA</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>XAF</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 18, padding: "28px 28px", border: "1px solid #EDE9FF" }}>
              <div style={{ fontSize: 13, color: "#7B7496", marginBottom: 8 }}>Escrow Balance</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#7C6FFF", letterSpacing: "-1px" }}>{(wallet.escrowBalance || 0).toLocaleString()} FCFA</div>
              <div style={{ fontSize: 12, color: "#A09BBF", marginTop: 6 }}>Locked in escrow</div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #EDE9FF" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F0FF", fontSize: 15, fontWeight: 700, color: "#1E0B4B" }}>Transaction History</div>
            {!wallet.transactions?.length ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "#A09BBF", fontSize: 14 }}>No transactions yet</div>
            ) : wallet.transactions.slice().reverse().map((tx, i) => {
              const isCredit = tx.type === "credit";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #F8F6FF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: isCredit ? "#DCFCE7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isCredit
                        ? <ArrowDown size={18} color="#16A34A" strokeWidth={2.5} />
                        : <ArrowUp size={18} color="#DC2626" strokeWidth={2.5} />
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E0B4B" }}>{tx.description || "Transaction"}</div>
                      <div style={{ fontSize: 11, color: "#A09BBF", marginTop: 2 }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—"}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isCredit ? "#16A34A" : "#DC2626" }}>
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
const DOCS = [
  { key: "idCard",         label: "National ID / Passport", desc: "Upload a clear photo or scan of your ID" },
  { key: "proofOfAddress", label: "Proof of Address",       desc: "Utility bill or bank statement (last 3 months)" },
];

export function InvestorProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bio: "", annualIncome: "", investmentExperience: "" });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false }), 3000);
  };

  const handleFile = (key, e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFiles(prev => ({ ...prev, [key]: f }));
  };

  useEffect(() => {
    api.get("/profile/me").then(r => {
      const p = r.data.user || r.data;
      setProfile(p);
      setForm({ bio: p.bio || "", annualIncome: p.annualIncome || "", investmentExperience: p.investmentExperience || "" });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      Object.entries(files).forEach(([k, f]) => fd.append(k, f));
      await api.put("/profile/Createprofile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Profile updated successfully");
    } catch (e) { showToast(e.response?.data?.message || "Failed to update", "error"); }
    finally { setSaving(false); }
  };

  const verificationStyle = {
    verified: { bg: "#DCFCE7", color: "#16A34A", label: "Verified" },
    pending: { bg: "#FFF7ED", color: "#C2410C", label: "Pending Review" },
    rejected: { bg: "#FEF2F2", color: "#DC2626", label: "Rejected" },
    unverified: { bg: "#F3F4F6", color: "#6B7280", label: "Not Verified" },
  };
  const vs = verificationStyle[profile?.verificationStatus || "unverified"];

  if (loading) return <div style={{ textAlign: "center", padding: "80px 0", color: "#A09BBF" }}>Loading profile...</div>;

  return (
    <div>
      {toast.show && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "error" ? "#DC2626" : "#059669", color: "#fff", borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 600, zIndex: 999, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1E0B4B", marginBottom: 4 }}>My Profile</div>
        <div style={{ fontSize: 14, color: "#7B7496" }}>Manage your investor profile and verification</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Left card */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #EDE9FF", padding: 24, textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#7C6FFF,#A78BFF)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", overflow: "hidden" }}>
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>{(profile?.name?.[0] || "I").toUpperCase()}</span>
            )}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1E0B4B", marginBottom: 4 }}>{profile?.name}</div>
          <div style={{ fontSize: 13, color: "#7B7496", marginBottom: 12 }}>{profile?.email}</div>
          <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 20, background: vs.bg, color: vs.color }}>{vs.label}</span>

          {profile?.verificationStatus !== "verified" && (
            <div style={{ marginTop: 16, background: "#FFF7ED", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#92400E", textAlign: "left", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              Complete your profile and submit documents to get verified.
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #EDE9FF", padding: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1E0B4B", marginBottom: 20 }}>Profile Information</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1E0B4B", display: "block", marginBottom: 6 }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
                style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }}
                placeholder="Tell creators about your investment background..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#1E0B4B", display: "block", marginBottom: 6 }}>Annual Income Range</label>
                <select value={form.annualIncome} onChange={e => setForm({ ...form, annualIncome: e.target.value })}
                  style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" }}>
                  <option value="">Select range</option>
                  <option value="under-50k">Under 50,000 FCFA</option>
                  <option value="50k-100k">50,000 - 100,000 FCFA</option>
                  <option value="100k-250k">100,000 - 250,000 FCFA</option>
                  <option value="over-250k">Over 250,000 FCFA</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#1E0B4B", display: "block", marginBottom: 6 }}>Investment Experience</label>
                <select value={form.investmentExperience} onChange={e => setForm({ ...form, investmentExperience: e.target.value })}
                  style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" }}>
                  <option value="">Select level</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="experienced">Experienced (5+ years)</option>
                </select>
              </div>
            </div>

            {/* Verification documents */}
            <div style={{ borderTop: "1px solid #EDE9FF", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E0B4B" }}>Verification Documents</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: "#FEF3C7", color: "#D97706" }}>Required</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DOCS.map(doc => (
                  <div key={doc.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${files[doc.key] ? "#BBF7D0" : "#E8E4FF"}`, background: files[doc.key] ? "#F0FDF4" : "#FAFAFF", transition: "all 0.2s" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E0B4B", marginBottom: 2 }}>{doc.label}</div>
                      <div style={{ fontSize: 12, color: "#A09BBF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {files[doc.key] ? files[doc.key].name : doc.desc}
                      </div>
                    </div>
                    <button type="button" onClick={() => document.getElementById(`inv-${doc.key}`).click()}
                      style={{ padding: "7px 14px", borderRadius: 8, background: "#fff", border: "1px solid #DDD6FE", color: "#7C6FFF", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                      {files[doc.key] ? "Change" : "Upload"}
                    </button>
                    <input id={`inv-${doc.key}`} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => handleFile(doc.key, e)} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={save} disabled={saving}
              style={{ background: saving ? "#C4B5FD" : "linear-gradient(135deg,#7C6FFF,#9B89FF)", border: "none", borderRadius: 10, padding: "12px 0", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", marginTop: 6 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}