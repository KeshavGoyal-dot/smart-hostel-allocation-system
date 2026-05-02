// src/pages/AuthPages.js  — Admin login + Student login

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginStaff, loginStudent } from "../services/api";
import { Alert } from "../components/UI";

const inputStyle = {
  width:"100%", padding:"9px 12px", borderRadius:8,
  border:"1px solid #D1D5DB", fontSize:13, outline:"none",
  boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#1A2332",
};

function LoginBox({ type }) {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const isAdmin    = type === "admin";

  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      let res;
      if (isAdmin) {
        if (!username || !password) { setError("Username and password required"); setLoading(false); return; }
        res = await loginStaff(username, password);
        // AuthContext decodes JWT to extract id, role, name automatically
        login({ token: res.data.token, role: res.data.role || "Admin" });
        navigate("/dashboard");
      } else {
        if (!email || !password) { setError("Email and password required"); setLoading(false); return; }
        res = await loginStudent(email, password);
        login({ token: res.data.token, role: "Student" });
        navigate("/my-dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0F2027,#1A3A4F)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans',sans-serif", padding:24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        input:focus { border-color:#1D9E75!important; box-shadow:0 0 0 3px rgba(29,158,117,0.12); }
      `}</style>

      <div style={{
        background:"#fff", borderRadius:16, padding:"38px 36px",
        width:400, maxWidth:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.28)",
      }}>
        <button onClick={() => navigate("/")}
          style={{ background:"none", border:"none", cursor:"pointer", color:"#7A8499", fontSize:13, marginBottom:18, padding:0 }}>
          ← Back to Home
        </button>

        <div style={{ fontSize:30, marginBottom:10 }}>{isAdmin ? "🔐" : "🎓"}</div>
        <h2 style={{ margin:"0 0 4px", fontSize:21, fontWeight:700, color:"#1A2332" }}>
          {isAdmin ? "Admin / Warden Login" : "Student Login"}
        </h2>
        <p style={{ color:"#7A8499", fontSize:12, margin:"0 0 22px" }}>Smart Hostel Allocation System</p>

        <Alert type="error" msg={error} />

        {isAdmin ? (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:600, color:"#4A5568", display:"block", marginBottom:5 }}>USERNAME</label>
            <input
              style={inputStyle} placeholder="e.g. admin1"
              value={username} onChange={e => setUsername(e.target.value)} onKeyDown={onKey}
              autoComplete="username" autoFocus
            />
          </div>
        ) : (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:600, color:"#4A5568", display:"block", marginBottom:5 }}>EMAIL ADDRESS</label>
            <input
              style={inputStyle} type="email" placeholder="you@thapar.edu"
              value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey}
              autoComplete="email" autoFocus
            />
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#4A5568", display:"block", marginBottom:5 }}>PASSWORD</label>
          <input
            style={inputStyle} type="password" placeholder="Enter your password"
            value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey}
            autoComplete="current-password"
          />
        </div>

        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width:"100%", padding:"11px", borderRadius:8, border:"none",
            background:"#1D9E75", color:"#fff", fontSize:14, fontWeight:600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, fontFamily:"'DM Sans',sans-serif",
          }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {/* Demo credentials */}
        <div style={{ marginTop:18, padding:"11px 14px", background:"#F8FDF9", borderRadius:8, border:"1px solid #9FE1CB" }}>
          <div style={{ fontSize:10, color:"#0F6E56", fontWeight:700, marginBottom:3, letterSpacing:"0.5px" }}>DEMO CREDENTIALS</div>
          {isAdmin
            ? <div style={{ fontSize:12, color:"#1D9E75" }}>Username: <b>admin1</b> · Password: <b>Admin@123</b></div>
            : <div style={{ fontSize:12, color:"#1D9E75" }}>Email: <b>keshav@thapar.edu</b> · Password: <b>Student@123</b></div>
          }
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { type } = useParams(); // "admin" | "student"
  return <LoginBox type={type} />;
}
