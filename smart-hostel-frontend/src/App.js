// src/App.js — Root router with role-based guards

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LandingPage          from "./pages/LandingPage";
import AuthPage             from "./pages/AuthPages";
import DashboardPage        from "./pages/DashboardPage";
import StudentsPage         from "./pages/StudentsPage";
import HostelsPage          from "./pages/HostelsPage";
import AllocationsPage      from "./pages/AllocationsPage";
import WaitlistPage         from "./pages/WaitlistPage";
import ReportsPage          from "./pages/ReportsPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import NotFoundPage         from "./pages/NotFoundPage";

// ── Role-based route guard ────────────────────────────────────
function Guard({ children, roles }) {
  const { user } = useAuth();

  // Not logged in → back to landing
  if (!user) return <Navigate to="/" replace />;

  // Logged in but wrong role → redirect to their home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "Student" ? "/my-dashboard" : "/dashboard"} replace />;
  }

  return children;
}

// ── Smart root redirect ───────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  return <Navigate to={user.role === "Student" ? "/my-dashboard" : "/dashboard"} replace />;
}

// ── All routes ────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"            element={<RootRedirect />} />
      <Route path="/login/:type" element={<AuthPage />} />

      {/* Admin / Warden */}
      <Route path="/dashboard"    element={<Guard roles={["Admin","Warden"]}><DashboardPage /></Guard>} />
      <Route path="/students"     element={<Guard roles={["Admin","Warden"]}><StudentsPage /></Guard>} />
      <Route path="/hostels"      element={<Guard roles={["Admin","Warden"]}><HostelsPage /></Guard>} />
      <Route path="/allocations"  element={<Guard roles={["Admin","Warden"]}><AllocationsPage /></Guard>} />
      <Route path="/waitlist"     element={<Guard roles={["Admin","Warden"]}><WaitlistPage /></Guard>} />
      <Route path="/reports"      element={<Guard roles={["Admin","Warden"]}><ReportsPage /></Guard>} />

      {/* Student */}
      <Route path="/my-dashboard" element={<Guard roles={["Student"]}><StudentDashboardPage /></Guard>} />
      <Route path="/my-room"      element={<Guard roles={["Student"]}><StudentDashboardPage /></Guard>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
