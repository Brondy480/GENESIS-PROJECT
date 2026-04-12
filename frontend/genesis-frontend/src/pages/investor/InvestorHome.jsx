import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Handshake, Clock, CreditCard, FileText, Inbox, Globe, TrendingUp, Wallet2 } from "lucide-react";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

function StatCard({ label, value, sub, accent, Icon }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 16px rgba(124,111,255,0.07)", border: "1px solid #EDE9FF", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#7B7496", fontWeight: 500 }}>{label}</span>
        <Icon size={22} color={accent || "#1E0B4B"} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent || "#1E0B4B", letterSpacing: "-1px" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#A09BBF" }}>{sub}</div>}
    </div>
  );  
}

function DealRow({ deal }) {
  const statusColors = {
    awaiting_payment: { bg: "#FFF7ED", color: "#C2410C", label: "Awaiting Payment" },
    payment_completed: { bg: "#F0FDF4", color: "#16A34A", label: "Payment Completed" },
    active: { bg: "#EFF6FF", color: "#1D4ED8", label: "Active" },
    completed: { bg: "#F0FDF4", color: "#15803D", label: "Completed" },
  };
  const s = statusColors[deal.dealStatus] || { bg: "#F3F4F6", color: "#6B7280", label: deal.dealStatus };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #F3F0FF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#7C6FFF22,#A78BFF33)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={18} color="#7C3AED" /></div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1E0B4B" }}>{deal.project?.title || "Project"}</div>
          <div style={{ fontSize: 12, color: "#A09BBF", marginTop: 2 }}>{deal.equity}% equity · {deal.amount?.toLocaleString()} FCFA</div>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
    </div>
  );
}

export default function InvestorHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealsRes, walletRes] = await Promise.allSettled([
          api.get("/payment/deal"),
          api.get("/wallet/my"),
        ]);
        if (dealsRes.status === "fulfilled") setDeals(dealsRes.value.data.deals || []);
        if (walletRes.status === "fulfilled") setWallet(walletRes.value.data.wallet || walletRes.value.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInvested = deals.filter(d => d.dealStatus !== "awaiting_payment").reduce((s, d) => s + (d.amount || 0), 0);
  const activeDeals = deals.filter(d => d.dealStatus === "active").length;
  const pendingPayment = deals.filter(d => d.dealStatus === "awaiting_payment").length;

  return (
    <div>
      {/* Welcome */}
      <div style={{ background: "linear-gradient(120deg,#1E0B4B 0%,#3B1A8A 60%,#2D1065 100%)", borderRadius: 20, padding: "28px 32px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, background: "rgba(124,111,255,0.15)", borderRadius: "50%" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#7C6FFF,#A78BFF)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            {user?.profileImage
              ? <img src={user.profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              : <span style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 20 }}>{user?.name?.[0]?.toUpperCase() || "I"}</span>}
          </div>
          <div>
          <div style={{ fontSize: 13, color: "#A78BFF", fontWeight: 500, marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{user?.name}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Manage your investments and grow your portfolio</div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button onClick={() => navigate("/investor/dashboard/browse")}
              style={{ background: "#7C6FFF", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Browse Projects
            </button>
            <button onClick={() => navigate("/investor/dashboard/deals")}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              My Deals
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Invested" value={`${totalInvested.toLocaleString()} FCFA`} sub="Across all deals" Icon={DollarSign} accent="#7C6FFF" />
        <StatCard label="Active Deals" value={activeDeals} sub="Currently running" Icon={Handshake} accent="#059669" />
        <StatCard label="Pending Payment" value={pendingPayment} sub="Awaiting your action" Icon={Clock} accent="#D97706" />
        <StatCard label="Wallet Balance" value={wallet ? `${(wallet.balance || 0).toLocaleString()} FCFA` : "—"} sub="Available funds" Icon={CreditCard} accent="#7C3AED" />
      </div>

      {/* Recent deals + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Recent Deals */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 16px rgba(124,111,255,0.07)", border: "1px solid #EDE9FF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1E0B4B" }}>Recent Deals</div>
            <button onClick={() => navigate("/investor/dashboard/deals")} style={{ fontSize: 12, color: "#7C6FFF", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#A09BBF", fontSize: 14 }}>Loading...</div>
          ) : deals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Inbox size={44} color="#DDD6FE" style={{ display: "block", margin: "0 auto 12px" }} />
              <div style={{ fontSize: 14, color: "#A09BBF" }}>No deals yet</div>
              <button onClick={() => navigate("/investor/dashboard/browse")}
                style={{ marginTop: 14, background: "#7C6FFF", border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Browse Projects
              </button>
            </div>
          ) : deals.slice(0, 5).map(d => <DealRow key={d._id} deal={d} />)}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Feed Button - Highlighted */}
          <button onClick={() => navigate("/feed")}
            style={{ background: "linear-gradient(135deg, #7C6FFF, #9B89FF)", border: "none", borderRadius: 14, padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", boxShadow: "0 4px 16px rgba(124, 111, 255, 0.35)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Globe size={20} color="#7C3AED" /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Go to Project Feed</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Discover & invest in projects</div>
            </div>
          </button>

          {[
            { Icon: Globe,      label: "Browse Projects", desc: "Discover new opportunities", path: "/investor/dashboard/browse",   color: "#7C6FFF" },
            { Icon: Inbox,      label: "My Requests",     desc: "Track pending requests",     path: "/investor/dashboard/requests", color: "#059669" },
            { Icon: TrendingUp, label: "My Portfolio",    desc: "View equity ownership",      path: "/investor/dashboard/portfolio",color: "#D97706" },
            { Icon: Wallet2,    label: "My Wallet",       desc: "Check balance",              path: "/investor/dashboard/wallet",   color: "#7C3AED" },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              style={{ background: "#fff", border: "1px solid #EDE9FF", borderRadius: 14, padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", transition: "box-shadow 0.2s", boxShadow: "0 2px 8px rgba(124,111,255,0.05)" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><a.Icon size={20} color={a.color} /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1E0B4B" }}>{a.label}</div>
                <div style={{ fontSize: 12, color: "#A09BBF", marginTop: 2 }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}