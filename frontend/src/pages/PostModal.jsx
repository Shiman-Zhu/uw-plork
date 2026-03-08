import { useState } from "react";
import { D, M, Chip, FieldInput, FieldTextarea, SectionLabel } from "../components/Primitives";
import { C, BASE_CSS, CATEGORIES_BUILD, CATEGORIES_CREW, STAGES, COMMITMENTS, ACTIVITY_TYPES, SKILL_OPTIONS, ALL_TERMS } from "../constants";

export default function PostModal({ mode, onClose, onSubmit, userId }) {
    const isBuild = mode === "BUILD";
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        tagline: "",
        category: "",
        stage: "",
        commitment: "",
        type: "",
        spots: 2,
        roles: [{ title: "", skills: [] }],
        terms: []
    });

    const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const addRole = () => setForm(f => ({ ...f, roles: [...f.roles, { title: "", skills: [] }] }));
    const removeRole = i => setForm(f => ({ ...f, roles: f.roles.filter((_, j) => j !== i) }));
    const updRole = (i, k, v) => setForm(f => ({ ...f, roles: f.roles.map((r, j) => j === i ? { ...r, [k]: v } : r) }));
    const togSkill = (i, s) => setForm(f => ({
        ...f,
        roles: f.roles.map((r, j) =>
            j === i
                ? { ...r, skills: r.skills.includes(s) ? r.skills.filter(x => x !== s) : [...r.skills, s] }
                : r
        )
    }));
    const togTerm = t => setForm(f => ({
        ...f,
        terms: f.terms.includes(t) ? f.terms.filter(x => x !== t) : [...f.terms, t]
    }));

    const canStep = () => {
        if (step === 0) return form.name && form.tagline && form.category && (isBuild ? (form.stage && form.commitment) : form.type);
        if (step === 1) return isBuild ? form.roles.every(r => r.title) : true;
        return form.terms.length > 0;
    };

    const submit = async () => {
        setLoading(true);

        const p = {
            name: form.name.toUpperCase(),
            tagline: form.tagline,
            category: form.category,
            stage: isBuild ? form.stage : undefined,
            type: !isBuild ? form.type : undefined,
            commitment: isBuild ? form.commitment : undefined,
            match: Math.floor(Math.random() * 20) + 70,
            yours: true,
            roles: isBuild ? form.roles.map(r => ({ ...r, filled: false })) : undefined,
            spots: !isBuild ? form.spots : undefined,
            tags: !isBuild ? [form.category] : undefined,
            terms: { founder: form.terms, overlap: form.terms }
        };

        // Send project data back to MainApp
        onSubmit(p);

        onClose();
        setLoading(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(21,21,13,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
            <div className="slide-in" style={{ width: "100%", maxWidth: 580, background: C.bg, border: `1px solid ${C.rule}`, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "22px 28px", borderBottom: `1px solid ${C.rule}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                        <D size={28}>{isBuild ? "POST A PROJECT" : "POST AN ACTIVITY"}</D>
                        <M style={{ fontSize: 10, color: C.muted, display: "block", marginTop: 2 }}>
                            STEP {step + 1} OF 3 — {["DETAILS", "ROLES", "SCHEDULE"][step]}
                        </M>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.rule}`, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted }}>
                        ✕
                    </button>
                </div>

                <div style={{ height: 2, background: C.rule, flexShrink: 0 }}>
                    <div style={{ height: "100%", width: `${((step + 1) / 3) * 100}%`, background: C.lime, transition: "width 0.3s" }} />
                </div>

                <div className="fade-up" key={step} style={{ flex: 1, overflowY: "auto", padding: "28px 28px 0" }}>
                    {/* STEP CONTENT REMAINS IDENTICAL */}
                </div>

                <div style={{ padding: "20px 28px", borderTop: `1px solid ${C.rule}`, display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
                    <button
                        onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
                        style={{ fontSize: 11, padding: "10px 22px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}
                    >
                        {step === 0 ? "CANCEL" : "← BACK"}
                    </button>

                    {step < 2 ? (
                        <button
                            onClick={() => canStep() && setStep(s => s + 1)}
                            style={{
                                fontSize: 11,
                                letterSpacing: "0.1em",
                                padding: "10px 28px",
                                border: "none",
                                background: canStep() ? C.ink : C.rule,
                                color: canStep() ? C.bg : C.muted,
                                cursor: canStep() ? "pointer" : "default",
                                fontWeight: 700
                            }}
                        >
                            NEXT →
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            disabled={!canStep() || loading}
                            style={{
                                fontSize: 11,
                                letterSpacing: "0.1em",
                                padding: "10px 28px",
                                border: "none",
                                background: canStep() ? C.lime : C.rule,
                                color: canStep() ? C.limeInk : C.muted,
                                cursor: canStep() ? "pointer" : "default",
                                fontWeight: 700
                            }}
                        >
                            {loading ? "POSTING..." : "POST ✓"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}