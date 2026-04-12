import { useState, useEffect } from "react";
import { CheckCircle, Clock, Lock, X, FileText, DollarSign, AlertTriangle } from "lucide-react";
import { getAllEscrows, validateEscrow, releaseEscrow } from "../../api/admin";
import api from "../../api/axios";

const F = { jakarta: "'Plus Jakarta Sans',sans-serif", dm: "'DM Sans',sans-serif" };

// Real status values from Escrow schema: holding | ready_for_release | released | refunded
// ready_for_release means both have signed
// ready_for_release + adminValidated means admin has validated → can release

const statusStyle = (e) => {
  if (e.status === "released")
    return { bg: "#D1FAE5", c: "#059669", label: "Released" };
  if (e.status === "ready_for_release" && e.agreement?.adminValidated)
    return { bg: "#DBEAFE", c: "#2563EB", label: "Validated — Ready to Release" };
  if (e.status === "ready_for_release")
    return { bg: "#EDE9FE", c: "#7C3AED", label: "Both Signed — Awaiting Validation" };
  if (e.status === "refunded")
    return { bg: "#FEE2E2", c: "#DC2626", label: "Refunded" };
  // holding
  const creatorSigned  = e.agreement?.creatorSigned;
  const investorSigned = e.agreement?.investorSigned;
  if (creatorSigned || investorSigned)
    return { bg: "#FEF3C7", c: "#D97706", label: "Partially Signed" };
  return { bg: "#F3F4F6", c: "#6B7280", label: "Awaiting Signatures" };
};

// Validate = ready_for_release + both signed + not yet admin-validated
const canValidate = (e) =>
  e.status === "ready_for_release" &&
  e.agreement?.creatorSigned &&
  e.agreement?.investorSigned &&
  !e.agreement?.adminValidated;

// Release = ready_for_release + admin has validated
const canRelease = (e) =>
  e.status === "ready_for_release" && e.agreement?.adminValidated;

