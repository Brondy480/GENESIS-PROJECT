// ── CreatorRequests ──────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Inbox, CheckCircle, XCircle } from "lucide-react";
import { getMyRequests, acceptRequest, rejectInvestment, sendCounterOffer, getMessages, sendMessage } from "../../api/creator";

const F = { jakarta:"'Plus Jakarta Sans',sans-serif", dm:"'DM Sans',sans-serif" };

export default function CreatorRequests() { 
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [counter, setCounter] = useState({ amount:"", equity:"", message:"" });
  const [tab, setTab] = useState("chat");
  const [actionLoading, setActionLoading] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try { const r = await getMyRequests(); setRequests(r.data?.requests||r.data||[]); }
    catch { setRequests([]); } finally { setLoading(false); }
  };

  const openRequest = async (req) => {
    setSelected(req); setTab("chat");
    setCounter({ amount:req.currentTerms?.amount||req.amount, equity:req.currentTerms?.equity||req.equityRequested, message:"" });
    setMsgLoading(true);
    try { const r = await getMessages(req._id); setMessages(r.data?.messages||r.data?.negotiationHistory||[]); }
    catch { setMessages([]); } finally { setMsgLoading(false); }
  };

  const sendMsg = async () => {
    if (!newMsg.trim()) return;
    try {
      await sendMessage(selected._id, newMsg);
      setMessages(p=>[...p,{ role:"creator",message:newMsg,createdAt:new Date().toISOString() }]);
      setNewMsg("");
    } catch(e) { alert(e.response?.data?.message||"Failed"); }
  };

  const sendCounter = async () => {
    if (!counter.amount||!counter.equity) return;
    setActionLoading("counter");
    try {
      await sendCounterOffer(selected._id, counter);
      setMessages(p=>[...p,{ role:"creator",proposedBy:"creator",amount:counter.amount,equity:counter.equity,message:counter.message,createdAt:new Date().toISOString(),isCounter:true }]);
      setCounter({ amount:"",equity:"",message:"" });
    } catch(e) { alert(e.response?.data?.message||"Failed"); }
    finally { setActionLoading(""); }
  };

  const accept = async (id) => {
    setActionLoading("accept");
    try { await acceptRequest(id); setRequests(p=>p.map(r=>r._id===id?{...r,creatorStatus:"accepted"}:r)); if(selected?._id===id) setSelected(p=>({...p,creatorStatus:"accepted"})); alert("Accepted! Deal created."); }
    catch(e) { alert(e.response?.data?.message||"Failed"); }
    finally { setActionLoading(""); }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this request?")) return;
    setActionLoading("reject");
    try { await rejectInvestment(id); setRequests(p=>p.map(r=>r._id===id?{...r,creatorStatus:"rejected"}:r)); if(selected?._id===id) setSelected(null); }
    catch(e) { alert(e.response?.data?.message||"Failed"); }
    finally { setActionLoading(""); }
  };

  const filtered = requests.filter(r => {
    if (filter==="pending") return r.creatorStatus==="pending"&&r.adminStatus==="approved";
    if (filter==="accepted") return r.creatorStatus==="accepted";
    if (filter==="rejected") return r.creatorStatus==="rejected";
    return true;
  });

  const statusBadge = (req) => {
    if (req.adminStatus==="pending") return { label:"Awaiting Admin", bg:"#FEF3C7",color:"#D97706" };
    if (req.adminStatus==="rejected") return { label:"Admin Rejected", bg:"#FEE2E2",color:"#DC2626" };
    if (req.creatorStatus==="accepted") return { label:"Accepted", bg:"#D1FAE5",color:"#059669" };
    if (req.creatorStatus==="rejected") return { label:"Rejected", bg:"#FEE2E2",color:"#DC2626" };
    return { label:"Review", bg:"#EDE9FE",color:"#7C3AED" };
  };

  const inp = { width:"100%",background:"#F5F3FF",border:"1.5px solid rgba(124,58,237,0.12)",borderRadius:12,padding:"11px 14px",fontSize:14,fontFamily:F.dm,color:"#0D0621",outline:"none" };

  return (
    <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 1.2fr":"1fr",gap:18,height:"calc(100vh - 160px)" }}>

      {/* List */}
      <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(124,58,237,0.06)",display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <div style={{ padding:"16px 18px",borderBottom:"1px solid rgba(124,58,237,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
          <span style={{ fontFamily:F.jakarta,fontSize:15,fontWeight:700,color:"#0D0621" }}>Investment Requests</span>
          <div style={{ display:"flex",gap:4,background:"#F5F3FF",borderRadius:10,padding:4 }}>
            {["all","pending","accepted","rejected"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:F.jakarta,fontSize:11,fontWeight:700,background:filter===f?"#7C3AED":"transparent",color:filter===f?"white":"rgba(13,6,33,0.5)",transition:"all 0.2s" }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1,overflowY:"auto" }}>
          {loading ? <div style={{ display:"flex",justifyContent:"center",padding:60 }}><div style={{ width:28,height:28,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          : filtered.length===0 ? <div style={{ padding:"60px 20px",textAlign:"center" }}><div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}><Inbox size={44} color="#DDD6FE" /></div><p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>No requests</p></div>
          : filtered.map((req,i) => {
            const sb = statusBadge(req);
            return (
              <div key={i} onClick={()=>openRequest(req)} style={{ padding:"14px 18px",borderBottom:"1px solid rgba(124,58,237,0.05)",cursor:"pointer",background:selected?._id===req._id?"#F5F3FF":"white",borderLeft:selected?._id===req._id?"3px solid #7C3AED":"3px solid transparent",transition:"all 0.15s" }}>
                <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                  <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#A78BFF)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:F.jakarta,fontWeight:800,fontSize:14,flexShrink:0 }}>
                    {req.investor?.name?.[0]?.toUpperCase()||"I"}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4 }}>
                      <span style={{ fontFamily:F.jakarta,fontSize:13,fontWeight:700,color:"#0D0621" }}>{req.investor?.name||"Investor"}</span>
                      <span style={{ padding:"2px 8px",borderRadius:100,background:sb.bg,color:sb.color,fontFamily:F.jakarta,fontSize:10,fontWeight:700,flexShrink:0,marginLeft:8 }}>{sb.label}</span>
                    </div>
                    <span style={{ fontFamily:F.dm,fontSize:12,color:"rgba(13,6,33,0.5)" }}>{(req.currentTerms?.amount||req.amount||0).toLocaleString()} FCFA for {req.currentTerms?.equity||req.equityRequested}% equity</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <div style={{ background:"white",borderRadius:20,boxShadow:"0 2px 16px rgba(124,58,237,0.06)",display:"flex",flexDirection:"column",overflow:"hidden" }}>
          <div style={{ padding:"14px 18px",borderBottom:"1px solid rgba(124,58,237,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
            <div>
              <span style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:700,color:"#0D0621" }}>{selected.investor?.name}</span>
              <span style={{ fontFamily:F.dm,fontSize:11,color:"rgba(13,6,33,0.4)",display:"block",marginTop:2 }}>Request · {selected._id?.slice(-8)}</span>
            </div>
            <button onClick={()=>setSelected(null)} style={{ width:30,height:30,borderRadius:8,background:"#F5F3FF",border:"none",cursor:"pointer",fontSize:14 }}>✕</button>
          </div>

          {/* Terms */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,padding:"12px 18px",background:"#FAFAFF",borderBottom:"1px solid rgba(124,58,237,0.07)",flexShrink:0 }}>
            {[{l:"Amount",v:`${(selected.currentTerms?.amount||selected.amount||0).toLocaleString()} FCFA`},{l:"Equity",v:`${selected.currentTerms?.equity||selected.equityRequested}%`},{l:"Status",v:selected.negotiationStatus||"open"}].map(m=>(
              <div key={m.l} style={{ background:"white",borderRadius:10,padding:"10px",textAlign:"center",border:"1px solid rgba(124,58,237,0.08)" }}>
                <div style={{ fontFamily:F.jakarta,fontSize:14,fontWeight:800,color:"#7C3AED" }}>{m.v}</div>
                <div style={{ fontFamily:F.dm,fontSize:9,color:"rgba(13,6,33,0.4)",textTransform:"uppercase",marginTop:2 }}>{m.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex",borderBottom:"1px solid rgba(124,58,237,0.07)",flexShrink:0 }}>
            {["chat","counter"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:"11px",border:"none",cursor:"pointer",fontFamily:F.jakarta,fontSize:12,fontWeight:700,background:"transparent",color:tab===t?"#7C3AED":"rgba(13,6,33,0.4)",borderBottom:tab===t?"2px solid #7C3AED":"2px solid transparent",transition:"all 0.2s" }}>
                {t==="chat"?"Negotiation":"Counter Offer"}
              </button>
            ))}
          </div>

          {/* Chat */}
          {tab==="chat" && (
            <div style={{ display:"flex",flexDirection:"column",flex:1,overflow:"hidden" }}>
              <div style={{ flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10 }}>
                {msgLoading ? <div style={{ display:"flex",justifyContent:"center",padding:32 }}><div style={{ width:24,height:24,border:"2px solid rgba(124,58,237,0.2)",borderTopColor:"#7C3AED",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /></div>
                : messages.length===0 ? <div style={{ textAlign:"center",padding:"40px 0" }}><p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.4)" }}>No messages yet. Start the negotiation.</p></div>
                : messages.map((msg,i) => {
                  const isMe = msg.role==="creator"||msg.proposedBy==="creator";
                  return (
                    <div key={i} style={{ display:"flex",justifyContent:isMe?"flex-end":"flex-start" }}>
                      <div style={{ maxWidth:"75%",borderRadius:16,padding:"10px 14px",background:isMe?"#7C3AED":"#F5F3FF",borderBottomRightRadius:isMe?4:16,borderBottomLeftRadius:isMe?16:4 }}>
                        {msg.isCounter && <div style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:isMe?"rgba(255,255,255,0.2)":"#EDE9FE",color:isMe?"white":"#7C3AED",marginBottom:6,display:"inline-block",fontFamily:F.jakarta }}>Counter: {Number(msg.amount).toLocaleString()} FCFA / {msg.equity}%</div>}
                        <p style={{ fontFamily:F.dm,fontSize:13,color:isMe?"white":"#0D0621",margin:0,lineHeight:1.5 }}>{msg.message}</p>
                        <p style={{ fontFamily:F.dm,fontSize:10,color:isMe?"rgba(255,255,255,0.5)":"rgba(13,6,33,0.35)",margin:"4px 0 0",textAlign:"right" }}>{new Date(msg.createdAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex",gap:10,padding:"12px 14px",borderTop:"1px solid rgba(124,58,237,0.07)",flexShrink:0 }}>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message..." style={{ ...inp,flex:1,padding:"10px 14px" }} />
                <button onClick={sendMsg} style={{ padding:"10px 18px",borderRadius:12,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:13,cursor:"pointer" }}>Send</button>
              </div>
            </div>
          )}

          {/* Counter offer */}
          {tab==="counter" && (
            <div style={{ flex:1,overflowY:"auto",padding:18,display:"flex",flexDirection:"column",gap:14 }}>
              <p style={{ fontFamily:F.dm,fontSize:13,color:"rgba(13,6,33,0.5)",margin:0,lineHeight:1.6 }}>Propose new terms to the investor.</p>
              {[{l:"New Amount ($)",key:"amount",ph:"e.g. 45000"},{l:"New Equity (%)",key:"equity",ph:"e.g. 8"}].map(f=>(
                <div key={f.key}>
                  <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>{f.l}</label>
                  <input type="number" value={counter[f.key]} onChange={e=>setCounter({...counter,[f.key]:e.target.value})} placeholder={f.ph} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ fontFamily:F.jakarta,fontSize:12,fontWeight:700,color:"#0D0621",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Message</label>
                <textarea value={counter.message} onChange={e=>setCounter({...counter,message:e.target.value})} placeholder="Explain your counter offer..." rows={3} style={{ ...inp,resize:"vertical" }} />
              </div>
              <button onClick={sendCounter} disabled={actionLoading==="counter"} style={{ padding:13,borderRadius:12,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",border:"none",color:"white",fontFamily:F.jakarta,fontWeight:700,fontSize:14,cursor:"pointer",opacity:actionLoading==="counter"?0.7:1 }}>
                {actionLoading==="counter"?"Sending...":"Send Counter Offer"}
              </button>
            </div>
          )}

          {/* Accept/Reject */}
          {selected.creatorStatus==="pending" && selected.adminStatus==="approved" && (
            <div style={{ display:"flex",gap:10,padding:"12px 14px",borderTop:"1px solid rgba(124,58,237,0.07)",flexShrink:0 }}>
              <button onClick={()=>accept(selected._id)} disabled={!!actionLoading} style={{ flex:1,padding:12,borderRadius:12,background:"#D1FAE5",border:"none",color:"#059669",fontFamily:F.jakarta,fontWeight:700,fontSize:13,cursor:"pointer",opacity:actionLoading?0.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                {actionLoading==="accept"?"Accepting...":<><CheckCircle size={15} />Accept Deal</>}
              </button>
              <button onClick={()=>reject(selected._id)} disabled={!!actionLoading} style={{ flex:1,padding:12,borderRadius:12,background:"#FEE2E2",border:"none",color:"#DC2626",fontFamily:F.jakarta,fontWeight:700,fontSize:13,cursor:"pointer",opacity:actionLoading?0.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                {actionLoading==="reject"?"Rejecting...":<><XCircle size={15} />Reject</>}
              </button>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}