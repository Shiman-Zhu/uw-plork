import { D, M } from "../components/Primitives";
import { C, BASE_CSS, ALL_TERMS } from "../constants";

export default function Landing({ onLogin, onSignup }) {
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
                            <span style={{ display: "inline-block", background: C.ink, padding: "2px 14px" }}><D size={76} color={C.lime}>WATERLOO</D></span>
                        </div>
                        <p style={{ fontSize: 14, color: C.body, lineHeight: 1.8, maxWidth: 420, marginBottom: 40 }}>The co-op cycle kills side projects and sports teams alike. Plork matches you by skill, schedule, and the terms you're actually on campus.</p>
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
                        <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>TWO MODES</M>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                            {[{ m: "BUILD", desc: "Side projects & engineering teams. Role slots and skill matching.", dark: true },
                            { m: "CREW", desc: "Sports, music, social. Find people on campus the same terms as you.", dark: false }].map((x, i) => (
                                <div key={x.m} style={{ padding: "20px 22px", background: x.dark ? C.ink : C.surface, borderRight: i === 0 ? `1px solid ${C.rule}` : "none" }}>
                                    <D size={22} color={x.dark ? C.lime : C.muted} style={{ display: "block", marginBottom: 10 }}>{x.m}</D>
                                    <p style={{ fontSize: 12, color: x.dark ? "#7a9a6a" : C.muted, lineHeight: 1.65 }}>{x.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ borderBottom: `1px solid ${C.rule}`, padding: "32px 48px" }}>
                        <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>CO-OP OVERLAP CALENDAR</M>
                        {[{ n: "YOU", t: ["W25", "F25", "W26"] }, { n: "ARJUN", t: ["W25", "S25", "F25", "W26"] }, { n: "PRIYA", t: ["F25", "W26"] }].map(p => (
                            <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                                <M style={{ width: 52, fontSize: 10, color: C.muted }}>{p.n}</M>
                                <div style={{ display: "flex", gap: 5 }}>{ALL_TERMS.slice(3).map(t => { const a = p.t.includes(t); return <div key={t} style={{ width: 30, height: 14, background: a ? C.ink : C.rule }} />; })}</div>
                            </div>
                        ))}
                        <div style={{ display: "flex", gap: 5, marginTop: 6, paddingLeft: 66 }}>{ALL_TERMS.slice(3).map(t => <M key={t} style={{ width: 30, fontSize: 8, color: C.muted, textAlign: "center" }}>{t}</M>)}</div>
                    </div>
                    <div style={{ padding: "32px 48px" }}>
                        <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>ROLE SLOT SYSTEM</M>
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