export default function AdminEscrows() {
  const [escrows,       setEscrows]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [msg,           setMsg]           = useState({ text: "", type: "" });
  const [filter,        setFilter]        = useState("all");

  useEffect(() => { fetchEscrows(); }, []);

  const fetchEscrows = async () => {
    try {
      const r = await getAllEscrows();
      setEscrows(r.data?.escrows || r.data || []);
    } catch { setEscrows([]); }
    finally { setLoading(false); }
  };

  const notify = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  };

  const viewSignedDoc = async (escrowId, party) => {
    try {
      const response = await api.get(`/agreements/${escrowId}/signed-doc/${party}`, { responseType: "blob" });
      const mimeType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to load document", "error");
    }
  };

  const handle = async (action, id) => {
    setActionLoading(action + id);
    try {
      if (action === "validate") await validateEscrow(id);
      if (action === "release")  await releaseEscrow(id);
      notify(`Escrow ${action === "validate" ? "validated" : "released"} successfully.`);
      setSelected(null);
      fetchEscrows();
    } catch (err) {
      notify(err.response?.data?.message || "Action failed", "error");
    } finally { setActionLoading(""); }
  };

  const filtered = escrows.filter(e => {
    if (filter === "pending")   return e.status === "holding";
    if (filter === "ready")     return e.status === "ready_for_release" && !e.agreement?.adminValidated;
    if (filter === "validated") return e.status === "ready_for_release" && e.agreement?.adminValidated;
    if (filter === "released")  return e.status === "released";
    return true;
  });

  const feePercent    = (e) => e.deal?.platformFeePercent || 5;
  const feeAmount     = (e) => ((e.amount || 0) * feePercent(e)) / 100;
  const creatorGets   = (e) => (e.amount || 0) - feeAmount(e);

  const TABS = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "Awaiting Signatures" },
    { key: "ready",     label: "Ready to Validate" },
    { key: "validated", label: "Validated" },
    { key: "released",  label: "Released" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: F.jakarta, fontSize: 20, fontWeight: 800, color: "#0D0621", margin: 0 }}>
          Escrow Management
        </h2>
        <p style={{ fontFamily: F.dm, fontSize: 13, color: "rgba(13,6,33,0.45)", margin: "4px 0 0" }}>
          {escrows.length} escrow{escrows.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {msg.text && (
        <div style={{
          background: msg.type === "error" ? "#FEF2F2" : "#ECFDF5",
          border: `1px solid ${msg.type === "error" ? "#FECACA" : "#A7F3D0"}`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 16,
          fontFamily: F.dm, fontSize: 14,
          color: msg.type === "error" ? "#DC2626" : "#059669",
        }}>
          {msg.text}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 14, padding: 6, width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: F.jakarta, fontSize: 12, fontWeight: 700,
              background: filter === t.key ? "#7C3AED" : "transparent",
              color: filter === t.key ? "white" : "rgba(13,6,33,0.5)",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div style={{ width: 28, height: 28, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: 24, padding: "80px 40px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <Lock size={56} color="#DDD6FE" style={{ margin: "0 auto 16px", display: "block" }} />
          <p style={{ fontFamily: F.dm, fontSize: 14, color: "rgba(13,6,33,0.45)" }}>No escrows in this category.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((e) => {
            const ss             = statusStyle(e);
            const creatorSigned  = e.agreement?.creatorSigned;
            const investorSigned = e.agreement?.investorSigned;
            const validate       = canValidate(e);
            const release        = canRelease(e);

            return (
              <div
                key={e._id}
                style={{ background: "white", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", padding: "20px 24px", transition: "all 0.2s" }}
                onMouseEnter={ev => { ev.currentTarget.style.transform = "translateY(-2px)"; ev.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={ev => { ev.currentTarget.style.transform = "none"; ev.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)"; }}
              >
                {/* Top row: title + status + actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Lock size={20} color="#7C3AED" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontFamily: F.jakarta, fontSize: 14, fontWeight: 700, color: "#0D0621" }}>
                        {e.project?.title || `Escrow #${(e._id || "").slice(-8)}`}
                      </span>
                      <span style={{ padding: "2px 9px", borderRadius: 100, background: ss.bg, color: ss.c, fontFamily: F.jakarta, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {ss.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: F.dm, fontSize: 12, color: "rgba(13,6,33,0.5)" }}>
                      {e.creator?.name || "—"} (creator) · {e.investor?.name || "—"} (investor)
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setSelected(e)}
                      style={{ padding: "8px 14px", borderRadius: 10, background: "#F5F3FF", border: "1px solid rgba(124,58,237,0.15)", color: "#7C3AED", fontFamily: F.jakarta, fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <FileText size={13} /> Details
                    </button>
                    {validate && (
                      <button
                        onClick={() => handle("validate", e._id)}
                        disabled={actionLoading !== ""}
                        style={{ padding: "8px 14px", borderRadius: 10, background: "#EDE9FE", border: "none", color: "#7C3AED", fontFamily: F.jakarta, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: actionLoading !== "" ? 0.6 : 1 }}
                      >
                        <CheckCircle size={13} /> Validate
                      </button>
                    )}
                    {release && (
                      <button
                        onClick={() => handle("release", e._id)}
                        disabled={actionLoading !== ""}
                        style={{ padding: "8px 14px", borderRadius: 10, background: "linear-gradient(135deg,#059669,#047857)", border: "none", color: "white", fontFamily: F.jakarta, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: actionLoading !== "" ? 0.6 : 1 }}
                      >
                        <DollarSign size={13} /> Release Funds
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom row: amounts + signing status */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {/* Amount breakdown */}
                  <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "8px 14px", display: "flex", gap: 16 }}>
                    <span style={{ fontFamily: F.dm, fontSize: 12, color: "rgba(13,6,33,0.5)" }}>
                      Held: <strong style={{ color: "#0D0621" }}>{(e.amount || 0).toLocaleString()} FCFA</strong>
                    </span>
                    <span style={{ fontFamily: F.dm, fontSize: 12, color: "rgba(13,6,33,0.5)" }}>
                      Fee: <strong style={{ color: "#D97706" }}>{feeAmount(e).toLocaleString()} FCFA</strong>
                    </span>
                    <span style={{ fontFamily: F.dm, fontSize: 12, color: "rgba(13,6,33,0.5)" }}>
                      Creator gets: <strong style={{ color: "#059669" }}>{creatorGets(e).toLocaleString()} FCFA</strong>
                    </span>
                  </div>

                  {/* Signing status chips */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: creatorSigned ? "#D1FAE5" : "#FEF3C7", borderRadius: 100, padding: "5px 12px" }}>
                      {creatorSigned
                        ? <CheckCircle size={12} color="#059669" />
                        : <Clock size={12} color="#D97706" />
                      }
                      <span style={{ fontFamily: F.dm, fontSize: 12, fontWeight: 600, color: creatorSigned ? "#059669" : "#D97706" }}>
                        Creator {creatorSigned ? "signed" : "not signed"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: investorSigned ? "#D1FAE5" : "#FEF3C7", borderRadius: 100, padding: "5px 12px" }}>
                      {investorSigned
                        ? <CheckCircle size={12} color="#059669" />
                        : <Clock size={12} color="#D97706" />
                      }
                      <span style={{ fontFamily: F.dm, fontSize: 12, fontWeight: 600, color: investorSigned ? "#059669" : "#D97706" }}>
                        Investor {investorSigned ? "signed" : "not signed"}
                      </span>
                    </div>
                    {e.agreement?.adminValidated && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#DBEAFE", borderRadius: 100, padding: "5px 12px" }}>
                        <CheckCircle size={12} color="#2563EB" />
                        <span style={{ fontFamily: F.dm, fontSize: 12, fontWeight: 600, color: "#2563EB" }}>Admin validated</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 580, boxShadow: "0 40px 100px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white", zIndex: 1, borderRadius: "24px 24px 0 0" }}>
              <h3 style={{ fontFamily: F.jakarta, fontSize: 17, fontWeight: 800, color: "#0D0621", margin: 0 }}>
                Escrow Details
              </h3>
              <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: 8, background: "#F5F3FF", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: 22 }}>

              {/* Project & parties */}
              <div style={{ background: "#F5F3FF", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: F.jakarta, fontSize: 15, fontWeight: 700, color: "#0D0621", marginBottom: 6 }}>
                  {selected.project?.title || "—"}
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: F.dm, fontSize: 13, color: "rgba(13,6,33,0.6)" }}>
                    Creator: <strong style={{ color: "#0D0621" }}>{selected.creator?.name || "—"}</strong>
                  </span>
                  <span style={{ fontFamily: F.dm, fontSize: 13, color: "rgba(13,6,33,0.6)" }}>
                    Investor: <strong style={{ color: "#0D0621" }}>{selected.investor?.name || "—"}</strong>
                  </span>
                </div>
              </div>

              {/* Amount breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { l: "Escrow Amount", v: `${(selected.amount || 0).toLocaleString()} FCFA`, c: "#0D0621" },
                  { l: `Platform Fee (${feePercent(selected)}%)`, v: `${feeAmount(selected).toLocaleString()} FCFA`, c: "#D97706" },
                  { l: "Creator Receives", v: `${creatorGets(selected).toLocaleString()} FCFA`, c: "#059669" },
                ].map(m => (
                  <div key={m.l} style={{ background: "#F5F3FF", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ fontFamily: F.dm, fontSize: 10, color: "rgba(13,6,33,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.l}</div>
                    <div style={{ fontFamily: F.jakarta, fontSize: 16, fontWeight: 700, color: m.c }}>{m.v}</div>
                  </div>
                ))}
              </div>

              {/* Signing status */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 700, color: "#0D0621", marginBottom: 10 }}>
                  Agreement Signing Status
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Creator */}
                  <div style={{ background: selected.agreement?.creatorSigned ? "#F0FDF4" : "#FFFBEB", borderRadius: 12, padding: "12px 16px", border: `1px solid ${selected.agreement?.creatorSigned ? "#BBF7D0" : "#FDE68A"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: selected.agreement?.creatorSigned ? "#D1FAE5" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selected.agreement?.creatorSigned ? <CheckCircle size={16} color="#059669" /> : <Clock size={16} color="#D97706" />}
                      </div>
                      <div>
                        <div style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 700, color: "#0D0621" }}>Creator Signature</div>
                        {selected.agreement?.creatorSignedAt && (
                          <div style={{ fontFamily: F.dm, fontSize: 11, color: "rgba(13,6,33,0.5)", marginTop: 1 }}>
                            Signed {new Date(selected.agreement.creatorSignedAt).toLocaleString()}
                          </div>
                        )}
                        {!selected.agreement?.creatorSigned && (
                          <div style={{ fontFamily: F.dm, fontSize: 11, color: "#D97706", marginTop: 1 }}>Pending</div>
                        )}
                      </div>
                    </div>
                    {selected.agreement?.creatorSignedUrl ? (
                      <button
                        onClick={() => viewSignedDoc(selected._id, "creator")}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "white", border: "1px solid #DDD6FE", color: "#7C3AED", fontSize: 12, fontWeight: 600, fontFamily: F.jakarta, cursor: "pointer" }}
                      >
                        <FileText size={12} /> View Document
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "rgba(13,6,33,0.4)", fontFamily: F.dm }}>Not yet uploaded</span>
                    )}
                  </div>

                  {/* Investor */}
                  <div style={{ background: selected.agreement?.investorSigned ? "#F0FDF4" : "#FFFBEB", borderRadius: 12, padding: "12px 16px", border: `1px solid ${selected.agreement?.investorSigned ? "#BBF7D0" : "#FDE68A"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: selected.agreement?.investorSigned ? "#D1FAE5" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selected.agreement?.investorSigned ? <CheckCircle size={16} color="#059669" /> : <Clock size={16} color="#D97706" />}
                      </div>
                      <div>
                        <div style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 700, color: "#0D0621" }}>Investor Signature</div>
                        {selected.agreement?.investorSignedAt && (
                          <div style={{ fontFamily: F.dm, fontSize: 11, color: "rgba(13,6,33,0.5)", marginTop: 1 }}>
                            Signed {new Date(selected.agreement.investorSignedAt).toLocaleString()}
                          </div>
                        )}
                        {!selected.agreement?.investorSigned && (
                          <div style={{ fontFamily: F.dm, fontSize: 11, color: "#D97706", marginTop: 1 }}>Pending</div>
                        )}
                      </div>
                    </div>
                    {selected.agreement?.investorSignedUrl ? (
                      <button
                        onClick={() => viewSignedDoc(selected._id, "investor")}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "white", border: "1px solid #DDD6FE", color: "#7C3AED", fontSize: 12, fontWeight: 600, fontFamily: F.jakarta, cursor: "pointer" }}
                      >
                        <FileText size={12} /> View Document
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "rgba(13,6,33,0.4)", fontFamily: F.dm }}>Not yet uploaded</span>
                    )}
                  </div>

                  {/* Admin validated */}
                  <div style={{ background: selected.agreement?.adminValidated ? "#EFF6FF" : "#F5F3FF", borderRadius: 12, padding: "12px 16px", border: `1px solid ${selected.agreement?.adminValidated ? "#BFDBFE" : "#DDD6FE"}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: selected.agreement?.adminValidated ? "#DBEAFE" : "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selected.agreement?.adminValidated ? <CheckCircle size={16} color="#2563EB" /> : <AlertTriangle size={16} color="#7C3AED" />}
                    </div>
                    <div>
                      <div style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 700, color: "#0D0621" }}>Admin Validation</div>
                      {selected.agreement?.adminValidatedAt ? (
                        <div style={{ fontFamily: F.dm, fontSize: 11, color: "rgba(13,6,33,0.5)", marginTop: 1 }}>
                          Validated {new Date(selected.agreement.adminValidatedAt).toLocaleString()}
                        </div>
                      ) : (
                        <div style={{ fontFamily: F.dm, fontSize: 11, color: "rgba(13,6,33,0.5)", marginTop: 1 }}>Not yet validated</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                {canValidate(selected) && (
                  <button
                    onClick={() => handle("validate", selected._id)}
                    disabled={actionLoading !== ""}
                    style={{ flex: 1, padding: 13, borderRadius: 12, background: "#EDE9FE", border: "none", color: "#7C3AED", fontFamily: F.jakarta, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: actionLoading !== "" ? 0.6 : 1 }}
                  >
                    <CheckCircle size={16} /> {actionLoading ? "Working..." : "Validate Agreement"}
                  </button>
                )}
                {canRelease(selected) && (
                  <button
                    onClick={() => handle("release", selected._id)}
                    disabled={actionLoading !== ""}
                    style={{ flex: 1, padding: 13, borderRadius: 12, background: "linear-gradient(135deg,#059669,#047857)", border: "none", color: "white", fontFamily: F.jakarta, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: actionLoading !== "" ? 0.6 : 1 }}
                  >
                    <DollarSign size={16} /> {actionLoading ? "Working..." : `Release ${creatorGets(selected).toLocaleString()} FCFA to Creator`}
                  </button>
                )}
                {!canValidate(selected) && !canRelease(selected) && (
                  <div style={{ flex: 1, padding: 13, borderRadius: 12, background: "#F5F3FF", textAlign: "center", fontFamily: F.dm, fontSize: 13, color: "rgba(13,6,33,0.5)" }}>
                    {selected.status === "released"
                      ? "Funds already released."
                      : (!selected.agreement?.creatorSigned || !selected.agreement?.investorSigned)
                        ? "Waiting for both parties to sign."
                        : "Use Validate to approve, then Release to transfer funds."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
