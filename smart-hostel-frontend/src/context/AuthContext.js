// src/context/AuthContext.js

import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ── Simple JWT payload decoder (no library needed) ────────────
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    // atob with URL-safe base64 padding
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("hostel_token");
      if (!token) return null;
      const payload = decodeToken(token);
      // Check token expiry
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        localStorage.clear();
        return null;
      }
      return {
        token,
        role:  localStorage.getItem("hostel_role")  || payload.role || "Staff",
        id:    localStorage.getItem("hostel_id")    || String(payload.id || ""),
        name:  localStorage.getItem("hostel_name")  || payload.name || "",
      };
    } catch {
      return null;
    }
  });

  const login = ({ token, role, id, name }) => {
    // Also decode token to get any fields the server puts in
    const payload = decodeToken(token);
    const resolvedRole = role || payload.role || "Staff";
    const resolvedId   = String(id   ?? payload.id   ?? "");
    const resolvedName = name || payload.name || "";

    localStorage.setItem("hostel_token", token);
    localStorage.setItem("hostel_role",  resolvedRole);
    localStorage.setItem("hostel_id",    resolvedId);
    localStorage.setItem("hostel_name",  resolvedName);

    setUser({ token, role: resolvedRole, id: resolvedId, name: resolvedName });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
