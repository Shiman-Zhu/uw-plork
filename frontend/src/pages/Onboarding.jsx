import { useState } from "react";
import { api } from "../api";
import { D, M, Chip, FieldInput, FieldTextarea } from "../components/Primitives";
import { C, BASE_CSS, DISCIPLINE_OPTIONS, YEAR_OPTIONS, SKILL_OPTIONS, INTEREST_OPTIONS, ALL_TERMS, COMMITMENTS } from "../constants";

const STEPS_ARRAY = ["ACCOUNT", "STREAM", "SKILLS", "SCHEDULE", "DONE"];

export default function Onboarding({ onComplete, onBack }) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", discipline: "", year: "", skills: [], interests: [], built: "", terms: [], commitment: "" });
    const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const tog = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));
    const canNext = () => {
        if (step === 0) return form.name && form.email && form.password && form.password === form.confirmPassword && form.password.length >= 6;
        if (step === 1) return form.discipline && form.year;
        if (step === 2) return form.skills.length > 0;
        if (step === 3) return form.terms.length > 0;
        return true;
    };
    const finish = async () => {
        setLoading(true);
        try {
            const result = await api.register(form);
            setLoading(false);
            onComplete(result.userId);
        } catch (err) {
            setLoading(false);
            alert("Registration failed: " + (err.message || "Unknown error"));
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", display: "flex", flexDirection: "column" }}>
            <style>{BASE_CSS}</style>
            <div style={{ height: 3, background: C.rule }}><div style={{ height: "100%", width: `${(step / (STEPS_ARRAY.length - 1)) * 100}%`, background: C.lime, transition: "width 0.4s" }} /></div>
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 56, borderBottom: `1px solid ${C.rule}` }}>
                <D size={22}>PLORK</D>
                {step === 0 && <button onClick={onBack} style={{ fontSize: 11, letterSpacing: "0.08em", padding: "8px 20px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>← BACK TO LOGIN</button>}
            </nav>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "52px 40px", overflowY: "auto" }}>
                <div className="fade-up" key={step} style={{ width: "100%", maxWidth: 580 }}>
                    {step === 0 && <>
                        <D size={44} style={{ display: "block", marginBottom: 6 }}>CREATE ACCOUNT</D>
                        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Sign up with your UW email.</p>
                        <FieldInput label="FULL NAME" value={form.name} onChange={v => u("name", v)} placeholder="Jamie Kim" />
                        <FieldInput label="UW EMAIL" value={form.email} onChange={v => u("email", v)} placeholder="jkim@uwaterloo.ca" type="email" />
                        <FieldInput label="PASSWORD" value={form.password} onChange={v => u("password", v)} placeholder="••••••••" type="password" hint={form.password && form.password.length < 6 ? "At least 6 characters" : ""} />
                        <FieldInput label="CONFIRM PASSWORD" value={form.confirmPassword || ""} onChange={v => u("confirmPassword", v)} placeholder="••••••••" type="password" hint={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : ""} />
                    </>}
                    {step === 1 && <>
                        <D size={44} style={{ display: "block", marginBottom: 6 }}>YOUR STREAM</D>
                        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Helps Plork understand your schedule.</p>
                        <div style={{ marginBottom: 28 }}>
                            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>DISCIPLINE</M>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{DISCIPLINE_OPTIONS.map(d => <Chip key={d} active={form.discipline === d} onClick={() => u("discipline", d)}>{d}</Chip>)}</div>
                        </div>
                        <div>
                            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>CURRENT TERM</M>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{YEAR_OPTIONS.map(y => <Chip key={y} active={form.year === y} onClick={() => u("year", y)}>{y}</Chip>)}</div>
                        </div>
                    </>}
                    {step === 2 && <>
                        <D size={44} style={{ display: "block", marginBottom: 6 }}>YOUR SKILLS</D>
                        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Select everything you're comfortable with.</p>
                        <div style={{ marginBottom: 28 }}>
                            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>TECHNICAL SKILLS</M>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{SKILL_OPTIONS.map(s => <Chip key={s} active={form.skills.includes(s)} onClick={() => tog("skills", s)}>{s}</Chip>)}</div>
                        </div>
                        <FieldTextarea label="WHAT I'VE BUILT" value={form.built} onChange={v => u("built", v)} placeholder="Built a lane-detection model for Midnight Sun." hint="1–2 lines" />
                        <div>
                            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>INTERESTS — for Crew Mode</M>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{INTEREST_OPTIONS.map(s => <Chip key={s} active={form.interests.includes(s)} onClick={() => tog("interests", s)}>{s}</Chip>)}</div>
                        </div>
                    </>}
                    {step === 3 && <>
                        <D size={44} style={{ display: "block", marginBottom: 6 }}>YOUR SCHEDULE</D>
                        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Which terms are you on campus?</p>
                        <div style={{ marginBottom: 32 }}>
                            <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>ON-CAMPUS TERMS</M>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{ALL_TERMS.map(t => <div key={t} onClick={() => tog("terms", t)} style={{ padding: "14px 18px", border: form.terms.includes(t) ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.terms.includes(t) ? C.ink : C.surface, cursor: "pointer", textAlign: "center", transition: "all 0.12s", minWidth: 60 }}><D size={15} color={form.terms.includes(t) ? C.lime : C.muted} style={{ display: "block" }}>{t}</D></div>)}</div>
                        </div>
                        <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>COMMITMENT LEVEL</M>
                        {COMMITMENTS.map(c => <div key={c} onClick={() => u("commitment", c)} style={{ padding: "13px 18px", border: form.commitment === c ? `2px solid ${C.ink}` : `1px solid ${C.rule}`, background: form.commitment === c ? C.ink : C.surface, cursor: "pointer", marginBottom: 8, display: "flex", gap: 16, alignItems: "center", transition: "all 0.12s" }}><D size={15} color={form.commitment === c ? C.lime : C.muted} style={{ flexShrink: 0 }}>{c}</D><span style={{ fontSize: 12, color: form.commitment === c ? "#7a9a6a" : C.muted, lineHeight: 1.5 }}>{c === "CASUAL" ? "A few hours a week" : c === "SERIOUS" ? "Consistent effort, aiming to ship" : "Startup-track"}</span></div>)}
                    </>}
                    {step === 4 && <div style={{ textAlign: "center", paddingTop: 40 }}>
                        <div style={{ width: 64, height: 64, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px" }}>✓</div>
                        <D size={48} style={{ display: "block", marginBottom: 14 }}>YOU'RE IN.</D>
                        <p style={{ fontSize: 14, color: C.body, lineHeight: 1.8, marginBottom: 40, maxWidth: 380, margin: "0 auto 40px" }}>Profile created for <strong>{form.name || "you"}</strong>.<br />{form.discipline} {form.year}{form.skills.length > 0 ? " · " + form.skills.slice(0, 3).join(", ") : ""}</p>
                        <button onClick={finish} disabled={loading} style={{ fontSize: 13, letterSpacing: "0.12em", fontWeight: 700, padding: "14px 44px", background: C.ink, color: C.bg, border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>{loading ? "SETTING UP..." : "ENTER PLORK →"}</button>
                    </div>}
                    {step < 4 && <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.rule}` }}>
                        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ fontSize: 11, padding: "10px 24px", border: `1px solid ${C.rule}`, background: "transparent", color: step === 0 ? C.rule : C.body, cursor: step === 0 ? "default" : "pointer" }}>← BACK</button>
                        <button onClick={() => setStep(s => Math.min(STEPS_ARRAY.length - 1, s + 1))} disabled={!canNext()} style={{ fontSize: 11, letterSpacing: "0.1em", padding: "10px 28px", border: "none", background: canNext() ? C.ink : C.rule, color: canNext() ? C.bg : C.muted, cursor: canNext() ? "pointer" : "default", fontWeight: 700 }}>NEXT →</button>
                    </div>}
                </div>
            </div>
        </div>
    );
}
