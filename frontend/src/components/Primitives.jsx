// UI Primitive Components
import { C } from "../constants";

export const D = ({ children, size = 48, color = C.ink, style = {} }) => (
  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: size, letterSpacing: "0.08em", lineHeight: 1, color, ...style }}>{children}</span>
);

export const M = ({ children, style = {} }) => (
  <span style={{ fontFamily: "'IBM Plex Mono',monospace", ...style }}>{children}</span>
);

export function StatusBadge({ status }) {
  const cfg = {
    PENDING: { bg: C.amberLight, color: C.amber, border: "#cc880044" },
    ACCEPTED: { bg: C.limeLight, color: C.limeDark, border: `${C.lime}66` },
    REJECTED: { bg: C.redLight, color: C.red, border: "#cc330044" },
  }[status] || { bg: C.amberLight, color: C.amber, border: "#cc880044" };
  return <M style={{ fontSize: 10, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: "3px 10px", letterSpacing: "0.08em", flexShrink: 0 }}>{status}</M>;
}

export function Chip({ children, active, onClick, small }) {
  return <span onClick={onClick} style={{ display: "inline-block", fontFamily: "'IBM Plex Mono',monospace", fontSize: small ? 10 : 11, letterSpacing: "0.04em", padding: small ? "3px 8px" : "5px 12px", border: active ? `1.5px solid ${C.ink}` : `1px solid ${C.rule}`, background: active ? C.ink : "transparent", color: active ? C.bg : C.body, cursor: onClick ? "pointer" : "default", transition: "all 0.1s", userSelect: "none" }}>{children}</span>;
}

export function FieldInput({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>{label}</label>
        {hint && <M style={{ fontSize: 10, color: C.muted }}>{hint}</M>}
      </div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", fontSize: 13, color: C.ink, background: C.surface, border: `1px solid ${C.rule}`, outline: "none", transition: "border-color 0.15s" }}
        onFocus={e => e.target.style.borderColor = C.lime} onBlur={e => e.target.style.borderColor = C.rule} />
    </div>
  );
}

export function FieldTextarea({ label, value, onChange, placeholder, rows = 3, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>{label}</label>
        {hint && <M style={{ fontSize: 10, color: C.muted }}>{hint}</M>}
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", padding: "11px 14px", fontSize: 13, color: C.ink, background: C.surface, border: `1px solid ${C.rule}`, outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.15s" }}
        onFocus={e => e.target.style.borderColor = C.lime} onBlur={e => e.target.style.borderColor = C.rule} />
    </div>
  );
}

export function SectionLabel({ children }) {
  return <M style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>{children}</M>;
}

export function SectionDivider() { 
  return <div style={{ height: 1, background: C.rule, margin: "28px 0" }} />; 
}

export function SubTopBar({ onBack, backLabel = "BACK TO PLORK", rightSlot }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid ${C.rule}`, height: 52, flexShrink: 0, background: C.bg }}>
      <div style={{ padding: "0 24px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.rule}`, gap: 10 }}>
        <D size={24}>PLORK</D>
        <div style={{ width: 5, height: 5, background: C.lime, animation: "blink 1.4s infinite" }} />
      </div>
      <button onClick={onBack} style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, letterSpacing: "0.08em", color: C.muted, background: "transparent", border: "none", borderRight: `1px solid ${C.rule}` }}>
        ← {backLabel}
      </button>
      {rightSlot && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", borderLeft: `1px solid ${C.rule}` }}>{rightSlot}</div>}
    </div>
  );
}
