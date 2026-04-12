import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    clearError();
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate(`/${result.user.userType}/dashboard`);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    background: "white",
    border: `1.5px solid ${hasError ? "#EF4444" : "rgba(124,58,237,0.15)"}`,
    borderRadius: 14,
    padding: "14px 18px",
    fontSize: 15,
    fontFamily: "var(--font-dm)",
    color: "#0D0621",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: hasError ? "0 0 0 4px rgba(239,68,68,0.08)" : "none",
  });

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", fontFamily: "var(--font-dm)" }}>

      {/* ── LEFT — Purple Panel ── */}
      <div style={{
        background: "linear-gradient(160deg,#7C3AED 0%,#4C1D95 100%)",
        padding: "60px 64px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div className="dot-grid" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-10%", right:"-10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,255,0.2),transparent 65%)", pointerEvents:"none" }} />

        {/* Logo */}
        <Link to="/" style={{ position:"relative", zIndex:1, textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, background:"rgba(255,255,255,0.2)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"var(--font-jakarta)", fontWeight:800, fontSize:20, color:"white" }}>G</span>
          </div>
          <span style={{ fontFamily:"var(--font-jakarta)", fontWeight:800, fontSize:20, color:"white", letterSpacing:"-0.01em" }}>Genesis</span>
        </Link>

        {/* Center content */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:100, padding:"6px 16px", marginBottom:28 }}>
            <span style={{ fontSize:14 }}>🌍</span>
            <span style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(255,255,255,0.8)" }}>Africa's #1 Investment Platform</span>
          </div>

          <h2 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(36px,4vw,52px)", fontWeight:700, color:"white", lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:20 }}>
            Welcome back<br />to Genesis
          </h2>
          <p style={{ fontFamily:"var(--font-dm)", fontSize:16, color:"rgba(255,255,255,0.6)", lineHeight:1.75, fontWeight:300, maxWidth:340, marginBottom:48 }}>
            Continue building Africa's future — your deals, projects, and investments are waiting.
          </p>

          {/* Stats */}
          <div style={{ display:"flex", gap:32 }}>
            {[{ n:"1.4B+ FCFA", l:"Raised" },{ n:"140+", l:"Projects" },{ n:"12", l:"Countries" }].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily:"var(--font-jakarta)", fontSize:22, fontWeight:800, color:"white", letterSpacing:"-0.02em" }}>{s.n}</div>
                <div style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial card */}
        <div style={{ position:"relative", zIndex:1, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:"24px 28px" }}>
          <p style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(255,255,255,0.8)", lineHeight:1.7, fontWeight:300, marginBottom:16 }}>
            "Genesis helped me raise 290M FCFA for my solar project in just 3 months. The escrow system gave investors the confidence to commit."
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#A78BFF,#7C3AED)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontFamily:"var(--font-jakarta)", fontSize:14, fontWeight:700, color:"white" }}>A</span>
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:700, color:"white" }}>Amara Diallo</div>
              <div style={{ fontFamily:"var(--font-dm)", fontSize:11, color:"rgba(255,255,255,0.45)" }}>Creator · SolarGrid Africa</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
              {[...Array(5)].map((_,i) => <span key={i} style={{ fontSize:14, color:"#F0C040" }}>★</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form Panel ── */}
      <div style={{ background:"#FAFAFF", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 72px" }}>
        <div style={{ width:"100%", maxWidth:400 }}>

          {/* Header */}
          <div className="animate-fade-up" style={{ marginBottom:36 }}>
            <h1 style={{ fontFamily:"var(--font-clash)", fontSize:32, fontWeight:700, color:"#0D0621", letterSpacing:"-0.02em", marginBottom:8 }}>Sign in</h1>
            <p style={{ fontFamily:"var(--font-dm)", fontSize:15, color:"rgba(13,6,33,0.5)", fontWeight:300 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color:"#7C3AED", fontWeight:600, textDecoration:"none" }}>Create one →</Link>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12, padding:"12px 16px", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:16 }}>⚠️</span>
              <span style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"#DC2626" }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Email */}
            <div className="animate-fade-up delay-1">
              <label style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:600, color:"#0D0621", display:"block", marginBottom:8, letterSpacing:"0.01em" }}>
                Email address
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message:"Enter a valid email" }
                })}
                type="email" placeholder="you@example.com"
                style={inputStyle(!!errors.email)}
                onFocus={e => { if (!errors.email) { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 4px rgba(124,58,237,0.08)"; }}}
                onBlur={e => { if (!errors.email) { e.target.style.borderColor="rgba(124,58,237,0.15)"; e.target.style.boxShadow="none"; }}}
              />
              {errors.email && <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"#EF4444", marginTop:6 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="animate-fade-up delay-2">
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <label style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:600, color:"#0D0621", letterSpacing:"0.01em" }}>Password</label>
                <Link to="/forgot-password" style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"#7C3AED", textDecoration:"none", fontWeight:500 }}>Forgot password?</Link>
              </div>
              <div style={{ position:"relative" }}>
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPass ? "text" : "password"} placeholder="Enter your password"
                  style={{ ...inputStyle(!!errors.password), paddingRight:48 }}
                  onFocus={e => { if (!errors.password) { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 4px rgba(124,58,237,0.08)"; }}}
                  onBlur={e => { if (!errors.password) { e.target.style.borderColor="rgba(124,58,237,0.15)"; e.target.style.boxShadow="none"; }}}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:18, color:"rgba(13,6,33,0.4)", padding:0 }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"#EF4444", marginTop:6 }}>{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <div className="animate-fade-up delay-3" style={{ display:"flex", alignItems:"center", gap:10 }}>
              <input type="checkbox" id="remember" style={{ width:16, height:16, accentColor:"#7C3AED", cursor:"pointer" }} />
              <label htmlFor="remember" style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(13,6,33,0.55)", cursor:"pointer" }}>Keep me signed in</label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="animate-fade-up delay-4"
              style={{
                width:"100%", background:"linear-gradient(135deg,#7C3AED,#6D28D9)", color:"white",
                fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:15,
                padding:15, border:"none", borderRadius:14, cursor: isLoading ? "not-allowed" : "pointer",
                transition:"all 0.25s", opacity: isLoading ? 0.7 : 1,
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(124,58,237,0.35)"; }}}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
              {isLoading ? <><span className="spinner" style={{ width:18, height:18 }} /> Signing in...</> : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div className="animate-fade-up delay-4" style={{ display:"flex", alignItems:"center", gap:16, margin:"28px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(13,6,33,0.08)" }} />
            <span style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(13,6,33,0.35)" }}>or continue with</span>
            <div style={{ flex:1, height:1, background:"rgba(13,6,33,0.08)" }} />
          </div>

          {/* Social buttons */}
          <div className="animate-fade-up delay-5" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { label:"Google", icon:<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
              { label:"Facebook", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            ].map(s => (
              <button key={s.label} style={{
                background:"white", border:"1.5px solid rgba(13,6,33,0.1)", borderRadius:14,
                padding:13, fontFamily:"var(--font-jakarta)", fontWeight:600, fontSize:14,
                color:"#0D0621", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                gap:10, transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(124,58,237,0.3)"; e.currentTarget.style.background="#F5F3FF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(13,6,33,0.1)"; e.currentTarget.style.background="white"; }}>
                {s.icon}{s.label}
              </button>
            ))}
          </div>

          <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(13,6,33,0.35)", textAlign:"center", marginTop:32, lineHeight:1.6 }}>
            By signing in, you agree to our{" "}
            <Link to="/terms" style={{ color:"#7C3AED", textDecoration:"none" }}>Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" style={{ color:"#7C3AED", textDecoration:"none" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}