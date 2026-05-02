// src/components/UI.js  — Reusable UI primitives

import React from "react";

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 32 }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
      <div style={{
        width:size, height:size,
        border:"3px solid #E8EBF0", borderTopColor:"#1D9E75",
        borderRadius:"50%", animation:"spin 0.8s linear infinite"
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Alert ───────────────────────────────────────────────── */
export function Alert({ type, msg }) {
  if (!msg) return null;
  const ok = type === "success";
  return (
    <div style={{
      padding:"10px 16px", borderRadius:8, fontSize:13, marginBottom:14,
      background: ok ? "#E1F5EE" : "#FCEBEB",
      color:       ok ? "#0F6E56" : "#A32D2D",
      border:`1px solid ${ok ? "#9FE1CB" : "#F7C1C1"}`
    }}>
      {msg}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────── */
const BADGE_MAP = {
  Active:      { bg:"#E1F5EE",  c:"#0F6E56"  },
  Vacated:     { bg:"#F1EFE8",  c:"#5F5E5A"  },
  Transferred: { bg:"#E6F1FB",  c:"#185FA5"  },
  General:     { bg:"#EEEDFE",  c:"#4A45A0"  },
  OBC:         { bg:"#FAECE7",  c:"#8C3310"  },
  SC:          { bg:"#E1F5EE",  c:"#0F6E56"  },
  ST:          { bg:"#FAEEDA",  c:"#854F0B"  },
  EWS:         { bg:"#FBEAF0",  c:"#8C1A44"  },
  Male:        { bg:"#E6F1FB",  c:"#185FA5"  },
  Female:      { bg:"#FBEAF0",  c:"#8C1A44"  },
  Paid:        { bg:"#E1F5EE",  c:"#0F6E56"  },
  Unpaid:      { bg:"#FCEBEB",  c:"#A32D2D"  },
  Pending:     { bg:"#FAEEDA",  c:"#854F0B"  },
  Admin:       { bg:"#E6F1FB",  c:"#185FA5"  },
  Warden:      { bg:"#E1F5EE",  c:"#0F6E56"  },
  Staff:       { bg:"#F1EFE8",  c:"#5F5E5A"  },
  Unallocated: { bg:"#FCEBEB",  c:"#A32D2D"  },
  Boys:        { bg:"#E6F1FB",  c:"#185FA5"  },
  Girls:       { bg:"#FBEAF0",  c:"#8C1A44"  },
  Mixed:       { bg:"#EEEDFE",  c:"#4A45A0"  },
  ALLOCATED:   { bg:"#E1F5EE",  c:"#0F6E56"  },
};
export function Badge({ status }) {
  const s = BADGE_MAP[status] || { bg:"#F1EFE8", c:"#5F5E5A" };
  return (
    <span style={{
      background:s.bg, color:s.c,
      padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600,
      whiteSpace:"nowrap"
    }}>
      {status || "—"}
    </span>
  );
}

/* ── Modal ───────────────────────────────────────────────── */
export function Modal({ open, onClose, title, width = 480, children }) {
  if (!open) return null;
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
        display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000
      }}
    >
      <div style={{
        background:"#fff", borderRadius:14, padding:"26px 30px",
        width, maxWidth:"94vw", maxHeight:"88vh", overflowY:"auto",
        boxShadow:"0 20px 60px rgba(0,0,0,0.22)"
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:600, color:"#1A2332" }}>{title}</h3>
          <button onClick={onClose}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#7A8499", lineHeight:1 }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── FormField ───────────────────────────────────────────── */
export function FormField({ label, children, half }) {
  return (
    <div style={{ marginBottom:13, ...(half && { gridColumn:"span 1" }) }}>
      <label style={{ fontSize:11, fontWeight:600, color:"#4A5568", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.4px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Input / Select shared styles ────────────────────────── */
export const inputStyle = {
  width:"100%", padding:"9px 12px", borderRadius:8,
  border:"1px solid #D1D5DB", fontSize:13, outline:"none",
  background:"#fff", color:"#1A2332", boxSizing:"border-box",
  fontFamily:"'DM Sans', sans-serif",
};

/* ── Button ──────────────────────────────────────────────── */
const BTN = {
  primary: { background:"#1D9E75", color:"#fff" },
  danger:  { background:"#E24B4A", color:"#fff" },
  info:    { background:"#378ADD", color:"#fff" },
  ghost:   { background:"#F1F3F7", color:"#4A5568" },
  amber:   { background:"#BA7517", color:"#fff" },
};
export function Btn({ variant="primary", size="md", onClick, disabled, children, style={} }) {
  const v = BTN[variant] || BTN.primary;
  const pad = size === "sm" ? "5px 11px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v, padding:pad, borderRadius:8, border:"none", cursor:disabled?"not-allowed":"pointer",
        fontSize:fs, fontWeight:500, fontFamily:"'DM Sans',sans-serif",
        opacity: disabled ? 0.65 : 1, transition:"opacity 0.15s, transform 0.1s",
        ...style
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = 0.88)}
      onMouseLeave={e => (e.currentTarget.style.opacity = disabled ? 0.65 : 1)}
    >
      {children}
    </button>
  );
}

/* ── StatCard ────────────────────────────────────────────── */
export function StatCard({ icon, label, value, color="#1D9E75" }) {
  return (
    <div style={{
      background:"#fff", borderRadius:12, border:"1px solid #E8EBF0",
      padding:"18px 20px", borderLeft:`4px solid ${color}`
    }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:26, fontWeight:700, color:"#1A2332" }}>{value}</div>
      <div style={{ fontSize:10, color:"#7A8499", textTransform:"uppercase", letterSpacing:"0.5px", marginTop:4 }}>{label}</div>
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────── */
export function Card({ title, children, action }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E8EBF0", padding:"20px 22px", marginBottom:18 }}>
      {(title || action) && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          {title && <div style={{ fontSize:14, fontWeight:600, color:"#1A2332" }}>{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── DataTable ───────────────────────────────────────────── */
export function DataTable({ columns, rows, emptyMsg = "No data found" }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
        <thead>
          <tr style={{ background:"#FAFBFC" }}>
            {columns.map(c => (
              <th key={c.key || c.label} style={{
                textAlign:"left", padding:"9px 12px",
                borderBottom:"2px solid #E8EBF0",
                fontSize:10, fontWeight:700, color:"#7A8499",
                textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap"
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} style={{ padding:32, textAlign:"center", color:"#7A8499" }}>{emptyMsg}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ transition:"background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                {columns.map(c => (
                  <td key={c.key || c.label} style={{ padding:"10px 12px", borderBottom:"1px solid #F0F2F5", color:"#2D3748", ...c.style }}>
                    {c.render ? c.render(row, i) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

/* ── ProgressBar ─────────────────────────────────────────── */
export function ProgressBar({ pct, color }) {
  const c = color || (pct > 80 ? "#E24B4A" : pct > 50 ? "#BA7517" : "#1D9E75");
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"#E8EBF0", borderRadius:4 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:4, transition:"width 0.6s" }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:600, color:"#4A5568", minWidth:34 }}>{pct}%</span>
    </div>
  );
}
