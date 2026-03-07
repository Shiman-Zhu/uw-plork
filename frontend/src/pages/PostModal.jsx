import { useState } from "react";
import { api } from "../api";
import { D, M, Chip, FieldInput, FieldTextarea, SectionLabel } from "../components/Primitives";
import { C, BASE_CSS, CATEGORIES_BUILD, CATEGORIES_CREW, STAGES, COMMITMENTS, ACTIVITY_TYPES, SKILL_OPTIONS, ALL_TERMS } from "../constants";

export default function PostModal({ mode, onClose, onSubmit, userId }) {
    const isBuild = mode === "BUILD";
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", tagline: "", category: "", stage: "", commitment: "", type: "", spots: 2, roles: [{ title: "", skills: [] }], terms: [] });
    const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const addRole = () => setForm(f => ({ ...f, roles: [...f.roles, { title: "", skills: [] }] }));
    const removeRole = i => setForm(f => ({ ...f, roles: f.roles.filter((_, j) => j !== i) }));
    const updRole = (i, k, v) => setForm(f => ({ ...f, roles: f.roles.map((r, j) => j === i ? { ...r, [k]: v } : r) }));
    const togSkill = (i, s) => setForm(f => ({ ...f, roles: f.roles.map((r, j) => j === i ? { ...r, skills: r.skills.includes(s) ? r.skills.filter(x => x !== s) : [...r.skills, s] } : r) }));
    const togTerm = t => setForm(f => ({ ...f, terms: f.terms.includes(t) ? f.terms.filter(x => x !== t) : [...f.terms, t] }));
    const canStep = () => {
        if (step === 0) return form.name && form.tagline && form.category && (isBuild ? (form.stage && form.commitment) : form.type);
        if (step === 1) return isBuild ? form.roles.every(r => r.title) : true;
        return form.terms.length > 0;
    };
    const submit = async () => {
        setLoading(true);
        const p = { name: form.name.toUpperCase(), tagline: form.tagline, category: form.category, stage: isBuild ? form.stage : undefined, type: !isBuild ? form.type : undefined, commitment: isBuild ? form.commitment : undefined, match: Math.floor(Math.random() * 20) + 70, yours: true, roles: isBuild ? form.roles.map(r => ({ ...r, filled: false })) : undefined, spots: !isBuild ? form.spots : undefined, tags: !isBuild ? [form.category] : undefined, terms: { founder: form.terms, overlap: form.terms } };
        const created = await api.createProject(p, userId);
        onSubmit(created);
        onClose();
        setLoading(false);
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
                        {isBuild && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}><div><SectionLabel>STAGE</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{STAGES.map(s => <Chip key={s} small active={form.stage === s} onClick={() => u("stage", s)}>{s}</Chip>)}</div></div><div><SectionLabel>COMMITMENT</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{COMMITMENTS.map(c => <Chip key={c} small active={form.commitment === c} onClick={() => u("commitment", c)}>{c}</Chip>)}</div></div></div>}
                        {!isBuild && <><div style={{ marginBottom: 20 }}><SectionLabel>ACTIVITY TYPE</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{ACTIVITY_TYPES.map(t => <Chip key={t} active={form.type === t} onClick={() => u("type", t)}>{t}</Chip>)}</div></div><div style={{ marginBottom: 20 }}><SectionLabel>SPOTS NEEDED</SectionLabel><div style={{ display: "flex", alignItems: "center", gap: 12 }}><button onClick={() => u("spots", Math.max(1, form.spots - 1))} style={{ width: 36, height: 36, border: `1px solid ${C.rule}`, background: C.surface, cursor: "pointer", fontSize: 18 }}>−</button><M style={{ fontSize: 20, fontWeight: 600, minWidth: 24, textAlign: "center" }}>{form.spots}</M><button onClick={() => u("spots", Math.min(20, form.spots + 1))} style={{ width: 36, height: 36, border: `1px solid ${C.rule}`, background: C.surface, cursor: "pointer", fontSize: 18 }}>+</button><M style={{ fontSize: 11, color: C.muted }}>spots needed</M></div></div></>}
                    </>}
                    {step === 1 && <>
                        {isBuild && <>{form.roles.map((role, i) => <div key={i} style={{ border: `1px solid ${C.rule}`, padding: "18px", marginBottom: 14, background: C.surface }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><M style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>ROLE {i + 1}</M>{form.roles.length > 1 && <button onClick={() => removeRole(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.muted }}>✕ remove</button>}</div><input value={role.title} onChange={e => updRole(i, "title", e.target.value)} placeholder="e.g. Firmware Engineer" style={{ width: "100%", padding: "10px 12px", fontSize: 13, color: C.ink, background: C.bg, border: `1px solid ${C.rule}`, outline: "none", marginBottom: 14 }} onFocus={e => e.target.style.borderColor = C.lime} onBlur={e => e.target.style.borderColor = C.rule} /><SectionLabel>REQUIRED SKILLS</SectionLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SKILL_OPTIONS.map(s => <Chip key={s} small active={role.skills.includes(s)} onClick={() => togSkill(i, s)}>{s}</Chip>)}</div></div>)}<button onClick={addRole} style={{ width: "100%", padding: "11px", border: `1px dashed ${C.rule}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11, letterSpacing: "0.08em" }}>+ ADD ANOTHER ROLE</button></>}
                        {!isBuild && <div style={{ paddingTop: 20 }}><p style={{ fontSize: 13, color: C.body, marginBottom: 24, lineHeight: 1.6 }}>You're looking for {form.spots} person{form.spots !== 1 ? "s" : ""} to join <strong>{form.name || "your activity"}</strong>.</p></div>}
                    </>}
                    {step === 2 && <>
                        <p style={{ fontSize: 13, color: C.body, marginBottom: 24, lineHeight: 1.6 }}>Which terms are you running this {isBuild ? "project" : "activity"}?</p>
                        <SectionLabel>ACTIVE TERMS</SectionLabel>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>{ALL_TERMS.map(t => <div key={t} onClick={() => togTerm(t)} style={{ padding: "14px 18px", border: form.terms.includes(t) ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.terms.includes(t) ? C.ink : C.surface, cursor: "pointer", textAlign: "center", transition: "all 0.12s", minWidth: 60 }}><D size={15} color={form.terms.includes(t) ? C.lime : C.muted} style={{ display: "block" }}>{t}</D></div>)}</div>
                        {form.terms.length > 0 && <div style={{ padding: "14px 18px", border: `1px solid ${C.lime}66`, background: C.limeLight }}><M style={{ fontSize: 12, color: C.limeDark }}>✓ Active: {form.terms.join("  ·  ")}</M></div>}
                    </>}
                </div>
                <div style={{ padding: "20px 28px", borderTop: `1px solid ${C.rule}`, display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
                    <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} style={{ fontSize: 11, padding: "10px 22px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>{step === 0 ? "CANCEL" : "← BACK"}</button>
                    {step < 2 ? <button onClick={() => canStep() && setStep(s => s + 1)} style={{ fontSize: 11, letterSpacing: "0.1em", padding: "10px 28px", border: "none", background: canStep() ? C.ink : C.rule, color: canStep() ? C.bg : C.muted, cursor: canStep() ? "pointer" : "default", fontWeight: 700 }}>NEXT →</button>
                        : <button onClick={submit} disabled={!canStep() || loading} style={{ fontSize: 11, letterSpacing: "0.1em", padding: "10px 28px", border: "none", background: canStep() ? C.lime : C.rule, color: canStep() ? C.limeInk : C.muted, cursor: canStep() ? "pointer" : "default", fontWeight: 700 }}>{loading ? "POSTING..." : "POST ✓"}</button>}
                </div>
            </div>
        </div>
    );
}
