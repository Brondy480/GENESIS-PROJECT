import { useState, useEffect } from "react";
import { CheckCircle, XCircle, UserX, Eye, X } from "lucide-react";
import { getPendingUsers, getUserById, approveUser, rejectUser, suspendUser, unsuspendUser } from "../../api/admin";

const F = { jakarta: "'Plus Jakarta Sans',sans-serif", dm: "'DM Sans',sans-serif" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const r = await getPendingUsers();
      // Backend returns array directly, not { users: [...] }
      setUsers(Array.isArray(r.data) ? r.data : (r.data?.users || []));
    } catch { setUsers([]); } finally { setLoading(false); }
  }; 

  const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3000); };

  const handle = async (action, id, label) => {
    setActionLoading(action + id);
    try {
      if (action === "approve") await approveUser(id);
      if (action === "reject") await rejectUser(id);
      if (action === "suspend") await suspendUser(id);
      if (action === "unsuspend") await unsuspendUser(id);
      notify(`User ${label} successfully.`);
      setSelected(null);
      fetchUsers();
    } catch (e) { notify(e.response?.data?.message || "Action failed", "error"); }
    finally { setActionLoading(""); }
  };

  const roleColor = r => r === "creator" ? { bg: "#EDE9FE", c: "#7C3AED" } : r === "investor" ? { bg: "#DBEAFE", c: "#2563EB" } : { bg: "#D1FAE5", c: "#059669" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: F.jakarta, fontSize: 20, fontWeight: 800, color: "#0D0621", margin: 0 }}>User Verification</h2>
        <p style={{ fontFamily: F.dm, fontSize: 13, color: "rgba(13,6,33,0.45)", margin: "4px 0 0" }}>{users.length} user{users.length !== 1 ? "s" : ""} pending verification</p>
      </div>

      {msg.text && <div style={{ background: msg.type === "error" ? "#FEF2F2" : "#ECFDF5", border: `1px solid ${msg.type === "error" ? "#FECACA" : "#A7F3D0"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontFamily: F.dm, fontSize: 14, color: msg.type === "error" ? "#DC2626" : "#059669" }}>{msg.text}</div>}

      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><div style={{ width: 28, height: 28, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
        : users.length === 0 ? (
          <div style={{ background: "white", borderRadius: 24, padding: "80px 40px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <CheckCircle size={56} color="#D1FAE5" style={{ margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ fontFamily: F.jakarta, fontSize: 20, fontWeight: 800, color: "#0D0621", marginBottom: 8 }}>All caught up!</h3>
            <p style={{ fontFamily: F.dm, fontSize: 14, color: "rgba(13,6,33,0.45)" }}>No users pending verification right now.</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", padding: "12px 20px", background: "#FAFAFF", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              {["User", "Role", "Email", "Joined", "Actions"].map(h => (
                <span key={h} style={{ fontFamily: F.jakarta, fontSize: 11, fontWeight: 700, color: "rgba(13,6,33,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>
            {users.map((u, i) => {
              const rc = roleColor(u.userType);
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAFF"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7C3AED,#A78BFF)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: F.jakarta, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {(u.name || u.fullName || "U")[0].toUpperCase()}
                    </div>
                    <span style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, color: "#0D0621" }}>{u.name || u.fullName || "Unknown"}</span>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 100, background: rc.bg, color: rc.c, fontFamily: F.jakarta, fontSize: 11, fontWeight: 700, width: "fit-content" }}>{u.userType}</span>
                  <span style={{ fontFamily: F.dm, fontSize: 12, color: "rgba(13,6,33,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{u.email}</span>
                  <span style={{ fontFamily: F.dm, fontSize: 12, color: "rgba(13,6,33,0.4)" }}>{new Date(u.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={async () => { try { const r = await getUserById(u._id); setSelected(r.data); } catch { setSelected(u); } }} title="View Details" style={{ width: 32, height: 32, borderRadius: 8, background: "#F5F3FF", border: "1px solid rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Eye size={14} color="#7C3AED" />
                    </button>
                    <button onClick={() => handle("approve", u._id, "approved")} disabled={actionLoading !== ""} title="Approve" style={{ width: 32, height: 32, borderRadius: 8, background: "#D1FAE5", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: actionLoading !== "" ? 0.6 : 1 }}>
                      <CheckCircle size={14} color="#059669" />
                    </button>
                    <button onClick={() => handle("reject", u._id, "rejected")} disabled={actionLoading !== ""} title="Reject" style={{ width: 32, height: 32, borderRadius: 8, background: "#FEE2E2", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: actionLoading !== "" ? 0.6 : 1 }}>
                      <XCircle size={14} color="#DC2626" />
                    </button>
                    <button onClick={() => handle("suspend", u._id, "suspended")} disabled={actionLoading !== ""} title="Suspend" style={{ width: 32, height: 32, borderRadius: 8, background: "#FEF3C7", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: actionLoading !== "" ? 0.6 : 1 }}>
                      <UserX size={14} color="#D97706" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, boxShadow: "0 40px 100px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: F.jakarta, fontSize: 17, fontWeight: 800, color: "#0D0621", margin: 0 }}>User Details</h3>
              <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: 8, background: "#F5F3FF", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 16, background: "#FAFAFF", borderRadius: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#7C3AED,#A78BFF)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: F.jakarta, fontWeight: 800, fontSize: 22 }}>
                  {(selected.name || selected.fullName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: F.jakarta, fontSize: 16, fontWeight: 700, color: "#0D0621" }}>{selected.name || selected.fullName}</div>
                  <div style={{ fontFamily: F.dm, fontSize: 13, color: "rgba(13,6,33,0.5)" }}>{selected.email}</div>
                  <span style={{ padding: "2px 10px", borderRadius: 100, background: "#EDE9FE", color: "#7C3AED", fontFamily: F.jakarta, fontSize: 11, fontWeight: 700, marginTop: 6, display: "inline-block" }}>{selected.userType}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { l: "Phone", v: selected.phone || "—" },
                  { l: "Country", v: selected.country || "—" },
                  { l: "Joined", v: new Date(selected.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                  { l: "Status", v: selected.verificationStatus || selected.status || "pending" },
                ].map(m => (
                  <div key={m.l} style={{ background: "#F5F3FF", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ fontFamily: F.dm, fontSize: 10, color: "rgba(13,6,33,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.l}</div>
                    <div style={{ fontFamily: F.jakarta, fontSize: 14, fontWeight: 600, color: "#0D0621" }}>{m.v}</div>
                  </div>
                ))}
              </div>
              {/* Documents */}
              {(selected.idCard || selected.proofOfAddress) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: F.jakarta, fontSize: 12, fontWeight: 700, color: "rgba(13,6,33,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Submitted Documents</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {selected.idCard && <a href={selected.idCard} target="_blank" rel="noreferrer" style={{ padding: "8px 16px", borderRadius: 10, background: "#EDE9FE", color: "#7C3AED", fontFamily: F.jakarta, fontWeight: 600, fontSize: 12, textDecoration: "none" }}>View ID Card</a>}
                    {selected.proofOfAddress && <a href={selected.proofOfAddress} target="_blank" rel="noreferrer" style={{ padding: "8px 16px", borderRadius: 10, background: "#EDE9FE", color: "#7C3AED", fontFamily: F.jakarta, fontWeight: 600, fontSize: 12, textDecoration: "none" }}>Proof of Address</a>}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handle("approve", selected._id, "approved")} disabled={actionLoading !== ""} style={{ flex: 1, padding: 12, borderRadius: 12, background: "#D1FAE5", border: "none", color: "#059669", fontFamily: F.jakarta, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <CheckCircle size={15} />{actionLoading ? "Working..." : "Approve"}
                </button>
                <button onClick={() => handle("reject", selected._id, "rejected")} disabled={actionLoading !== ""} style={{ flex: 1, padding: 12, borderRadius: 12, background: "#FEE2E2", border: "none", color: "#DC2626", fontFamily: F.jakarta, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <XCircle size={15} />{actionLoading ? "Working..." : "Reject"}
                </button>
                <button onClick={() => handle("suspend", selected._id, "suspended")} disabled={actionLoading !== ""} style={{ flex: 1, padding: 12, borderRadius: 12, background: "#FEF3C7", border: "none", color: "#D97706", fontFamily: F.jakarta, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <UserX size={15} />{actionLoading ? "Working..." : "Suspend"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}