// src/pages/NotFoundPage.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const goHome = () => {
    if (!user) navigate("/");
    else if (user.role === "Student") navigate("/my-dashboard");
    else navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0F2027 0%,#1A3A4F 55%,#0F2027 100%)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans', sans-serif", textAlign:"center", padding:32,
    }}>
      <div style={{ fontSize:72, marginBottom:16 }}>🏨</div>
      <h1 style={{ color:"#fff", fontSize:48, fontWeight:700, margin:"0 0 8px" }}>404</h1>
      <p style={{ color:"rgba(255,255,255,0.55)", fontSize:16, margin:"0 0 32px" }}>
        This page doesn't exist in the hostel system.
      </p>
      <button
        onClick={goHome}
        style={{
          padding:"12px 28px", borderRadius:10, border:"2px solid #1D9E75",
          background:"#1D9E75", color:"#fff", fontSize:14, fontWeight:600,
          cursor:"pointer", fontFamily:"'DM Sans', sans-serif",
        }}
      >
        ← Go Home
      </button>
    </div>
  );
}
