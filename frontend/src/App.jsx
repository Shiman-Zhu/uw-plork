import { useState } from "react";

const INIT_PROJECTS = [
  {
    id: 1, name: "SOLARIS", tagline: "Solar-powered autonomous campus weather network",
    category: "HARDWARE", stage: "POC", match: 94, commitment: "SERIOUS",
    roles: [
      { title: "Firmware Engineer", skills: ["Embedded C", "FPGA"], filled: true, member: "A. Singh" },
      { title: "ML Engineer", skills: ["Python", "ML/AI"], filled: true, member: "P. Mehta" },
      { title: "PCB Designer", skills: ["PCB Design", "KiCad"], filled: false },
      { title: "Backend Developer", skills: ["Node.js", "Python"], filled: false },
    ],
    terms: { founder: ["W25", "F25", "W26"], overlap: ["W25", "F25", "W26"] },
    velocity: true, yours: false,
  },
  {
    id: 2, name: "NEXUS AR", tagline: "AR overlay for E5/E7 lab equipment manuals",
    category: "SOFTWARE", stage: "IDEA", match: 78, commitment: "CASUAL",
    roles: [
      { title: "iOS Developer", skills: ["iOS", "Swift"], filled: true, member: "D. Wang" },
      { title: "3D Designer", skills: ["CAD", "Blender"], filled: false },
      { title: "CV Engineer", skills: ["Computer Vision", "Python"], filled: false },
    ],
    terms: { founder: ["S25", "F25"], overlap: ["F25"] },
    velocity: false, yours: false,
  },
  {
    id: 3, name: "WATERVAULT", tagline: "Encrypted academic resource sharing for UW students",
    category: "SOFTWARE", stage: "PROTOTYPE", match: 88, commitment: "STARTUP",
    roles: [
      { title: "Security Engineer", skills: ["Rust", "Crypto"], filled: true, member: "K. Liu" },
      { title: "Frontend Developer", skills: ["React", "TypeScript"], filled: false },
      { title: "DevOps Engineer", skills: ["Docker", "Node.js"], filled: false },
    ],
    terms: { founder: ["W25", "S25", "F25", "W26"], overlap: ["W25", "F25", "W26"] },
    velocity: true, yours: false,
  },
];

const INIT_ACTIVITIES = [
  {
    id: 4, name: "BADMINTON", tagline: "Competitive doubles — looking for consistent partners",
    category: "SPORT", type: "COMPETITIVE", match: 91, spots: 2,
    terms: { overlap: ["W25", "F25", "W26"] }, tags: ["Doubles", "PAC", "Competitive"], yours: false,
  },
  {
    id: 5, name: "JAZZ BAND", tagline: "Small ensemble, plays CIF events and campus shows",
    category: "MUSIC", type: "RECREATIONAL", match: 65, spots: 3,
    terms: { overlap: ["S25", "F25"] }, tags: ["Jazz", "Brass", "Casual"], yours: false,
  },
];

const INIT_PROFILE = {
  name: "Jamie Kim", email: "jkim@uwaterloo.ca",
  discipline: "ECE", year: "3A",
  skills: ["React", "TypeScript", "ML/AI", "Python"],
  interests: ["Badminton", "Chess", "Music"],
  built: "Built a lane-detection model for Midnight Sun. Shipped a React dashboard for 500 users.",
  terms: ["W25", "F25", "W26"],
  commitment: "SERIOUS",
  github: "github.com/jkim",
};

const ALL_TERMS = ["W24", "S24", "F24", "W25", "S25", "F25", "W26"];
const YOU_TERMS = ["W25", "F25", "W26"];
const SKILL_OPTIONS = ["React", "TypeScript", "Python", "ML/AI", "Embedded C", "PCB Design", "CAD", "Rust", "Node.js", "FPGA", "Computer Vision", "iOS", "Java", "C++", "Figma", "Verilog", "Swift", "Docker"];
const DISCIPLINE_OPTIONS = ["ECE", "MTE", "SE", "CE", "ME", "CHE", "CIVE", "ENVE", "NANO", "SYDE", "TRON", "BME"];
const YEAR_OPTIONS = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];
const INTEREST_OPTIONS = ["Volleyball", "Badminton", "Basketball", "Soccer", "Chess", "Hiking", "Music", "Gaming", "Photography", "Cooking", "Running", "Tennis"];
const CATEGORIES_BUILD = ["SOFTWARE", "HARDWARE", "RESEARCH", "STARTUP", "DESIGN"];
const CATEGORIES_CREW = ["SPORT", "MUSIC", "GAMING", "ART", "SOCIAL", "FOOD"];
const STAGES = ["IDEA", "POC", "PROTOTYPE", "SCALING"];
const COMMITMENTS = ["CASUAL", "SERIOUS", "STARTUP"];
const ACTIVITY_TYPES = ["RECREATIONAL", "COMPETITIVE", "ONE-TIME"];

