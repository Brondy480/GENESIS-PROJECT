import { useState, useEffect, useRef } from "react";
import { getMyRequests, sendCounterOffer, getMessages, sendMessage } from "../../api/investor";

const STATUS_STYLE = {
  pending:   { bg: "#FFF7ED", color: "#C2410C", label: "Pending" },
  approved:  { bg: "#F0FDF4", color: "#16A34A", label: "Approved" },
  rejected:  { bg: "#FEF2F2", color: "#DC2626", label: "Rejected" },
  accepted:  { bg: "#EFF6FF", color: "#1D4ED8", label: "Accepted" },
  countered: { bg: "#FAF5FF", color: "#7C3AED", label: "Countered" },
  open:      { bg: "#F0FDF4", color: "#059669", label: "Open" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#F3F4F6", color: "#6B7280", label: status };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function InvestorRequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [counter, setCounter] = useState({ amount: "", equity: "", message: "" });
  const [chatMsg, setChatMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const chatRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false }), 3000);
  };

  useEffect(() => {
    getMyRequests()
      .then(r => setRequests(r.data.requests || r.data || []))
      .catch(e => {
        console.error("Could not load requests:", e.response?.data?.message || e.message);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    getMessages(selected._id)
      .then(r => setMessages(r.data.messages || r.data || []))
      .catch(() => setMessages([]));
  }, [selected]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleCounter = async () => {
    if (!counter.amount || !counter.equity) return;
    setSending(true);
    try {
      await sendCounterOffer(selected._id, {
        amount: Number(counter.amount),
        equity: Number(counter.equity),
        message: counter.message,
      });
      const r = await getMessages(selected._id);
      setMessages(r.data.messages || r.data || []);
      setCounter({ amount: "", equity: "", message: "" });
      showToast("Counter offer sent");
    } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
    finally { setSending(false); }
  };

  const handleChat = async () => {
    if (!chatMsg.trim()) return;
    setSending(true);
    try {
      await sendMessage(selected._id, chatMsg);
      const r = await getMessages(selected._id);
      setMessages(r.data.messages || r.data || []);
      setChatMsg("");
    } catch (e) { showToast("Failed to send", "error"); }
    finally { setSending(false); }
  };

  // Determine effective status for display
  const getDisplayStatus = (r) => {
    if (r.adminStatus !== "approved") return r.adminStatus;
    return r.negotiationStatus || r.creatorStatus || "approved";
  };

  return (
    <div>
      {toast.show && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "error" ? "#DC2626" : "#059669", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1E0B4B", marginBottom: 4 }}>My Investment Requests</div>
        <div style={{ fontSize: 14, color: "#7B7496" }}>{requests.length} request{requests.length !== 1 ? "s" : ""} total</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, minHeight: 600 }}>
        {/* List */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FF", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "#A09BBF", fontSize: 14 }}>Loading...</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#A09BBF", marginTop: 8 }}>No requests yet</div>
            </div>
          ) : requests.map(r => (
            <div key={r._id} onClick={() => setSelected(r)}
              style={{ padding: "16px 18px", borderBottom: "1px solid #F3F0FF", cursor: "pointer", background: selected?._id === r._id ? "#F5F3FF" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1E0B4B", flex: 1, marginRight: 8 }}>{r.project?.title || "Project"}</div>
                <StatusBadge status={getDisplayStatus(r)} />
              </div>
              <div style={{ fontSize: 12, color: "#7B7496" }}>${r.amount?.toLocaleString()} · {r.equityRequested}% equity</div>
              <div style={{ fontSize: 11, color: "#A09BBF", marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {/* Detail + Chat */}
        {!selected ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#A09BBF" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1E0B4B", marginBottom: 4 }}>Select a request</div>
              <div style={{ fontSize: 13 }}>View details and negotiate terms</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #F3F0FF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1E0B4B" }}>{selected.project?.title}</div>
                  <div style={{ fontSize: 13, color: "#7B7496", marginTop: 2 }}>Creator: {selected.creator?.name || "—"}</div>
                </div>
                <StatusBadge status={getDisplayStatus(selected)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 14 }}>
                {[
                  { label: "Your Offer", value: `$${(selected.currentTerms?.amount || selected.amount)?.toLocaleString()}` },
                  { label: "Equity Requested", value: `${selected.currentTerms?.equity || selected.equityRequested}%` },
                  { label: "Admin Status", value: selected.adminStatus },
                ].map(t => (
                  <div key={t.label} style={{ background: "#F8F7FF", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "#A09BBF" }}>{t.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1E0B4B", marginTop: 2 }}>{t.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", minHeight: 180, maxHeight: 220 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#A09BBF", fontSize: 13, paddingTop: 20 }}>No messages yet</div>
              ) : messages.map((m, i) => {
                const isMe = m.role === "investor";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 10 }}>
                    <div style={{ maxWidth: "72%", background: isMe ? "linear-gradient(135deg,#7C6FFF,#9B89FF)" : "#F3F0FF", color: isMe ? "#fff" : "#1E0B4B", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 14px", fontSize: 13 }}>
                      {m.type === "counter" && <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Counter Offer: ${m.amount?.toLocaleString()} · {m.equity}%</div>}
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Counter offer form */}
            {selected.adminStatus === "approved" && selected.creatorStatus !== "rejected" && (
              <div style={{ borderTop: "1px solid #F3F0FF", padding: "14px 20px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1E0B4B", marginBottom: 10 }}>Send Counter Offer</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                  {["amount", "equity", "message"].map(field => (
                    <div key={field}>
                      <label style={{ fontSize: 11, color: "#7B7496", display: "block", marginBottom: 4 }}>
                        {field === "amount" ? "Amount ($)" : field === "equity" ? "Equity (%)" : "Note"}
                      </label>
                      <input value={counter[field]} onChange={e => setCounter({ ...counter, [field]: e.target.value })}
                        type={field === "message" ? "text" : "number"}
                        style={{ width: "100%", border: "1.5px solid #E8E4FF", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <button onClick={handleCounter} disabled={sending}
                    style={{ background: "#7C6FFF", border: "none", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Chat input */}
            <div style={{ borderTop: "1px solid #F3F0FF", padding: "12px 20px", display: "flex", gap: 10 }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChat()}
                style={{ flex: 1, border: "1.5px solid #E8E4FF", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }}
                placeholder="Send a message..." />
              <button onClick={handleChat} disabled={sending || !chatMsg.trim()}
                style={{ background: "#7C6FFF", border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}