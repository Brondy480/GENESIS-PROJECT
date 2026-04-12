import { useState, useEffect } from "react";
import { Rocket, X, AlertCircle, CheckCircle } from "lucide-react";
import { getMyDeals, payDeal } from "../../api/investor";

const STATUS_STYLES = {
  awaiting_payment:   { bg: "#FFF7ED", color: "#C2410C", label: "Awaiting Payment",   dot: "#F59E0B" },
  payment_completed:  { bg: "#F0FDF4", color: "#16A34A", label: "Payment Completed",  dot: "#10B981" },
  active:             { bg: "#EFF6FF", color: "#1D4ED8", label: "Active",             dot: "#3B82F6" },
  completed:          { bg: "#F0FDF4", color: "#15803D", label: "Completed",          dot: "#22C55E" },
  cancelled:          { bg: "#FEF2F2", color: "#DC2626", label: "Cancelled",          dot: "#EF4444" },
};

export default function InvestorDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 4000);
  };

  const fetchDeals = () => {
    setLoading(true);
    getMyDeals()
      .then(r => setDeals(r.data.deals || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeals(); }, []);

  const handlePay = async (dealId) => {
    setPaying(true);
    try {
      await payDeal(dealId);
      showToast("Payment processed! Agreement PDF generated and sent to your email.");
      fetchDeals();
      setSelectedDeal(null);
    } catch (e) {
      showToast(e.response?.data?.message || "Payment failed", "error");
    } finally { setPaying(false); }
  };

  const s = (status) => STATUS_STYLES[status] || { bg: "#F3F4F6", color: "#6B7280", label: status, dot: "#9CA3AF" };

  return (
    <div>
      {toast.show && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "error" ? "#DC2626" : "#059669", color: "#fff", borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 600, zIndex: 999, maxWidth: 360, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1E0B4B", marginBottom: 4 }}>My Deals</div>
        <div style={{ fontSize: 14, color: "#7B7496" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""} total</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#A09BBF" }}>Loading deals...</div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 20, border: "1px solid #EDE9FF" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Rocket size={56} color="#C4B5FD" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1E0B4B", marginBottom: 6 }}>No deals yet</div>
          <div style={{ fontSize: 14, color: "#A09BBF" }}>Your accepted investment requests will appear here</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {deals.map(deal => {
            const st = s(deal.dealStatus);
            return (
              <div key={deal._id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FF", overflow: "hidden", boxShadow: "0 2px 12px rgba(124,111,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", background: "#E8E4FF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {deal.project?.coverImage
                        ? <img src={deal.project.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <Rocket size={24} color="#A78BFF" strokeWidth={1.5} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1E0B4B" }}>{deal.project?.title || "Project"}</div>
                      <div style={{ fontSize: 13, color: "#7B7496", marginTop: 2 }}>Creator: {deal.creator?.name || "—"}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#A09BBF" }}>Amount</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1E0B4B" }}>{deal.amount?.toLocaleString()} FCFA</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#A09BBF" }}>Equity</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#7C6FFF" }}>{deal.equity}%</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#A09BBF" }}>Status</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setSelectedDeal(deal)}
                      style={{ background: "#F0EEFF", border: "none", borderRadius: 10, padding: "9px 16px", color: "#7C6FFF", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Details
                    </button>
                    {deal.dealStatus === "awaiting_payment" && (
                      <button onClick={() => setSelectedDeal(deal)}
                        style={{ background: "linear-gradient(135deg,#7C6FFF,#9B89FF)", border: "none", borderRadius: 10, padding: "9px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDeal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 520, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1E0B4B" }}>Deal Details</div>
              <button onClick={() => setSelectedDeal(null)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
                <X size={16} color="#6B7280" />
              </button>
            </div>

            <div style={{ background: "#F8F7FF", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1E0B4B", marginBottom: 16 }}>{selectedDeal.project?.title}</div>
              {[
                ["Investment Amount", `${selectedDeal.amount?.toLocaleString()} FCFA`],
                ["Equity", `${selectedDeal.equity}%`],
                ["Status", STATUS_STYLES[selectedDeal.dealStatus]?.label || selectedDeal.dealStatus],
                ["Platform Fee", `${selectedDeal.platformFeePercent || 5}%`],
                ["Creator", selectedDeal.creator?.name || "—"],
                ["Deal ID", selectedDeal._id],
                ["Created", new Date(selectedDeal.createdAt).toLocaleDateString()],
                ...(selectedDeal.paidAt ? [["Paid At", new Date(selectedDeal.paidAt).toLocaleDateString()]] : []),
                ...(selectedDeal.escrow ? [["Escrow ID", typeof selectedDeal.escrow === "string" ? selectedDeal.escrow : selectedDeal.escrow._id]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #EDE9FF" }}>
                  <span style={{ fontSize: 13, color: "#7B7496" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E0B4B", wordBreak: "break-all", maxWidth: "60%", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>

            {selectedDeal.dealStatus === "awaiting_payment" && (
              <div>
                <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "#92400E", display: "flex", gap: 10 }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  Payment required to proceed. An agreement PDF will be auto-generated and emailed to both parties once paid.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "#F0EEFF", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#7B7496" }}>You Pay</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#1E0B4B" }}>{selectedDeal.amount?.toLocaleString()} FCFA</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#7B7496" }}>You Receive</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#7C6FFF" }}>{selectedDeal.equity}% equity</div>
                  </div>
                </div>
                <button onClick={() => handlePay(selectedDeal._id)} disabled={paying}
                  style={{ width: "100%", background: paying ? "#C4B5FD" : "linear-gradient(135deg,#7C6FFF,#9B89FF)", border: "none", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: paying ? "not-allowed" : "pointer" }}>
                  {paying ? "Processing Payment..." : `Confirm & Pay ${selectedDeal.amount?.toLocaleString()} FCFA`}
                </button>
              </div>
            )}

            {selectedDeal.dealStatus === "payment_completed" && (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#166534", display: "flex", gap: 10, alignItems: "center" }}>
                <CheckCircle size={16} />
                Payment completed. Go to Agreements to sign the investment agreement.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}