const C = {
  bg: "#F5F2EB",
  surface: "#EDEAE1",
  surface2: "#E5E1D6",
  detail: "#EFECE3",
  ink: "#15150D",
  body: "#3a3a28",
  muted: "#7a7a62",
  rule: "#D8D4C6",
  lime: "#AACC00",
  limeLight: "#F0F9C0",
  limeDark: "#8aaa00",
  limeInk: "#2d3a00",
  red: "#CC3300",
  redLight: "#FFF0ED",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Bebas+Neue&display=swap');`;

const BASE_CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }
  ::selection { background: ${C.lime}; color: ${C.limeInk}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${C.rule}; border-radius: 2px; }
  input, textarea, button, select { font-family: 'IBM Plex Mono', monospace; }
  input::placeholder, textarea::placeholder { color: ${C.muted}; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
  .fade-up { animation: fadeUp 0.3s both; }
  .slide-in { animation: slideIn 0.25s both; }
  @media(max-width:860px) {
    .app-layout { flex-direction: column !important; }
    .app-sidebar { width: 100% !important; max-height: 220px !important; border-right: none !important; border-bottom: 1px solid ${C.rule} !important; }
  }
  @media(max-width:540px) { .topbar-meta { display: none !important; } }
`;

const D = ({ children, size = 48, color = C.ink, style = {} }) => (
  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: size, letterSpacing: "0.08em", lineHeight: 1, color, ...style }}>{children}</span>
);
const M = ({ children, style = {} }) => (
  <span style={{ fontFamily: "'IBM Plex Mono',monospace", ...style }}>{children}</span>
);

function Chip({ children, active, onClick, small }) {
  return (
    <span onClick={onClick} style={{
      display: "inline-block", fontFamily: "'IBM Plex Mono',monospace",
      fontSize: small ? 10 : 11, letterSpacing: "0.04em",
      padding: small ? "3px 8px" : "5px 12px",
      border: active ? `1.5px solid ${C.ink}` : `1px solid ${C.rule}`,
      background: active ? C.ink : "transparent",
      color: active ? C.bg : C.body,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.1s", userSelect: "none",
    }}>{children}</span>
  );
}

function FieldInput({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>{label}</label>
        {hint && <M style={{ fontSize: 10, color: C.muted }}>{hint}</M>}
      </div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", fontSize: 13, color: C.ink, background: C.surface, border: `1px solid ${C.rule}`, outline: "none", transition: "border-color 0.15s" }}
        onFocus={e => e.target.style.borderColor = C.lime}
        onBlur={e => e.target.style.borderColor = C.rule}
      />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>{label}</label>
        {hint && <M style={{ fontSize: 10, color: C.muted }}>{hint}</M>}
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", padding: "11px 14px", fontSize: 13, color: C.ink, background: C.surface, border: `1px solid ${C.rule}`, outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.15s" }}
        onFocus={e => e.target.style.borderColor = C.lime}
        onBlur={e => e.target.style.borderColor = C.rule}
      />
    </div>
  );
}

function SectionLabel({ children }) {
  return <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>{children}</M>;
}

function SectionDivider() {
  return <div style={{ height: 1, background: C.rule, margin: "28px 0" }} />;
}

function Landing({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", color: C.ink }}>
      <style>{BASE_CSS}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 56, borderBottom: `1px solid ${C.rule}` }}>
        <D size={26}>PLORK</D>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onLogin} style={{ fontSize: 11, letterSpacing: "0.08em", padding: "8px 20px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>LOG IN</button>
          <button onClick={onSignup} style={{ fontSize: 11, letterSpacing: "0.08em", padding: "8px 20px", border: "none", background: C.ink, color: C.bg, cursor: "pointer", fontWeight: 600 }}>SIGN UP →</button>
        </div>
      </nav>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 56px)" }}>
        <div style={{ padding: "72px 56px 56px", borderRight: `1px solid ${C.rule}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <M style={{ fontSize: 11, color: C.muted, letterSpacing: "0.16em", display: "block", marginBottom: 20 }}>FOR WORK AND PLAY</M>
            <div style={{ marginBottom: 32 }}>
              <D size={76} style={{ display: "block", marginBottom: 2 }}>FIND YOUR</D>
              <D size={76} style={{ display: "block", marginBottom: 2 }}>TEAM AT</D>
              <span style={{ display: "inline-block", background: C.ink, padding: "2px 14px" }}>
                <D size={76} color={C.lime}>WATERLOO</D>
              </span>
            </div>
            <p style={{ fontSize: 14, color: C.body, lineHeight: 1.8, maxWidth: 420, marginBottom: 40 }}>
              The co-op cycle kills side projects and sports teams alike. Plork matches you by skill, schedule, and the terms you're actually on campus.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onSignup} style={{ fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, padding: "13px 32px", border: "none", background: C.lime, color: C.limeInk, cursor: "pointer" }}>GET STARTED →</button>
              <button onClick={onLogin} style={{ fontSize: 12, letterSpacing: "0.1em", padding: "13px 32px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>LOG IN</button>
            </div>
          </div>
          <div style={{ display: "flex", paddingTop: 32, borderTop: `1px solid ${C.rule}`, marginTop: 56 }}>
            {[["10K+", "ENG STUDENTS"], ["4", "CO-OP ROTATIONS/YR"], ["8", "DISCIPLINES"]].map(([n, l], i) => (
              <div key={l} style={{ flex: 1, paddingRight: i < 2 ? 24 : 0, borderRight: i < 2 ? `1px solid ${C.rule}` : "none", marginRight: i < 2 ? 24 : 0 }}>
                <D size={32} style={{ display: "block" }}>{n}</D>
                <M style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em" }}>{l}</M>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ borderBottom: `1px solid ${C.rule}`, padding: "48px 48px 36px" }}>
            <SectionLabel>TWO MODES</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {[{ m: "BUILD", desc: "Side projects & engineering teams. Role slots, skill matching, Velocity track.", dark: true }, { m: "CREW", desc: "Sports, music, social. Find people on campus the same terms as you.", dark: false }].map((x, i) => (
                <div key={x.m} style={{ padding: "20px 22px", background: x.dark ? C.ink : C.surface, borderRight: i === 0 ? `1px solid ${C.rule}` : "none" }}>
                  <D size={22} color={x.dark ? C.lime : C.muted} style={{ display: "block", marginBottom: 10 }}>{x.m}</D>
                  <p style={{ fontSize: 12, color: x.dark ? "#7a9a6a" : C.muted, lineHeight: 1.65 }}>{x.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderBottom: `1px solid ${C.rule}`, padding: "32px 48px" }}>
            <SectionLabel>CO-OP OVERLAP CALENDAR</SectionLabel>
            {[{ n: "YOU", t: ["W25", "F25", "W26"] }, { n: "ARJUN", t: ["W25", "S25", "F25", "W26"] }, { n: "PRIYA", t: ["F25", "W26"] }].map(p => (
              <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <M style={{ width: 52, fontSize: 10, color: C.muted }}>{p.n}</M>
                <div style={{ display: "flex", gap: 5 }}>
                  {ALL_TERMS.slice(3).map(t => { const a = p.t.includes(t), ov = a && YOU_TERMS.includes(t); return <div key={t} style={{ width: 30, height: 14, background: ov ? C.lime : a ? C.ink : C.rule }} />; })}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 5, marginTop: 6, paddingLeft: 66 }}>
              {ALL_TERMS.slice(3).map(t => <M key={t} style={{ width: 30, fontSize: 8, color: C.muted, textAlign: "center" }}>{t}</M>)}
            </div>
          </div>
          <div style={{ padding: "32px 48px" }}>
            <SectionLabel>ROLE SLOT SYSTEM</SectionLabel>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <D size={20}>SOLARIS</D>
              <M style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>94% MATCH</M>
            </div>
            {[{ t: "Firmware Engineer", f: true, m: "A. Singh" }, { t: "ML Engineer", f: true, m: "P. Mehta" }, { t: "Backend Dev", f: false }].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.rule}` }}>
                <div style={{ width: 7, height: 7, flexShrink: 0, background: r.f ? C.ink : "transparent", border: r.f ? "none" : `1px solid ${C.rule}` }} />
                <M style={{ fontSize: 12, flex: 1, color: r.f ? C.muted : C.ink, textDecoration: r.f ? "line-through" : "none" }}>{r.t}</M>
                {r.f ? <M style={{ fontSize: 11, color: C.muted }}>→ {r.m}</M> : <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", border: `1px solid ${C.ink}`, padding: "2px 9px" }}>OPEN</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({ onBack, onSuccess }) {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace" }}>
      <style>{BASE_CSS}</style>
      <nav style={{ display: "flex", alignItems: "center", padding: "0 48px", height: 56, borderBottom: `1px solid ${C.rule}`, gap: 16 }}>
        <span onClick={onBack} style={{ fontSize: 11, color: C.muted, cursor: "pointer" }}>← BACK</span>
        <D size={22}>PLORK</D>
      </nav>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, minHeight: "calc(100vh - 56px)" }}>
        <div style={{ width: "100%", maxWidth: 420, border: `1px solid ${C.rule}`, padding: "52px 48px" }}>
          <D size={40} style={{ display: "block", marginBottom: 6 }}>LOG IN</D>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 40 }}>Welcome back to Plork.</p>
          <FieldInput label="UW EMAIL" value={email} onChange={setEmail} placeholder="userid@uwaterloo.ca" type="email" />
          <FieldInput label="PASSWORD" value={pass} onChange={setPass} placeholder="••••••••" type="password" />
          <button onClick={onSuccess} style={{ width: "100%", padding: "13px", fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, background: C.ink, color: C.bg, border: "none", cursor: "pointer", marginTop: 8 }}>LOG IN →</button>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.rule}`, textAlign: "center" }}>
            <span style={{ fontSize: 11, color: C.muted }}>No account? </span>
            <span onClick={onBack} style={{ fontSize: 11, color: C.ink, cursor: "pointer", textDecoration: "underline" }}>Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = ["ACCOUNT", "STREAM", "SKILLS", "SCHEDULE", "DONE"];
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "", discipline: "", year: "", skills: [], interests: [], built: "", terms: [], commitment: "" });
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tog = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));
  const canNext = () => { if (step === 0) return form.name && form.email && form.password; if (step === 1) return form.discipline && form.year; if (step === 2) return form.skills.length > 0; if (step === 3) return form.terms.length > 0; return true; };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", display: "flex", flexDirection: "column" }}>
      <style>{BASE_CSS}</style>
      <div style={{ height: 3, background: C.rule }}><div style={{ height: "100%", width: `${(step / (STEPS.length - 1)) * 100}%`, background: C.lime, transition: "width 0.4s" }} /></div>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 56, borderBottom: `1px solid ${C.rule}` }}>
        <D size={22}>PLORK</D>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 22, height: 22, background: i < step ? C.ink : i === step ? C.lime : "transparent", border: i < step ? `1px solid ${C.ink}` : i === step ? "none" : `1px solid ${C.rule}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: i < step ? C.bg : i === step ? C.limeInk : C.muted, fontWeight: 600 }}>{i < step ? "✓" : i + 1}</div>
              {i < STEPS.length - 1 && <div style={{ width: 14, height: 1, background: C.rule }} />}
            </div>
          ))}
        </div>
      </nav>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "52px 40px", overflowY: "auto" }}>
        <div className="fade-up" key={step} style={{ width: "100%", maxWidth: 580 }}>
          {step === 0 && <><D size={44} style={{ display: "block", marginBottom: 6 }}>CREATE ACCOUNT</D><p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Sign up with your UW email.</p><FieldInput label="FULL NAME" value={form.name} onChange={v => u("name", v)} placeholder="Jamie Kim" /><FieldInput label="UW EMAIL" value={form.email} onChange={v => u("email", v)} placeholder="jkim@uwaterloo.ca" type="email" /><FieldInput label="PASSWORD" value={form.password} onChange={v => u("password", v)} placeholder="••••••••" type="password" /></>}
          {step === 1 && <><D size={44} style={{ display: "block", marginBottom: 6 }}>YOUR STREAM</D><p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Helps Plork understand your schedule.</p><div style={{ marginBottom: 28 }}><SectionLabel>DISCIPLINE</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{DISCIPLINE_OPTIONS.map(d => <Chip key={d} active={form.discipline === d} onClick={() => u("discipline", d)}>{d}</Chip>)}</div></div><div><SectionLabel>CURRENT TERM</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{YEAR_OPTIONS.map(y => <Chip key={y} active={form.year === y} onClick={() => u("year", y)}>{y}</Chip>)}</div></div></>}
          {step === 2 && <><D size={44} style={{ display: "block", marginBottom: 6 }}>YOUR SKILLS</D><p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Select everything you're comfortable with.</p><div style={{ marginBottom: 28 }}><SectionLabel>TECHNICAL SKILLS</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{SKILL_OPTIONS.map(s => <Chip key={s} active={form.skills.includes(s)} onClick={() => tog("skills", s)}>{s}</Chip>)}</div></div><FieldTextarea label="WHAT I'VE BUILT" value={form.built} onChange={v => u("built", v)} placeholder="Built a lane-detection model for Midnight Sun." hint="1–2 lines" /><div><SectionLabel>INTERESTS — for Crew Mode</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{INTEREST_OPTIONS.map(s => <Chip key={s} active={form.interests.includes(s)} onClick={() => tog("interests", s)}>{s}</Chip>)}</div></div></>}
          {step === 3 && <><D size={44} style={{ display: "block", marginBottom: 6 }}>YOUR SCHEDULE</D><p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Which terms are you on campus?</p><div style={{ marginBottom: 32 }}><SectionLabel>ON-CAMPUS TERMS</SectionLabel><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{ALL_TERMS.map(t => <div key={t} onClick={() => tog("terms", t)} style={{ padding: "14px 18px", border: form.terms.includes(t) ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.terms.includes(t) ? C.ink : C.surface, cursor: "pointer", textAlign: "center", transition: "all 0.12s", minWidth: 60 }}><D size={15} color={form.terms.includes(t) ? C.lime : C.muted} style={{ display: "block" }}>{t}</D></div>)}</div></div><SectionLabel>COMMITMENT LEVEL</SectionLabel>{COMMITMENTS.map(c => <div key={c} onClick={() => u("commitment", c)} style={{ padding: "13px 18px", border: form.commitment === c ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.commitment === c ? C.ink : C.surface, cursor: "pointer", marginBottom: 8, display: "flex", gap: 16, alignItems: "center", transition: "all 0.12s" }}><D size={15} color={form.commitment === c ? C.lime : C.muted} style={{ flexShrink: 0 }}>{c}</D><span style={{ fontSize: 12, color: form.commitment === c ? "#7a9a6a" : C.muted, lineHeight: 1.5 }}>{c === "CASUAL" ? "A few hours a week" : c === "SERIOUS" ? "Consistent effort, aiming to ship" : "Startup-track — applying to Velocity"}</span></div>)}</>}
          {step === 4 && <div style={{ textAlign: "center", paddingTop: 40 }}><div style={{ width: 64, height: 64, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px" }}>✓</div><D size={48} style={{ display: "block", marginBottom: 14 }}>YOU'RE IN.</D><p style={{ fontSize: 14, color: C.body, lineHeight: 1.8, marginBottom: 40, maxWidth: 380, margin: "0 auto 40px" }}>Profile created for <strong>{form.name || "you"}</strong>.<br />{form.discipline} {form.year}{form.skills.length > 0 ? " · " + form.skills.slice(0, 3).join(", ") : ""}</p><button onClick={onComplete} style={{ fontSize: 13, letterSpacing: "0.12em", fontWeight: 700, padding: "14px 44px", background: C.ink, color: C.bg, border: "none", cursor: "pointer" }}>ENTER PLORK →</button></div>}
          {step < 4 && <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.rule}` }}><button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ fontSize: 11, padding: "10px 24px", border: `1px solid ${C.rule}`, background: "transparent", color: step === 0 ? C.rule : C.body, cursor: step === 0 ? "default" : "pointer" }}>← BACK</button><button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={!canNext()} style={{ fontSize: 11, letterSpacing: "0.1em", padding: "10px 28px", border: "none", background: canNext() ? C.ink : C.rule, color: canNext() ? C.bg : C.muted, cursor: canNext() ? "pointer" : "default", fontWeight: 700 }}>NEXT →</button></div>}
        </div>
      </div>
    </div>
  );
}

