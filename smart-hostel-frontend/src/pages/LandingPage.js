// src/pages/LandingPage.js

import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon:"⚡", title:"Smart Allocation",   desc:"Automated room assignment via MySQL stored procedures" },
  { icon:"📋", title:"Priority Waitlist",  desc:"Year & reservation-category based priority scoring"   },
  { icon:"🔒", title:"Role-based Access",  desc:"Admin, Warden & Student portals with JWT auth"        },
  { icon:"📊", title:"Reports",            desc:"Occupancy, branch-wise, audit log & payment reports"  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(135deg,#0F2027 0%,#1A3A4F 55%,#0F2027 100%)",
      fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:"60px 24px 40px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .land-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
        .land-btn { transition:all 0.2s; }
        .feat-card { transition:all 0.2s; }
        .feat-card:hover { border-color:rgba(29,158,117,0.4)!important; transform:translateY(-3px); }
      `}</style>

      {/* Pill */}
      <div style={{ background:"rgba(29,158,117,0.15)", border:"1px solid rgba(29,158,117,0.3)", padding:"5px 16px", borderRadius:20, marginBottom:22 }}>
        <span style={{ color:"#1D9E75", fontSize:11, fontWeight:600, letterSpacing:1 }}>
          UCS310 · DBMS Project · Thapar Institute
        </span>
      </div>

      {/* Heading */}
      <h1 style={{ color:"#fff", fontSize:"clamp(26px,4.5vw,52px)", fontWeight:700, textAlign:"center", lineHeight:1.2, margin:"0 0 18px", maxWidth:700 }}>
        Smart Hostel{" "}
        <span style={{ display:"block", background:"linear-gradient(90deg,#1D9E75,#5DCAA5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Allocation System
        </span>
      </h1>
      <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, maxWidth:520, textAlign:"center", lineHeight:1.75, marginBottom:36 }}>
        Priority-based room allocation with real-time waitlist processing, stored-procedure-driven automation, and full analytics — built for Thapar Institute.
      </p>

      {/* CTA buttons */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", marginBottom:52 }}>
        <button className="land-btn" onClick={() => navigate("/login/student")}
          style={{ padding:"13px 30px", borderRadius:10, border:"2px solid #1D9E75", background:"#1D9E75", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
          🎓 Student Login
        </button>
        <button className="land-btn" onClick={() => navigate("/login/admin")}
          style={{ padding:"13px 30px", borderRadius:10, border:"2px solid rgba(255,255,255,0.22)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
          🔐 Admin / Warden Login
        </button>
      </div>

      {/* Feature cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, maxWidth:820, width:"100%" }}>
        {features.map(f => (
          <div key={f.title} className="feat-card" style={{
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
            borderRadius:12, padding:"20px 18px"
          }}>
            <div style={{ fontSize:24, marginBottom:10 }}>{f.icon}</div>
            <div style={{ color:"#fff", fontWeight:600, fontSize:13, marginBottom:6 }}>{f.title}</div>
            <div style={{ color:"rgba(255,255,255,0.42)", fontSize:12, lineHeight:1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:36, color:"rgba(255,255,255,0.22)", fontSize:12 }}>
        Team: Keshav Goyal · Shubh Mittal · Rishi Vikram Singh
      </div>
    </div>
  );
}
