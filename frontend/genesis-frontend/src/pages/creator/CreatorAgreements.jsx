import { useState, useEffect, useRef } from "react";
import { FileText, Check, Upload, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../api/axios";

const STEPS = [
  { num: 1, label: "Payment Received",  desc: "Investor payment confirmed" },
  { num: 2, label: "Download Agreement", desc: "Download the auto-generated PDF" },
  { num: 3, label: "Sign & Upload",      desc: "Sign and upload your copy" },
  { num: 4, label: "Awaiting Investor",  desc: "Investor must also sign" },
  { num: 5, label: "Admin Validation",   desc: "Admin reviews and releases funds" },
];

function EscrowCard({ escrow, onDownload, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const step = escrow.status === "holding" && !escrow.agreement?.creatorSigned ? 2
    : escrow.status === "holding" && escrow.agreement?.creatorSigned && !escrow.agreement?.investorSigned ? 4
    : escrow.status === "ready_for_release" && !escrow.agreement?.adminValidated ? 5
    : escrow.status === "released" ? 6 : 3;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("agreementDoc", file);
      await onUpload(escrow._id, fd);
    } finally { setUploading(false); }
  };

  const statusMap = {
    holding:           { bg: "#FFF7ED", color: "#C2410C", label: "Funds Held in Escrow" },
    ready_for_release: { bg: "#EFF6FF", color: "#1D4ED8", label: "Ready for Release" },
    released:          { bg: "#F0FDF4", color: "#16A34A", label: "Released" },
    refunded:          { bg: "#FEF2F2", color: "#DC2626", label: "Refunded" },
  };
  const st = statusMap[escrow.status] || statusMap.holding;

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #EDE9FF", overflow: "hidden", boxShadow: "0 2px 16px rgba(124,58,237,0.06)", marginBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F0FF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0D0621" }}>{escrow.project?.title || "Project"}</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
            {escrow.amount?.toLocaleString()} FCFA · Investor: {escrow.investor?.name || "—"}
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
      </div>

      {/* Steps */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F0FF" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {STEPS.map((s, i) => {
            const done = step > s.num;
            const current = step === s.num;
            return (
              <div key={s.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: "absolute", top: 14, left: "50%", width: "100%", height: 2, background: done ? "#7C3AED" : "#EDE9FE", zIndex: 0 }} />
                )}
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#7C3AED" : current ? "#EDE9FE" : "#F5F3FF", border: `2px solid ${done || current ? "#7C3AED" : "#DDD6FE"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, flexShrink: 0, position: "relative" }}>
                  {done
                    ? <Check size={13} color="#fff" strokeWidth={3} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: current ? "#7C3AED" : "#A78BFF" }}>{s.num}</span>
                  }
                </div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: current ? 700 : 500, color: current ? "#0D0621" : "#9CA3AF", textAlign: "center" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Signature status */}
      <div style={{ padding: "16px 24px", background: "#FAFAFF", borderBottom: "1px solid #F3F0FF", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Your Signature",       done: escrow.agreement?.creatorSigned,   at: escrow.agreement?.creatorSignedAt },
          { label: "Investor's Signature", done: escrow.agreement?.investorSigned,  at: escrow.agreement?.investorSignedAt },
          { label: "Admin Validated",      done: escrow.agreement?.adminValidated,  at: escrow.agreement?.adminValidatedAt },
        ].map(sig => (
          <div key={sig.label} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: `1px solid ${sig.done ? "#BBF7D0" : "#EDE9FE"}` }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>{sig.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: sig.done ? "#10B981" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sig.done && <Check size={10} color="#fff" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: sig.done ? "#059669" : "#9CA3AF" }}>{sig.done ? "Signed" : "Pending"}</span>
            </div>
            {sig.done && sig.at && <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3 }}>{new Date(sig.at).toLocaleDateString()}</div>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: "18px 24px", display: "flex", gap: 12 }}>
        <button onClick={() => onDownload(escrow._id)}
          style={{ flex: 1, background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "11px 0", color: "#7C3AED", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <FileText size={15} /> Download Agreement PDF
        </button>

        {!escrow.agreement?.creatorSigned && escrow.status === "holding" && (
          <div style={{ flex: 1 }}>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.png" onChange={handleFile} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: "100%", background: uploading ? "#C4B5FD" : "linear-gradient(135deg,#7C3AED,#6D28D9)", border: "none", borderRadius: 10, padding: "11px 0", color: "#fff", fontSize: 13, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Upload size={15} /> {uploading ? "Uploading..." : "Upload Signed Copy"}
            </button>
          </div>
        )}

        {escrow.agreement?.creatorSigned && !escrow.agreement?.investorSigned && (
          <div style={{ flex: 1, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#92400E", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <AlertCircle size={14} /> Waiting for investor to sign...
          </div>
        )}

        {escrow.status === "released" && (
          <div style={{ flex: 1, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 600 }}>
            <CheckCircle size={14} /> Funds Released to Wallet
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatorAgreements() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false }), 3500);
  };

  const fetchEscrows = async () => {
    try {
      const r = await api.get("/agreements/my-escrows");
      setEscrows(r.data.escrows || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEscrows(); }, []);

  const handleDownload = async (escrowId) => {
    try {
      const response = await api.get(`/agreements/${escrowId}/view-agreement`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `agreement-${escrowId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Failed to download agreement. Please try again.", "error");
    }
  };

  const handleUpload = async (escrowId, formData) => {
    try {
      await api.post(`/agreements/${escrowId}/creator-sign`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Agreement signed successfully!");
      fetchEscrows();
    } catch (e) { showToast(e.response?.data?.message || "Upload failed", "error"); }
  };

  return (
    <div>
      {toast.show && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "error" ? "#DC2626" : "#059669", color: "#fff", borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 600, zIndex: 999, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0D0621", marginBottom: 4 }}>Agreements</div>
        <div style={{ fontSize: 14, color: "#6B7280" }}>Download, sign and upload your investment agreements</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9CA3AF" }}>
          <div style={{ width: 28, height: 28, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading agreements...
        </div>
      ) : escrows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 20, border: "1px solid #EDE9FE" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <FileText size={56} color="#C4B5FD" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0D0621", marginBottom: 6 }}>No agreements yet</div>
          <div style={{ fontSize: 14, color: "#9CA3AF" }}>Agreements appear after an investor pays for their deal</div>
        </div>
      ) : escrows.map(e => (
        <EscrowCard key={e._id} escrow={e} onDownload={handleDownload} onUpload={handleUpload} />
      ))}
    </div>
  );
}