function PostModal({ mode, onClose, onSubmit }) {
  const isBuild = mode === "BUILD";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", tagline: "", category: "", stage: "", commitment: "", type: "", velocity: false, spots: 2, roles: [{ title: "", skills: [] }], terms: [] });
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addRole = () => setForm(f => ({ ...f, roles: [...f.roles, { title: "", skills: [] }] }));
  const removeRole = i => setForm(f => ({ ...f, roles: f.roles.filter((_, j) => j !== i) }));
  const updateRole = (i, k, v) => setForm(f => ({ ...f, roles: f.roles.map((r, j) => j === i ? { ...r, [k]: v } : r) }));
  const toggleRoleSkill = (i, s) => setForm(f => ({ ...f, roles: f.roles.map((r, j) => j === i ? { ...r, skills: r.skills.includes(s) ? r.skills.filter(x => x !== s) : [...r.skills, s] } : r) }));
  const toggleTerm = t => setForm(f => ({ ...f, terms: f.terms.includes(t) ? f.terms.filter(x => x !== t) : [...f.terms, t] }));
  const canNextStep = () => { if (step === 0) return form.name && form.tagline && form.category && (isBuild ? (form.stage && form.commitment) : form.type); if (step === 1) return isBuild ? form.roles.every(r => r.title) : true; return form.terms.length > 0; };
  const handleSubmit = () => {
    onSubmit({ id: Date.now(), name: form.name.toUpperCase(), tagline: form.tagline, category: form.category, stage: isBuild ? form.stage : undefined, type: !isBuild ? form.type : undefined, commitment: isBuild ? form.commitment : undefined, match: Math.floor(Math.random() * 20) + 70, velocity: form.velocity, yours: true, roles: isBuild ? form.roles.map(r => ({ ...r, filled: false })) : undefined, spots: !isBuild ? form.spots : undefined, tags: !isBuild ? [form.category] : undefined, terms: { founder: form.terms, overlap: form.terms } });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,21,13,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div className="slide-in" style={{ width: "100%", maxWidth: 580, background: C.bg, border: `1px solid ${C.rule}`, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "22px 28px", borderBottom: `1px solid ${C.rule}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div><D size={28}>{isBuild ? "POST A PROJECT" : "POST AN ACTIVITY"}</D><M style={{ fontSize: 10, color: C.muted, display: "block", marginTop: 2 }}>STEP {step + 1} OF 3 — {["DETAILS", "ROLES", "SCHEDULE"][step]}</M></div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.rule}`, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted }}>✕</button>
        </div>
        <div style={{ height: 2, background: C.rule, flexShrink: 0 }}><div style={{ height: "100%", width: `${((step + 1) / 3) * 100}%`, background: C.lime, transition: "width 0.3s" }} /></div>
        <div className="fade-up" key={step} style={{ flex: 1, overflowY: "auto", padding: "28px 28px 0" }}>
          {step === 0 && <>
            <FieldInput label="NAME" value={form.name} onChange={v => u("name", v)} placeholder={isBuild ? "e.g. Solar Rover" : "e.g. Volleyball"} />
            <FieldTextarea label="ONE-LINE PITCH" value={form.tagline} onChange={v => u("tagline", v)} rows={2} placeholder="What are you building and why?" hint="120 chars" />
            <div style={{ marginBottom: 20 }}><SectionLabel>CATEGORY</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{(isBuild ? CATEGORIES_BUILD : CATEGORIES_CREW).map(c => <Chip key={c} active={form.category === c} onClick={() => u("category", c)}>{c}</Chip>)}</div></div>
            {isBuild && <><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}><div><SectionLabel>STAGE</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{STAGES.map(s => <Chip key={s} small active={form.stage === s} onClick={() => u("stage", s)}>{s}</Chip>)}</div></div><div><SectionLabel>COMMITMENT</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{COMMITMENTS.map(c => <Chip key={c} small active={form.commitment === c} onClick={() => u("commitment", c)}>{c}</Chip>)}</div></div></div><div onClick={() => u("velocity", !form.velocity)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: form.velocity ? `1.5px solid ${C.lime}` : `1px solid ${C.rule}`, background: form.velocity ? C.limeLight : C.surface, cursor: "pointer", marginBottom: 20, transition: "all 0.15s" }}><div style={{ width: 18, height: 18, border: `1.5px solid ${form.velocity ? C.limeDark : C.rule}`, background: form.velocity ? C.lime : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{form.velocity ? "✓" : ""}</div><div><M style={{ fontSize: 12, color: C.ink, fontWeight: 600 }}>⚡ Velocity Track</M><M style={{ fontSize: 10, color: C.muted, display: "block" }}>Applying to Velocity or W+Accelerate</M></div></div></>}
            {!isBuild && <><div style={{ marginBottom: 20 }}><SectionLabel>ACTIVITY TYPE</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{ACTIVITY_TYPES.map(t => <Chip key={t} active={form.type === t} onClick={() => u("type", t)}>{t}</Chip>)}</div></div><div style={{ marginBottom: 20 }}><SectionLabel>SPOTS NEEDED</SectionLabel><div style={{ display: "flex", alignItems: "center", gap: 12 }}><button onClick={() => u("spots", Math.max(1, form.spots - 1))} style={{ width: 36, height: 36, border: `1px solid ${C.rule}`, background: C.surface, cursor: "pointer", fontSize: 18 }}>−</button><M style={{ fontSize: 20, fontWeight: 600, minWidth: 24, textAlign: "center" }}>{form.spots}</M><button onClick={() => u("spots", Math.min(20, form.spots + 1))} style={{ width: 36, height: 36, border: `1px solid ${C.rule}`, background: C.surface, cursor: "pointer", fontSize: 18 }}>+</button><M style={{ fontSize: 11, color: C.muted }}>spots needed</M></div></div></>}
          </>}
          {step === 1 && <>
            {isBuild && <>{form.roles.map((role, i) => <div key={i} style={{ border: `1px solid ${C.rule}`, padding: "18px", marginBottom: 14, background: C.surface }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><M style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>ROLE {i + 1}</M>{form.roles.length > 1 && <button onClick={() => removeRole(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.muted }}>✕ remove</button>}</div><input value={role.title} onChange={e => updateRole(i, "title", e.target.value)} placeholder="e.g. Firmware Engineer" style={{ width: "100%", padding: "10px 12px", fontSize: 13, color: C.ink, background: C.bg, border: `1px solid ${C.rule}`, outline: "none", marginBottom: 14 }} onFocus={e => e.target.style.borderColor = C.lime} onBlur={e => e.target.style.borderColor = C.rule} /><SectionLabel>REQUIRED SKILLS</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SKILL_OPTIONS.map(s => <Chip key={s} small active={role.skills.includes(s)} onClick={() => toggleRoleSkill(i, s)}>{s}</Chip>)}</div></div>)}<button onClick={addRole} style={{ width: "100%", padding: "11px", border: `1px dashed ${C.rule}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11, letterSpacing: "0.08em" }}>+ ADD ANOTHER ROLE</button></>}
            {!isBuild && <div style={{ paddingTop: 20 }}><p style={{ fontSize: 13, color: C.body, marginBottom: 24, lineHeight: 1.6 }}>You're looking for {form.spots} person{form.spots !== 1 ? "s" : ""} to join <strong>{form.name || "your activity"}</strong>.</p><div style={{ padding: "20px", border: `1px solid ${C.rule}`, background: C.surface }}><D size={20} style={{ display: "block", marginBottom: 8 }}>{form.name || "YOUR ACTIVITY"}</D><M style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 12 }}>{form.tagline || "Your tagline"}</M><div style={{ display: "flex", gap: 8 }}><M style={{ fontSize: 10, background: C.rule, padding: "2px 8px", color: C.body }}>{form.category || "CATEGORY"}</M><M style={{ fontSize: 10, color: C.lime, border: `1px solid ${C.lime}`, padding: "2px 8px" }}>{form.spots} SPOTS OPEN</M></div></div></div>}
          </>}
          {step === 2 && <>
            <p style={{ fontSize: 13, color: C.body, marginBottom: 24, lineHeight: 1.6 }}>Which terms are you running this {isBuild ? "project" : "activity"}?</p>
            <SectionLabel>ACTIVE TERMS</SectionLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>{ALL_TERMS.map(t => <div key={t} onClick={() => toggleTerm(t)} style={{ padding: "14px 18px", border: form.terms.includes(t) ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.terms.includes(t) ? C.ink : C.surface, cursor: "pointer", textAlign: "center", transition: "all 0.12s", minWidth: 60 }}><D size={15} color={form.terms.includes(t) ? C.lime : C.muted} style={{ display: "block" }}>{t}</D></div>)}</div>
            {form.terms.length > 0 && <div style={{ padding: "14px 18px", border: `1px solid ${C.lime}66`, background: C.limeLight }}><M style={{ fontSize: 12, color: C.limeDark }}>✓ Active: {form.terms.join("  ·  ")}</M></div>}
          </>}
        </div>
        <div style={{ padding: "20px 28px", borderTop: `1px solid ${C.rule}`, display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} style={{ fontSize: 11, padding: "10px 22px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>{step === 0 ? "CANCEL" : "← BACK"}</button>
          {step < 2 ? <button onClick={() => canNextStep() && setStep(s => s + 1)} style={{ fontSize: 11, letterSpacing: "0.1em", padding: "10px 28px", border: "none", background: canNextStep() ? C.ink : C.rule, color: canNextStep() ? C.bg : C.muted, cursor: canNextStep() ? "pointer" : "default", fontWeight: 700 }}>NEXT →</button>
            : <button onClick={handleSubmit} disabled={!canNextStep()} style={{ fontSize: 11, letterSpacing: "0.1em", padding: "10px 28px", border: "none", background: canNextStep() ? C.lime : C.rule, color: canNextStep() ? C.limeInk : C.muted, cursor: canNextStep() ? "pointer" : "default", fontWeight: 700 }}>POST ✓</button>}
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ profile, onSave, onBack }) {
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tog = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const handleSave = () => { onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", color: C.ink }}>
      <style>{BASE_CSS}</style>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid ${C.rule}`, height: 52, flexShrink: 0, background: C.bg }}>
        <div style={{ padding: "0 24px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.rule}`, gap: 10 }}>
          <D size={24}>PLORK</D>
          <div style={{ width: 5, height: 5, background: C.lime, animation: "blink 1.4s infinite" }} />
        </div>
        <button onClick={onBack} style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, letterSpacing: "0.08em", color: C.muted, background: "transparent", border: "none", borderRight: `1px solid ${C.rule}` }}>
          ← BACK TO PLORK
        </button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: "0 24px", borderLeft: `1px solid ${C.rule}`, gap: 12 }}>
          {saved && <M style={{ fontSize: 11, color: C.limeDark }}>✓ Saved</M>}
          <button onClick={handleSave} style={{ fontSize: 11, letterSpacing: "0.1em", fontWeight: 700, padding: "8px 22px", border: "none", background: C.lime, color: C.limeInk, cursor: "pointer" }}>SAVE CHANGES</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 52px)" }}>

        {/* Left nav / identity summary */}
        <div style={{ borderRight: `1px solid ${C.rule}`, padding: "36px 28px", background: C.surface }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, background: C.limeLight, border: `1px solid ${C.lime}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 20 }}>
            🧑‍💻
          </div>
          <D size={28} style={{ display: "block", marginBottom: 4 }}>{form.name || "Your Name"}</D>
          <M style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>{form.email || "—"}</M>
          <M style={{ fontSize: 12, color: C.body, display: "block", marginBottom: 24 }}>
            {form.discipline || "—"} · {form.year || "—"}
          </M>

          <SectionDivider />

          {/* Skills summary */}
          <SectionLabel>SKILLS</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 24 }}>
            {form.skills.length > 0
              ? form.skills.map(s => <M key={s} style={{ fontSize: 10, background: C.limeLight, color: C.limeDark, border: `1px solid ${C.lime}66`, padding: "2px 8px" }}>{s}</M>)
              : <M style={{ fontSize: 11, color: C.muted }}>None added yet</M>}
          </div>

          <SectionLabel>INTERESTS</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 24 }}>
            {form.interests.length > 0
              ? form.interests.map(s => <M key={s} style={{ fontSize: 10, background: C.surface2, color: C.body, border: `1px solid ${C.rule}`, padding: "2px 8px" }}>{s}</M>)
              : <M style={{ fontSize: 11, color: C.muted }}>None added yet</M>}
          </div>

          <SectionLabel>ON-CAMPUS TERMS</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {ALL_TERMS.map(t => (
              <M key={t} style={{ fontSize: 10, padding: "2px 7px", background: form.terms.includes(t) ? C.ink : C.surface2, color: form.terms.includes(t) ? C.lime : C.muted, border: `1px solid ${form.terms.includes(t) ? C.ink : C.rule}` }}>{t}</M>
            ))}
          </div>
        </div>

        {/* Right: edit form */}
        <div style={{ overflowY: "auto", padding: "36px 48px", background: C.detail }}>
          <D size={36} style={{ display: "block", marginBottom: 4 }}>EDIT PROFILE</D>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 36 }}>Changes update your match score and visibility to other Plork users.</p>

          {/* ─ Basic info ─ */}
          <SectionLabel>BASIC INFO</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldInput label="FULL NAME" value={form.name} onChange={v => u("name", v)} placeholder="Jamie Kim" />
            <FieldInput label="UW EMAIL" value={form.email} onChange={v => u("email", v)} placeholder="jkim@uwaterloo.ca" type="email" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldInput label="GITHUB / PORTFOLIO" value={form.github || ""} onChange={v => u("github", v)} placeholder="github.com/username" />
            <div />
          </div>

          <SectionDivider />

          {/* ─ Stream ─ */}
          <SectionLabel>YOUR STREAM</SectionLabel>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>DISCIPLINE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {DISCIPLINE_OPTIONS.map(d => <Chip key={d} active={form.discipline === d} onClick={() => u("discipline", d)}>{d}</Chip>)}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>CURRENT TERM</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {YEAR_OPTIONS.map(y => <Chip key={y} active={form.year === y} onClick={() => u("year", y)}>{y}</Chip>)}
            </div>
          </div>

          <SectionDivider />

          {/* ─ Skills ─ */}
          <SectionLabel>TECHNICAL SKILLS</SectionLabel>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SKILL_OPTIONS.map(s => <Chip key={s} active={form.skills.includes(s)} onClick={() => tog("skills", s)}>{s}</Chip>)}
            </div>
          </div>

          <FieldTextarea
            label="WHAT I'VE BUILT"
            value={form.built || ""}
            onChange={v => u("built", v)}
            placeholder="Built a lane-detection model for Midnight Sun. Shipped a React dashboard for 500 users."
            hint="1–2 lines"
            rows={3}
          />

          <SectionDivider />

          {/* ─ Interests ─ */}
          <SectionLabel>INTERESTS — shown in Crew Mode</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
            {INTEREST_OPTIONS.map(s => <Chip key={s} active={form.interests.includes(s)} onClick={() => tog("interests", s)}>{s}</Chip>)}
          </div>

          <SectionDivider />

          {/* ─ Schedule ─ */}
          <SectionLabel>CO-OP SCHEDULE</SectionLabel>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 12 }}>ON-CAMPUS TERMS</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ALL_TERMS.map(t => (
                <div key={t} onClick={() => tog("terms", t)} style={{ padding: "14px 18px", border: form.terms.includes(t) ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.terms.includes(t) ? C.ink : C.surface, cursor: "pointer", textAlign: "center", transition: "all 0.12s", minWidth: 60 }}>
                  <D size={15} color={form.terms.includes(t) ? C.lime : C.muted} style={{ display: "block" }}>{t}</D>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 12 }}>COMMITMENT LEVEL</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {COMMITMENTS.map(c => (
                <div key={c} onClick={() => u("commitment", c)} style={{ padding: "13px 18px", border: form.commitment === c ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.commitment === c ? C.ink : C.surface, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "all 0.12s" }}>
                  <D size={15} color={form.commitment === c ? C.lime : C.muted} style={{ flexShrink: 0 }}>{c}</D>
                  <span style={{ fontSize: 12, color: form.commitment === c ? "#7a9a6a" : C.muted, lineHeight: 1.5 }}>
                    {c === "CASUAL" ? "A few hours a week, fits around coursework" : c === "SERIOUS" ? "Consistent effort, aiming to ship something real" : "Startup-track — applying to Velocity or W+Accelerate"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${C.rule}`, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={handleSave} style={{ fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, padding: "12px 32px", border: "none", background: C.lime, color: C.limeInk, cursor: "pointer" }}>SAVE CHANGES</button>
            <button onClick={onBack} style={{ fontSize: 12, padding: "12px 24px", border: `1px solid ${C.rule}`, background: "transparent", color: C.muted, cursor: "pointer" }}>CANCEL</button>
            {saved && <M style={{ fontSize: 12, color: C.limeDark }}>✓ Changes saved!</M>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [mode, setMode] = useState("BUILD");
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [activities, setActivities] = useState(INIT_ACTIVITIES);
  const [selectedId, setSelectedId] = useState(1);
  const [tab, setTab] = useState("ROLES");
  const [showPost, setShowPost] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(INIT_PROFILE);

  //added
  const [scoredProjects, setScoredProjects] = useState(INIT_PROJECTS);
  const [scoredActivities, setScoredActivities] = useState(INIT_ACTIVITIES);

  useEffect(() => {
    const userId = 1; // replace with your actual logged-in user id from auth
    
    fetch(`http://localhost:3000/feed/${userId}`)
      .then(r => r.json())
      .then(data => {
        // Backend returns all posts with compatibility_score
        // Split them into projects vs activities by category
        const allScored = data.listings;

        setScoredProjects(prev => prev.map(p => {
          const match = allScored.find(s => s.id === p.id);
          return match ? { ...p, match: match.compatibility_score } : p;
        }));

        setScoredActivities(prev => prev.map(a => {
          const match = allScored.find(s => s.id === a.id);
          return match ? { ...a, match: match.compatibility_score } : a;
        }));
      })
      .catch(() => {
        // silently fall back to hardcoded scores if backend is offline
      });
  }, []);  // end of added

  const items = mode === "BUILD" ? scoredProjects : scoredActivities;
  const filtered = filter === "YOURS" ? items.filter(i => i.yours) : items;
  const sel = items.find(i => i.id === selectedId) || items[0];
  const openRoles = sel?.roles?.filter(r => !r.filled) || [];
  const filledRoles = sel?.roles?.filter(r => r.filled) || [];
  const switchMode = m => { setMode(m); setSelectedId(m === "BUILD" ? 1 : 4); setTab(m === "BUILD" ? "ROLES" : "SPOTS"); setFilter("ALL"); };
  const handlePost = item => {
    if (mode === "BUILD") {
      setProjects(p => [...p, item]);
      setScoredProjects(p => [...p, item]); // keep in sync
      setSelectedId(item.id);
      setTab("ROLES");
    } else {
      setActivities(a => [...a, item]);
      setScoredActivities(a => [...a, item]); // keep in sync
      setSelectedId(item.id);
      setTab("SPOTS");
    }
  };

  if (showProfile) return <ProfilePage profile={profile} onSave={p => { setProfile(p); }} onBack={() => setShowProfile(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, display: "flex", flexDirection: "column", fontFamily: "'IBM Plex Mono',monospace" }}>
      <style>{BASE_CSS}</style>
      {showPost && <PostModal mode={mode} onClose={() => setShowPost(false)} onSubmit={handlePost} />}

      {/* ── TOP BAR ── */}
      <div style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid ${C.rule}`, height: 52, flexShrink: 0, background: C.bg }}>
        <div style={{ padding: "0 24px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.rule}`, gap: 10 }}>
          <D size={24}>PLORK</D>
          <div style={{ width: 5, height: 5, background: C.lime, animation: "blink 1.4s infinite" }} />
        </div>
        {["BUILD", "CREW"].map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{ padding: "0 22px", display: "flex", alignItems: "center", cursor: "pointer", fontSize: 11, letterSpacing: "0.1em", borderBottom: mode === m ? `2px solid ${C.lime}` : "2px solid transparent", color: mode === m ? C.ink : C.muted, background: "transparent", border: "none", borderBottom: mode === m ? `2px solid ${C.lime}` : "2px solid transparent", transition: "color 0.12s", userSelect: "none", paddingLeft: 22, paddingRight: 22 }}>{m} MODE</button>
        ))}
        <div className="topbar-meta" style={{ marginLeft: "auto", display: "flex", borderLeft: `1px solid ${C.rule}` }}>
          {[["STREAM", profile.discipline + " " + profile.year], ["TERM", "W26"]].map(([l, v]) => (
            <div key={l} style={{ padding: "0 18px", borderRight: `1px solid ${C.rule}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 8, color: C.muted, letterSpacing: "0.12em", marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 12, color: C.body }}>{v}</div>
            </div>
          ))}
          {/* Profile avatar — clickable */}
          <button onClick={() => setShowProfile(true)} style={{ padding: "0 18px", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", borderLeft: `1px solid ${C.rule}` }}>
            <div style={{ width: 32, height: 32, border: `1px solid ${C.rule}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🧑‍💻</div>
            <M style={{ fontSize: 11, color: C.body }}>{profile.name.split(" ")[0]}</M>
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="app-layout" style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <div className="app-sidebar" style={{ width: 300, borderRight: `1px solid ${C.rule}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0, background: C.bg }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.rule}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>{mode === "BUILD" ? "PROJECTS" : "ACTIVITIES"}</M>
              <M style={{ fontSize: 10, color: C.lime, fontWeight: 600 }}>{filtered.length} FOUND</M>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {["ALL", "YOURS"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "6px", fontSize: 10, letterSpacing: "0.08em", border: `1px solid ${C.rule}`, background: filter === f ? C.ink : "transparent", color: filter === f ? C.bg : C.muted, cursor: "pointer", transition: "all 0.1s" }}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowPost(true)} style={{ width: "100%", padding: "9px", fontSize: 11, letterSpacing: "0.1em", fontWeight: 700, background: C.lime, color: C.limeInk, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              + POST {mode === "BUILD" ? "PROJECT" : "ACTIVITY"}
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center" }}><M style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>No {mode === "BUILD" ? "projects" : "activities"} yet.<br />Post one to get started.</M></div>}
            {filtered.map(item => {
              const isSel = selectedId === item.id;
              const open = item.roles?.filter(r => !r.filled).length ?? item.spots;
              const filled2 = item.roles?.filter(r => r.filled).length ?? 0;
              const total = item.roles?.length ?? item.spots;
              const pct = total > 0 ? Math.round((filled2 / total) * 100) : 0;
              return (
                <div key={item.id} onClick={() => { setSelectedId(item.id); setTab(mode === "BUILD" ? "ROLES" : "SPOTS"); }}
                  style={{ padding: "16px 18px", borderLeft: isSel ? `3px solid ${C.lime}` : "3px solid transparent", borderBottom: `1px solid ${C.rule}`, cursor: "pointer", background: isSel ? C.surface : "transparent", transition: "background 0.1s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
                      <D size={17} color={isSel ? C.ink : C.body} style={{ flexShrink: 0 }}>{item.name}</D>
                      {item.yours && <M style={{ fontSize: 8, background: C.limeLight, color: C.limeDark, border: `1px solid ${C.lime}`, padding: "1px 6px", letterSpacing: "0.06em", flexShrink: 0 }}>YOURS</M>}
                    </div>
                    <M style={{ fontSize: 13, fontWeight: 700, color: item.match > 90 ? C.lime : item.match > 75 ? "#aaaa00" : C.muted, flexShrink: 0, marginLeft: 8 }}>{item.match}%</M>
                  </div>
                  <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>{item.tagline}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <M style={{ fontSize: 9, color: C.muted, background: C.surface2, padding: "2px 7px" }}>{item.category}</M>
                    <div style={{ flex: 1, height: 3, background: C.rule, borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: C.lime, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                    <M style={{ fontSize: 9, color: open > 0 ? C.lime : C.muted }}>{open} OPEN</M>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.rule}`, background: C.surface }}>
            <M style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>YOUR SKILLS</M>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {profile.skills.slice(0, 5).map(s => <M key={s} style={{ fontSize: 10, background: C.limeLight, color: C.limeDark, border: `1px solid ${C.lime}66`, padding: "2px 8px" }}>{s}</M>)}
            </div>
          </div>
        </div>

        {/* ── DETAIL PANEL ── */}
        {sel && (
          <div key={selectedId} className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.detail }}>

            {/* Header */}
            <div style={{ padding: "28px 36px 0", borderBottom: `1px solid ${C.rule}`, background: C.detail }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                    {sel.yours && <M style={{ fontSize: 10, background: C.limeLight, color: C.limeDark, border: `1px solid ${C.lime}`, padding: "3px 10px", letterSpacing: "0.08em" }}>YOUR PROJECT</M>}
                    {sel.velocity && <M style={{ fontSize: 10, color: "#996600", border: "1px solid #cc880044", background: "#fff8e0", padding: "3px 10px" }}>⚡ VELOCITY</M>}
                    {sel.stage && <M style={{ fontSize: 10, color: C.muted, border: `1px solid ${C.rule}`, padding: "3px 10px" }}>{sel.stage}</M>}
                    {sel.commitment && <M style={{ fontSize: 10, color: C.muted, border: `1px solid ${C.rule}`, padding: "3px 10px" }}>{sel.commitment}</M>}
                    {sel.type && <M style={{ fontSize: 10, color: C.muted, border: `1px solid ${C.rule}`, padding: "3px 10px" }}>{sel.type}</M>}
                  </div>
                  <D size={52} style={{ display: "block", marginBottom: 10 }}>{sel.name}</D>
                  <p style={{ fontSize: 14, color: C.body, lineHeight: 1.65, maxWidth: 520 }}>{sel.tagline}</p>
                </div>
                <div style={{ border: `1px solid ${C.rule}`, padding: "18px 24px", background: C.surface, textAlign: "center", flexShrink: 0 }}>
                  <D size={52} color={sel.match > 90 ? C.lime : sel.match > 75 ? "#aaaa00" : C.muted} style={{ display: "block" }}>{sel.match}%</D>
                  <M style={{ fontSize: 9, color: C.muted, letterSpacing: "0.14em" }}>SKILL MATCH</M>
                </div>
              </div>
              <div style={{ display: "flex" }}>
                {(mode === "BUILD" ? ["ROLES", "TIMELINE", "INFO"] : ["SPOTS", "TIMELINE", "INFO"]).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ padding: "11px 20px", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", borderBottom: tab === t ? `2px solid ${C.lime}` : "2px solid transparent", color: tab === t ? C.ink : C.muted, background: "transparent", border: "none", borderBottom: tab === t ? `2px solid ${C.lime}` : "2px solid transparent", transition: "color 0.1s", userSelect: "none" }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>

              {(tab === "ROLES" || tab === "SPOTS") && (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: 40 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                      <M style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>{mode === "BUILD" ? "TEAM COMPOSITION" : "OPEN SPOTS"}</M>
                      {mode === "BUILD" && sel.roles && <M style={{ fontSize: 11, color: C.body }}>{filledRoles.length}/{sel.roles.length} filled</M>}
                    </div>
                    {mode === "BUILD" && sel.roles && <div style={{ height: 4, background: C.rule, borderRadius: 2, marginBottom: 24 }}><div style={{ height: "100%", width: `${(filledRoles.length / sel.roles.length) * 100}%`, background: C.lime, borderRadius: 2, transition: "width 0.4s" }} /></div>}
                    {mode === "BUILD" && sel.roles?.map((role, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 0", borderBottom: `1px solid ${C.rule}` }}>
                        <div style={{ width: 8, height: 8, flexShrink: 0, marginTop: 4, background: role.filled ? C.lime : "transparent", border: role.filled ? "none" : `1px solid ${C.rule}` }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: role.filled ? C.muted : C.ink, textDecoration: role.filled ? "line-through" : "none", marginBottom: role.filled ? 3 : 6 }}>{role.title}</div>
                          {role.filled && <M style={{ fontSize: 11, color: C.lime, display: "block", marginBottom: 6 }}>→ {role.member}</M>}
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{role.skills?.map(s => <M key={s} style={{ fontSize: 9, color: C.muted, border: `1px solid ${C.rule}`, padding: "2px 6px" }}>{s}</M>)}</div>
                        </div>
                        {!role.filled && <M style={{ fontSize: 10, color: C.lime, border: `1px solid ${C.lime}`, padding: "4px 12px", cursor: "pointer", letterSpacing: "0.06em", flexShrink: 0, marginTop: 2 }}>APPLY</M>}
                      </div>
                    ))}
                    {mode === "CREW" && [...Array(sel.spots || 0)].map((_, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: `1px solid ${C.rule}` }}>
                        <div style={{ width: 8, height: 8, border: `1px solid ${C.rule}` }} />
                        <span style={{ fontSize: 13, color: C.body, flex: 1 }}>Open spot {i + 1}</span>
                        <M style={{ fontSize: 10, color: C.lime, border: `1px solid ${C.lime}`, padding: "4px 12px", cursor: "pointer" }}>JOIN</M>
                      </div>
                    ))}
                    {mode === "CREW" && sel.tags && <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>{sel.tags.map(t => <M key={t} style={{ fontSize: 10, color: C.muted, border: `1px solid ${C.rule}`, padding: "3px 9px" }}>{t}</M>)}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                    {!sel.yours && (
                      <div style={{ border: `1px solid ${C.lime}`, padding: "22px", background: C.limeLight }}>
                        <M style={{ fontSize: 10, color: C.limeDark, letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>{mode === "BUILD" ? "YOU FIT THIS ROLE" : "YOU CAN JOIN"}</M>
                        <p style={{ fontSize: 14, color: C.ink, marginBottom: 6 }}>{mode === "BUILD" ? `${openRoles.length} open role${openRoles.length !== 1 ? "s" : ""} match your skills` : `${sel.spots} spot${sel.spots !== 1 ? "s" : ""} open this term`}</p>
                        <p style={{ fontSize: 12, color: C.body, marginBottom: 20, lineHeight: 1.5 }}>{mode === "BUILD" ? "Your React + ML/AI skills fit the Backend Dev role" : "Your schedule overlaps for 3 terms"}</p>
                        <button style={{ width: "100%", padding: "12px", fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, background: C.lime, color: C.limeInk, border: "none", cursor: "pointer" }}>{mode === "BUILD" ? "REQUEST TO JOIN →" : "EXPRESS INTEREST →"}</button>
                      </div>
                    )}
                    {sel.yours && (
                      <div style={{ border: `1px solid ${C.rule}`, padding: "22px", background: C.surface }}>
                        <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>YOUR {mode === "BUILD" ? "PROJECT" : "ACTIVITY"}</M>
                        <p style={{ fontSize: 13, color: C.body, marginBottom: 16, lineHeight: 1.5 }}>{openRoles.length > 0 || sel.spots > 0 ? `${mode === "BUILD" ? openRoles.length : sel.spots} open ${mode === "BUILD" ? "role" : "spot"}${(mode === "BUILD" ? openRoles.length : sel.spots) !== 1 ? "s" : ""} — waiting for applicants.` : "Team is full!"}</p>
                        <button style={{ width: "100%", padding: "11px", fontSize: 11, letterSpacing: "0.08em", fontWeight: 600, background: "transparent", color: C.ink, border: `1px solid ${C.ink}`, cursor: "pointer" }}>MANAGE APPLICANTS</button>
                      </div>
                    )}
                    <div>
                      <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>DETAILS</M>
                      {[["CATEGORY", sel.category], ["STAGE/TYPE", sel.type || sel.stage], ["COMMITMENT", sel.commitment || sel.type || "—"]].map(([k, v]) => v && (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.rule}`, padding: "9px 0" }}>
                          <M style={{ fontSize: 11, color: C.muted }}>{k}</M>
                          <M style={{ fontSize: 11, color: C.body }}>{v}</M>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "TIMELINE" && (
                <div>
                  <p style={{ fontSize: 13, color: C.body, marginBottom: 24, lineHeight: 1.6 }}>When the full team is on campus at the same time — highlighted in green.</p>
                  <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
                    {[{ c: C.lime, l: "Overlap" }, { c: C.ink, l: "On campus" }, { c: C.rule, l: "On co-op" }].map(x => (
                      <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, background: x.c }} /><M style={{ fontSize: 11, color: C.body }}>{x.l}</M></div>
                    ))}
                  </div>
                  {[{ label: "YOU", terms: YOU_TERMS, you: true }, { label: "FOUNDER", terms: sel.terms?.founder || YOU_TERMS }, ...(filledRoles.map((r, i) => ({ label: r.member.toUpperCase(), terms: ALL_TERMS.filter((_, j) => j % 2 === i % 2) })))].map((p, pi) => (
                    <div key={pi} style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 0", borderBottom: `1px solid ${C.rule}` }}>
                      <M style={{ width: 80, fontSize: 11, color: p.you ? C.lime : C.body, fontWeight: p.you ? "600" : "400" }}>{p.label}</M>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                        {ALL_TERMS.map(t => {
                          const active = p.terms.includes(t); const overlap = active && YOU_TERMS.includes(t) && (sel.terms?.overlap || YOU_TERMS).includes(t);
                          return <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: overlap ? 24 : active ? 16 : 8, background: overlap ? C.lime : active ? C.ink : C.rule, transition: "all 0.2s", boxShadow: overlap ? `0 2px 6px ${C.lime}66` : "none" }} /><M style={{ fontSize: 8, color: overlap ? C.limeDark : active ? C.body : C.muted }}>{t}</M></div>;
                        })}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 20, padding: "13px 18px", border: `1px solid ${C.lime}66`, background: C.limeLight }}>
                    <M style={{ fontSize: 12, color: C.limeDark }}>✓ Full team overlaps: {(sel.terms?.overlap || []).join("  ·  ")}</M>
                  </div>
                </div>
              )}

              {tab === "INFO" && (
                <div style={{ maxWidth: 520 }}>
                  <M style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 20 }}>PROJECT INFO</M>
                  {[["Name", sel.name], ["Tagline", sel.tagline], ["Category", sel.category], ["Stage", sel.stage || sel.type], ["Commitment", sel.commitment || "—"], ["Velocity Track", sel.velocity ? "Yes" : "No"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 24, borderBottom: `1px solid ${C.rule}`, padding: "11px 0" }}>
                      <M style={{ width: 140, fontSize: 11, color: C.muted, flexShrink: 0 }}>{k}</M>
                      <M style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>{v}</M>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  if (screen === "login") return <Login onBack={() => setScreen("landing")} onSuccess={() => setScreen("app")} />;
  if (screen === "onboarding") return <Onboarding onComplete={() => setScreen("app")} />;
  if (screen === "app") return <MainApp />;
  return <Landing onLogin={() => setScreen("login")} onSignup={() => setScreen("onboarding")} />;
}
