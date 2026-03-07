import { useState } from "react";
import { api } from "../api";
import { D, M, Chip, FieldInput, FieldTextarea, SectionLabel, SectionDivider, SubTopBar } from "../components/Primitives";
import { C, BASE_CSS, ALL_TERMS, DISCIPLINE_OPTIONS, YEAR_OPTIONS, SKILL_OPTIONS, INTEREST_OPTIONS, COMMITMENTS } from "../constants";

export default function ProfilePage({ profile, userId, onSave, onBack }) {
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tog = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));
  const save = async () => {
    if (!userId) { alert("No user ID found"); return; }
    setLoading(true);
    const u2 = await api.updateProfile(userId, form);
    onSave(u2);
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  };
  const SaveBtn = () => <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px" }}>{saved && <M style={{ fontSize: 11, color: C.limeDark }}>✓ Saved</M>}<button onClick={save} disabled={loading} style={{ fontSize: 11, letterSpacing: "0.1em", fontWeight: 700, padding: "8px 22px", border: "none", background: C.lime, color: C.limeInk, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>{loading ? "SAVING..." : "SAVE CHANGES"}</button></div>;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", color: C.ink }}>
      <style>{BASE_CSS}</style>
      <SubTopBar onBack={onBack} rightSlot={<SaveBtn />} />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 52px)" }}>
        <div style={{ borderRight: `1px solid ${C.rule}`, padding: "36px 28px", background: C.surface }}>
          <div style={{ width: 72, height: 72, background: C.limeLight, border: `1px solid ${C.lime}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 20 }}>🧑‍💻</div>
          <D size={28} style={{ display: "block", marginBottom: 4 }}>{form.name || "Your Name"}</D>
          <M style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>{form.email || "—"}</M>
          <M style={{ fontSize: 12, color: C.body, display: "block", marginBottom: 24 }}>{form.discipline || "—"} · {form.year || "—"}</M>
          <SectionDivider />
          <SectionLabel>SKILLS</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 24 }}>{form.skills.length > 0 ? form.skills.map(s => <M key={s} style={{ fontSize: 10, background: C.limeLight, color: C.limeDark, border: `1px solid ${C.lime}66`, padding: "2px 8px" }}>{s}</M>) : <M style={{ fontSize: 11, color: C.muted }}>None added yet</M>}</div>
          <SectionLabel>INTERESTS</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 24 }}>{form.interests.length > 0 ? form.interests.map(s => <M key={s} style={{ fontSize: 10, background: C.surface2, color: C.body, border: `1px solid ${C.rule}`, padding: "2px 8px" }}>{s}</M>) : <M style={{ fontSize: 11, color: C.muted }}>None added yet</M>}</div>
          <SectionLabel>ON-CAMPUS TERMS</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{ALL_TERMS.map(t => <M key={t} style={{ fontSize: 10, padding: "2px 7px", background: form.terms.includes(t) ? C.ink : C.surface2, color: form.terms.includes(t) ? C.lime : C.muted, border: `1px solid ${form.terms.includes(t) ? C.ink : C.rule}` }}>{t}</M>)}</div>
        </div>
        <div style={{ overflowY: "auto", padding: "36px 48px", background: C.detail }}>
          <D size={36} style={{ display: "block", marginBottom: 4 }}>EDIT PROFILE</D>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 36 }}>Changes update your match score and visibility to other Plork users.</p>
          <SectionLabel>BASIC INFO</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><FieldInput label="FULL NAME" value={form.name} onChange={v => u("name", v)} placeholder="Jamie Kim" /><FieldInput label="UW EMAIL" value={form.email} onChange={v => u("email", v)} placeholder="jkim@uwaterloo.ca" type="email" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><FieldInput label="GITHUB / PORTFOLIO" value={form.github || ""} onChange={v => u("github", v)} placeholder="github.com/username" /><div /></div>
          <SectionDivider />
          <SectionLabel>YOUR STREAM</SectionLabel>
          <div style={{ marginBottom: 20 }}><label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>DISCIPLINE</label><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{DISCIPLINE_OPTIONS.map(d => <Chip key={d} active={form.discipline === d} onClick={() => u("discipline", d)}>{d}</Chip>)}</div></div>
          <div style={{ marginBottom: 20 }}><label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>CURRENT TERM</label><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{YEAR_OPTIONS.map(y => <Chip key={y} active={form.year === y} onClick={() => u("year", y)}>{y}</Chip>)}</div></div>
          <SectionDivider />
          <SectionLabel>TECHNICAL SKILLS</SectionLabel>
          <div style={{ marginBottom: 20 }}><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{SKILL_OPTIONS.map(s => <Chip key={s} active={form.skills.includes(s)} onClick={() => tog("skills", s)}>{s}</Chip>)}</div></div>
          <FieldTextarea label="WHAT I'VE BUILT" value={form.built || ""} onChange={v => u("built", v)} placeholder="Built a lane-detection model for Midnight Sun." hint="1–2 lines" rows={3} />
          <SectionDivider />
          <SectionLabel>INTERESTS — shown in Crew Mode</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>{INTEREST_OPTIONS.map(s => <Chip key={s} active={form.interests.includes(s)} onClick={() => tog("interests", s)}>{s}</Chip>)}</div>
          <SectionDivider />
          <SectionLabel>CO-OP SCHEDULE</SectionLabel>
          <div style={{ marginBottom: 20 }}><label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 12 }}>ON-CAMPUS TERMS</label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{ALL_TERMS.map(t => <div key={t} onClick={() => tog("terms", t)} style={{ padding: "14px 18px", border: form.terms.includes(t) ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.terms.includes(t) ? C.ink : C.surface, cursor: "pointer", textAlign: "center", transition: "all 0.12s", minWidth: 60 }}><D size={15} color={form.terms.includes(t) ? C.lime : C.muted} style={{ display: "block" }}>{t}</D></div>)}</div></div>
          <div><label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", display: "block", marginBottom: 12 }}>COMMITMENT LEVEL</label><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{COMMITMENTS.map(c => <div key={c} onClick={() => u("commitment", c)} style={{ padding: "13px 18px", border: form.commitment === c ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.commitment === c ? C.ink : C.surface, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "all 0.12s" }}><D size={15} color={form.commitment === c ? C.lime : C.muted} style={{ flexShrink: 0 }}>{c}</D><span style={{ fontSize: 12, color: form.commitment === c ? "#7a9a6a" : C.muted, lineHeight: 1.5 }}>{c === "CASUAL" ? "A few hours a week, fits around coursework" : c === "SERIOUS" ? "Consistent effort, aiming to ship something real" : "Startup-track — applying to Velocity or W+Accelerate"}</span></div>)}</div></div>
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${C.rule}`, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={save} disabled={loading} style={{ fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, padding: "12px 32px", border: "none", background: C.lime, color: C.limeInk, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>{loading ? "SAVING..." : "SAVE CHANGES"}</button>
            <button onClick={onBack} style={{ fontSize: 12, padding: "12px 24px", border: `1px solid ${C.rule}`, background: "transparent", color: C.muted, cursor: "pointer" }}>CANCEL</button>
            {saved && <M style={{ fontSize: 12, color: C.limeDark }}>✓ Changes saved!</M>}
          </div>
        </div>
      </div>
    </div>
  );
}
