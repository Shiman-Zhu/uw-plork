import { useState, useEffect } from "react";
import { api } from "../api";
import { D, M, Chip } from "../components/Primitives";
import { C, BASE_CSS, ALL_TERMS } from "../constants";
import ProfilePage from "./ProfilePage";
import MyApplicationsPage from "./MyApplicationsPage";
import ManageApplicantsPage from "./ManageApplicantsPage";
import RequestToJoin from "./RequestToJoin";
import PostModal from "./PostModal";

export default function MainApp({ userId: propUserId }) {
  const [mode, setMode] = useState("BUILD");
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("ROLES");
  const [showPost, setShowPost] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [profile, setProfile] = useState({ name: "", email: "", discipline: "", year: "", skills: [], interests: [], built: "", terms: [], commitment: "", github: "" });
  const [userId, setUserId] = useState(propUserId);
  const [myApps, setMyApps] = useState([]);
  const [requestTarget, setRequestTarget] = useState(null);
  const [subPage, setSubPage] = useState(null);
  const [manageProject, setManageProject] = useState(null);

  useEffect(() => {
    if (userId) {
      api.getProfile(userId).then(data => {
        setProfile(data);
      }).catch(err => {
        console.error("Failed to load profile:", err);
      });
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      api.getProjects(mode, userId).then(data => {
        if (mode === "BUILD") {
          setProjects(data);
          setSelectedId(data[0]?.id || null);
        } else {
          setActivities(data);
          setSelectedId(data[0]?.id || null);
        }
      }).catch(err => {
        console.error("Failed to load projects:", err);
      });
    }
  }, [mode, userId]);

  useEffect(() => {
    if (userId) {
      api.getMyApplications(userId).then(data => {
        setMyApps(data);
      }).catch(err => {
        console.error("Failed to load applications:", err);
      });
    }
  }, [userId]);

  const handlePost = async (p) => {
    if (!userId) { alert("Please log in first"); return; }
    const created = await api.createProject(p, userId);
    if (mode === "BUILD") {
      setProjects(prev => [created, ...prev]);
      setSelectedId(created.id);
    } else {
      setActivities(prev => [created, ...prev]);
      setSelectedId(created.id);
    }
    setShowPost(false);
  };

  const handleApplied = async (app) => {
    setMyApps(prev => [...prev, app]);
    setRequestTarget(null);
  };

  const current = mode === "BUILD" ? projects.find(p => p.id === selectedId) : activities.find(a => a.id === selectedId);
  const shown = mode === "BUILD" ? projects : activities;
  const filtered = filter === "ALL" ? shown : shown.filter(p => filter === "YOURS" ? p.yours : !p.yours);

  if (subPage === "profile") return <ProfilePage profile={profile} userId={userId} onSave={setProfile} onBack={() => setSubPage(null)} />;
  if (subPage === "applications") return <MyApplicationsPage initialApps={myApps} onBack={() => setSubPage(null)} userId={userId} />;
  if (manageProject) return <ManageApplicantsPage project={manageProject} onBack={() => setManageProject(null)} />;
  if (requestTarget) return <RequestToJoin project={requestTarget.project} role={requestTarget.role} onBack={() => setRequestTarget(null)} onSubmitted={handleApplied} userId={userId} profile={profile} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'IBM Plex Mono',monospace", color: C.ink }}>
      <style>{BASE_CSS}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 56, borderBottom: `1px solid ${C.rule}`, background: C.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <D size={26}>PLORK</D>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setMode("BUILD")} style={{ padding: "6px 14px", fontSize: 11, letterSpacing: "0.08em", border: mode === "BUILD" ? `1.5px solid ${C.ink}` : `1px solid ${C.rule}`, background: mode === "BUILD" ? C.ink : "transparent", color: mode === "BUILD" ? C.bg : C.body, cursor: "pointer", fontWeight: mode === "BUILD" ? 600 : 400 }}>BUILD</button>
            <button onClick={() => setMode("CREW")} style={{ padding: "6px 14px", fontSize: 11, letterSpacing: "0.08em", border: mode === "CREW" ? `1.5px solid ${C.ink}` : `1px solid ${C.rule}`, background: mode === "CREW" ? C.ink : "transparent", color: mode === "CREW" ? C.bg : C.body, cursor: "pointer", fontWeight: mode === "CREW" ? 600 : 400 }}>CREW</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSubPage("applications")} style={{ fontSize: 11, letterSpacing: "0.08em", padding: "7px 16px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>MY APPLICATIONS</button>
          <button onClick={() => setSubPage("profile")} style={{ fontSize: 11, letterSpacing: "0.08em", padding: "7px 16px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>PROFILE</button>
          <button onClick={() => setShowPost(true)} style={{ fontSize: 11, letterSpacing: "0.1em", fontWeight: 700, padding: "7px 20px", border: "none", background: C.lime, color: C.limeInk, cursor: "pointer" }}>+ POST</button>
        </div>
      </nav>
      <div className="app-layout" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        <div className="app-sidebar" style={{ width: 320, borderRight: `1px solid ${C.rule}`, background: C.surface, overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.rule}` }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["ALL", "YOURS", "AVAILABLE"].map(f => <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "6px", fontSize: 10, letterSpacing: "0.08em", border: filter === f ? `1.5px solid ${C.ink}` : `1px solid ${C.rule}`, background: filter === f ? C.ink : "transparent", color: filter === f ? C.bg : C.body, cursor: "pointer" }}>{f}</button>)}
            </div>
            <M style={{ fontSize: 10, color: C.muted }}>{filtered.length} {mode === "BUILD" ? "projects" : "activities"}</M>
          </div>
          <div>
            {filtered.length === 0 && <div style={{ padding: "40px 22px", textAlign: "center" }}><M style={{ fontSize: 12, color: C.muted }}>No {mode === "BUILD" ? "projects" : "activities"} found.</M></div>}
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelectedId(p.id)} style={{ padding: "16px 22px", borderBottom: `1px solid ${C.rule}`, cursor: "pointer", background: selectedId === p.id ? C.detail : "transparent", transition: "background 0.1s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <D size={18} style={{ flex: 1, lineHeight: 1.2 }}>{p.name}</D>
                  {p.yours && <M style={{ fontSize: 9, color: C.limeDark, background: C.limeLight, border: `1px solid ${C.lime}66`, padding: "1px 6px", flexShrink: 0, marginLeft: 8 }}>YOURS</M>}
                </div>
                <M style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6, lineHeight: 1.4 }}>{p.tagline}</M>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {p.category && <M style={{ fontSize: 9, color: C.body, background: C.surface2, padding: "2px 7px" }}>{p.category}</M>}
                  {p.match && <M style={{ fontSize: 10, fontWeight: 600, color: p.match > 90 ? C.lime : p.match > 80 ? "#aaaa00" : C.muted }}>{p.match}%</M>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {current ? (
            <>
              <div style={{ padding: "28px 36px", borderBottom: `1px solid ${C.rule}`, background: C.detail, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <D size={36}>{current.name}</D>
                      {current.yours && <M style={{ fontSize: 10, color: C.limeDark, background: C.limeLight, border: `1px solid ${C.lime}66`, padding: "2px 8px" }}>YOURS</M>}
                    </div>
                    <M style={{ fontSize: 13, color: C.body, lineHeight: 1.6, display: "block", marginBottom: 12 }}>{current.tagline}</M>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {current.category && <M style={{ fontSize: 11, color: C.body, background: C.surface2, padding: "3px 10px" }}>{current.category}</M>}
                      {current.stage && <M style={{ fontSize: 11, color: C.body, background: C.surface2, padding: "3px 10px" }}>{current.stage}</M>}
                      {current.commitment && <M style={{ fontSize: 11, color: C.body, background: C.surface2, padding: "3px 10px" }}>{current.commitment}</M>}
                      {current.match && <M style={{ fontSize: 12, fontWeight: 700, color: current.match > 90 ? C.lime : current.match > 80 ? "#aaaa00" : C.muted }}>{current.match}% match</M>}
                    </div>
                  </div>
                  {current.yours && <button onClick={() => setManageProject(current)} style={{ fontSize: 11, letterSpacing: "0.08em", padding: "8px 18px", border: `1px solid ${C.rule}`, background: "transparent", color: C.body, cursor: "pointer" }}>MANAGE</button>}
                </div>
                {current.poster_name && <M style={{ fontSize: 11, color: C.muted }}>Posted by {current.poster_name} · {current.discipline} {current.year}</M>}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px", background: C.bg }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                  {["ROLES", "DETAILS"].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", fontSize: 11, letterSpacing: "0.08em", border: tab === t ? `1.5px solid ${C.ink}` : `1px solid ${C.rule}`, background: tab === t ? C.ink : "transparent", color: tab === t ? C.bg : C.body, cursor: "pointer", fontWeight: tab === t ? 600 : 400 }}>{t}</button>)}
                </div>
                {tab === "ROLES" && (
                  <div>
                    {mode === "BUILD" && current.roles && current.roles.length > 0 ? (
                      current.roles.map((role, i) => (
                        <div key={i} style={{ border: `1px solid ${C.rule}`, padding: "18px 22px", marginBottom: 12, background: C.surface }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <M style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{role.title}</M>
                            {role.filled ? <M style={{ fontSize: 10, color: C.muted }}>→ Filled</M> : <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", border: `1px solid ${C.ink}`, padding: "2px 9px" }}>OPEN</span>}
                          </div>
                          {role.skills && role.skills.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{role.skills.map(s => <Chip key={s} small>{s}</Chip>)}</div>}
                          {!role.filled && !current.yours && <button onClick={() => setRequestTarget({ project: current, role })} style={{ marginTop: 12, fontSize: 11, letterSpacing: "0.08em", padding: "7px 16px", border: `1px solid ${C.ink}`, background: "transparent", color: C.ink, cursor: "pointer" }}>APPLY →</button>}
                        </div>
                      ))
                    ) : mode === "CREW" ? (
                      <div style={{ border: `1px solid ${C.rule}`, padding: "22px", background: C.surface }}>
                        <M style={{ fontSize: 13, color: C.body, lineHeight: 1.7 }}>Looking for <strong>{current.spots || 1} person{current.spots !== 1 ? "s" : ""}</strong> to join this activity.</M>
                        {!current.yours && <button onClick={() => setRequestTarget({ project: current, role: { title: "Member", skills: [] } })} style={{ marginTop: 16, fontSize: 11, letterSpacing: "0.08em", padding: "7px 16px", border: `1px solid ${C.ink}`, background: "transparent", color: C.ink, cursor: "pointer" }}>REQUEST TO JOIN →</button>}
                      </div>
                    ) : (
                      <M style={{ fontSize: 12, color: C.muted }}>No roles defined yet.</M>
                    )}
                  </div>
                )}
                {tab === "DETAILS" && (
                  <div>
                    {current.terms && (current.terms.founder || current.terms.overlap) && (
                      <div style={{ marginBottom: 24 }}>
                        <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>ACTIVE TERMS</M>
                        <div style={{ display: "flex", gap: 6 }}>{ALL_TERMS.map(t => { const inOv = current.terms?.overlap?.includes(t); return <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: inOv ? 24 : 8, background: inOv ? C.lime : C.rule }} /><M style={{ fontSize: 8, color: inOv ? C.limeDark : C.muted }}>{t}</M></div>; })}</div>
                      </div>
                    )}
                    {current.poster_name && <div style={{ marginBottom: 16 }}><M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 6 }}>POSTED BY</M><M style={{ fontSize: 13, color: C.body }}>{current.poster_name} · {current.discipline} {current.year}</M></div>}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
              <M style={{ fontSize: 13, color: C.muted }}>Select a {mode === "BUILD" ? "project" : "activity"} from the sidebar</M>
            </div>
          )}
        </div>
      </div>
      {showPost && <PostModal mode={mode} onClose={() => setShowPost(false)} onSubmit={handlePost} userId={userId} />}
    </div>
  );
}
