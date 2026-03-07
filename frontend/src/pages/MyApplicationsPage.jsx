import { useState, useEffect } from "react";
import { api } from "../api";
import { D, M, StatusBadge, SectionLabel, SubTopBar } from "../components/Primitives";
import { C, BASE_CSS } from "../constants";

export default function MyApplicationsPage({ initialApps, onBack, userId }) {
  const [apps, setApps] = useState(initialApps || []);
  const [loading, setLoading] = useState(!initialApps);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!initialApps && userId) {
      api.getMyApplications(userId).then(data => { setApps(data); setLoading(false); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const counts = {
    ALL: apps.length,
    PENDING: apps.filter(a => a.status === "PENDING").length,
    ACCEPTED: apps.filter(a => a.status === "ACCEPTED").length,
    REJECTED: apps.filter(a => a.status === "REJECTED").length,
  };
  const shown = statusFilter === "ALL" ? apps : apps.filter(a => a.status === statusFilter);
  const fmt = iso => new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  const statusLine = { PENDING: "Under review — founder will respond via Plork.", ACCEPTED: "🎉 Accepted! Check your messages to coordinate next steps.", REJECTED: "Not a fit this time. Keep applying — your profile is strong." };
  const accentColor = { PENDING: C.amber, ACCEPTED: C.lime, REJECTED: C.red };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", color: C.ink }}>
      <style>{BASE_CSS}</style>
      <SubTopBar onBack={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "calc(100vh - 52px)" }}>
        <div style={{ borderRight: `1px solid ${C.rule}`, padding: "32px 24px", background: C.surface }}>
          <D size={26} style={{ display: "block", marginBottom: 4 }}>MY APPLICATIONS</D>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>Track the roles you've applied for.</p>
          <SectionLabel>FILTER</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
            {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", border: statusFilter === s ? `1.5px solid ${C.ink}` : `1px solid ${C.rule}`, background: statusFilter === s ? C.ink : "transparent", cursor: "pointer", transition: "all 0.1s" }}>
                <M style={{ fontSize: 11, letterSpacing: "0.06em", color: statusFilter === s ? C.bg : C.body }}>{s}</M>
                <M style={{ fontSize: 11, fontWeight: 600, color: statusFilter === s ? C.lime : C.muted }}>{counts[s]}</M>
              </button>
            ))}
          </div>
          <SectionLabel>SUMMARY</SectionLabel>
          {[["Applied", counts.ALL], ["Pending", counts.PENDING], ["Accepted", counts.ACCEPTED], ["Rejected", counts.REJECTED]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.rule}` }}>
              <M style={{ fontSize: 11, color: C.muted }}>{l}</M>
              <M style={{ fontSize: 11, fontWeight: 600, color: C.body }}>{v}</M>
            </div>
          ))}
        </div>
        <div style={{ padding: "32px 40px", overflowY: "auto", background: C.detail }}>
          {loading && <M style={{ fontSize: 13, color: C.muted }}>Loading…</M>}
          {!loading && shown.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <M style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>No {statusFilter !== "ALL" ? statusFilter.toLowerCase() + " " : ""}applications yet.<br />Browse projects and hit APPLY to get started.</M>
            </div>
          )}
          {!loading && shown.map(app => {
            const open = expanded === app.id;
            return (
              <div key={app.id} style={{ border: `1px solid ${C.rule}`, marginBottom: 10, background: C.bg }}>
                <div onClick={() => setExpanded(open ? null : app.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer" }}>
                  <div style={{ width: 3, alignSelf: "stretch", background: accentColor[app.status] || C.amber, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <D size={19}>{app.projectName}</D>
                      <StatusBadge status={app.status} />
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <M style={{ fontSize: 12, color: C.body }}>{app.roleTitle}</M>
                      <M style={{ fontSize: 10, color: C.muted, background: C.surface2, padding: "2px 7px" }}>{app.projectCategory}</M>
                      <M style={{ fontSize: 10, color: C.muted }}>Applied {fmt(app.createdAt)}</M>
                      {app.status !== "PENDING" && <M style={{ fontSize: 10, color: C.muted }}>· Updated {fmt(app.updatedAt)}</M>}
                    </div>
                  </div>
                  <M style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{open ? "▲" : "▼"}</M>
                </div>
                {open && (
                  <div className="fade-up" style={{ borderTop: `1px solid ${C.rule}`, padding: "20px 21px 20px 35px", background: C.surface }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                      <div>
                        <SectionLabel>YOUR INTRO</SectionLabel>
                        <p style={{ fontSize: 13, color: C.body, lineHeight: 1.7, marginBottom: 14 }}>{app.intro}</p>
                        {app.links && <><SectionLabel>LINKS</SectionLabel><M style={{ fontSize: 12, color: C.ink }}>{app.links}</M></>}
                      </div>
                      <div>
                        <SectionLabel>ROLE SKILLS</SectionLabel>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>{app.roleSkills.map(s => <M key={s} style={{ fontSize: 10, color: C.limeDark, background: C.limeLight, border: `1px solid ${C.lime}55`, padding: "2px 8px" }}>{s}</M>)}</div>
                        <SectionLabel>STATUS UPDATE</SectionLabel>
                        <p style={{ fontSize: 12, color: app.status === "ACCEPTED" ? C.limeDark : app.status === "REJECTED" ? C.red : C.body, lineHeight: 1.6 }}>{statusLine[app.status]}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
