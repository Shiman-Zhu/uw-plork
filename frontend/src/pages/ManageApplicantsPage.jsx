import { useState, useEffect } from "react";
import { api } from "../api";
import { D, M, StatusBadge, SectionLabel, SectionDivider, SubTopBar } from "../components/Primitives";
import { C, BASE_CSS, ALL_TERMS } from "../constants";

export default function ManageApplicantsPage({ project, onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  useEffect(() => {
    api.getProjectApplicants(project.id).then(data => { setApplicants(data); setLoading(false); });
  }, [project.id]);

  const decide = async (id, status) => {
    setUpdatingId(id);
    await api.updateApplicationStatus(id, status);
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setUpdatingId(null);
  };
  const pending = applicants.filter(a => a.status === "PENDING");
  const decided = applicants.filter(a => a.status !== "PENDING");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", color: C.ink }}>
      <style>{BASE_CSS}</style>
      <SubTopBar onBack={onBack} backLabel="BACK TO PROJECT" />
      <div style={{ padding: "36px 48px", maxWidth: 800, background: C.detail, minHeight: "calc(100vh - 52px)" }}>
        <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 8 }}>APPLICANTS FOR</M>
        <D size={40} style={{ display: "block", marginBottom: 4 }}>{project.name}</D>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 36 }}>{pending.length} pending · {decided.length} decided</p>

        {loading && <M style={{ fontSize: 13, color: C.muted }}>Loading applicants…</M>}
        {!loading && applicants.length === 0 && <div style={{ paddingTop: 48, textAlign: "center" }}><M style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>No applicants yet.</M></div>}

        {!loading && pending.length > 0 && <>
          <SectionLabel>AWAITING REVIEW ({pending.length})</SectionLabel>
          {pending.map(app => (
            <div key={app.id} style={{ border: `1px solid ${C.rule}`, marginBottom: 16, background: C.bg, padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: C.limeLight, border: `1px solid ${C.lime}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🧑‍💻</div>
                  <div>
                    <M style={{ fontSize: 13, color: C.ink, fontWeight: 600, display: "block" }}>{app.applicantName}</M>
                    <M style={{ fontSize: 11, color: C.muted }}>{app.applicantStream}</M>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <M style={{ fontSize: 24, fontWeight: 700, color: app.applicantMatch > 90 ? C.lime : app.applicantMatch > 80 ? "#aaaa00" : C.muted, display: "block", lineHeight: 1 }}>{app.applicantMatch}%</M>
                  <M style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em" }}>MATCH</M>
                </div>
              </div>
              <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>APPLYING FOR</M>
              <M style={{ fontSize: 13, color: C.ink, display: "block", marginBottom: 12 }}>{app.roleTitle}</M>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>{app.applicantSkills.map(s => <M key={s} style={{ fontSize: 10, color: C.limeDark, background: C.limeLight, border: `1px solid ${C.lime}55`, padding: "2px 8px" }}>{s}</M>)}</div>
              <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>{ALL_TERMS.map(t => { const th = app.applicantTerms.includes(t), ov = th && project.terms?.overlap?.includes(t); return <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: ov ? 20 : th ? 12 : 6, background: ov ? C.lime : th ? C.ink : C.rule }} /><M style={{ fontSize: 7, color: ov ? C.limeDark : C.muted }}>{t}</M></div>; })}</div>
              <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 7 }}>THEIR INTRO</M>
              <p style={{ fontSize: 13, color: C.body, lineHeight: 1.7, marginBottom: 16 }}>{app.intro}</p>
              {app.links && <M style={{ fontSize: 12, color: C.lime, display: "block", marginBottom: 18 }}>{app.links}</M>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => decide(app.id, "ACCEPTED")} disabled={updatingId === app.id} style={{ flex: 1, padding: "11px", fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, background: C.lime, color: C.limeInk, border: "none", cursor: "pointer", opacity: updatingId === app.id ? 0.6 : 1 }}>✓ ACCEPT</button>
                <button onClick={() => decide(app.id, "REJECTED")} disabled={updatingId === app.id} style={{ flex: 1, padding: "11px", fontSize: 12, letterSpacing: "0.1em", fontWeight: 600, background: "transparent", color: C.red, border: `1px solid ${C.red}55`, cursor: "pointer", opacity: updatingId === app.id ? 0.6 : 1 }}>✕ PASS</button>
              </div>
            </div>
          ))}
        </>}

        {!loading && decided.length > 0 && <>
          {pending.length > 0 && <SectionDivider />}
          <SectionLabel>DECIDED ({decided.length})</SectionLabel>
          {decided.map(app => (
            <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", border: `1px solid ${C.rule}`, background: C.bg, marginBottom: 7 }}>
              <div style={{ width: 3, alignSelf: "stretch", background: app.status === "ACCEPTED" ? C.lime : C.red, flexShrink: 0 }} />
              <M style={{ fontSize: 13, color: C.body, flex: 1 }}>{app.applicantName}</M>
              <M style={{ fontSize: 11, color: C.muted }}>{app.roleTitle}</M>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}
