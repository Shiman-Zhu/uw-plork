import { useState } from "react";
import { api } from "../api";
import { D, M, FieldInput } from "../components/Primitives";
import { C, BASE_CSS } from "../constants";

export default function Login({ onBack, onSuccess }) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handle = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await api.login(email, pass);
            onSuccess(result.userId);
        } catch (err) {
            setError(err.message || "Invalid credentials.");
        }
        setLoading(false);
    };

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
                    {error && <div style={{ padding: "10px 14px", background: C.redLight, border: `1px solid ${C.red}44`, marginBottom: 20 }}><M style={{ fontSize: 12, color: C.red }}>{error}</M></div>}
                    <FieldInput label="UW EMAIL" value={email} onChange={setEmail} placeholder="userid@uwaterloo.ca" type="email" />
                    <FieldInput label="PASSWORD" value={pass} onChange={setPass} placeholder="••••••••" type="password" />
                    <button onClick={handle} disabled={loading} style={{ width: "100%", padding: "13px", fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, background: C.ink, color: C.bg, border: "none", cursor: "pointer", marginTop: 8, opacity: loading ? 0.6 : 1 }}>{loading ? "LOGGING IN..." : "LOG IN →"}</button>
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.rule}`, textAlign: "center" }}>
                        <span style={{ fontSize: 11, color: C.muted }}>No account? </span>
                        <span onClick={onBack} style={{ fontSize: 11, color: C.ink, cursor: "pointer", textDecoration: "underline" }}>Sign up</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
