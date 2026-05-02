// Smart Hostel Allocation System - Complete React Frontend
// UCS310 DBMS Project | Thapar Institute of Engineering & Technology
// Team: Keshav Goyal · Shubh Mittal · Rishi Vikram Singh

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ─────────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────────
const BASE_URL = "http://localhost:5000/api";
const COLORS = ["#1D9E75", "#378ADD", "#D85A30", "#BA7517", "#7F77DD", "#D4537E"];

// ─────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("hostel_token");
      const role = localStorage.getItem("hostel_role");
      const id = localStorage.getItem("hostel_id");
      return token ? { token, role, id } : null;
    } catch { return null; }
  });

  const login = (token, role, id) => {
    localStorage.setItem("hostel_token", token);
    localStorage.setItem("hostel_role", role);
    localStorage.setItem("hostel_id", id || "");
    setUser({ token, role, id });
  };

  const logout = () => {
    localStorage.removeItem("hostel_token");
    localStorage.removeItem("hostel_role");
    localStorage.removeItem("hostel_id");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────────
// API SERVICE
// ─────────────────────────────────────────────
const api = {
  async request(method, path, body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },
  get: (path, token) => api.request("GET", path, null, token),
  post: (path, body, token) => api.request("POST", path, body, token),
  put: (path, body, token) => api.request("PUT", path, body, token),
  delete: (path, token) => api.request("DELETE", path, null, token),
};

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────

const styles = {
  sidebar: {
    width: 220, minHeight: "100vh", background: "#0F2027",
    display: "flex", flexDirection: "column", padding: "0",
    position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebarBrand: {
    padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", gap: 10,
  },
  sidebarIcon: {
    width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1D9E75,#0F6E56)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
  },
  brandText: { color: "#fff", fontSize: 14, fontWeight: 600, lineHeight: 1.3 },
  brandSub: { color: "rgba(255,255,255,0.45)", fontSize: 11 },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
    cursor: "pointer", borderRadius: 0, color: active ? "#fff" : "rgba(255,255,255,0.55)",
    background: active ? "rgba(29,158,117,0.18)" : "transparent",
    borderLeft: active ? "3px solid #1D9E75" : "3px solid transparent",
    fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.15s",
    textDecoration: "none",
  }),
  mainContent: { marginLeft: 220, minHeight: "100vh", background: "#F4F6F9", fontFamily: "'DM Sans', sans-serif" },
  topbar: {
    background: "#fff", borderBottom: "1px solid #E8EBF0",
    padding: "0 32px", height: 60, display: "flex", alignItems: "center",
    justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
  },
  pageTitle: { fontSize: 18, fontWeight: 600, color: "#1A2332", margin: 0 },
  pageBody: { padding: "28px 32px" },
  card: {
    background: "#fff", borderRadius: 12, border: "1px solid #E8EBF0",
    padding: "20px 24px", marginBottom: 20,
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#1A2332", marginBottom: 16, marginTop: 0 },
  statCard: (color = "#1D9E75") => ({
    background: "#fff", borderRadius: 12, border: "1px solid #E8EBF0",
    padding: "20px 24px", borderLeft: `4px solid ${color}`,
  }),
  statNum: { fontSize: 28, fontWeight: 700, color: "#1A2332", margin: 0 },
  statLabel: { fontSize: 12, color: "#7A8499", marginTop: 4, marginBottom: 0, textTransform: "uppercase", letterSpacing: "0.5px" },
  btn: (variant = "primary") => ({
    padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 500, transition: "all 0.15s",
    background: variant === "primary" ? "#1D9E75" : variant === "danger" ? "#E24B4A" : variant === "info" ? "#378ADD" : "#F1F3F7",
    color: variant === "ghost" ? "#4A5568" : "#fff",
  }),
  btnSm: (variant = "primary") => ({
    padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 500,
    background: variant === "primary" ? "#1D9E75" : variant === "danger" ? "#E24B4A" : variant === "info" ? "#378ADD" : "#F1F3F7",
    color: variant === "ghost" ? "#4A5568" : "#fff",
  }),
  input: {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid #D1D5DB", fontSize: 13, outline: "none",
    background: "#fff", color: "#1A2332", boxSizing: "border-box",
  },
  label: { fontSize: 12, fontWeight: 500, color: "#4A5568", marginBottom: 4, display: "block" },
  badge: (color) => {
    const map = {
      green: { bg: "#E1F5EE", color: "#0F6E56" },
      red: { bg: "#FCEBEB", color: "#A32D2D" },
      amber: { bg: "#FAEEDA", color: "#854F0B" },
      blue: { bg: "#E6F1FB", color: "#185FA5" },
      gray: { bg: "#F1EFE8", color: "#5F5E5A" },
    };
    const c = map[color] || map.gray;
    return { background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 };
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #E8EBF0", fontSize: 11, fontWeight: 600, color: "#7A8499", textTransform: "uppercase", letterSpacing: "0.5px" },
  td: { padding: "11px 12px", borderBottom: "1px solid #F0F2F5", color: "#2D3748" },
  alert: (type) => ({
    padding: "10px 16px", borderRadius: 8, fontSize: 13, marginBottom: 16,
    background: type === "error" ? "#FCEBEB" : "#E1F5EE",
    color: type === "error" ? "#A32D2D" : "#0F6E56",
    border: `1px solid ${type === "error" ? "#F7C1C1" : "#9FE1CB"}`,
  }),
  modal: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modalBox: {
    background: "#fff", borderRadius: 14, padding: "28px 32px",
    width: 480, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
};

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div style={{
        width: 32, height: 32, border: "3px solid #E8EBF0",
        borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Alert({ type, msg }) {
  if (!msg) return null;
  return <div style={styles.alert(type)}>{msg}</div>;
}

function Badge({ status }) {
  const map = {
    Active: "green", Vacated: "gray", Transferred: "blue",
    Paid: "green", Unpaid: "red", Pending: "amber",
    Admin: "blue", Warden: "green", Staff: "gray", Student: "amber",
  };
  return <span style={styles.badge(map[status] || "gray")}>{status}</span>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={styles.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1A2332" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#7A8499" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────
function Sidebar({ page, setPage, role }) {
  const { logout } = useAuth();

  const adminNav = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "students", icon: "👤", label: "Students" },
    { id: "hostels", icon: "🏨", label: "Hostels & Rooms" },
    { id: "allocations", icon: "🔑", label: "Allocations" },
    { id: "waitlist", icon: "⏳", label: "Waitlist" },
    { id: "reports", icon: "📊", label: "Reports" },
  ];
  const studentNav = [
    { id: "student-dashboard", icon: "⊞", label: "My Dashboard" },
    { id: "student-allocation", icon: "🏠", label: "My Room" },
    { id: "student-apply", icon: "✉", label: "Apply for Hostel" },
  ];

  const nav = role === "Student" ? studentNav : adminNav;

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarBrand}>
        <div style={styles.sidebarIcon}>🏨</div>
        <div>
          <div style={styles.brandText}>Smart Hostel</div>
          <div style={styles.brandSub}>TIET | UCS310</div>
        </div>
      </div>

      <div style={{ padding: "12px 0", flex: 1 }}>
        <div style={{ padding: "4px 20px 8px", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>
          {role === "Student" ? "Student Portal" : "Management"}
        </div>
        {nav.map(item => (
          <div key={item.id} style={styles.navItem(page === item.id)} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
          Logged in as <strong style={{ color: "rgba(255,255,255,0.7)" }}>{role}</strong>
        </div>
        <button onClick={logout} style={{ ...styles.btn("ghost"), width: "100%", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Topbar({ title, children }) {
  return (
    <div style={styles.topbar}>
      <h1 style={styles.pageTitle}>{title}</h1>
      <div style={{ display: "flex", gap: 10 }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
function LandingPage({ onGo }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0F2027 0%,#1A3A4F 50%,#0F2027 100%)", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .land-btn { transition: all 0.2s; }
        .land-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
        .feature-card:hover { border-color: rgba(29,158,117,0.4) !important; transform: translateY(-3px); }
        .feature-card { transition: all 0.2s; }
      `}</style>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 32px 40px", textAlign: "center" }}>
        <div style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)", padding: "6px 16px", borderRadius: 20, marginBottom: 24 }}>
          <span style={{ color: "#1D9E75", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>UCS310 • DBMS Project • Thapar Institute</span>
        </div>

        <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 20px", maxWidth: 700 }}>
          Smart Hostel
          <span style={{ display: "block", background: "linear-gradient(90deg,#1D9E75,#5DCAA5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Allocation System
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 540, marginBottom: 40, lineHeight: 1.7 }}>
          Streamlined hostel management with priority-based room allocation, real-time waitlist processing, and comprehensive reporting for Thapar Institute.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 60 }}>
          <button className="land-btn" onClick={() => onGo("student-login")} style={{
            padding: "13px 28px", borderRadius: 10, border: "2px solid #1D9E75",
            background: "#1D9E75", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>
            Student Login
          </button>
          <button className="land-btn" onClick={() => onGo("admin-login")} style={{
            padding: "13px 28px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>
            Admin / Warden Login
          </button>
        </div>

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, maxWidth: 800, width: "100%" }}>
          {[
            { icon: "⚡", title: "Smart Allocation", desc: "Automated room assignment via stored procedures" },
            { icon: "📋", title: "Priority Waitlist", desc: "Year & category-based priority scoring" },
            { icon: "🔒", title: "Role-based Access", desc: "Admin, Warden, and Student roles" },
            { icon: "📊", title: "Reports & Analytics", desc: "Occupancy, branch-wise & audit logs" },
          ].map(f => (
            <div key={f.title} className="feature-card" style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: "20px", textAlign: "left",
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px 32px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
        Team: Keshav Goyal · Shubh Mittal · Rishi Vikram Singh
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN PAGES
// ─────────────────────────────────────────────
function LoginPage({ type, onBack }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.password) { setError("Password is required"); return; }
    if (type === "admin" && !form.username) { setError("Username is required"); return; }
    if (type === "student" && !form.email) { setError("Email is required"); return; }

    setLoading(true); setError("");
    try {
      let data;
      if (type === "admin") {
        data = await api.post("/auth/login", { username: form.username, password: form.password });
      } else {
        data = await api.post("/auth/student-login", { email: form.email, password: form.password });
      }
      login(data.token, type === "admin" ? "Admin" : "Student", data.id || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = type === "admin";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0F2027,#1A3A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px", width: 400, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A8499", fontSize: 13, marginBottom: 20, padding: 0 }}>
          ← Back to Home
        </button>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{isAdmin ? "🔐" : "🎓"}</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1A2332" }}>
            {isAdmin ? "Admin / Warden Login" : "Student Login"}
          </h2>
          <p style={{ color: "#7A8499", fontSize: 13, margin: "6px 0 0" }}>Smart Hostel Allocation System</p>
        </div>

        <Alert type="error" msg={error} />

        {isAdmin ? (
          <FormField label="Username">
            <input style={styles.input} placeholder="e.g. admin1" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </FormField>
        ) : (
          <FormField label="Email Address">
            <input style={styles.input} type="email" placeholder="you@thapar.edu" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </FormField>
        )}

        <FormField label="Password">
          <input style={styles.input} type="password" placeholder="Enter password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </FormField>

        <button onClick={handleSubmit} disabled={loading} style={{
          ...styles.btn("primary"), width: "100%", padding: "11px 0", fontSize: 14, marginTop: 8,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div style={{ marginTop: 20, padding: "12px 16px", background: "#F8FDF9", borderRadius: 8, border: "1px solid #9FE1CB" }}>
          <div style={{ fontSize: 11, color: "#0F6E56", fontWeight: 600, marginBottom: 4 }}>DEMO CREDENTIALS</div>
          {isAdmin ? (
            <div style={{ fontSize: 12, color: "#1D9E75" }}>Username: admin1 · Password: Admin@123</div>
          ) : (
            <div style={{ fontSize: 12, color: "#1D9E75" }}>Email: keshav@thapar.edu · Password: Student@123</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/students", user.token),
      api.get("/allocations", user.token),
      api.get("/waitlist", user.token),
      api.get("/hostels", user.token),
    ]).then(([s, a, w, h]) => {
      setStats({
        students: s.data?.length || 0,
        allocated: a.data?.length || 0,
        waitlisted: w.data?.length || 0,
        hostels: h.data?.length || 0,
      });
    }).catch(() => setStats({ students: 0, allocated: 0, waitlisted: 0, hostels: 0 }))
      .finally(() => setLoading(false));
  }, [user.token]);

  if (loading) return <Spinner />;

  const cards = [
    { label: "Total Students", value: stats.students, color: "#378ADD", icon: "👤" },
    { label: "Active Allocations", value: stats.allocated, color: "#1D9E75", icon: "🏠" },
    { label: "On Waitlist", value: stats.waitlisted, color: "#BA7517", icon: "⏳" },
    { label: "Hostels", value: stats.hostels, color: "#7F77DD", icon: "🏨" },
    { label: "Unallocated", value: Math.max(0, stats.students - stats.allocated), color: "#E24B4A", icon: "❗" },
    { label: "Allocation Rate", value: stats.students > 0 ? Math.round((stats.allocated / stats.students) * 100) + "%" : "—", color: "#D85A30", icon: "📈" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 16, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={styles.statCard(c.color)}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
            <div style={styles.statNum}>{c.value}</div>
            <div style={styles.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.card }}>
        <div style={styles.cardTitle}>System Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#F8FDF9", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "#0F6E56", fontWeight: 600 }}>ALLOCATION RATE</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1A2332", margin: "6px 0 4px" }}>
              {stats.students > 0 ? Math.round((stats.allocated / stats.students) * 100) : 0}%
            </div>
            <div style={{ height: 6, background: "#E1F5EE", borderRadius: 4 }}>
              <div style={{ height: "100%", background: "#1D9E75", borderRadius: 4, width: `${stats.students > 0 ? Math.round((stats.allocated / stats.students) * 100) : 0}%`, transition: "width 1s" }} />
            </div>
          </div>
          <div style={{ background: "#FFF8F0", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "#854F0B", fontWeight: 600 }}>WAITLIST PRESSURE</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1A2332", margin: "6px 0 4px" }}>
              {stats.waitlisted}
            </div>
            <div style={{ fontSize: 12, color: "#7A8499" }}>students awaiting a room</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Quick Actions</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Register Student", icon: "➕" },
            { label: "Allocate Room", icon: "🔑" },
            { label: "View Reports", icon: "📊" },
            { label: "Manage Waitlist", icon: "📋" },
          ].map(a => (
            <div key={a.label} style={{
              padding: "12px 18px", borderRadius: 10, border: "1.5px solid #E8EBF0",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, fontWeight: 500, color: "#2D3748",
              background: "#fff", transition: "border-color 0.15s",
            }}>
              <span>{a.icon}</span>{a.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDENTS PAGE
// ─────────────────────────────────────────────
function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get("/students", user.token)
      .then(d => setStudents(d.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [user.token]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ StudentID: "", Name: "", Branch: "", Year: 1, Gender: "Male", Category: "General", Email: "", Phone: "", Password: "" });
    setMsg({ type: "", text: "" });
    setModal("add");
  };

  const openEdit = (s) => {
    setSelected(s);
    setForm({ Name: s.Name, Branch: s.Branch, Year: s.Year, Gender: s.Gender, Category: s.Category, Email: s.Email, Phone: s.Phone || "" });
    setMsg({ type: "", text: "" });
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      if (modal === "add") {
        await api.post("/students", form, user.token);
        setMsg({ type: "success", text: "Student registered successfully!" });
      } else {
        await api.put(`/students/${selected.StudentID}`, form, user.token);
        setMsg({ type: "success", text: "Student updated!" });
      }
      load();
      setTimeout(() => setModal(null), 1200);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete student ${id}? This cannot be undone.`)) return;
    try {
      await api.delete(`/students/${id}`, user.token);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = students.filter(s =>
    s.Name?.toLowerCase().includes(search.toLowerCase()) ||
    s.StudentID?.includes(search) ||
    s.Branch?.toLowerCase().includes(search.toLowerCase())
  );

  const fields = [
    { key: "StudentID", label: "Student ID", type: "text", addOnly: true },
    { key: "Name", label: "Full Name", type: "text" },
    { key: "Email", label: "Email", type: "email" },
    { key: "Branch", label: "Branch", type: "text", placeholder: "CSE / ECE / ME..." },
    { key: "Year", label: "Year", type: "number" },
    { key: "Gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { key: "Category", label: "Category", type: "select", options: ["General", "OBC", "SC", "ST", "EWS"] },
    { key: "Phone", label: "Phone", type: "text" },
    { key: "Password", label: "Password", type: "password", addOnly: true },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <input style={{ ...styles.input, width: 280 }} placeholder="Search by name, ID, or branch..." value={search}
          onChange={e => setSearch(e.target.value)} />
        {user.role !== "Student" && (
          <button style={styles.btn("primary")} onClick={openAdd}>+ Add Student</button>
        )}
      </div>

      <div style={styles.card}>
        {loading ? <Spinner /> : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Student ID", "Name", "Branch", "Year", "Gender", "Category", "Email", "Alloc Status", "Actions"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ ...styles.td, textAlign: "center", color: "#7A8499", padding: 32 }}>No students found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.StudentID} style={{ transition: "background 0.1s" }}>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#378ADD" }}>{s.StudentID}</td>
                  <td style={styles.td}>{s.Name}</td>
                  <td style={styles.td}>{s.Branch}</td>
                  <td style={styles.td}>{s.Year}</td>
                  <td style={styles.td}>{s.Gender}</td>
                  <td style={styles.td}><Badge status={s.Category} /></td>
                  <td style={{ ...styles.td, fontSize: 12 }}>{s.Email}</td>
                  <td style={styles.td}><Badge status={s.AllocStatus || "Unallocated"} /></td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={styles.btnSm("info")} onClick={() => openEdit(s)}>Edit</button>
                      {user.role === "Admin" && (
                        <button style={styles.btnSm("danger")} onClick={() => handleDelete(s.StudentID)}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "add" ? "Register New Student" : "Edit Student"}>
        <Alert type={msg.type === "success" ? "success" : "error"} msg={msg.text} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          {fields.filter(f => modal === "add" || !f.addOnly).map(f => (
            <FormField key={f.key} label={f.label}>
              {f.type === "select" ? (
                <select style={styles.input} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input style={styles.input} type={f.type} placeholder={f.placeholder || ""}
                  value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </FormField>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button style={{ ...styles.btn("primary"), flex: 1 }} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : modal === "add" ? "Register Student" : "Save Changes"}
          </button>
          <button style={{ ...styles.btn("ghost"), flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOSTELS PAGE
// ─────────────────────────────────────────────
function HostelsPage() {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });

  const loadHostels = useCallback(() => {
    setLoading(true);
    api.get("/hostels", user.token).then(d => setHostels(d.data || [])).catch(() => setHostels([])).finally(() => setLoading(false));
  }, [user.token]);

  useEffect(() => { loadHostels(); }, [loadHostels]);

  const viewRooms = (h) => {
    setSelectedHostel(h);
    setLoadingRooms(true);
    api.get(`/hostels/${h.HostelID}/rooms`, user.token).then(d => setRooms(d.data || [])).finally(() => setLoadingRooms(false));
  };

  const saveHostel = async () => {
    try {
      await api.post("/hostels", form, user.token);
      setMsg({ type: "success", text: "Hostel added!" });
      loadHostels();
      setTimeout(() => setModal(null), 1000);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const pct = (h) => h.TotalCapacity > 0 ? Math.round((h.TotalOccupied / h.TotalCapacity) * 100) : 0;

  return (
    <div>
      {user.role === "Admin" && (
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <button style={styles.btn("primary")} onClick={() => { setForm({ HostelName: "", Type: "Boys", TotalBlocks: 1 }); setMsg({ type: "", text: "" }); setModal("hostel"); }}>
            + Add Hostel
          </button>
        </div>
      )}

      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {hostels.map(h => (
            <div key={h.HostelID} style={{ ...styles.card, cursor: "pointer", marginBottom: 0 }} onClick={() => viewRooms(h)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1A2332", fontSize: 15 }}>{h.HostelName}</div>
                  <Badge status={h.Type === "Boys" ? "Student" : h.Type === "Girls" ? "Admin" : "Staff"} />
                </div>
                <span style={{ fontSize: 28 }}>{h.Type === "Boys" ? "🏗" : "🏘"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Rooms", val: h.TotalRooms || 0 },
                  { label: "Occupied", val: h.TotalOccupied || 0 },
                  { label: "Free", val: h.AvailableSeats || 0 },
                ].map(s => (
                  <div key={s.label} style={{ background: "#F4F6F9", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1A2332" }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "#7A8499", textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7A8499", marginBottom: 4 }}>
                  <span>Occupancy</span><span>{pct(h)}%</span>
                </div>
                <div style={{ height: 6, background: "#E8EBF0", borderRadius: 4 }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${pct(h)}%`, background: pct(h) > 80 ? "#E24B4A" : pct(h) > 50 ? "#BA7517" : "#1D9E75" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedHostel && (
        <div style={{ ...styles.card, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={styles.cardTitle}>Rooms — {selectedHostel.HostelName}</div>
            <button onClick={() => setSelectedHostel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A8499" }}>✕ Close</button>
          </div>
          {loadingRooms ? <Spinner /> : (
            <table style={styles.table}>
              <thead>
                <tr>{["Room No", "Block", "Type", "Capacity", "Occupied", "Free", "Status"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.RoomID}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{r.RoomNo}</td>
                    <td style={styles.td}>{r.BlockName}</td>
                    <td style={styles.td}>{r.RoomType}</td>
                    <td style={styles.td}>{r.Capacity}</td>
                    <td style={styles.td}>{r.OccupiedSeats}</td>
                    <td style={styles.td}>{r.FreeSeats}</td>
                    <td style={styles.td}>
                      <Badge status={r.FreeSeats > 0 ? "Active" : "Vacated"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal open={modal === "hostel"} onClose={() => setModal(null)} title="Add New Hostel">
        <Alert type={msg.type === "success" ? "success" : "error"} msg={msg.text} />
        <FormField label="Hostel Name">
          <input style={styles.input} placeholder="e.g. Kailash Boys Hostel" value={form.HostelName || ""}
            onChange={e => setForm(p => ({ ...p, HostelName: e.target.value }))} />
        </FormField>
        <FormField label="Type">
          <select style={styles.input} value={form.Type || "Boys"} onChange={e => setForm(p => ({ ...p, Type: e.target.value }))}>
            {["Boys", "Girls", "Mixed"].map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Total Blocks">
          <input style={styles.input} type="number" min={1} value={form.TotalBlocks || 1}
            onChange={e => setForm(p => ({ ...p, TotalBlocks: +e.target.value }))} />
        </FormField>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...styles.btn("primary"), flex: 1 }} onClick={saveHostel}>Add Hostel</button>
          <button style={{ ...styles.btn("ghost"), flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// ALLOCATIONS PAGE
// ─────────────────────────────────────────────
function AllocationsPage() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [studentID, setStudentID] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [working, setWorking] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/allocations", user.token).then(d => setAllocations(d.data || [])).catch(() => setAllocations([])).finally(() => setLoading(false));
  }, [user.token]);

  useEffect(() => { load(); }, [load]);

  const doAllocate = async () => {
    if (!studentID) { setMsg({ type: "error", text: "Enter a student ID" }); return; }
    setWorking(true); setMsg({ type: "", text: "" });
    try {
      const data = await api.post("/allocations/allocate", { studentID }, user.token);
      setMsg({ type: "success", text: data.message });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setWorking(false);
    }
  };

  const doVacate = async () => {
    if (!studentID) { setMsg({ type: "error", text: "Enter a student ID" }); return; }
    setWorking(true); setMsg({ type: "", text: "" });
    try {
      const data = await api.post("/allocations/vacate", { studentID }, user.token);
      setMsg({ type: "success", text: data.message });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button style={styles.btn("primary")} onClick={() => { setModal("allocate"); setStudentID(""); setMsg({ type: "", text: "" }); }}>
          🔑 Allocate Room
        </button>
        <button style={styles.btn("danger")} onClick={() => { setModal("vacate"); setStudentID(""); setMsg({ type: "", text: "" }); }}>
          🚪 Vacate Room
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Active Allocations ({allocations.length})</div>
        {loading ? <Spinner /> : (
          <table style={styles.table}>
            <thead>
              <tr>{["Alloc ID", "Student", "Branch", "Year", "Hostel", "Block", "Room", "Type", "Date", "Status"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr><td colSpan={10} style={{ ...styles.td, textAlign: "center", color: "#7A8499", padding: 32 }}>No active allocations</td></tr>
              ) : allocations.map(a => (
                <tr key={a.AllocID}>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#7F77DD" }}>#{a.AllocID}</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{a.Name}</div>
                    <div style={{ fontSize: 11, color: "#7A8499" }}>{a.StudentID}</div>
                  </td>
                  <td style={styles.td}>{a.Branch}</td>
                  <td style={styles.td}>{a.Year}</td>
                  <td style={styles.td}>{a.HostelName}</td>
                  <td style={styles.td}>{a.BlockName}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{a.RoomNo}</td>
                  <td style={styles.td}>{a.RoomType}</td>
                  <td style={{ ...styles.td, fontSize: 12 }}>{a.AllocDate?.split("T")[0]}</td>
                  <td style={styles.td}><Badge status={a.Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "allocate" ? "Allocate Room to Student" : "Vacate Room"}>
        <Alert type={msg.type === "success" ? "success" : "error"} msg={msg.text} />
        <p style={{ color: "#7A8499", fontSize: 13, marginTop: 0 }}>
          {modal === "allocate"
            ? "Calls sp_allocate_room stored procedure. Finds the best available room matching gender & hostel type."
            : "Calls sp_vacate_room stored procedure. Automatically triggers waitlist processing."}
        </p>
        <FormField label="Student ID">
          <input style={styles.input} placeholder="e.g. 102417031" value={studentID}
            onChange={e => setStudentID(e.target.value)} />
        </FormField>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...styles.btn(modal === "allocate" ? "primary" : "danger"), flex: 1 }} onClick={modal === "allocate" ? doAllocate : doVacate} disabled={working}>
            {working ? "Processing..." : modal === "allocate" ? "Allocate Room" : "Vacate Room"}
          </button>
          <button style={{ ...styles.btn("ghost"), flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// WAITLIST PAGE
// ─────────────────────────────────────────────
function WaitlistPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = useCallback(() => {
    setLoading(true);
    api.get("/waitlist", user.token).then(d => setList(d.data || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, [user.token]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!confirm("Remove this student from the waitlist?")) return;
    try {
      await api.delete(`/waitlist/${id}`, user.token);
      setMsg({ type: "success", text: "Removed from waitlist" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  return (
    <div>
      <Alert type={msg.type === "success" ? "success" : "error"} msg={msg.text} />
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={styles.cardTitle}>Waiting List — {list.length} students</div>
          <span style={{ fontSize: 12, color: "#7A8499" }}>Sorted by Priority (high → low) then Request Date (FIFO)</span>
        </div>
        {loading ? <Spinner /> : (
          <table style={styles.table}>
            <thead>
              <tr>{["Rank", "Student ID", "Name", "Branch", "Year", "Gender", "Category", "Priority Score", "Requested", "Action"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={10} style={{ ...styles.td, textAlign: "center", color: "#7A8499", padding: 32 }}>Waiting list is empty</td></tr>
              ) : list.map((w, i) => (
                <tr key={w.WL_ID}>
                  <td style={{ ...styles.td, fontWeight: 700, color: "#7A8499" }}>#{i + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#378ADD" }}>{w.StudentID}</td>
                  <td style={styles.td}>{w.Name}</td>
                  <td style={styles.td}>{w.Branch}</td>
                  <td style={styles.td}>{w.Year}</td>
                  <td style={styles.td}>{w.Gender}</td>
                  <td style={styles.td}><Badge status={w.Category} /></td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 700, color: w.Priority >= 50 ? "#1D9E75" : w.Priority >= 30 ? "#BA7517" : "#7A8499", fontSize: 15 }}>
                      {w.Priority}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: 12 }}>{w.RequestDate?.split("T")[0]}</td>
                  <td style={styles.td}>
                    <button style={styles.btnSm("danger")} onClick={() => remove(w.StudentID)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REPORTS PAGE
// ─────────────────────────────────────────────
function ReportsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("occupancy");
  const [occupancy, setOccupancy] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [unalloc, setUnalloc] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = user.token;
    Promise.all([
      api.get("/reports/occupancy", token).catch(() => ({ data: [] })),
      api.get("/reports/by-branch", token).catch(() => ({ data: [] })),
      api.get("/reports/unallocated", token).catch(() => ({ data: [] })),
      api.get("/reports/audit-log", token).catch(() => ({ data: [] })),
    ]).then(([o, b, u, a]) => {
      setOccupancy(o.data || []);
      setBranchData(b.data || []);
      setUnalloc(u.data || []);
      setAuditLog(a.data || []);
    }).finally(() => setLoading(false));
  }, [user.token]);

  const tabs = [
    { id: "occupancy", label: "Occupancy" },
    { id: "branch", label: "By Branch" },
    { id: "unallocated", label: "Unallocated" },
    { id: "audit", label: "Audit Log" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "#fff", borderRadius: 10, border: "1px solid #E8EBF0", overflow: "hidden", width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t.id ? "#1D9E75" : "transparent",
            color: tab === t.id ? "#fff" : "#4A5568",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {tab === "occupancy" && (
            <div>
              <div style={{ ...styles.card, marginBottom: 24 }}>
                <div style={styles.cardTitle}>Hostel Occupancy Overview</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={occupancy} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                    <XAxis dataKey="HostelName" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="OccupiedSeats" fill="#1D9E75" name="Occupied" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="FreeSeats" fill="#E1F5EE" name="Free" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ ...styles.card }}>
                <div style={styles.cardTitle}>Occupancy Breakdown</div>
                <table style={styles.table}>
                  <thead>
                    <tr>{["Hostel", "Type", "Total Seats", "Occupied", "Free", "Occupancy %"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {occupancy.map(h => (
                      <tr key={h.HostelName}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{h.HostelName}</td>
                        <td style={styles.td}>{h.Type}</td>
                        <td style={styles.td}>{h.TotalSeats}</td>
                        <td style={styles.td}>{h.OccupiedSeats}</td>
                        <td style={styles.td}>{h.FreeSeats}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "#E8EBF0", borderRadius: 4 }}>
                              <div style={{ height: "100%", background: (h.OccupancyPercent || 0) > 80 ? "#E24B4A" : "#1D9E75", borderRadius: 4, width: `${h.OccupancyPercent || 0}%` }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, minWidth: 36 }}>{h.OccupancyPercent || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "branch" && (
            <div>
              <div style={{ ...styles.card, marginBottom: 24 }}>
                <div style={styles.cardTitle}>Allocations by Branch & Year</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={branchData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                    <XAxis dataKey="Branch" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="AllocatedCount" fill="#378ADD" name="Allocated" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.card}>
                <table style={styles.table}>
                  <thead>
                    <tr>{["Branch", "Year", "Allocated Students"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {branchData.map((b, i) => (
                      <tr key={i}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{b.Branch}</td>
                        <td style={styles.td}>Year {b.Year}</td>
                        <td style={styles.td}>{b.AllocatedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "unallocated" && (
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={styles.cardTitle}>Unallocated Students</div>
                <span style={{ ...styles.badge("red"), fontSize: 12 }}>{unalloc.length} students</span>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>{["Student ID", "Name", "Branch", "Year", "Gender", "Category", "Email"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {unalloc.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center", padding: 32, color: "#1D9E75", fontWeight: 600 }}>All students are allocated!</td></tr>
                  ) : unalloc.map(s => (
                    <tr key={s.StudentID}>
                      <td style={{ ...styles.td, fontWeight: 600, color: "#E24B4A" }}>{s.StudentID}</td>
                      <td style={styles.td}>{s.Name}</td>
                      <td style={styles.td}>{s.Branch}</td>
                      <td style={styles.td}>{s.Year}</td>
                      <td style={styles.td}>{s.Gender}</td>
                      <td style={styles.td}><Badge status={s.Category} /></td>
                      <td style={{ ...styles.td, fontSize: 12 }}>{s.Email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "audit" && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Allocation Audit Log (Latest 100)</div>
              <table style={styles.table}>
                <thead>
                  <tr>{["Log ID", "Action", "Student", "Alloc ID", "Room ID", "Time", "Performed By"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {auditLog.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center", color: "#7A8499", padding: 32 }}>No audit records</td></tr>
                  ) : auditLog.map(l => (
                    <tr key={l.LogID}>
                      <td style={{ ...styles.td, color: "#7A8499" }}>#{l.LogID}</td>
                      <td style={styles.td}>
                        <Badge status={l.Action === "ALLOCATED" ? "Active" : l.Action === "Vacated" ? "Vacated" : "Transferred"} />
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500 }}>{l.StudentName}</div>
                        <div style={{ fontSize: 11, color: "#7A8499" }}>{l.StudentID}</div>
                      </td>
                      <td style={styles.td}>{l.AllocID}</td>
                      <td style={styles.td}>{l.RoomID}</td>
                      <td style={{ ...styles.td, fontSize: 11 }}>{l.ActionTime?.replace("T", " ").slice(0, 19)}</td>
                      <td style={styles.td}>{l.PerformedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────
function StudentDashboard({ studentID }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const id = studentID || user.id;
    Promise.all([
      api.get(`/students/${id}`, user.token),
      api.get(`/allocations/student/${id}`, user.token),
    ]).then(([p, h]) => {
      setProfile(p.data);
      setHistory(h.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user.token, user.id, studentID]);

  const applyForHostel = async () => {
    setApplying(true); setApplyMsg({ type: "", text: "" });
    try {
      const data = await api.post("/allocations/apply", {}, user.token);
      setApplyMsg({ type: "success", text: data.message });
    } catch (err) {
      setApplyMsg({ type: "error", text: err.message });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Profile card */}
      {profile && (
        <div style={{ ...styles.card, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#1D9E75,#378ADD)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
            {profile.Name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1A2332" }}>{profile.Name}</h2>
            <div style={{ color: "#7A8499", fontSize: 13, marginBottom: 12 }}>{profile.StudentID} · {profile.Branch} · Year {profile.Year}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge status={profile.Gender} />
              <Badge status={profile.Category} />
              {profile.AllocStatus && <Badge status={profile.AllocStatus} />}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#7A8499" }}>Email</div>
            <div style={{ fontWeight: 500, color: "#1A2332" }}>{profile.Email}</div>
          </div>
        </div>
      )}

      {/* Current allocation */}
      {profile && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Current Room Status</div>
          {profile.AllocStatus === "Active" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              {[
                { label: "Hostel", value: profile.HostelName },
                { label: "Block", value: profile.BlockName },
                { label: "Room No", value: profile.RoomNo },
                { label: "Status", value: profile.AllocStatus },
              ].map(s => (
                <div key={s.label} style={{ background: "#F4F6F9", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, color: "#7A8499", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 600, color: "#1A2332", fontSize: 15 }}>{s.value || "—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ ...styles.alert("error"), marginBottom: 16 }}>You don't have an active room allocation.</div>
              <Alert type={applyMsg.type === "success" ? "success" : "error"} msg={applyMsg.text} />
              <button style={styles.btn("primary")} onClick={applyForHostel} disabled={applying}>
                {applying ? "Applying..." : "Apply for Hostel Room"}
              </button>
              <p style={{ fontSize: 12, color: "#7A8499", marginTop: 10 }}>
                You'll be added to the waitlist with a priority score based on your year and category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Allocation History</div>
        {history.length === 0 ? (
          <div style={{ color: "#7A8499", fontSize: 13 }}>No allocation history found.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>{["Alloc ID", "Hostel", "Block", "Room", "Type", "Date", "Status"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {history.map(a => (
                <tr key={a.AllocID}>
                  <td style={{ ...styles.td, color: "#7F77DD", fontWeight: 600 }}>#{a.AllocID}</td>
                  <td style={styles.td}>{a.HostelName}</td>
                  <td style={styles.td}>{a.BlockName}</td>
                  <td style={styles.td}>{a.RoomNo}</td>
                  <td style={styles.td}>{a.RoomType}</td>
                  <td style={{ ...styles.td, fontSize: 12 }}>{a.AllocDate?.split("T")[0]}</td>
                  <td style={styles.td}><Badge status={a.Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE TITLES MAP
// ─────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: "Dashboard",
  students: "Student Management",
  hostels: "Hostels & Rooms",
  allocations: "Room Allocations",
  waitlist: "Waiting List",
  reports: "Reports & Analytics",
  "student-dashboard": "My Dashboard",
  "student-allocation": "My Room",
  "student-apply": "Apply for Hostel",
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
function AppContent() {
  const { user } = useAuth();
  const [landingPage, setLandingPage] = useState("home"); // home | admin-login | student-login

  // Not logged in: show landing / auth pages
  if (!user) {
    if (landingPage === "admin-login") return <LoginPage type="admin" onBack={() => setLandingPage("home")} />;
    if (landingPage === "student-login") return <LoginPage type="student" onBack={() => setLandingPage("home")} />;
    return <LandingPage onGo={setLandingPage} />;
  }

  // Logged in
  const isStudent = user.role === "Student";
  const defaultPage = isStudent ? "student-dashboard" : "dashboard";
  const [page, setPage] = useState(defaultPage);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <AdminDashboard />;
      case "students": return <StudentsPage />;
      case "hostels": return <HostelsPage />;
      case "allocations": return <AllocationsPage />;
      case "waitlist": return <WaitlistPage />;
      case "reports": return <ReportsPage />;
      case "student-dashboard":
      case "student-allocation":
      case "student-apply":
        return <StudentDashboard />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus, select:focus { border-color: #1D9E75 !important; outline: none; box-shadow: 0 0 0 3px rgba(29,158,117,0.12); }
        tr:hover td { background: #FAFBFC; }
        button:active { transform: scale(0.98); }
      `}</style>
      <Sidebar page={page} setPage={setPage} role={user.role} />
      <div style={styles.mainContent}>
        <Topbar title={PAGE_TITLES[page] || "Dashboard"}>
          <span style={{ fontSize: 12, color: "#7A8499", padding: "4px 12px", background: "#F4F6F9", borderRadius: 20 }}>
            {user.role}
          </span>
        </Topbar>
        <div style={styles.pageBody}>{renderPage()}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
