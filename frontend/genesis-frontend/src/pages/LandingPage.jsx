import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import vid1 from "../assets/DGaveclebic.mp4";
import vid2 from "../assets/DGenveste.mp4";
import vid3 from "../assets/jeune.mp4";
import vid4 from "../assets/projectsurpapier.mp4";
import vid5 from "../assets/Vueaeriene.mp4";

const VIDEOS = [vid1, vid2, vid3, vid4, vid5];

const PROJECTS = [
  { id:1, title:"SolarGrid Africa",   cat:"Energy",     loc:"Lagos, NG",   raised:480, goal:500, equity:"12%", val:"$4M",  days:8,  hot:true,  img:"https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop&q=80" },
  { id:2, title:"AgriChain Platform", cat:"AgriTech",   loc:"Nairobi, KE", raised:210, goal:400, equity:"18%", val:"$2.2M",days:24, hot:false, img:"https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop&q=80" },
  { id:3, title:"MediConnect",        cat:"HealthTech", loc:"Accra, GH",   raised:150, goal:300, equity:"15%", val:"$2M",  days:31, hot:false, img:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop&q=80" },
];

const TABS = [
  { id:"investor", icon:"📈", label:"Investors", color:"#7C3AED",
    title:"Own equity in Africa's next unicorns",
    body:"Negotiate terms directly. Every deal escrow-protected, legally documented, admin-validated.",
    perks:["Equity ownership","Direct negotiation","Escrow protection","Legal agreements","Portfolio dashboard","Shareholder rights"] },
  { id:"creator",  icon:"🚀", label:"Creators",  color:"#6D28D9",
    title:"Your vision. Your terms. Your future.",
    body:"Set your valuation, choose your equity offer, and accept both backers and investors simultaneously.",
    perks:["Set your valuation","Dual funding modes","Auto PDF agreements","Negotiation tools","Deal dashboard","Fund tracking"] },
  { id:"backer",   icon:"🤝", label:"Backers",   color:"#5B21B6",
    title:"Back bold African ideas directly.",
    body:"Support projects you believe in. No equity complexity — just pure backing for Africa's innovators.",
    perks:["Simple contributions","Project tracking","Community updates","Impact reports","Verified projects","Direct support"] },
];

const STEPS = [
  { n:"01", icon:"👤", title:"Create & Verify",     body:"Register as an investor, creator, or backer. Upload your documents and get verified by our admin team before you can participate." },
  { n:"02", icon:"🔍", title:"Post or Browse",      body:"Creators post projects with their valuation and equity offer. Investors browse verified opportunities filtered by category, country, and stage." },
  { n:"03", icon:"🤝", title:"Negotiate & Close",   body:"Use our built-in negotiation tools to send counter-offers, discuss terms directly, and reach an agreement. A deal is created." },
  { n:"04", icon:"🔒", title:"Escrow, Sign & Done", body:"Investor pays into escrow. Both parties sign the auto-generated legal PDF agreement. Admin validates. Funds released to creator." },
];

/* ── VIDEO CAROUSEL — seamless dual-video crossfade ── */
const CLIP_DURATION = 6;   // seconds to play per clip
const CROSSFADE_MS  = 900; // crossfade duration in ms

function HeroCarousel() {
  const [activeSlot, setActiveSlot] = useState(0); // 0 = A on top, 1 = B on top
  const [dotIdx,     setDotIdx]     = useState(0);
  const refA   = useRef(null);
  const refB   = useRef(null);
  const curIdx = useRef(0);   // current video index
  const busy   = useRef(false);

  const getActive   = () => activeSlot === 0 ? refA.current : refB.current;
  const getInactive = () => activeSlot === 0 ? refB.current : refA.current;

  const crossfadeTo = (nextIdx) => {
    if (busy.current) return;
    busy.current = true;
    curIdx.current = nextIdx;
    setDotIdx(nextIdx);

    const next = getInactive();
    if (!next) { busy.current = false; return; }
    next.src = VIDEOS[nextIdx];
    next.currentTime = 0;
    next.load();
    next.play().catch(() => {});

    setActiveSlot(s => s === 0 ? 1 : 0);
    setTimeout(() => { busy.current = false; }, CROSSFADE_MS + 150);
  };

  const goNext = () => crossfadeTo((curIdx.current + 1) % VIDEOS.length);

  // timeupdate: cut clip at CLIP_DURATION seconds
  const onTimeUpdate = (slot) => (e) => {
    if (slot !== activeSlot) return;
    if (e.target.currentTime >= CLIP_DURATION) goNext();
  };

  // Boot
  useEffect(() => {
    const a = refA.current;
    const b = refB.current;
    if (!a || !b) return;
    a.src = VIDEOS[0]; a.currentTime = 0; a.load(); a.play().catch(() => {});
    b.src = VIDEOS[1]; b.currentTime = 0; b.load(); // preload silently
  }, []);

  const vidStyle = (slot) => ({
    position:"absolute", inset:0,
    width:"100%", height:"100%",
    objectFit:"cover", objectPosition:"center top",
    display:"block",
    opacity:   activeSlot === slot ? 1 : 0,
    zIndex:    activeSlot === slot ? 2 : 1,
    transition:`opacity ${CROSSFADE_MS}ms ease`,
  });

  return (
    <div style={{ position:"relative", overflow:"hidden" }}>
      <video ref={refA} muted playsInline style={vidStyle(0)} onTimeUpdate={onTimeUpdate(0)} />
      <video ref={refB} muted playsInline style={vidStyle(1)} onTimeUpdate={onTimeUpdate(1)} />

      {/* Dark overlay */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(124,58,237,0.1) 0%,rgba(13,6,33,0.55) 100%)", zIndex:1 }} />

      {/* Floating badge — Escrow */}
      <div className="animate-floatA" style={{ position:"absolute", bottom:"22%", left:"6%", background:"white", borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(124,58,237,0.18)", zIndex:3 }}>
        <div style={{ width:38, height:38, background:"#EDE9FE", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔐</div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#7C3AED", fontFamily:"var(--font-jakarta)", marginBottom:2 }}>Escrow Active</div>
          <div style={{ fontSize:11, color:"rgba(13,6,33,0.4)", fontFamily:"var(--font-dm)" }}>$10,000 secured</div>
        </div>
      </div>

      {/* Floating badge — Deal Signed */}
      <div style={{ position:"absolute", bottom:"8%", right:"6%", background:"white", borderRadius:16, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 32px rgba(124,58,237,0.15)", zIndex:3, animation:"floatA 6s 1.2s ease-in-out infinite" }}>
        <div style={{ width:34, height:34, background:"#F0FDF4", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✅</div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#16A34A", fontFamily:"var(--font-jakarta)" }}>Deal Signed</div>
          <div style={{ fontSize:11, color:"rgba(13,6,33,0.38)", fontFamily:"var(--font-dm)" }}>Agreement validated</div>
        </div>
      </div>

      {/* Live deals badge */}
      <div style={{ position:"absolute", top:"12%", right:"8%", background:"white", borderRadius:16, padding:"10px 16px", display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", zIndex:3 }}>
        <div className="animate-blink" style={{ width:8, height:8, background:"#22C55E", borderRadius:"50%" }} />
        <span style={{ fontSize:12, fontWeight:700, color:"#16A34A", fontFamily:"var(--font-jakarta)" }}>12 Live Deals</span>
      </div>

      {/* Dots */}
      <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", display:"flex", gap:7, zIndex:4 }}>
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => crossfadeTo(i)}
            style={{
              width: dotIdx===i ? 24 : 7,
              height:7, borderRadius:4, border:"none", cursor:"pointer",
              background: dotIdx===i ? "white" : "rgba(255,255,255,0.4)",
              padding:0, transition:"all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Arrow next */}
      <button
        onClick={goNext}
        style={{
          position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
          width:38, height:38, borderRadius:"50%", border:"none", cursor:"pointer",
          background:"rgba(255,255,255,0.18)", backdropFilter:"blur(8px)",
          color:"white", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:4, transition:"all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.3)"}
        onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.18)"}
      >
        ›
      </button>
    </div>
  );
}

/* ── PILL TAG ── */
const PillTag = ({ children, light }) => (
  <div style={{
    display:"inline-flex", alignItems:"center", gap:8,
    background: light ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.08)",
    border: light ? "1px solid rgba(255,255,255,0.18)" : "none",
    color: light ? "rgba(255,255,255,0.8)" : "#7C3AED",
    padding:"5px 14px", borderRadius:100,
    fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:11,
    letterSpacing:"0.08em", textTransform:"uppercase",
  }}>
    <span style={{ width:16, height:2, borderRadius:1, background:"currentColor", display:"inline-block" }} />
    {children}
  </div>
);

/* ── BUTTONS ── */
const BtnSolid = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{
    background:"#7C3AED", color:"white",
    fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14,
    padding:"14px 36px", border:"none", borderRadius:100,
    cursor:"pointer", transition:"all 0.25s", whiteSpace:"nowrap", ...style
  }}
  onMouseEnter={e => { e.currentTarget.style.background="#6D28D9"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(124,58,237,0.35)"; }}
  onMouseLeave={e => { e.currentTarget.style.background=style?.background||"#7C3AED"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
  {children}
  </button>
);

const BtnGhost = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background:"transparent", color:"#7C3AED",
    fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14,
    padding:"13px 36px", border:"2px solid #7C3AED", borderRadius:100,
    cursor:"pointer", transition:"all 0.25s",
  }}
  onMouseEnter={e => { e.currentTarget.style.background="#7C3AED"; e.currentTarget.style.color="white"; }}
  onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#7C3AED"; }}>
  {children}
  </button>
);

/* ── MAIN ── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [count, setCount] = useState({ m:0, p:0, i:0, c:0 });
  const statsRef = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !counted.current) {
        counted.current = true;
        const targets = { m:2.4, p:140, i:1200, c:12 };
        const start = Date.now();
        const tick = () => {
          const prog = Math.min((Date.now()-start)/2000, 1);
          const ease = 1 - Math.pow(1-prog, 3);
          setCount({ m:+(targets.m*ease).toFixed(1), p:Math.floor(targets.p*ease), i:Math.floor(targets.i*ease), c:Math.floor(targets.c*ease) });
          if (prog < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold:0.4 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  return (
    <div style={{ background:"#FAFAFF", color:"#0D0621", fontFamily:"var(--font-dm)", overflowX:"hidden" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        height: scrolled ? 68 : 84, padding:"0 48px",
        background: scrolled ? "rgba(250,250,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(124,58,237,0.08)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(124,58,237,0.06)" : "none",
        transition:"all 0.3s ease",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, background:"linear-gradient(135deg,#7C3AED,#A78BFF)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(124,58,237,0.35)" }}>
            <span style={{ color:"white", fontWeight:800, fontSize:20, fontFamily:"var(--font-jakarta)" }}>G</span>
          </div>
          <span style={{ fontWeight:800, fontSize:20, color:"#0D0621", fontFamily:"var(--font-jakarta)", letterSpacing:"-0.01em" }}>Genesis</span>
        </Link>

        <div style={{ display:"flex", gap:4 }}>
          {[
            { label:"Discover",     action:() => scrollTo("projects") },
            { label:"Invest",       action:() => navigate("/register?role=investor") },
            { label:"Raise",        action:() => navigate("/register?role=creator") },
            { label:"How It Works", action:() => scrollTo("how-it-works") },
          ].map(n => (
            <button key={n.label} onClick={n.action} style={{
              background:"transparent", border:"none", cursor:"pointer",
              padding:"8px 16px", borderRadius:100,
              fontFamily:"var(--font-dm)", fontSize:14, fontWeight:500,
              color:"rgba(13,6,33,0.5)", transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color="#7C3AED"; e.currentTarget.style.background="rgba(124,58,237,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="rgba(13,6,33,0.5)"; e.currentTarget.style.background="transparent"; }}>
              {n.label}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={() => navigate("/login")} style={{
            background:"transparent", border:"none", cursor:"pointer",
            padding:"8px 16px", borderRadius:100,
            fontFamily:"var(--font-dm)", fontSize:14, fontWeight:500,
            color:"rgba(13,6,33,0.5)", transition:"all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color="#7C3AED"; e.currentTarget.style.background="rgba(124,58,237,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.color="rgba(13,6,33,0.5)"; e.currentTarget.style.background="transparent"; }}>
            Sign In
          </button>
          <BtnSolid onClick={() => navigate("/register")} style={{ padding:"11px 26px", fontSize:13 }}>Get Started →</BtnSolid>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr" }}>

        {/* LEFT */}
        <div style={{
          background:"blue",
          padding:"140px 60px 80px 48px", position:"relative",
          overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"center",
        }}>
          <div className="dot-grid" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,255,0.25),transparent 65%)", pointerEvents:"none" }} />

          <div style={{ position:"relative", zIndex:1 }}>
            <div className="animate-slide-right" style={{ marginBottom:28 }}>
              <PillTag light>Platform Launch 2026</PillTag>
            </div>

            <h1 className="animate-slide-right delay-1" style={{
              fontFamily:"var(--font-clash)", fontSize:"clamp(48px,5.2vw,80px)",
              fontWeight:700, lineHeight:1.0, letterSpacing:"-0.025em",
              color:"white", marginBottom:24,
            }}>
              Fund the<br />Future of<br /><span style={{ color:"#C4B5FD" }}>African</span><br />Innovation
            </h1>

            <p className="animate-slide-right delay-2" style={{
              fontSize:17, lineHeight:1.75, color:"rgba(255,255,255,0.62)",
              fontWeight:300, maxWidth:400, marginBottom:40, fontFamily:"var(--font-dm)",
            }}>
              The first platform combining crowdfunding and equity investment — built for Africa's boldest founders and most ambitious investors.
            </p>

            <div className="animate-slide-right delay-3" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:56 }}>
              <button onClick={() => navigate("/register?role=investor")} style={{
                background:"white", color:"#7C3AED",
                fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14,
                padding:"15px 36px", border:"none", borderRadius:100,
                cursor:"pointer", transition:"all 0.25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="#F3EEFF"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="white"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                Start Investing →
              </button>
              <button onClick={() => navigate("/register?role=creator")} style={{
                background:"rgba(255,255,255,0.1)", color:"white",
                fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14,
                padding:"15px 36px", border:"1px solid rgba(255,255,255,0.22)", borderRadius:100,
                cursor:"pointer", backdropFilter:"blur(8px)", transition:"all 0.25s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}>
                Raise Capital
              </button>
            </div>

            <div className="animate-slide-right delay-4" style={{ display:"flex", gap:24, alignItems:"center" }}>
              {[{ icon:"🔐", label:"Escrow-secured" },{ icon:"📋", label:"Legal agreements" },{ icon:"✅", label:"Admin-validated" }].map(b => (
                <div key={b.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:14 }}>{b.icon}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:500, fontFamily:"var(--font-dm)" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position:"absolute", top:0, right:-40, bottom:0, width:80, background:"#FAFAFF", transform:"skewX(-3deg)", zIndex:10 }} />
        </div>

        {/* RIGHT — Video carousel */}
        <HeroCarousel />
      </section>

      {/* ── TICKER ── */}
      <div style={{ borderTop:"1px solid rgba(124,58,237,0.1)", borderBottom:"1px solid rgba(124,58,237,0.1)", padding:"14px 0", overflow:"hidden", background:"white" }}>
        <div className="animate-ticker" style={{ display:"flex", whiteSpace:"nowrap" }}>
          {Array(6).fill(null).map((_,ri) => (
            <div key={ri} style={{ display:"flex", alignItems:"center" }}>
              {["Equity Investment","Escrow Protection","Legal Agreements","Verified Deals","African Innovation","Secure Crowdfunding","12 Countries"].map((t,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:20, padding:"0 20px" }}>
                  <div style={{ width:8, height:8, background:"#7C3AED", borderRadius:"50%", boxShadow:"0 0 0 3px rgba(124,58,237,0.2),0 0 16px rgba(124,58,237,0.4)" }} />
                  <span style={{ fontSize:13, fontWeight:600, color:"rgba(13,6,33,0.35)", letterSpacing:"0.04em", fontFamily:"var(--font-jakarta)" }}>{t}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ padding:"100px 48px", background:"white" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 2fr", gap:80, alignItems:"center" }}>
          <div>
            <div style={{ marginBottom:20 }}><PillTag>By The Numbers</PillTag></div>
            <h2 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(32px,3.5vw,52px)", fontWeight:700, color:"#0D0621", lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:16 }}>
              Trusted by Africa's best founders & investors
            </h2>
            <p style={{ fontSize:16, color:"rgba(13,6,33,0.45)", lineHeight:1.75, fontWeight:300, fontFamily:"var(--font-dm)" }}>
              Real capital. Real equity. Real deals — secured by escrow and validated by our team.
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
            {[
              { value:`$${count.m}M+`, label:"Capital Raised",      sub:"Across all projects",  icon:"💰", even:true  },
              { value:`${count.p}+`,   label:"Active Projects",     sub:"Across 12 countries",  icon:"🚀", even:false },
              { value:`${count.i.toLocaleString()}+`, label:"Registered Investors", sub:"Growing daily", icon:"👥", even:false },
              { value:`${count.c}`,    label:"African Countries",   sub:"And expanding",        icon:"🌍", even:true  },
            ].map((s,i) => (
              <div key={i} style={{ background: s.even?"#F5F3FF":"white", border:"1px solid rgba(124,58,237,0.08)", padding:"36px 32px", transition:"all 0.3s ease", cursor:"default" }}
                onMouseEnter={e => { e.currentTarget.style.background="#EDE9FE"; e.currentTarget.style.transform="translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background=s.even?"#F5F3FF":"white"; e.currentTarget.style.transform="none"; }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                <div style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(36px,4vw,52px)", fontWeight:700, color:"#7C3AED", letterSpacing:"-0.03em", lineHeight:1, marginBottom:8 }}>{s.value}</div>
                <div style={{ fontFamily:"var(--font-jakarta)", fontSize:15, fontWeight:700, color:"#0D0621", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(13,6,33,0.4)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding:"100px 48px", background:"#FAFAFF" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:52 }}>
            <div>
              <div style={{ marginBottom:16 }}><PillTag>Live Opportunities</PillTag></div>
              <h2 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(32px,4vw,56px)", fontWeight:700, color:"#0D0621", letterSpacing:"-0.025em", lineHeight:1.05 }}>
                Open<br /><span className="gradient-text">Deals</span>
              </h2>
            </div>
            <BtnGhost onClick={() => navigate("/register")}>Browse All Projects</BtnGhost>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gridTemplateRows:"auto auto", gap:24 }}>
            {/* Featured large card */}
            <div style={{ gridRow:"1 / 3", background:"white", borderRadius:24, overflow:"hidden", boxShadow:"0 4px 24px rgba(124,58,237,0.06)", cursor:"pointer", transition:"all 0.4s cubic-bezier(0.23,1,0.32,1)" }}
              onClick={() => navigate("/register?role=investor")}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-10px) scale(1.01)"; e.currentTarget.style.boxShadow="0 28px 64px rgba(124,58,237,0.18)"; setHovered(1); }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 24px rgba(124,58,237,0.06)"; setHovered(null); }}>
              <div style={{ position:"relative", height:320, overflow:"hidden" }}>
                <img src={PROJECTS[0].img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s ease", transform: hovered===1?"scale(1.05)":"scale(1)" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(76,29,149,0.8) 0%,rgba(124,58,237,0.2) 60%,transparent)" }} />
                <div style={{ position:"absolute", top:20, left:20, background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", borderRadius:100, padding:"5px 14px" }}>
                  <span style={{ fontFamily:"var(--font-jakarta)", fontSize:11, fontWeight:700, color:"#0D0621" }}>{PROJECTS[0].cat}</span>
                </div>
                <div style={{ position:"absolute", top:20, right:20, background:"linear-gradient(135deg,#7C3AED,#A78BFF)", borderRadius:100, padding:"4px 12px" }}>
                  <span style={{ fontFamily:"var(--font-jakarta)", fontSize:10, fontWeight:800, color:"white" }}>🔥 HOT</span>
                </div>
                <div style={{ position:"absolute", bottom:20, left:20, right:20 }}>
                  <h3 style={{ fontFamily:"var(--font-clash)", fontSize:28, fontWeight:700, color:"white", letterSpacing:"-0.01em", marginBottom:4 }}>{PROJECTS[0].title}</h3>
                  <span style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(255,255,255,0.65)" }}>{PROJECTS[0].loc}</span>
                </div>
              </div>
              <div style={{ padding:"24px 28px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:18 }}>
                  {[{v:`$${PROJECTS[0].raised}K`,l:"Raised"},{v:PROJECTS[0].equity,l:"Equity"},{v:PROJECTS[0].val,l:"Valuation"}].map(m=>(
                    <div key={m.l} style={{ background:"#F5F3FF", borderRadius:14, padding:"14px 16px", textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--font-jakarta)", fontSize:18, fontWeight:800, color:"#7C3AED" }}>{m.v}</div>
                      <div style={{ fontFamily:"var(--font-dm)", fontSize:10, color:"rgba(13,6,33,0.4)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(13,6,33,0.45)" }}>{PROJECTS[0].raised}K of {PROJECTS[0].goal}K</span>
                    <span style={{ fontFamily:"var(--font-jakarta)", fontSize:12, fontWeight:700, color:"#7C3AED" }}>{Math.round(PROJECTS[0].raised/PROJECTS[0].goal*100)}% · {PROJECTS[0].days}d left</span>
                  </div>
                  <div style={{ height:5, background:"#EDE9FE", borderRadius:100, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:"linear-gradient(90deg,#7C3AED,#A78BFF)", borderRadius:100, width:`${PROJECTS[0].raised/PROJECTS[0].goal*100}%` }} />
                  </div>
                </div>
                <button style={{ width:"100%", padding:14, background:"#7C3AED", color:"white", fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14, border:"none", borderRadius:14, cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background="#6D28D9"}
                  onMouseLeave={e => e.currentTarget.style.background="#7C3AED"}>
                  View Investment Opportunity →
                </button>
              </div>
            </div>

            {/* Small cards */}
            {PROJECTS.slice(1,3).map(p => (
              <div key={p.id} style={{ background:"white", borderRadius:24, overflow:"hidden", boxShadow:"0 4px 24px rgba(124,58,237,0.06)", cursor:"pointer", transition:"all 0.4s cubic-bezier(0.23,1,0.32,1)" }}
                onClick={() => navigate("/register?role=investor")}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-8px)"; e.currentTarget.style.boxShadow="0 20px 50px rgba(124,58,237,0.15)"; setHovered(p.id); }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 24px rgba(124,58,237,0.06)"; setHovered(null); }}>
                <div style={{ position:"relative", height:160, overflow:"hidden" }}>
                  <img src={p.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s ease", transform: hovered===p.id?"scale(1.06)":"scale(1)" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(13,6,33,0.6),transparent)" }} />
                  <div style={{ position:"absolute", top:14, left:14, background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", borderRadius:100, padding:"4px 12px" }}>
                    <span style={{ fontFamily:"var(--font-jakarta)", fontSize:10, fontWeight:700 }}>{p.cat}</span>
                  </div>
                  <div style={{ position:"absolute", bottom:12, left:16 }}>
                    <span style={{ fontFamily:"var(--font-clash)", fontSize:18, fontWeight:700, color:"white", letterSpacing:"-0.01em" }}>{p.title}</span>
                  </div>
                </div>
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ display:"flex", gap:8 }}>
                      {[{v:p.equity,l:"Equity"},{v:p.val,l:"Valuation"}].map(m=>(
                        <div key={m.l} style={{ background:"#F5F3FF", borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                          <div style={{ fontFamily:"var(--font-jakarta)", fontSize:15, fontWeight:800, color:"#7C3AED" }}>{m.v}</div>
                          <div style={{ fontFamily:"var(--font-dm)", fontSize:9, color:"rgba(13,6,33,0.4)", textTransform:"uppercase" }}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                    <span style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(13,6,33,0.4)" }}>{p.days}d left</span>
                  </div>
                  <div style={{ height:5, background:"#EDE9FE", borderRadius:100, overflow:"hidden", marginBottom:12 }}>
                    <div style={{ height:"100%", background:"linear-gradient(90deg,#7C3AED,#A78BFF)", borderRadius:100, width:`${Math.round(p.raised/p.goal*100)}%` }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(13,6,33,0.45)" }}>${p.raised}K of ${p.goal}K</span>
                    <button onClick={e=>{e.stopPropagation();navigate("/register?role=investor");}} style={{ padding:"9px 18px", background:"#7C3AED", color:"white", fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:12, border:"none", borderRadius:100, cursor:"pointer" }}>
                      Invest →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:"100px 48px", background:"white", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", right:"-2%", transform:"translateY(-50%)", fontFamily:"var(--font-clash)", fontWeight:700, fontSize:"20vw", color:"rgba(124,58,237,0.03)", lineHeight:1, userSelect:"none", letterSpacing:"-0.05em" }}>HOW</div>
        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", display:"grid", gridTemplateColumns:"1fr 2fr", gap:80, alignItems:"start" }}>
          <div style={{ position:"sticky", top:100 }}>
            <div style={{ marginBottom:20 }}><PillTag>Simple Process</PillTag></div>
            <h2 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(32px,3.5vw,52px)", fontWeight:700, color:"#0D0621", lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:20 }}>
              How Genesis<br /><span className="gradient-text">Works</span>
            </h2>
            <p style={{ fontSize:16, color:"rgba(13,6,33,0.45)", lineHeight:1.75, fontWeight:300, fontFamily:"var(--font-dm)", marginBottom:36 }}>
              From registration to funded deal — every step is secure, transparent, and legally backed.
            </p>
            <BtnSolid onClick={() => navigate("/register")}>Get Started Today →</BtnSolid>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {STEPS.map((step,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:28, padding:"36px 40px", background:"#FAFAFF", border:"1px solid rgba(124,58,237,0.07)", transition:"all 0.3s ease", cursor:"default" }}
                onMouseEnter={e => { e.currentTarget.style.background="#F5F3FF"; e.currentTarget.style.borderColor="rgba(124,58,237,0.2)"; e.currentTarget.style.transform="translateX(6px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#FAFAFF"; e.currentTarget.style.borderColor="rgba(124,58,237,0.07)"; e.currentTarget.style.transform="none"; }}>
                <div>
                  <div style={{ fontFamily:"var(--font-clash)", fontSize:80, fontWeight:700, lineHeight:1, background:"linear-gradient(135deg,#7C3AED,#C4B5FD)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", opacity:0.25, letterSpacing:"-0.04em" }}>{step.n}</div>
                  <div style={{ width:52, height:52, background:"#EDE9FE", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginTop:-16 }}>{step.icon}</div>
                </div>
                <div style={{ paddingTop:8 }}>
                  <h3 style={{ fontFamily:"var(--font-jakarta)", fontSize:19, fontWeight:700, color:"#0D0621", marginBottom:10, letterSpacing:"-0.01em" }}>{step.title}</h3>
                  <p style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(13,6,33,0.48)", lineHeight:1.75, fontWeight:300 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE TABS ── */}
      <section style={{ padding:"100px 48px", background:"#FAFAFF" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ justifyContent:"center", display:"flex", marginBottom:16 }}><PillTag>For Everyone</PillTag></div>
            <h2 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(32px,4vw,56px)", fontWeight:700, color:"#0D0621", letterSpacing:"-0.025em" }}>Your role on Genesis</h2>
          </div>

          <div style={{ background:"white", borderRadius:28, padding:10, boxShadow:"0 4px 24px rgba(124,58,237,0.06)", display:"flex", gap:6, width:"fit-content", margin:"0 auto 24px" }}>
            {TABS.map((t,i) => (
              <button key={i} onClick={() => setActiveTab(i)} style={{
                padding:"12px 32px", borderRadius:20, border:"none",
                fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14,
                cursor:"pointer", transition:"all 0.25s",
                background: activeTab===i ? "#7C3AED" : "transparent",
                color: activeTab===i ? "white" : "rgba(13,6,33,0.45)",
                boxShadow: activeTab===i ? "0 6px 20px rgba(124,58,237,0.3)" : "none",
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ background:"white", borderRadius:28, padding:60, boxShadow:"0 8px 40px rgba(124,58,237,0.07)", borderTop:`3px solid ${TABS[activeTab].color}`, display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
            <div>
              <div style={{ width:60, height:60, background:"linear-gradient(135deg,#EDE9FE,#DDD6FE)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:24 }}>{TABS[activeTab].icon}</div>
              <h3 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(24px,2.8vw,40px)", fontWeight:700, color:"#0D0621", lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:16 }}>{TABS[activeTab].title}</h3>
              <p style={{ fontFamily:"var(--font-dm)", fontSize:16, color:"rgba(13,6,33,0.48)", lineHeight:1.8, fontWeight:300, marginBottom:36 }}>{TABS[activeTab].body}</p>
              <BtnSolid onClick={() => navigate(`/register?role=${TABS[activeTab].id}`)} style={{ background:TABS[activeTab].color }}>
                Join as {TABS[activeTab].label.replace(/s$/,"")} →
              </BtnSolid>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {TABS[activeTab].perks.map((p,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:16, background:"#FAFAFF", borderRadius:14, border:"1px solid rgba(124,58,237,0.07)", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#EDE9FE"; e.currentTarget.style.borderColor="rgba(124,58,237,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#FAFAFF"; e.currentTarget.style.borderColor="rgba(124,58,237,0.07)"; }}>
                  <div style={{ width:22, height:22, background:"linear-gradient(135deg,#7C3AED,#A78BFF)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, color:"white", fontWeight:700 }}>✓</div>
                  <span style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(13,6,33,0.65)", fontWeight:500 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:"linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%)", padding:"120px 48px", position:"relative", overflow:"hidden" }}>
        <div className="dot-grid" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:350, background:"radial-gradient(ellipse,rgba(196,181,253,0.18),transparent)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-15%", right:"-3%", fontFamily:"var(--font-clash)", fontWeight:700, fontSize:"18vw", color:"rgba(255,255,255,0.03)", lineHeight:1, userSelect:"none", letterSpacing:"-0.05em" }}>GO</div>
        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"1fr auto", gap:60, alignItems:"center" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:100, padding:"6px 18px", marginBottom:28 }}>
              <span style={{ fontSize:14 }}>🌍</span>
              <span style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(255,255,255,0.8)" }}>1,200+ investors across Africa</span>
            </div>
            <h2 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(40px,5.5vw,80px)", fontWeight:700, color:"white", lineHeight:1.0, letterSpacing:"-0.025em", marginBottom:20 }}>
              Ready to change<br /><span style={{ color:"#C4B5FD" }}>Africa's future?</span>
            </h2>
            <p style={{ fontFamily:"var(--font-dm)", fontSize:17, color:"rgba(255,255,255,0.55)", fontWeight:300, maxWidth:520, lineHeight:1.75 }}>
              Join the platform where Africa's boldest founders meet its most ambitious investors — with the security and legal structure they deserve.
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, minWidth:240 }}>
            <button onClick={() => navigate("/register?role=investor")} style={{ background:"white", color:"#7C3AED", fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14, padding:"15px 36px", border:"none", borderRadius:100, cursor:"pointer", transition:"all 0.25s", textAlign:"center" }}
              onMouseEnter={e => { e.currentTarget.style.background="#F3EEFF"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="white"; e.currentTarget.style.transform="none"; }}>
              Start Investing →
            </button>
            <button onClick={() => navigate("/register?role=creator")} style={{ background:"rgba(255,255,255,0.08)", color:"white", fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:14, padding:"15px 36px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:100, cursor:"pointer", backdropFilter:"blur(8px)", transition:"all 0.25s", textAlign:"center" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
              Post Your Project
            </button>
            <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(255,255,255,0.35)", textAlign:"center" }}>No fees until your deal closes</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#0D0621", padding:"80px 48px 40px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:60, marginBottom:64 }}>
            <div>
              <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:36, height:36, background:"linear-gradient(135deg,#7C3AED,#A78BFF)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"var(--font-jakarta)", fontWeight:800, fontSize:18, color:"white" }}>G</span>
                </div>
                <span style={{ fontFamily:"var(--font-jakarta)", fontWeight:800, fontSize:20, color:"white" }}>Genesis</span>
              </Link>
              <p style={{ fontFamily:"var(--font-dm)", fontSize:14, lineHeight:1.8, color:"rgba(255,255,255,0.3)", fontWeight:300, maxWidth:260, marginBottom:28 }}>
                Africa's first hybrid crowdfunding and equity investment platform. Built with trust. Secured by escrow.
              </p>
              <div style={{ display:"flex", gap:8 }}>
                {["TW","LI","IG","YT"].map(s => (
                  <div key={s} style={{ width:36, height:36, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s", fontFamily:"var(--font-jakarta)", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)" }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(124,58,237,0.25)"; e.currentTarget.style.color="#A78BFF"; e.currentTarget.style.borderColor="rgba(124,58,237,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title:"Platform", links:[{l:"Browse Projects",to:"/register"},{l:"For Investors",to:"/register?role=investor"},{l:"For Creators",to:"/register?role=creator"},{l:"For Backers",to:"/register?role=backer"},{l:"How It Works",to:"/"}] },
              { title:"Company",  links:[{l:"About Us",to:"/"},{l:"Blog",to:"/"},{l:"Careers",to:"/"},{l:"Press",to:"/"},{l:"Contact",to:"/"}] },
              { title:"Legal",    links:[{l:"Privacy Policy",to:"/"},{l:"Terms of Use",to:"/"},{l:"Cookie Policy",to:"/"},{l:"Compliance",to:"/"},{l:"Security",to:"/"}] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily:"var(--font-jakarta)", fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"rgba(167,139,255,0.6)", textTransform:"uppercase", marginBottom:24 }}>{col.title}</div>
                {col.links.map(link => (
                  <Link key={link.l} to={link.to} style={{ display:"block", textDecoration:"none", fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(255,255,255,0.28)", marginBottom:12, cursor:"pointer", transition:"color 0.2s", fontWeight:300 }}
                    onMouseEnter={e => e.currentTarget.style.color="#A78BFF"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.28)"}>
                    {link.l}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:28, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(255,255,255,0.18)" }}>© 2026 Genesis Platform. All rights reserved.</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="animate-blink" style={{ width:7, height:7, background:"#A78BFF", borderRadius:"50%", boxShadow:"0 0 8px rgba(167,139,255,0.6)" }} />
              <span style={{ fontFamily:"var(--font-jakarta)", fontSize:11, color:"rgba(255,255,255,0.18)", letterSpacing:"0.08em" }}>ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}