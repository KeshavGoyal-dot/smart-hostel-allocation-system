// src/components/Layout.js — Sidebar + Topbar + PageLayout shell

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Navigation config ─────────────────────────────────────────
const ADMIN_NAV = [
  { path:"/dashboard",   icon:"⊞",  label:"Dashboard"       },
  { path:"/students",    icon:"👤",  label:"Students"         },
  { path:"/hostels",     icon:"🏨",  label:"Hostels & Rooms"  },
  { path:"/allocations", icon:"🔑",  label:"Allocations"      },
  { path:"/waitlist",    icon:"⏳",  label:"Waitlist"         },
  { path:"/reports",     icon:"📊",  label:"Reports"          },
];

const STUDENT_NAV = [
  { path:"/my-dashboard", icon:"⊞", label:"My Dashboard" },
  { path:"/my-room",      icon:"🏠", label:"My Room"      },
];

// ── Sidebar ───────────────────────────────────────────────────
export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const nav = user?.role === "Student" ? STUDENT_NAV : ADMIN_NAV;

  const goHome = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{
      width: 220, minHeight:"100vh", background:"#0F2027",
      display:"flex", flexDirection:"column",
      position:"fixed", left:0, top:0, bottom:0, zIndex:100,
      fontFamily:"'DM Sans', sans-serif",
    }}>
      {/* Brand */}
      <div style={{
        padding:"22px 18px 18px",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        display:"flex", alignItems:"center", gap:10,
      }}>
        <div style={{
          width:36, height:36, borderRadius:10, flexShrink:0,
          background:"linear-gradient(135deg,#1D9E75,#0F6E56)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
        }}>🏨</div>
        <div>
          <div style={{ color:"#fff", fontSize:14, fontWeight:600, lineHeight:1.3 }}>Smart Hostel</div>
          <div style={{ color:"rgba(255,255,255,0.38)", fontSize:10 }}>TIET · UCS310</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding:"12px 0", overflowY:"auto" }}>
        <div style={{
          padding:"4px 18px 8px",
          fontSize:9, color:"rgba(255,255,255,0.28)",
          letterSpacing:1, textTransform:"uppercase",
        }}>
          {user?.role === "Student" ? "Student Portal" : "Management"}
        </div>

        {nav.map(item => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 18px", cursor:"pointer",
                color: active ? "#fff" : "rgba(255,255,255,0.52)",
                background: active ? "rgba(29,158,117,0.18)" : "transparent",
                borderLeft:`3px solid ${active ? "#1D9E75" : "transparent"}`,
                fontSize:13, fontWeight: active ? 600 : 400,
                transition:"all 0.15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize:15 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Footer: user info + logout */}
      <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:4 }}>
          Signed in as
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:600, marginBottom:10 }}>
          {user?.name || user?.role}
          <span style={{
            marginLeft:8, fontSize:10, background:"rgba(29,158,117,0.25)",
            color:"#5DCAA5", padding:"1px 7px", borderRadius:20,
          }}>
            {user?.role}
          </span>
        </div>
        <button
          onClick={goHome}
          style={{
            width:"100%", padding:"7px 0", borderRadius:7, border:"none", cursor:"pointer",
            background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)",
            fontSize:12, fontFamily:"'DM Sans', sans-serif", transition:"background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────
export function Topbar({ title, actions }) {
  const { user } = useAuth();
  return (
    <div style={{
      background:"#fff", borderBottom:"1px solid #E8EBF0",
      padding:"0 28px", height:56,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <h1 style={{ margin:0, fontSize:17, fontWeight:600, color:"#1A2332" }}>{title}</h1>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        {actions}
        <span style={{
          fontSize:11, color:"#7A8499", padding:"3px 12px",
          background:"#F4F6F9", borderRadius:20, border:"1px solid #E8EBF0",
        }}>
          {user?.role}
        </span>
      </div>
    </div>
  );
}

// ── PageLayout ────────────────────────────────────────────────
// Wraps every authenticated page: Sidebar + Topbar + scrollable content
export function PageLayout({ title, actions, children }) {
  return (
    <div style={{ display:"flex", fontFamily:"'DM Sans', sans-serif" }}>
      <Sidebar />
      <div style={{ marginLeft:220, flex:1, minHeight:"100vh", background:"#F4F6F9" }}>
        <Topbar title={title} actions={actions} />
        <div style={{ padding:"26px 28px" }}>{children}</div>
      </div>
    </div>
  );
}
