import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuthStore from "../store/authStore";

const ROLES = [
  { id:"investor", label:"Investor", icon:"📈", desc:"Buy equity in African startups",       color:"#7C3AED", lightBg:"rgba(124,58,237,0.06)",  border:"rgba(124,58,237,0.2)" },
  { id:"creator",  label:"Creator",  icon:"🚀", desc:"Raise capital for your project",       color:"#6D28D9", lightBg:"rgba(109,40,217,0.06)",  border:"rgba(109,40,217,0.2)" },
  { id:"backer",   label:"Backer",   icon:"🤝", desc:"Support projects you believe in",     color:"#5B21B6", lightBg:"rgba(91,33,182,0.06)",   border:"rgba(91,33,182,0.2)" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const preselected = searchParams.get("role");
  const [selectedRole, setSelectedRole] = useState(preselected || null);
  const [step, setStep] = useState(preselected ? 2 : 1);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setStep(2);
  };

  const onSubmit = async (data) => {
    if (!selectedRole) return;
    clearError();
    const result = await registerUser({ name:data.name, email:data.email, password:data.password, userType:selectedRole });
    if (result.success) navigate(`/${selectedRole}/dashboard`);
  };

  const getStrength = (pw) => {
    if (!pw) return 0;
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return 4;
    if (pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 3;
    if (pw.length >= 8) return 2;
    return 1;
  };
  const strengthColors = ["","#EF4444","#F97316","#EAB308","#22C55E"];
  const strengthLabels = ["","Too short","Acceptable","Good password","Strong password ✓"];

  const inputStyle = (hasError) => ({
    width:"100%", background:"white",
    border:`1.5px solid ${hasError ? "#EF4444" : "rgba(124,58,237,0.15)"}`,
    borderRadius:14, padding:"14px 18px", fontSize:15,
    fontFamily:"var(--font-dm)", color:"#0D0621", outline:"none", transition:"all 0.2s",
    boxShadow: hasError ? "0 0 0 4px rgba(239,68,68,0.08)" : "none",
  });

  const activeRole = ROLES.find(r => r.id === selectedRole);

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", fontFamily:"var(--font-dm)" }}>

      {/* ── LEFT — Purple Panel ── */}
      <div style={{
        background:"linear-gradient(160deg,#7C3AED 0%,#4C1D95 100%)",
        padding:"60px 64px",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        position:"relative", overflow:"hidden",
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

        {/* Center */}
        <div style={{ position:"relative", zIndex:1 }}>
          <h2 style={{ fontFamily:"var(--font-clash)", fontSize:"clamp(32px,3.5vw,48px)", fontWeight:700, color:"white", lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:20 }}>
            Join Africa's<br />boldest platform
          </h2>
          <p style={{ fontFamily:"var(--font-dm)", fontSize:16, color:"rgba(255,255,255,0.6)", lineHeight:1.75, fontWeight:300, maxWidth:340, marginBottom:48 }}>
            Whether you're raising capital, investing in equity, or backing innovation — Genesis is built for you.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {[
              { icon:"📈", title:"Investors", desc:"Buy equity in verified African startups" },
              { icon:"🚀", title:"Creators",  desc:"Raise capital with escrow-backed deals" },
              { icon:"🤝", title:"Backers",   desc:"Support projects you believe in" },
            ].map(r => (
              <div key={r.title} style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, background:"rgba(255,255,255,0.1)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{r.icon}</div>
                <div>
                  <div style={{ fontFamily:"var(--font-jakarta)", fontSize:14, fontWeight:700, color:"white", marginBottom:2 }}>{r.title}</div>
                  <div style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(255,255,255,0.45)" }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ display:"flex" }}>
            {["A","B","C","D"].map((l,i) => (
              <div key={l} style={{ width:32, height:32, borderRadius:"50%", background:`hsl(${260+i*15},60%,60%)`, border:"2px solid rgba(255,255,255,0.3)", marginLeft: i>0?-8:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white", fontFamily:"var(--font-jakarta)" }}>{l}</div>
            ))}
          </div>
          <span style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(255,255,255,0.55)" }}>1,200+ members already joined</span>
        </div>
      </div>

      {/* ── RIGHT — Form Panel ── */}
      <div style={{ background:"#FAFAFF", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 64px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:420 }}>

          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:36 }}>
            {[1,2].map(s => (
              <div key={s} style={{ height:6, borderRadius:3, background: step>=s ? "#7C3AED" : "rgba(13,6,33,0.12)", width: step===s ? 28 : 8, transition:"all 0.3s ease" }} />
            ))}
            <span style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"rgba(13,6,33,0.4)", marginLeft:4 }}>Step {step} of 2</span>
          </div>

          {/* ── STEP 1 — Role Selection ── */}
          {step === 1 && (
            <div className="animate-fade-up">
              <div style={{ marginBottom:32 }}>
                <h1 style={{ fontFamily:"var(--font-clash)", fontSize:30, fontWeight:700, color:"#0D0621", letterSpacing:"-0.02em", marginBottom:8 }}>I want to...</h1>
                <p style={{ fontFamily:"var(--font-dm)", fontSize:15, color:"rgba(13,6,33,0.5)", fontWeight:300 }}>Choose your role on Genesis</p>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {ROLES.map((role) => (
                  <div key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    style={{
                      background: selectedRole===role.id ? role.lightBg : "white",
                      border: `2px solid ${selectedRole===role.id ? role.color : "rgba(13,6,33,0.08)"}`,
                      borderRadius:16, padding:20, cursor:"pointer",
                      display:"flex", alignItems:"center", gap:14,
                      transition:"all 0.25s cubic-bezier(0.23,1,0.32,1)",
                      boxShadow: selectedRole===role.id ? `0 8px 28px ${role.lightBg}` : "0 2px 12px rgba(124,58,237,0.05)",
                    }}
                    onMouseEnter={e => { if (selectedRole!==role.id) { e.currentTarget.style.borderColor=role.border; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(124,58,237,0.1)"; }}}
                    onMouseLeave={e => { if (selectedRole!==role.id) { e.currentTarget.style.borderColor="rgba(13,6,33,0.08)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 2px 12px rgba(124,58,237,0.05)"; }}}>
                    <div style={{ width:48, height:48, background: selectedRole===role.id ? `${role.color}18` : "#F5F3FF", border:`1px solid ${role.border}`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                      {role.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"var(--font-jakarta)", fontSize:16, fontWeight:700, color:"#0D0621", marginBottom:4 }}>{role.label}</div>
                      <div style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(13,6,33,0.5)" }}>{role.desc}</div>
                    </div>
                    <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${selectedRole===role.id ? role.color : "rgba(13,6,33,0.12)"}`, background: selectedRole===role.id ? role.color : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                      {selectedRole===role.id && <span style={{ fontSize:11, color:"white", fontWeight:700 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(13,6,33,0.4)", textAlign:"center", marginTop:28 }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color:"#7C3AED", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 — Registration Form ── */}
          {step === 2 && (
            <div className="animate-fade-up">
              {/* Back button */}
              <button onClick={() => { setStep(1); clearError(); }} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(13,6,33,0.5)", padding:0, marginBottom:28, transition:"color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color="#7C3AED"}
                onMouseLeave={e => e.currentTarget.style.color="rgba(13,6,33,0.5)"}>
                ← Back
              </button>

              {/* Role badge */}
              {activeRole && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#EDE9FE", border:"1px solid rgba(124,58,237,0.2)", borderRadius:100, padding:"6px 14px", marginBottom:24 }}>
                  <span style={{ fontSize:14 }}>{activeRole.icon}</span>
                  <span style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:700, color:"#7C3AED" }}>Registering as {activeRole.label}</span>
                </div>
              )}

              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:"var(--font-clash)", fontSize:30, fontWeight:700, color:"#0D0621", letterSpacing:"-0.02em", marginBottom:8 }}>Create account</h1>
                <p style={{ fontFamily:"var(--font-dm)", fontSize:15, color:"rgba(13,6,33,0.5)", fontWeight:300 }}>Fill in your details to get started</p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:16 }}>⚠️</span>
                  <span style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"#DC2626" }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:18 }}>

                {/* Full name */}
                <div>
                  <label style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:600, color:"#0D0621", display:"block", marginBottom:8 }}>Full name</label>
                  <input
                    {...register("name", { required:"Full name is required", minLength:{ value:2, message:"Name must be at least 2 characters" } })}
                    type="text" placeholder="Your full name"
                    style={inputStyle(!!errors.name)}
                    onFocus={e => { if (!errors.name) { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 4px rgba(124,58,237,0.08)"; }}}
                    onBlur={e => { if (!errors.name) { e.target.style.borderColor="rgba(124,58,237,0.15)"; e.target.style.boxShadow="none"; }}}
                  />
                  {errors.name && <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"#EF4444", marginTop:6 }}>{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:600, color:"#0D0621", display:"block", marginBottom:8 }}>Email address</label>
                  <input
                    {...register("email", { required:"Email is required", pattern:{ value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message:"Enter a valid email" } })}
                    type="email" placeholder="you@example.com"
                    style={inputStyle(!!errors.email)}
                    onFocus={e => { if (!errors.email) { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 4px rgba(124,58,237,0.08)"; }}}
                    onBlur={e => { if (!errors.email) { e.target.style.borderColor="rgba(124,58,237,0.15)"; e.target.style.boxShadow="none"; }}}
                  />
                  {errors.email && <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"#EF4444", marginTop:6 }}>{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:600, color:"#0D0621", display:"block", marginBottom:8 }}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input
                      {...register("password", { required:"Password is required", minLength:{ value:8, message:"Password must be at least 8 characters" } })}
                      type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
                      style={{ ...inputStyle(!!errors.password), paddingRight:48 }}
                      onFocus={e => { if (!errors.password) { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 4px rgba(124,58,237,0.08)"; }}}
                      onBlur={e => { if (!errors.password) { e.target.style.borderColor="rgba(124,58,237,0.15)"; e.target.style.boxShadow="none"; }}}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:18, color:"rgba(13,6,33,0.4)", padding:0 }}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ display:"flex", gap:4 }}>
                        {[1,2,3,4].map(lvl => {
                          const s = getStrength(password);
                          return <div key={lvl} style={{ flex:1, height:3, borderRadius:2, background: lvl<=s ? strengthColors[s] : "rgba(13,6,33,0.08)", transition:"all 0.3s" }} />;
                        })}
                      </div>
                      <p style={{ fontFamily:"var(--font-dm)", fontSize:11, color:"rgba(13,6,33,0.4)", marginTop:4 }}>{strengthLabels[getStrength(password)]}</p>
                    </div>
                  )}
                  {errors.password && <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"#EF4444", marginTop:6 }}>{errors.password.message}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label style={{ fontFamily:"var(--font-jakarta)", fontSize:13, fontWeight:600, color:"#0D0621", display:"block", marginBottom:8 }}>Confirm password</label>
                  <input
                    {...register("confirmPassword", { required:"Please confirm your password", validate: val => val===password || "Passwords do not match" })}
                    type={showPass ? "text" : "password"} placeholder="Repeat your password"
                    style={inputStyle(!!errors.confirmPassword)}
                    onFocus={e => { if (!errors.confirmPassword) { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 4px rgba(124,58,237,0.08)"; }}}
                    onBlur={e => { if (!errors.confirmPassword) { e.target.style.borderColor="rgba(124,58,237,0.15)"; e.target.style.boxShadow="none"; }}}
                  />
                  {errors.confirmPassword && <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"#EF4444", marginTop:6 }}>{errors.confirmPassword.message}</p>}
                </div>

                {/* Terms */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <input
                    {...register("terms", { required:"You must accept the terms" })}
                    type="checkbox" id="terms" style={{ width:16, height:16, marginTop:2, accentColor:"#7C3AED", cursor:"pointer", flexShrink:0 }}
                  />
                  <label htmlFor="terms" style={{ fontFamily:"var(--font-dm)", fontSize:13, color:"rgba(13,6,33,0.55)", lineHeight:1.5, cursor:"pointer" }}>
                    I agree to the{" "}
                    <Link to="/terms" style={{ color:"#7C3AED", textDecoration:"none", fontWeight:600 }}>Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy" style={{ color:"#7C3AED", textDecoration:"none", fontWeight:600 }}>Privacy Policy</Link>
                  </label>
                </div>
                {errors.terms && <p style={{ fontFamily:"var(--font-dm)", fontSize:12, color:"#EF4444", marginTop:-8 }}>{errors.terms.message}</p>}

                {/* Submit */}
                <button type="submit" disabled={isLoading}
                  style={{
                    width:"100%", background:"linear-gradient(135deg,#7C3AED,#6D28D9)", color:"white",
                    fontFamily:"var(--font-jakarta)", fontWeight:700, fontSize:15,
                    padding:15, border:"none", borderRadius:14, cursor: isLoading ? "not-allowed" : "pointer",
                    transition:"all 0.25s", opacity: isLoading ? 0.7 : 1,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  }}
                  onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(124,58,237,0.35)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                  {isLoading ? <><span className="spinner" style={{ width:18, height:18 }} /> Creating account...</> : "Create Account →"}
                </button>
              </form>

              <p style={{ fontFamily:"var(--font-dm)", fontSize:14, color:"rgba(13,6,33,0.4)", textAlign:"center", marginTop:24 }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color:"#7C3AED", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}