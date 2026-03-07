import { useState } from "react";
import { api } from "../api";
import { D, M, FieldInput, FieldTextarea, SectionLabel } from "../components/Primitives";
import { C, BASE_CSS, ALL_TERMS } from "../constants";

export default function RequestToJoin({ project, role, onBack, onSubmitted, userId, profile }) {
  const [intro, setIntro] = useState("");
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!intro.trim()) return;
    if (!userId) { alert("Please log in first"); return; }
    setLoading(true);
    const created = await api.submitApplication({ projectId: project.id, roleTitle: role.title, intro, links }, userId);
    setLoading(false);
    setSent(true);
    if (onSubmitted) onSubmitted({ ...created, projectName: project.name, projectCategory: project.category, roleSkills: role.skills });
  };

  if (sent) return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{BASE_CSS}</style>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ width: 64, height: 64, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px" }}>✓</div>
        <D size={44} style={{ display: "block", marginBottom: 12 }}>REQUEST SENT</D>
        <p style={{ fontSize: 14, color: C.body, lineHeight: 1.8, marginBottom: 32 }}>
          Your request to join <strong>{project.name}</strong> as <strong>{role.title}</strong> has been sent.<br />Track its status in <strong>My Applications</strong>.
        </p>
        <button onClick={onBack} style={{ fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, padding: "12px 32px", background: C.ink, color: C.bg, border: "none", cursor: "pointer" }}>← BACK TO PLORK</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", color: C.ink }}>
      <style>{BASE_CSS}</style>
      <div style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid ${C.rule}`, height: 52, flexShrink: 0 }}>
        <div style={{ padding: "0 24px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.rule}`, gap: 10 }}><D size={24}>PLORK</D></div>
        <button onClick={onBack} style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, letterSpacing: "0.08em", color: C.muted, background: "transparent", border: "none", borderRight: `1px solid ${C.rule}` }}>← BACK</button>
        <div style={{ padding: "0 24px", display: "flex", alignItems: "center" }}><M style={{ fontSize: 11, color: C.muted }}>REQUEST TO JOIN</M></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 52px)" }}>
        <div style={{ padding: "48px 52px", borderRight: `1px solid ${C.rule}`, background: C.detail }}>
          <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 28 }}>YOU'RE APPLYING FOR</M>
          <div style={{ border: `1px solid ${C.rule}`, padding: "22px", marginBottom: 28, background: C.bg }}>
            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>OPEN ROLE</M>
            <D size={28} style={{ display: "block", marginBottom: 6 }}>{role.title}</D>
            <D size={16} color={C.muted} style={{ display: "block", marginBottom: 16 }}>{project.name}</D>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{role.skills?.map(s => <M key={s} style={{ fontSize: 10, color: C.limeDark, background: C.limeLight, border: `1px solid ${C.lime}55`, padding: "2px 8px" }}>{s}</M>)}</div>
          </div>
          <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 14 }}>ABOUT THE PROJECT</M>
          <p style={{ fontSize: 13, color: C.body, lineHeight: 1.75, marginBottom: 24 }}>{project.tagline}</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[["CATEGORY", project.category], ["STAGE", project.stage], ["COMMITMENT", project.commitment]].map(([k, v]) => v && (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.rule}` }}>
                <M style={{ fontSize: 11, color: C.muted }}>{k}</M>
                <M style={{ fontSize: 11, color: C.body }}>{v}</M>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>TERM OVERLAP WITH TEAM</M>
            <div style={{ display: "flex", gap: 6 }}>
              {ALL_TERMS.map(t => { const inOv = project.terms?.overlap?.includes(t), yours = profile?.terms?.includes(t), both = inOv && yours; return <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: both ? 24 : inOv || yours ? 16 : 8, background: both ? C.lime : inOv || yours ? C.ink : C.rule }} /><M style={{ fontSize: 8, color: both ? C.limeDark : C.muted }}>{t}</M></div>; })}
            </div>
          </div>
        </div>
        <div style={{ padding: "48px 52px", overflowY: "auto" }}>
          <D size={40} style={{ display: "block", marginBottom: 6 }}>YOUR REQUEST</D>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 40, lineHeight: 1.6 }}>Write a short intro — 2–3 sentences is enough. The founder will see your skills and schedule automatically.</p>
          <FieldTextarea label="INTRO — why you, why this project?" value={intro} onChange={setIntro} placeholder="I'm a 3A ECE student who's been working with ML pipelines for two terms. My Node.js + Python background is a strong fit. I can commit 8–10 hours a week starting W26." rows={5} hint="2–3 sentences" />
          <FieldInput label="LINKS — GitHub, portfolio, or project (optional)" value={links} onChange={setLinks} placeholder="github.com/yourname" />
          <div style={{ border: `1px solid ${C.rule}`, padding: "18px", background: C.surface, marginBottom: 32 }}>
            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 14 }}>WHAT THE FOUNDER SEES</M>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div><M style={{ fontSize: 13, color: C.ink, fontWeight: 600, display: "block", marginBottom: 2 }}>{profile?.name || "Your Name"}</M><M style={{ fontSize: 11, color: C.muted }}>{profile?.discipline || ""} {profile?.year || ""} · On campus {profile?.terms?.join(", ") || ""}</M></div>
              <M style={{ fontSize: 14, fontWeight: 700, color: C.lime }}>94%</M>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{(profile?.skills || []).slice(0, 4).map(s => <M key={s} style={{ fontSize: 10, background: C.limeLight, color: C.limeDark, border: `1px solid ${C.lime}66`, padding: "2px 8px" }}>{s}</M>)}</div>
          </div>
          <button onClick={submit} disabled={!intro.trim() || loading} style={{ width: "100%", padding: "14px", fontSize: 13, letterSpacing: "0.1em", fontWeight: 700, background: intro.trim() && !loading ? C.lime : C.rule, color: intro.trim() && !loading ? C.limeInk : C.muted, border: "none", cursor: intro.trim() && !loading ? "pointer" : "default", transition: "all 0.15s" }}>
            {loading ? "SENDING..." : "SEND REQUEST →"}
          </button>
        </div>
      </div>
    </div>
  );
}
